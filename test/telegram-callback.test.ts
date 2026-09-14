/**
 * End-to-end contract test for the Telegram widget host.
 *
 * Not a unit test of a helper: it asks the real route handler for its real
 * HTML, pulls out the `onTelegramAuth` function that ships to the browser,
 * and RUNS it. What it asserts is the seam between this page and the two
 * things that consume it — the mobile apps, which decode
 * `utf8.decode(base64.decode(data))`, and the dashboard, which reads a
 * postMessage.
 *
 * That seam is where it broke in production. The handler used
 * `btoa(JSON.stringify(user))`; btoa is Latin-1 only, so a Telegram account
 * whose first_name is Cyrillic — i.e. most of them here — threw
 * InvalidCharacterError inside a data-onauth callback, where nothing reports
 * it. The user approved in Telegram, the redirect never fired, and the app
 * sat on the widget screen until its 90-second timeout. Every ASCII test
 * account passed.
 */

import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/auth/telegram/route";

/** A payload shaped exactly like Telegram's, with a name btoa cannot encode. */
const CYRILLIC_USER = {
  id: 123456789,
  first_name: "Жамшид",
  last_name: "Мирзо",
  username: "jamshid",
  photo_url: "https://t.me/i/userpic/320/abc.jpg",
  auth_date: 1786867000,
  hash: "b7e2c1a4d9f80351e6a2c7b4098fd12e3a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
};

async function html(url: string): Promise<string> {
  const res = await GET(new NextRequest(url));
  return res.text();
}

/**
 * Extracts `onTelegramAuth` from the served page and runs it, returning
 * whatever the page tried to do: navigate, postMessage, or show text.
 *
 * The function body is executed as-is — no copy of it lives in this file, so
 * the test cannot drift from what the server actually ships.
 */
function runHandler(page: string, user: unknown) {
  const match = page.match(
    /function onTelegramAuth\(user\) \{([\s\S]*?)\n {6}\}/,
  );
  if (!match) throw new Error("onTelegramAuth not found in the served page");

  let navigatedTo: string | null = null;
  let bodyText: string | null = null;
  const posted: Array<{ message: unknown; targetOrigin: string }> = [];
  let closed = false;

  const win = {
    location: {
      set href(value: string) {
        navigatedTo = value;
      },
    },
    opener: {
      postMessage: (message: unknown, targetOrigin: string) => {
        posted.push({ message, targetOrigin });
      },
    },
    close: () => {
      closed = true;
    },
  };
  const doc = {
    body: {
      set textContent(value: string) {
        bodyText = value;
      },
    },
  };

  // btoa and TextEncoder are globals in the browser; Node has both.
  new Function(
    "user",
    "window",
    "document",
    "btoa",
    "TextEncoder",
    match[1],
  )(user, win, doc, globalThis.btoa, globalThis.TextEncoder);

  return { navigatedTo, bodyText, posted, closed };
}

/** What the Flutter apps do with `?data=` — decodeCallbackUrl, in TS. */
function decodeLikeTheApp(url: string) {
  const parsed = new URL(url);
  const data = parsed.searchParams.get("data");
  if (!data) throw new Error("callback carried no data parameter");

  let normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4 !== 0) normalized += "=";

  // base64 → bytes → UTF-8, matching utf8.decode(base64.decode(...)).
  const bytes = Uint8Array.from(atob(normalized), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

describe("mobile callback", () => {
  it("round-trips a Cyrillic profile name back to the app", async () => {
    const page = await html(
      "https://hayrli.app/api/auth/telegram?scheme=hayrli&lang=ru",
    );
    const { navigatedTo, bodyText } = runHandler(page, CYRILLIC_USER);

    expect(bodyText, "the handler reported a failure instead of navigating")
      .toBeNull();
    expect(navigatedTo).toBeTruthy();
    expect(navigatedTo!).toMatch(
      /^hayrli:\/\/oauth\/telegram\/callback\?data=/,
    );
    expect(decodeLikeTheApp(navigatedTo!)).toEqual(CYRILLIC_USER);
  });

  it("round-trips an ASCII name too — the case that always passed", async () => {
    const page = await html(
      "https://hayrli.app/api/auth/telegram?scheme=hayrli",
    );
    const user = { ...CYRILLIC_USER, first_name: "John", last_name: "Doe" };
    const { navigatedTo } = runHandler(page, user);

    expect(decodeLikeTheApp(navigatedTo!)).toEqual(user);
  });

  it("emits base64url, not base64 — the app decodes -_ and no padding", async () => {
    const page = await html(
      "https://hayrli.app/api/auth/telegram?scheme=hayrli",
    );
    // Emoji push the encoding into bytes that produce + and / in plain base64.
    const user = { ...CYRILLIC_USER, first_name: "Аё💈", username: "u~b?c" };
    const { navigatedTo } = runHandler(page, user);

    const data = new URL(navigatedTo!).searchParams.get("data")!;
    expect(data).not.toMatch(/[+/=]/);
    expect(decodeLikeTheApp(navigatedTo!)).toEqual(user);
  });

  it("honours the partner app's scheme", async () => {
    const page = await html(
      "https://hayrli.app/api/auth/telegram?scheme=operhair",
    );
    const { navigatedTo } = runHandler(page, CYRILLIC_USER);

    expect(navigatedTo!).toMatch(
      /^operhair:\/\/oauth\/telegram\/callback\?data=/,
    );
  });

  it("falls back to the default scheme rather than an attacker's", async () => {
    const page = await html(
      "https://hayrli.app/api/auth/telegram?scheme=javascript",
    );
    const { navigatedTo } = runHandler(page, CYRILLIC_USER);

    expect(navigatedTo!.startsWith("hayrli://")).toBe(true);
  });
});

describe("web callback", () => {
  it("posts to the dashboard's own origin, never a wildcard", async () => {
    const page = await html(
      "https://hayrli.app/api/auth/telegram?mode=web&origin=https://crm.hayrli.app",
    );
    const { posted, closed, navigatedTo } = runHandler(page, CYRILLIC_USER);

    expect(posted).toHaveLength(1);
    expect(posted[0].targetOrigin).toBe("https://crm.hayrli.app");
    expect(posted[0].message).toEqual({
      source: "hayrli-telegram-auth",
      user: CYRILLIC_USER,
    });
    expect(closed).toBe(true);
    // The browser path must not also fire the custom-scheme redirect.
    expect(navigatedTo).toBeNull();
  });

  it("refuses an origin that is not the dashboard", async () => {
    const page = await html(
      "https://hayrli.app/api/auth/telegram?mode=web&origin=https://evil.example.com",
    );

    expect(page).not.toContain("telegram-widget.js");
    expect(page).toContain("не может использовать вход через Telegram");
  });

  it("allows the dashboard's local dev server outside production", async () => {
    // vitest runs with NODE_ENV=test, so this exercises the same branch a
    // developer running the dashboard against `npm run dev` would hit.
    expect(process.env.NODE_ENV).not.toBe("production");

    const page = await html(
      "https://hayrli.app/api/auth/telegram?mode=web&origin=http://localhost:3000",
    );
    const { posted, closed } = runHandler(page, CYRILLIC_USER);

    expect(posted).toHaveLength(1);
    expect(posted[0].targetOrigin).toBe("http://localhost:3000");
    expect(closed).toBe(true);
  });

  it("serves the widget for mobile, which sends no origin at all", async () => {
    const page = await html(
      "https://hayrli.app/api/auth/telegram?scheme=hayrli",
    );

    expect(page).toContain("telegram-widget.js");
    expect(page).toContain('data-telegram-login="hayrliAI_bot"');
  });
});

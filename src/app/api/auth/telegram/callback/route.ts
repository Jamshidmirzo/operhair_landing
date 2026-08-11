import type { NextRequest } from "next/server";

/**
 * Where Telegram sends the signed login payload, and where it is handed to
 * the app.
 *
 * The response is an HTML page that redirects to `hayrliauth://telegram?...`
 * rather than a bare 302 to that scheme: a 302 into a custom scheme is
 * handled inconsistently by ASWebAuthenticationSession and Chrome Custom
 * Tabs, and it leaves someone without the app installed staring at a browser
 * error. The page gives them a button and an explanation instead.
 *
 * Nothing is verified here. The `hash` is checked by the backend against the
 * bot token, which this page does not have and should not: a signature check
 * on a client-facing page proves nothing to the server that receives the
 * payload afterwards.
 *
 * The scheme is `hayrliauth`, not `hayrli` — the app's main activity already
 * claims `hayrli` as a catch-all, and a second claim would make Android ask
 * which app to open on every sign-in.
 */

export const runtime = "nodejs";

const CALLBACK_SCHEME = process.env.TELEGRAM_CALLBACK_SCHEME ?? "hayrliauth";

/**
 * Exactly the fields Telegram signs. Anything else forwarded would be hashed
 * by the backend and break the signature, so this is a whitelist rather than
 * a pass-through of the query string.
 */
const SIGNED_FIELDS = [
  "id",
  "first_name",
  "last_name",
  "username",
  "photo_url",
  "auth_date",
  "hash",
] as const;

function escapeJs(value: string): string {
  return JSON.stringify(value);
}

function html(body: string, redirectTo: string | null): Response {
  const script = redirectTo
    ? `<script>
        // Drop the payload from the address bar before anything else: the
        // hash is a working credential until it expires, and it would
        // otherwise sit in browser history.
        history.replaceState(null, "", location.pathname);
        location.replace(${escapeJs(redirectTo)});
      </script>`
    : "";

  return new Response(
    `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Hayrli</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      margin: 0; min-height: 100dvh;
      display: flex; align-items: center; justify-content: center;
      font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #fff; color: #111; padding: 24px; text-align: center;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #101014; color: #f2f2f5; }
    }
    .wrap { max-width: 320px; }
    a.btn {
      display: inline-block; margin-top: 16px; padding: 12px 20px;
      border-radius: 12px; background: #2AABEE; color: #fff;
      text-decoration: none; font-weight: 600;
    }
    p { color: #6b6b76; font-size: 14px; }
  </style>
</head>
<body><div class="wrap">${body}</div>${script}</body>
</html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    },
  );
}

export async function GET(request: NextRequest): Promise<Response> {
  const incoming = request.nextUrl.searchParams;

  const forwarded = new URLSearchParams();
  for (const field of SIGNED_FIELDS) {
    const value = incoming.get(field);
    // Empty is dropped, not forwarded: Telegram omits a field it has nothing
    // for, so `last_name=` would enter the backend's data-check-string as a
    // line Telegram never signed and the HMAC would not match.
    if (value !== null && value !== "") forwarded.set(field, value);
  }

  if (!forwarded.has("id") || !forwarded.has("hash")) {
    // Someone opened the callback directly, or Telegram declined. Never log
    // the query — it carries the hash.
    return html(
      `<p>Не удалось получить данные из Telegram. Попробуйте ещё раз.</p>`,
      null,
    );
  }

  const target = `${CALLBACK_SCHEME}://telegram?${forwarded.toString()}`;

  return html(
    `<p>Возвращаемся в приложение…</p>
     <a class="btn" href="${target.replace(/&/g, "&amp;")}">Открыть Hayrli</a>`,
    target,
  );
}

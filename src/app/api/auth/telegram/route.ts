import type { NextRequest } from "next/server";

/**
 * Host page for the Telegram Login Widget.
 *
 * Telegram ships no mobile SDK for login — the widget is an iframe that only
 * runs on a domain registered with BotFather. So the app opens this page in a
 * browser session (ASWebAuthenticationSession on iOS, Chrome Auth Tab on
 * Android), the user taps "Log in with Telegram", and Telegram redirects to
 * /api/auth/telegram/callback with the signed payload.
 *
 * Why it lives under /api rather than /telegram-login: src/proxy.ts runs
 * next-intl with localePrefix "always" over everything except /api, so a
 * page route would be redirected to /ru/... — and there is no root layout
 * outside [locale] for it to render in anyway.
 *
 * BotFather setup this depends on:
 *   /setdomain -> hayrli.app
 * and TELEGRAM_LOGIN_BOT must be the same bot whose token the backend holds
 * in TELEGRAM_BOT_TOKEN. A mismatch there makes every signature fail with an
 * error that points nowhere near the cause.
 */

export const runtime = "nodejs";

// Username, not the token: the widget identifies the bot publicly. The token
// stays on the backend, which is the only party that needs to verify HMACs.
const BOT_USERNAME = process.env.TELEGRAM_LOGIN_BOT ?? "";

const CALLBACK_PATH = "/api/auth/telegram/callback";

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );
}

function page(body: string): Response {
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
      background: #fff; color: #111;
      padding: 24px; text-align: center;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #101014; color: #f2f2f5; }
    }
    .wrap { max-width: 320px; }
    p { color: #6b6b76; font-size: 14px; }
  </style>
</head>
<body><div class="wrap">${body}</div></body>
</html>`,
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        // The page carries no data, but it is one step from a credential —
        // keep it out of shared caches and out of search.
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    },
  );
}

export async function GET(_request: NextRequest): Promise<Response> {
  if (!BOT_USERNAME) {
    // Configuration gap, not a user error. Say so plainly rather than
    // rendering a widget that cannot work.
    return page(
      `<p>Вход через Telegram временно недоступен.</p>`,
    );
  }

  const script = [
    "https://telegram.org/js/telegram-widget.js?22",
  ].join("");

  return page(`
    <script async src="${escapeHtml(script)}"
      data-telegram-login="${escapeHtml(BOT_USERNAME)}"
      data-size="large"
      data-radius="12"
      data-userpic="false"
      data-request-access="write"
      data-auth-url="${CALLBACK_PATH}"></script>
    <noscript><p>Для входа через Telegram нужен JavaScript.</p></noscript>
  `);
}

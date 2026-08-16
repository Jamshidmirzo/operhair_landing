import type { NextRequest } from "next/server";

/**
 * Host page for the Telegram Login Widget — for every Hayrli client.
 *
 * Telegram validates the *embedding page's* origin against the single domain
 * registered for the bot with BotFather, and it matches exactly: subdomains
 * are not inherited. `hayrliAI_bot` is registered to `hayrli.app`, so this is
 * the only origin in the estate where the widget renders at all. Confirmed
 * against oauth.telegram.org:
 *
 *     hayrli.app        → widget renders
 *     api.hayrli.app    → "Bot domain invalid"
 *     pro.hayrli.app    → "Bot domain invalid"
 *     www.hayrli.app    → "Bot domain invalid"
 *
 * The backend also serves an embed at /api/v1/auth/telegram/embed. It returns
 * 200, which is why it looked healthy, but the widget inside it is rejected —
 * a 200 only proves the HTML was served, not that Telegram accepted the page.
 * That route cannot work without re-registering the bot to api.hayrli.app,
 * which would then break this page and the web dashboard in turn. One bot has
 * one domain; the widget therefore has to live here.
 *
 * The callback contract is deliberately identical to the backend's, so
 * clients need only change the URL they open:
 *
 *     {scheme}://oauth/telegram/callback?data=<base64url(JSON.stringify(user))>
 *
 * `scheme` picks the caller: `hayrli` for the client app, `operhair` for the
 * partner app. Both intercept the navigation inside a WebView, so the custom
 * scheme is never handed to the OS.
 *
 * Browsers have no custom scheme to be redirected into, so `?mode=web&origin=`
 * opens the same widget and posts the payload back to the opener instead.
 * That is how pro.hayrli.app signs in: it embedded the widget directly until
 * now, which could never work for the same domain reason.
 *
 * Lives under /api because src/proxy.ts runs next-intl with localePrefix
 * "always" over everything except /api: a page route would be redirected to
 * /ru/..., and there is no root layout outside [locale] to render it in.
 */

export const runtime = "nodejs";

// Username, not the token: the widget identifies the bot publicly. The token
// stays on the backend, the only party that needs to verify HMACs.
const BOT_USERNAME = process.env.TELEGRAM_LOGIN_BOT ?? "hayrliAI_bot";

/** Schemes we will redirect into. A whitelist — this value lands in a URL the
 * browser then navigates to, so it must never be caller-controlled text. */
const ALLOWED_SCHEMES = new Set(["hayrli", "operhair"]);
const DEFAULT_SCHEME = "hayrli";

/**
 * Origins allowed to receive the payload via postMessage in `mode=web`.
 *
 * A whitelist, and postMessage is always called with an explicit target
 * rather than "*": the payload contains `hash`, which is a working credential
 * until it expires. Sending it to a wildcard target would hand it to whatever
 * page happened to open this popup.
 */
const ALLOWED_WEB_ORIGINS = new Set([
  // The dashboard is served from crm.hayrli.app (a VPS behind Caddy, not this
  // Vercel project). This list named pro.hayrli.app, which is not the
  // dashboard at all — it falls through this project's `*.hayrli.app` wildcard
  // to the salon-slug route and answers "Салон не найден". So the one origin
  // that actually opens this popup was the one origin being turned away.
  "https://crm.hayrli.app",
  "https://pro.hayrli.app",
  "https://hayrli.app",
]);

const ALLOWED_LANGS = new Set(["ru", "uz", "en", "ko"]);
const DEFAULT_LANG = "ru";

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
      background: #fff; color: #111; padding: 24px; text-align: center;
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
        // One step away from a credential — keep it out of shared caches and
        // out of search results.
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    },
  );
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!BOT_USERNAME) {
    return page(`<p>Вход через Telegram временно недоступен.</p>`);
  }

  const requestedScheme = request.nextUrl.searchParams.get("scheme");
  const scheme =
    requestedScheme && ALLOWED_SCHEMES.has(requestedScheme)
      ? requestedScheme
      : DEFAULT_SCHEME;

  const requestedLang = request.nextUrl.searchParams.get("lang");
  const lang =
    requestedLang && ALLOWED_LANGS.has(requestedLang)
      ? requestedLang
      : DEFAULT_LANG;

  // Browser callers (the pro.hayrli.app dashboard) open this in a popup and
  // take the payload over postMessage — they have no custom scheme to be
  // redirected into. Mobile stays the default.
  const webOrigin = request.nextUrl.searchParams.get("origin");
  const isWeb =
    request.nextUrl.searchParams.get("mode") === "web" &&
    webOrigin !== null &&
    ALLOWED_WEB_ORIGINS.has(webOrigin);

  if (request.nextUrl.searchParams.get("mode") === "web" && !isWeb) {
    // Refusing rather than falling back to the mobile redirect: a caller
    // asking for web mode from an origin we do not know is either
    // misconfigured or fishing for the payload.
    return page(`<p>Этот сайт не может использовать вход через Telegram.</p>`);
  }

  const deliver = isWeb
    ? `
        if (!window.opener) {
          document.body.textContent = 'Окно входа открыто неправильно.';
          return;
        }
        window.opener.postMessage(
          { source: 'hayrli-telegram-auth', user: user },
          ${JSON.stringify(webOrigin)}
        );
        window.close();`
    : `
        var encoded = btoa(JSON.stringify(user))
          .replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
        window.location.href =
          ${JSON.stringify(`${scheme}://oauth/telegram/callback?data=`)} + encoded;`;

  // `data-onauth` runs in the page, so the payload never touches this server
  // — no request log can leak the `hash`, which is a live credential until it
  // expires. Mobile gets base64url with padding stripped, matching what the
  // apps decode; the browser gets the object as-is.
  return page(`
    <script async src="https://telegram.org/js/telegram-widget.js?22"
      data-telegram-login="${escapeHtml(BOT_USERNAME)}"
      data-size="large"
      data-radius="12"
      data-userpic="false"
      data-request-access="write"
      data-lang="${escapeHtml(lang)}"
      data-onauth="onTelegramAuth(user)"></script>
    <noscript><p>Для входа через Telegram нужен JavaScript.</p></noscript>
    <script>
      function onTelegramAuth(user) {${deliver}
      }
    </script>
  `);
}

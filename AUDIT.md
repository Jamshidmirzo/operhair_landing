# Статус аудита — 2026-09-16

Репозиторий публичный, поэтому здесь только список задач. Подробности, включая
соображения по безопасности, — в приватном отчёте
`operHair_backend/docs/PREPROD_AUDIT_2026-09-16.md`.

## Блокеры

1. **Сборка падает на typecheck — следующий пуш в `main` не задеплоится.**
   `npx tsc --noEmit` даёт 5 ошибок в `test/telegram-callback.test.ts` (строки 89, 165,
   177, 178, 207). `tsconfig.json:27-34` включает `**/*.ts` и исключает только
   `node_modules`, при включённых `strict` и `noUncheckedIndexedAccess`;
   `typescript.ignoreBuildErrors` не выставлен. Файл трекается и изменён в самом
   HEAD-коммите, а `.next/` датирован 16 августа — то есть с тех пор ни разу не собирали.
   Выглядеть поломка будет как проблема тестового файла, а не кода.
   Варианты: починить типы в тесте, либо исключить `test/**` из `tsconfig.json`.

2. **App Links для Hayrli Pro не работают — две независимые причины.**
   `public/.well-known/assetlinks.json`:
   - `:8` — `"package_name": "flek.hayrli.pro.app"`, тогда как Android-сборка использует
     `flek.hayrli.pro`;
   - `:10` — вместо SHA-256 стоит `TODO:REPLACE_WITH_HAYRLI_PRO_RELEASE_SHA256`
     (комментарий на `:3` подтверждает, что keystore ещё не создан).

   Починка одного без другого не даёт ничего: Android сверяет и имя пакета, и подпись.
   Пока обе на месте, каждая ссылка `hayrli.app/m/...` открывается в браузере вместо
   приложения. Отпечаток брать от **релизного** upload-keystore (см. `AUDIT.md` в
   репозитории Hayrli Pro — он сейчас отсутствует на машине сборки).

3. **AASA: проверить bundle id и Team ID для Pro.**
   `public/.well-known/apple-app-site-association:6` и `:18` объявляют
   `298VYB3R55.flek.hayrli.pro.app`, тогда как у клиентского приложения Team ID —
   `627FQ95TH8`. Два разных Team ID у приложений одной организации стоит подтвердить.
   Против реального Xcode-проекта сверяли только клиентский слот (`838094c`).
   **Сначала решить, какой bundle id у Pro на iOS** — от этого зависит и пункт 2:
   в Xcode-проекте Pro сейчас `flek.hayrli.pro.app`, на Android `flek.hayrli.pro`.

## Починить до прода

- **Сузить список доверенных origin в Telegram-роуте.**
  `src/app/api/auth/telegram/route.ts:86-93` — сейчас в проде принимаются в том числе
  локальные адреса разработки. Рассуждение коммита `fe4f322` (гейт по `NODE_ENV` не мог
  сработать) верное, но вывод нужен обратный: убрать сами записи, а не проверку.
  Детали — в приватном отчёте.
- **Завести `pro` в списке системных сабдоменов.** `src/proxy.ts:10` —
  `SYSTEM_SUBDOMAINS = {admin, api, crm, www, mail, app, backend}`, `pro` отсутствует,
  хотя `pro.hayrli.app` фигурирует как доверенный origin в
  `src/app/api/auth/telegram/route.ts:69`. Слаг салона выбирается пользователем, так что
  занять `pro` сейчас может кто угодно. Наборы системных сабдоменов у лендинга и у
  дашборда вдобавок расходятся — стоит вынести в одну общую константу.
- **`/og.png` не существует**, а ссылаются на него трижды:
  `src/app/[locale]/layout.tsx:96` (JSON-LD `Organization.logo`),
  `src/app/[locale]/m/[id]/page.tsx:77`, `src/app/salon-site/page.tsx:91`. В `public/`
  только SVG/JPG логотипа и `screenshots/`. Каждый расшаренный QR-скан `/m/<id>` мастера
  без аватара и каждый сабдомен салона без обложки отдают битую OG-карточку в Telegram и
  WhatsApp — то есть ровно в каналах, через которые продукт и распространяется.

## Мелочи

- `src/app/sitemap.ts:13-21` отдаёт только три языковых корня — `/privacy`, `/terms` и
  карточки `/m/<id>` отсутствуют. `src/app/robots.ts` разрешает всё, включая
  `/salon-site` (внутренняя цель rewrite).
- `ALLOWED_LANGS` в Telegram-роуте содержит `ko`, тогда как `src/i18n/routing.ts:3`
  знает только `ru|uz|en`.
- `npm run lint` — 1 ошибка: `src/components/layout/theme-toggle.tsx:14`
  (`react-hooks/set-state-in-effect`). Косметика, в сборку Vercel линт не входит.
- `salon-site` не сломан удалением AI-генератора на бэкенде: эндпоинт
  `GET /api/v1/public/salons/{slug}` жив и по-прежнему отдаёт `site_content`. Но у новых
  салонов это поле теперь всегда пустое, так что страница всегда падает в дефолты
  (`src/app/salon-site/page.tsx:194-199`), а вся ветка `style_config` (`:202`) стала
  мёртвым кодом.
- Устарели: `lucide-react` 1.14.0, `shadcn` 4.6.0, `@base-ui/react` 1.4.1,
  `framer-motion` 12.38 (есть мажор 13).

## Проверено — чисто

Секретов в репозитории нет: `.env*` не трекается вовсе (`.gitignore:25-27`), токен бота
читается только как серверная переменная и в клиент не попадает. Канонический домен
консистентно `https://hayrli.app`; метаданные по локалям полные (canonical, hreflang для
ru/uz/en, OG locale, Twitter card). Захардкоженных localhost/staging URL в `src/`,
`public/` и `messages/` нет. Подпись Telegram-payload проверяется на бэкенде, как и
задумано — лендинг является только хостом виджета.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Public endpoint for "Become a partner" submissions from the landing page.
 *
 * Delivery strategy (in order):
 *   1. Telegram bot (`TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`) — primary
 *      channel for the business owner. Always tried first when configured.
 *   2. FastAPI backend at `BACKEND_URL/api/v1/public/partner-leads` — optional
 *      durable storage + admin panel pipeline. Best-effort; failure is logged
 *      but does not fail the request.
 *
 * If neither channel is configured the route still returns 200 so the user
 * sees a success state, and the lead is at least logged on the server side.
 * That degraded mode is intentional: a public landing page must never reject
 * a partnership lead because of a misconfigured ops env.
 *
 * Honeypot: a non-empty `honeypot` field is treated as a fake-success — we
 * acknowledge the bot but skip all real delivery so spammers can't tell the
 * difference between a real and a swallowed submission.
 *
 * Rate-limit (basic): per-IP in-memory token bucket. Sufficient for the
 * single-instance Vercel function — survives within a single warm container.
 * For a stronger guarantee swap in Upstash KV or rely on the FastAPI backend.
 */

export const runtime = "nodejs";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const BACKEND_URL = process.env.BACKEND_URL;
const TIMEOUT_MS = 8_000;

// Per-IP rate-limiter. We allow up to 5 successful submissions per IP per
// 10 minutes — generous enough that a real user retrying isn't blocked,
// strict enough to slow scripted abuse.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const ipHits = new Map<string, number[]>();

function clientIp(request: NextRequest): string {
  // Vercel sets `x-vercel-forwarded-for` at the edge — clients cannot override it.
  // Other reverse proxies typically use `x-real-ip`.
  // Raw `x-forwarded-for` is intentionally NOT consulted: when the route is hit
  // directly (dev tunnel, self-hosted, mis-routed), clients can set it freely,
  // which would let an attacker spoof IPs to bypass rate-limit and pollute the
  // Telegram alert.
  const vercel = request.headers.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;
  const hits = (ipHits.get(ip) ?? []).filter((t) => t > cutoff);
  if (hits.length >= RATE_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

type LeadPayload = {
  name: string;
  phone: string;
  city: string;
  honeypot?: string;
  source?: string;
};

function validate(
  body: unknown,
): { ok: true; data: LeadPayload } | { ok: false } {
  if (!body || typeof body !== "object") return { ok: false };
  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const city = typeof b.city === "string" ? b.city.trim() : "";
  const honeypot = typeof b.honeypot === "string" ? b.honeypot : "";
  const source = typeof b.source === "string" ? b.source : "landing";

  if (name.length < 2 || name.length > 100) return { ok: false };
  if (!/^\+998\d{9}$/.test(phone)) return { ok: false };
  if (city.length < 2 || city.length > 100) return { ok: false };

  return { ok: true, data: { name, phone, city, honeypot, source } };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendTelegram(lead: LeadPayload, ip: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;

  const text = [
    "<b>Hayrli — новая заявка партнёра</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    `<b>Телефон:</b> ${escapeHtml(lead.phone)}`,
    `<b>Город:</b> ${escapeHtml(lead.city)}`,
    `<b>Источник:</b> ${escapeHtml(lead.source ?? "landing")}`,
    `<b>IP:</b> ${escapeHtml(ip)}`,
    `<b>Время:</b> ${new Date().toISOString()}`,
  ].join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
        cache: "no-store",
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[leads] telegram non-2xx", res.status, body.slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[leads] telegram error", err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function forwardToBackend(lead: LeadPayload, ip: string): Promise<void> {
  if (!BACKEND_URL) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/public/partner-leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": ip,
      },
      body: JSON.stringify({
        name: lead.name,
        phone: lead.phone,
        city: lead.city,
        honeypot: lead.honeypot ?? "",
        source: lead.source ?? "landing",
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      // 404 is expected while the backend deployment doesn't expose
      // partner-leads; treat any non-2xx as best-effort failure and log.
      console.warn(
        "[leads] backend forward non-2xx",
        res.status,
        body.slice(0, 300),
      );
    }
  } catch (err) {
    console.warn("[leads] backend forward error", err);
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const result = validate(parsed);
  if (!result.ok) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }

  const lead = result.data;
  const ip = clientIp(request);

  // Honeypot: bots fill every input. Fake-success and silently drop.
  if (lead.honeypot && lead.honeypot.trim().length > 0) {
    console.info("[leads] honeypot triggered ip=%s", ip);
    return NextResponse.json({ success: true }, { status: 200 });
  }

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  }

  const tgOk = await sendTelegram(lead, ip);

  // Best-effort fan-out to durable backend storage. Awaited (not detached)
  // because Vercel kills detached promises when the handler returns.
  await forwardToBackend(lead, ip);

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    // No delivery channel configured at all. Log the lead so it isn't lost
    // and still report success to the user. Ops must wire env vars.
    console.warn(
      "[leads] NO TELEGRAM CONFIGURED — lead captured in logs only:",
      JSON.stringify({ ...lead, ip }),
    );
    return NextResponse.json({ success: true }, { status: 200 });
  }

  if (!tgOk) {
    // Telegram configured but failed. Surface as 5xx so the user retries.
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

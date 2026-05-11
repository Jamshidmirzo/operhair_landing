import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Narrow proxy for the public partner-leads endpoint.
 *
 * Why a proxy at all:
 *  - Backend sits at $BACKEND_URL (default http://localhost:8000) and is not
 *    necessarily addressable from the browser. Forwarding through Next keeps
 *    the same origin in production and avoids leaking the upstream URL.
 *  - The backend rate-limits by IP. We forward `X-Forwarded-For` so the limit
 *    is applied to the real client and not the Next.js server itself.
 *
 * This is intentionally narrower than the admin proxy: only POST, only the
 * one upstream path, no auth.
 */

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
const UPSTREAM_PATH = "/api/v1/public/partner-leads";
const TIMEOUT_MS = 10_000;

export async function POST(request: NextRequest) {
  // Buffer the body — we only forward JSON, but reading as text keeps us
  // tolerant of any content-type the client sends and lets us re-emit it
  // verbatim to the upstream.
  const body = await request.text();

  // Build forwarded headers. We only need a couple of things:
  //  - content-type (so FastAPI parses JSON)
  //  - X-Forwarded-For (so the backend rate-limiter sees the real client IP)
  // Pass-through of arbitrary client headers is unnecessary and risky.
  const headers = new Headers();
  headers.set(
    "content-type",
    request.headers.get("content-type") ?? "application/json",
  );
  headers.set("accept", "application/json");

  const incomingXff = request.headers.get("x-forwarded-for");
  // NextRequest doesn't expose the socket address directly. In practice,
  // either Vercel/edge sets X-Forwarded-For for us, or in local dev the
  // header is absent and we just don't add one — backend will fall back to
  // its own request.client.host detection.
  if (incomingXff) {
    headers.set("x-forwarded-for", incomingXff);
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    headers.set("x-real-ip", realIp);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(`${BACKEND_URL}${UPSTREAM_PATH}`, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
      // Don't let Next's data cache touch a mutating request.
      cache: "no-store",
    });

    const resBody = await upstream.text();
    const resHeaders = new Headers();
    const ct = upstream.headers.get("content-type");
    if (ct) resHeaders.set("content-type", ct);

    return new NextResponse(resBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    // AbortError or network error — backend unavailable from our side.
    return NextResponse.json(
      { error: "service_unavailable" },
      { status: 503 },
    );
  } finally {
    clearTimeout(timer);
  }
}

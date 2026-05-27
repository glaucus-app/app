import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Generate unique nonce per request for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Build CSP header with both nonce and unsafe-inline
  // - nonce-${nonce} allows Next.js production scripts with nonce to run
  // - 'unsafe-inline' allows inline scripts (Next.js dev mode, fallback)
  // - 'strict-dynamic' trusts scripts loaded by nonce scripts
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    // Allow Kilo Code and TweakCN preview iframes
    "frame-ancestors 'self' https://*.kilocode.com https://kilocode.com https://*.tweakcn.com https://tweakcn.com",
    "base-uri 'self'",
  ].join("; ");

  // Pass nonce to downstream via request header for debugging
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set CSP header on response
  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

// Only run on pages, not static files or API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

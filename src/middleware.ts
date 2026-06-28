import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/labels",
  "/habits",
  "/goals",
  "/groups",
  "/leaderboard",
  "/ai-helper",
  "/study-plant",
  "/settings",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/** NextAuth v5 session cookie names (dev vs production HTTPS). */
function hasSessionCookie(request: NextRequest) {
  return (
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("__Host-authjs.session-token")
  );
}

/**
 * Lightweight auth gate — avoids NextAuth edge middleware, which crashes on
 * Vercel when AUTH_SECRET is missing (MIDDLEWARE_INVOCATION_FAILED).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (hasSessionCookie(request)) {
    return NextResponse.next();
  }

  const signIn = new URL("/auth/signin", request.url);
  signIn.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|auth|sw.js|embed.js|embed|mini).*)",
  ],
};

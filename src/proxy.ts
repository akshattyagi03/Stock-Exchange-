import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const url = request.nextUrl;

  // Redirect logged-in users away from auth pages
  if (
    token &&
    (
      url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify")
    )
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect all protected routes
  if (!token && (
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/holdings") ||
    url.pathname.startsWith("/orders") ||
    url.pathname.startsWith("/watchlist") ||
    url.pathname.startsWith("/analytics") ||
    url.pathname.startsWith("/ai-advisor") ||
    url.pathname.startsWith("/funds") ||
    url.pathname.startsWith("/settings") ||
    url.pathname.startsWith("/billing") ||
    url.pathname.startsWith("/quick-create")
  )) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/verify/:path*",
    "/dashboard/:path*",
    "/holdings/:path*",
    "/orders/:path*",
    "/watchlist/:path*",
    "/analytics/:path*",
    "/ai-advisor/:path*",
    "/funds/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/quick-create/:path*",
  ],
};
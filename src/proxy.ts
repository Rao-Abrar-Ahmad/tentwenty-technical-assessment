import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;
  console.log('current token => ', token);
  console.log('current pahtname -> ', pathname)
  // Redirect authenticated users away from login
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/timesheets", req.url));
  }

  // Protect routes
  if (!token && (pathname.startsWith("/timesheets") || pathname.startsWith("/api/timesheets"))) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/timesheets/:path*",
    "/api/timesheets/:path*",
  ],
};
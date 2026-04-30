import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Always allow setup and auth routes
  if (pathname.startsWith("/setup") || pathname.startsWith("/api/setup")) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!req.auth && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from login
  if (req.auth && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

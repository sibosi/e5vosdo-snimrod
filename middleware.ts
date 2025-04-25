import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/auth/callback/google")) {
    const host = request.headers.get("host");
    if (host?.includes("e5vosdo.hu") || host?.includes("info.e5vosdo.hu")) {
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/auth/callback/google"],
};

import { NextResponse } from "next/server";

export function middleware(request) {
  const session = request.cookies.get("session");
  const url = new URL("/signin", request.url);
  url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);

  if (!session) {
    // Remember where the user was trying to go
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Cookie exists → let the request continue
  return NextResponse.next();
}

// Only run on the private routes — keep the matcher narrow
// Private routes only. Keeping this narrow means public pages
// (/, /menu, /cart) never invoke middleware and stay static/ISR.
export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/kitchen/:path*"],
};
import { NextResponse } from "next/server";

export function proxy(request) {
  const session = request.cookies.get("session");

  if (!session) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search
    );
    return NextResponse.redirect(signInUrl);
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
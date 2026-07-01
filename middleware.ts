import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Public demo lives under /demo and reuses the dashboard for a fictional
  // company. Flag it with a header (read by getActiveCompany) and skip the
  // Supabase session refresh — no auth needed here.
  if (request.nextUrl.pathname.startsWith("/demo")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-demo", "1");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image files, so the
     * session is refreshed on navigations and /dashboard/* stays protected.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

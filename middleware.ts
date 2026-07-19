import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // x-demo is an INTERNAL signal only middleware may set — getActiveCompany
  // treats it as authoritative demo mode (user:null, canAdminister true), so a
  // client-supplied x-demo could otherwise spoof demo context on a real request.
  // Strip any inbound value first, then set it ourselves only for /demo.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-demo");

  // Public demo lives under /demo and reuses the dashboard for a fictional
  // company. Flag it with the header (read by getActiveCompany) and skip the
  // Supabase session refresh — no auth needed here.
  if (request.nextUrl.pathname.startsWith("/demo")) {
    requestHeaders.set("x-demo", "1");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return updateSession(request, requestHeaders);
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

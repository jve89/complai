/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer ships native-ish deps that should not be bundled by the
  // Next server compiler — keep it external so the PDF route works at runtime.
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    // Enables instrumentation.ts (Next 14.2) — used for the fail-fast prod env check.
    instrumentationHook: true,
  },
  // Type-checking (tsc) still runs during build; we just don't want lint-only
  // issues (e.g. unused imports) to fail production deploys.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Baseline security headers on every response. CSP is intentionally limited to
  // frame-ancestors/base-uri/object-src (no script-src) so it can't break Next's
  // inline runtime; the clickjacking defense is frame-ancestors 'none' +
  // X-Frame-Options: DENY. HSTS is safe on Vercel (always HTTPS) and ignored by
  // browsers over http/localhost.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

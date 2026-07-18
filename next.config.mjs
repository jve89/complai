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
};

export default nextConfig;

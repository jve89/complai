/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer ships native-ish deps that should not be bundled by the
  // Next server compiler — keep it external so the PDF route works at runtime.
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

export default nextConfig;

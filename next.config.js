/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['msosijumla.s3.eu-north-1.amazonaws.com'],
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_PROTOCOL,
        hostname: process.env.NEXT_PUBLIC_API_HOSTNAME,
      },
      {
        protocol: process.env.NEXT_PUBLIC_PROTOCOL,
        hostname: process.env.NEXT_PUBLIC_STORAGE_HOSTNAME,
      },
      {
        protocol: process.env.NEXT_PUBLIC_PROTOCOL,
        hostname: "msosi.jumlajumla.com",
      },
    ],
    minimumCacheTTL: 3600,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = withBundleAnalyzer(nextConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Externalize @libsql packages for Turbopack (prevents bundling issues)
  serverExternalPackages: ['@libsql/client', '@mastra/libsql'],
};

export default nextConfig;

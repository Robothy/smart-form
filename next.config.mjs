/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Ignore ESLint errors during production builds to allow builds to complete
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // WARNING: This should be disabled for production!
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static page generation since we only need API routes
  output: "standalone",
  // Disable page optimization since we don't have any pages
  optimizeFonts: false,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

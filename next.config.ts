import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: "/v0/b/aquaventa-d568a.firebasestorage.app/**",
      },
    ],
  },
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // enable only in prod
});

module.exports = withPWA({
  reactStrictMode: true,
});

export default nextConfig;

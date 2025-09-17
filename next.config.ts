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

export default nextConfig;

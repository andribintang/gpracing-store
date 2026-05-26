import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
  },
  // Railway injects PORT env var
  ...(process.env.PORT ? { experimental: {} } : {}),
};

export default nextConfig;

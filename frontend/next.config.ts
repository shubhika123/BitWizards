import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        // Prevent aggressive caching of catalog images so updates show immediately
        source: "/catalog/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";
    const defaultApiUrl = isProd ? "https://bitwizards.onrender.com" : "http://127.0.0.1:8000";
    const apiBase = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;
    
    return [
      {
        source: '/pruna-api/:path*',
        destination: 'https://api.pruna.ai/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

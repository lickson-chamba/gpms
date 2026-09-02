import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Local dev only. Next.js checks that a Server Action's request Origin
  // matches its own host to block CSRF — this trips up setups where
  // something between the browser and `next dev` rewrites headers (dev
  // containers, WSL, Codespaces/Gitpod, tunnels, some Docker networking).
  // If login still errors after this, add whatever host you actually load
  // the app from to both lists below. Don't carry a loose allowedOrigins
  // list like this into production.
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000"],
    },
  },
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Klasyczny App Router SSR - wystarczający na Etap 0/MVP.
  transpilePackages: ["@google/model-viewer"],
  experimental: {
    serverActions: {
      bodySizeLimit: "45mb",
    },
    // Next 16.4 Turbopack: persistent FS cache can emit HMR `restart` on every
    // subscribe → infinite tab reload. Disable until upstream fix lands.
    // https://github.com/vercel/next.js/issues/100251
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;

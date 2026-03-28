import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents is opt-in (Next.js 16); disabled here so pages use
  // force-dynamic + unstable_cache instead of build-time cache warming.
  allowedDevOrigins: ["alecia-gaited-emiliano.ngrok-free.dev"],
};

export default nextConfig;

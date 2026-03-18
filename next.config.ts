import type { NextConfig } from "next";

const isAitBuild = process.env.BUILD_TARGET === "ait";

const nextConfig: NextConfig = {
  ...(isAitBuild ? { output: "export", images: { unoptimized: true } } : {}),
  compiler: {
    emotion: true,
  },
  transpilePackages: ["@toss/tds-mobile", "@apps-in-toss/web-bridge", "@apps-in-toss/web-framework"],
};

export default nextConfig;

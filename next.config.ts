import type { NextConfig } from "next";

const isAitBuild = process.env.BUILD_TARGET === "ait";

// 광고 그룹 ID가 비면 컴포넌트가 테스트 ID/빈 값으로 폴백한다. 출시 번들에 그대로 들어가면 심사 반려·광고 수익 0.
if (isAitBuild) {
  for (const key of ["NEXT_PUBLIC_TOSS_REWARDED_AD_GROUP_ID", "NEXT_PUBLIC_TOSS_BANNER_AD_GROUP_ID"]) {
    const v = process.env[key];
    if (!v || v.startsWith("ait-ad-test")) throw new Error(`[build:ait] ${key} 미설정 또는 테스트 ID — .env.local 확인`);
  }
}

const nextConfig: NextConfig = {
  ...(isAitBuild ? { output: "export", images: { unoptimized: true } } : {}),
  compiler: {
    emotion: true,
  },
  transpilePackages: ["@toss/tds-mobile", "@apps-in-toss/web-bridge", "@apps-in-toss/web-framework"],
};

export default nextConfig;

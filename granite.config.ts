import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "planty",
  brand: {
    displayName: "플랜티",
    primaryColor: "#004ECB",
    icon: "https://your-domain.com/icon-512.png", // NOTE: 외부 접근성이 확보된 URL이거나 토스 디벨로퍼스 콘솔에서 직접 업로드해야 합니다.
  },
  permissions: [],
  web: {
    port: 3000,
    commands: {
      dev: "npm run dev",
      build: "npm run build:ait",
    },
  },
  outdir: "out",
  webViewProps: {
    type: "partner",
    bounces: true,
    pullToRefreshEnabled: true,
    allowsBackForwardNavigationGestures: true,
  },
});

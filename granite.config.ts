import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "planty",
  brand: {
    displayName: "플랜티",
    primaryColor: "#3182F6",
    icon: "https://static.toss.im/appsintoss/27829/136d7f2d-c91b-4474-bb91-46a625085271.png",
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

import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "planty",
  brand: {
    displayName: "플랜티",
    primaryColor: "#00C473",
    icon: "/icon-512.png",
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

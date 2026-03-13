import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "daily-green",
  brand: {
    displayName: "초록하루",
    primaryColor: "#00C473",
    icon: "https://placeholder.example.com/icon-512.png",
  },
  permissions: [],
  web: {
    port: 3000,
    commands: {
      dev: "npm run dev",
      build: "npm run build",
    },
  },
  webViewProps: {
    type: "partner",
    bounces: true,
    pullToRefreshEnabled: true,
    allowsBackForwardNavigationGestures: true,
  },
});

import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "planty",

  brand: {
    primaryColor: "#1B64DA"
  },

  permissions: [],
  webBundleDir: "out",

  webView: {
    bounces: true,
    pullToRefreshEnabled: true,
    allowsBackForwardNavigationGestures: true
  }
});

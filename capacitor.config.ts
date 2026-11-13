import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ariakepsut.crm",
  appName: "ARIA KEPSUT",
  webDir: ".output/public",
  android: {
    allowMixedContent: false,
  },
};

export default config;

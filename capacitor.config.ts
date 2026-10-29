import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lufo.teacher",
  appName: "LUFO Teacher",
  webDir: "dist",
  server: {
    // For development on a real device, point to your machine's IP + Vite port
    // url: "http://192.168.1.10:8080",
    // cleartext: true,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#0b0d14",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0b0d14",
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;

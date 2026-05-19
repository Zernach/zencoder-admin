import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "CellarTracker Wine Intelligence",
  slug: "cellartracker-admin",
  scheme: "cellartracker-admin",
  icon: "./src/assets/images/zencoder-orange.png",
  android: {
    package: "wine.cellartracker.admin",
    icon: "./src/assets/images/zencoder-orange.png",
  },
  ios: {
    bundleIdentifier: "wine.cellartracker.admin",
    icon: "./src/assets/images/zencoder-orange.png",
  },
  web: {
    bundler: "metro",
    favicon: "./src/assets/images/zencoder-transparent.ico",
    backgroundColor: "#0a0a0a",
  },
  plugins: ["expo-router"],
});

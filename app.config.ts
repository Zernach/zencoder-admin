import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Clarium Admin",
  slug: "clarium-admin",
  scheme: "clarium-admin",
  icon: "./src/assets/images/zencoder-orange.png",
  android: {
    package: "org.archlife.clariumadmin",
    icon: "./src/assets/images/zencoder-orange.png",
  },
  ios: {
    bundleIdentifier: "org.archlife.clariumadmin",
    icon: "./src/assets/images/zencoder-orange.png",
  },
  web: {
    bundler: "metro",
    favicon: "./src/assets/images/zencoder-transparent.ico",
    backgroundColor: "#0a0a0a",
  },
  plugins: ["expo-router"],
});

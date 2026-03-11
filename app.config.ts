import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Zencoder Admin",
  slug: "zencoder-admin",
  scheme: "zencoder-admin",
  icon: "./src/assets/images/zencoder-orange.png",
  android: {
    package: "org.archlife.zencoderadmin",
    icon: "./src/assets/images/zencoder-orange.png",
  },
  ios: {
    bundleIdentifier: "org.archlife.zencoderadmin",
    icon: "./src/assets/images/zencoder-orange.png",
  },
  web: {
    bundler: "metro",
    favicon: "./src/assets/images/zencoder-transparent.ico",
    backgroundColor: "#0a0a0a",
  },
  plugins: ["expo-router"],
});

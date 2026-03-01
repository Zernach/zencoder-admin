import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Zencoder Admin",
  slug: "zencoder-admin",
  scheme: "zencoder-admin",
  android: {
    package: "org.archlife.zencoderadmin",
  },
  ios: {
    bundleIdentifier: "org.archlife.zencoderadmin",
  },
  web: {
    bundler: "metro",
  },
  plugins: ["expo-router"],
});

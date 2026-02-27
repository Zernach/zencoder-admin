import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Zencoder Admin",
  slug: "zencoder-admin",
  scheme: "zencoder-admin",
  web: {
    bundler: "metro",
  },
  plugins: ["expo-router"],
});

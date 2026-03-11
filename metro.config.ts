import { getDefaultConfig } from "expo/metro-config";

const config = getDefaultConfig(__dirname);

// Unique cache key per project to avoid serving another project's assets (e.g. favicon)
(config as { cacheVersion: string }).cacheVersion = "zencoder-admin";

export default config;

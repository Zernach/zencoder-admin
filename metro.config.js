const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Unique cache key per project to avoid serving another project's assets (e.g. favicon)
config.cacheVersion = "zencoder-admin";

module.exports = config;

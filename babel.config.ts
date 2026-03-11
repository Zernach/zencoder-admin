type BabelConfigApi = { cache: (enabled: boolean) => void };

export default function (api: BabelConfigApi) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module-resolver", { alias: { "@": "./src" } }],
      "react-native-reanimated/plugin", // must be last
    ],
  };
}

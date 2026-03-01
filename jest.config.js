/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/\\.claude/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|victory-native|d3-.*|internmap|moti|@shopify/flash-list|tamagui|@tamagui/.*|immer|@reduxjs/toolkit|redux-saga|react-redux|@tanstack/react-query|lucide-react-native|react-native-reanimated|react-native-svg))",
  ],
};

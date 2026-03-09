/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  forceExit: true, // Prevents worker hang from residual timers (RTK Query, rAF polyfill)
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect", "<rootDir>/src/testing/jestSetup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/\\.claude/"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|victory-native|d3-.*|internmap|moti|immer|@reduxjs/toolkit|redux-saga|react-redux|@tanstack/react-query|lucide-react-native|react-native-reanimated|react-native-svg))",
  ],
};

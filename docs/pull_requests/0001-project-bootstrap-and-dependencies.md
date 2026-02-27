# 0001 — Project Bootstrap & Dependencies

> Scaffold the Expo project, install every dependency from the technical spec, and configure TypeScript strict mode so all downstream PRs can import, compile, and test from day one.

---

## Prior State

`package.json` contains only `dotenv`. No tsconfig, no babel config, no Expo app config, no test runner. Theme tokens exist in `src/theme/` but nothing else in `src/`.

## Target State

A fully configured Expo + React Native + React Native Web monorepo where `npx tsc --noEmit`, `npx expo start --web`, and `npx jest --passWithNoTests` all exit 0.

---

## Exact Dependencies

### Production

```
expo  expo-router  expo-constants  expo-linking  expo-status-bar  expo-system-ui
react-native  react-native-web  react-dom
@tanstack/react-query
@reduxjs/toolkit  react-redux  redux-saga
react-native-svg  victory-native  d3-scale  d3-shape  d3-array
react-native-reanimated  moti  react-native-gesture-handler
react-native-safe-area-context
tamagui  @tamagui/core  @tamagui/config
expo-linear-gradient  expo-blur
lucide-react-native
@shopify/flash-list
```

### Development

```
typescript  @types/react  @types/react-native
jest  @types/jest  ts-jest  jest-expo
@testing-library/react-native  @testing-library/jest-native
msw
@playwright/test
eslint  @typescript-eslint/parser  @typescript-eslint/eslint-plugin
prettier
babel-plugin-module-resolver
```

---

## Files to Create

### `tsconfig.json`

```jsonc
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["jest", "@testing-library/jest-native"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "e2e/**/*.ts"]
}
```

### `babel.config.js`

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module-resolver", { alias: { "@": "./src" } }],
      "react-native-reanimated/plugin", // must be last
    ],
  };
};
```

### `app.config.ts`

Expo config: scheme `zencoder-admin`, web bundler `metro`, plugins `["expo-router"]`.

### `metro.config.js`

Standard Expo metro config with web support.

### `jest.config.ts`

```ts
export default {
  preset: "jest-expo",
  setupFilesAfterSetup: ["@testing-library/jest-native/extend-expect"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|victory-native|d3-.*|moti|@shopify/flash-list|tamagui|@tamagui/.*))",
  ],
};
```

### Scaffold Directories (with `.gitkeep`)

```
src/app/(dashboard)/runs/
src/features/analytics/types/
src/features/analytics/api/stub/
src/features/analytics/services/
src/features/analytics/hooks/__tests__/
src/features/analytics/mappers/
src/features/analytics/fixtures/
src/features/analytics/utils/__tests__/
src/features/settings/types/
src/features/settings/hooks/
src/components/dashboard/__tests__/
src/components/charts/__tests__/
src/components/tables/__tests__/
src/components/shell/
src/core/di/
src/store/slices/
src/store/sagas/
src/providers/
src/hooks/
src/__tests__/integration/
e2e/tests/
e2e/helpers/
```

---

## Depends On

Nothing — this is PR #1.

## Done When

```bash
npm install                   # exits 0
npx tsc --noEmit              # exits 0 (strict: true)
npx expo start --web          # dev server starts
npx jest --passWithNoTests    # exits 0
```

All `@/` path aliases resolve in source and test files. Directory tree matches the technical spec layout.

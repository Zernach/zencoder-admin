import type { ReactNode } from "react";
import { act } from "@testing-library/react-native";

// Global mock for ThemeProvider so components that use useThemeMode() work in tests
// Individual test files can override this with their own jest.mock() calls.
jest.mock("@/providers/ThemeProvider", () => ({
  useThemeMode: () => ({ mode: "dark", setMode: jest.fn(), toggleMode: jest.fn() }),
}));

// Default safe-area mock for tests that use hooks/components from react-native-safe-area-context.
// Individual test files can override this mock when they need non-zero insets.
jest.mock("react-native-safe-area-context", () => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 320, height: 640 };

  return {
    SafeAreaProvider: ({ children }: { children?: ReactNode }) => children ?? null,
    SafeAreaConsumer: ({
      children,
    }: {
      children?: (value: typeof insets) => ReactNode;
    }) => (children ? children(insets) : null),
    SafeAreaView: ({ children }: { children?: ReactNode }) => children ?? null,
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets, frame },
  };
});

// Flush pending microtasks to avoid "torn down" errors from stray async work
afterEach(async () => {
  await act(async () => {
    await new Promise((r) => setImmediate(r));
  });
});

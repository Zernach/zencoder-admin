// Global mock for ThemeProvider so components that use useThemeMode() work in tests
// Individual test files can override this with their own jest.mock() calls.
jest.mock("@/providers/ThemeProvider", () => ({
  useThemeMode: () => ({ mode: "dark", setMode: jest.fn(), toggleMode: jest.fn() }),
}));

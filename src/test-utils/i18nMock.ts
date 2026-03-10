/**
 * Shared i18n mock for tests.
 *
 * Usage: add `jest.mock("react-i18next", () => require("@/test-utils/i18nMock"));`
 * at the top of test files that render components using `useTranslation`.
 *
 * The mock returns the translation key as-is (passthrough), with interpolation
 * parameters replaced so tests can assert on them when needed.
 */

function mockT(key: string, params?: Record<string, unknown>): string {
  if (!params) return key;
  let result = key;
  for (const [k, v] of Object.entries(params)) {
    result = result.replace(`{{${k}}}`, String(v));
  }
  return result;
}

const i18nMock = {
  useTranslation: () => ({
    t: mockT,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: "en",
    },
  }),
  initReactI18next: {
    type: "3rdParty" as const,
    init: () => undefined,
  },
  Trans: ({ children }: { children: unknown }) => children,
};

export = i18nMock;

import i18n from "../config";

describe("i18n config", () => {
  it("initializes without errors", () => {
    expect(i18n.isInitialized).toBe(true);
  });

  it("has English as the default language", () => {
    expect(i18n.language).toBe("en");
  });

  it("loads English translations for common.appName", () => {
    expect(i18n.t("common.appName")).toBe("Zencoder");
  });

  it("loads English translations for navigation keys", () => {
    expect(i18n.t("navigation.home")).toBe("Home");
    expect(i18n.t("navigation.agents")).toBe("Agents");
    expect(i18n.t("navigation.costs")).toBe("Costs");
    expect(i18n.t("navigation.governance")).toBe("Governance");
    expect(i18n.t("navigation.settings")).toBe("Chat");
  });

  it("loads English translations for dashboard keys", () => {
    expect(i18n.t("dashboard.keyMetrics")).toBe("Key Metrics");
    expect(i18n.t("dashboard.trends")).toBe("Trends");
  });

  it("loads English translations for settings keys", () => {
    expect(i18n.t("settings.title")).toBe("Settings");
    expect(i18n.t("settings.darkMode")).toBe("Dark Mode");
  });

  it("loads English translations for error keys", () => {
    expect(i18n.t("errors.somethingWentWrong")).toBe(
      "Something went wrong. Please try again.",
    );
  });

  it("falls back to English for missing keys in other languages", () => {
    const result = i18n.t("common.appName", { lng: "fr" });
    expect(result).toBe("Zencoder");
  });

  it("returns key path for completely missing keys", () => {
    const result = i18n.t("nonexistent.key");
    expect(result).toBe("nonexistent.key");
  });
});

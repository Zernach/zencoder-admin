import i18n from "../config";
import en from "../locales/en.json";
import ru from "../locales/ru.json";
import de from "../locales/de.json";
import fr from "../locales/fr.json";
import itTranslation from "../locales/it.json";
import es from "../locales/es.json";
import pl from "../locales/pl.json";
import uk from "../locales/uk.json";
import ro from "../locales/ro.json";
import nl from "../locales/nl.json";
import tr from "../locales/tr.json";
import el from "../locales/el.json";
import hu from "../locales/hu.json";
import pt from "../locales/pt.json";
import cs from "../locales/cs.json";
import sv from "../locales/sv.json";
import sr from "../locales/sr.json";
import bg from "../locales/bg.json";
import hr from "../locales/hr.json";
import da from "../locales/da.json";
import type { LanguageCode } from "@/types/settings";

type TranslationMap = Record<string, unknown>;

function getKeys(obj: TranslationMap, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...getKeys(value as TranslationMap, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

function getValues(obj: TranslationMap, prefix = ""): { key: string; value: unknown }[] {
  const entries: { key: string; value: unknown }[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      entries.push(...getValues(value as TranslationMap, fullKey));
    } else {
      entries.push({ key: fullKey, value });
    }
  }
  return entries;
}

const allLocales: Record<string, TranslationMap> = {
  en,
  ru,
  de,
  fr,
  it: itTranslation,
  es,
  pl,
  uk,
  ro,
  nl,
  tr,
  el,
  hu,
  pt,
  cs,
  sv,
  sr,
  bg,
  hr,
  da,
};

const enKeys = getKeys(en);

beforeEach(async () => {
  await i18n.changeLanguage("en");
});

describe("Language Integration", () => {
  describe("switching from English to each language updates t() output", () => {
    const otherLanguages: LanguageCode[] = [
      "ru", "de", "fr", "it", "es", "pl", "uk", "ro", "nl",
      "tr", "el", "hu", "pt", "cs", "sv", "sr", "bg", "hr", "da",
    ];

    it.each(otherLanguages)("switching to %s produces translated settings.title", async (lang) => {
      expect(i18n.t("settings.title")).toBe("Settings");

      await i18n.changeLanguage(lang);

      const translated = i18n.t("settings.title");
      // settings.title differs from English in all other languages
      expect(translated).not.toBe("Settings");
      expect(translated.length).toBeGreaterThan(0);
    });

    it.each(otherLanguages)("switching to %s produces translated common.cancel", async (lang) => {
      expect(i18n.t("common.cancel")).toBe("Cancel");

      await i18n.changeLanguage(lang);

      const translated = i18n.t("common.cancel");
      expect(translated).not.toBe("Cancel");
      expect(translated.length).toBeGreaterThan(0);
    });

    it.each(otherLanguages)("switching to %s produces translated common.save", async (lang) => {
      expect(i18n.t("common.save")).toBe("Save");

      await i18n.changeLanguage(lang);

      const translated = i18n.t("common.save");
      expect(translated).not.toBe("Save");
      expect(translated.length).toBeGreaterThan(0);
    });
  });

  describe("switching back to English restores original strings", () => {
    it.each<LanguageCode>([
      "ru", "de", "fr", "it", "es", "pl", "uk", "ro", "nl",
      "tr", "el", "hu", "pt", "cs", "sv", "sr", "bg", "hr", "da",
    ])("en → %s → en round-trip", async (lang) => {
      const originalTitle = i18n.t("settings.title");
      const originalCancel = i18n.t("common.cancel");

      await i18n.changeLanguage(lang);
      expect(i18n.t("settings.title")).not.toBe(originalTitle);

      await i18n.changeLanguage("en");
      expect(i18n.t("settings.title")).toBe(originalTitle);
      expect(i18n.t("common.cancel")).toBe(originalCancel);
    });
  });

  describe("fallback behavior", () => {
    it("unknown locale falls back to English", async () => {
      await i18n.changeLanguage("xx");
      expect(i18n.t("common.appName")).toBe("Zencoder");
      expect(i18n.t("navigation.home")).toBe("Home");
    });

    it("missing key returns key path", () => {
      expect(i18n.t("does.not.exist")).toBe("does.not.exist");
    });
  });

  describe("all 20 language files pass completeness check", () => {
    for (const [lang, data] of Object.entries(allLocales)) {
      it(`${lang}.json contains all keys from en.json`, () => {
        const langKeys = getKeys(data);
        const missing = enKeys.filter((k) => !langKeys.includes(k));
        expect(missing).toEqual([]);
      });

      it(`${lang}.json has no extra keys beyond en.json`, () => {
        const langKeys = getKeys(data);
        const extra = langKeys.filter((k) => !enKeys.includes(k));
        expect(extra).toEqual([]);
      });
    }
  });

  describe("no empty string values in any language file", () => {
    for (const [lang, data] of Object.entries(allLocales)) {
      it(`${lang}.json has no empty string values`, () => {
        const entries = getValues(data);
        const empties = entries.filter((e) => e.value === "");
        expect(empties.map((e) => e.key)).toEqual([]);
      });
    }
  });
});

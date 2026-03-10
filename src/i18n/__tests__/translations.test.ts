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

const enKeys = getKeys(en);

const translations: Record<string, TranslationMap> = {
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

describe("Translation completeness", () => {
  it("en.json has keys", () => {
    expect(enKeys.length).toBeGreaterThan(0);
  });

  for (const [lang, data] of Object.entries(translations)) {
    describe(`${lang}.json`, () => {
      it("has the same top-level namespace keys as en.json", () => {
        const enNamespaces = Object.keys(en).sort();
        const langNamespaces = Object.keys(data).sort();
        expect(langNamespaces).toEqual(enNamespaces);
      });

      it("contains all keys present in en.json", () => {
        const langKeys = getKeys(data);
        const missingKeys = enKeys.filter((k) => !langKeys.includes(k));
        expect(missingKeys).toEqual([]);
      });

      it("does not contain extra keys not in en.json", () => {
        const langKeys = getKeys(data);
        const extraKeys = langKeys.filter((k) => !enKeys.includes(k));
        expect(extraKeys).toEqual([]);
      });
    });
  }
});

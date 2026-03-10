import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ru from "./locales/ru.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import es from "./locales/es.json";
import pl from "./locales/pl.json";
import uk from "./locales/uk.json";
import ro from "./locales/ro.json";
import nl from "./locales/nl.json";
import tr from "./locales/tr.json";
import el from "./locales/el.json";
import hu from "./locales/hu.json";
import pt from "./locales/pt.json";
import cs from "./locales/cs.json";
import sv from "./locales/sv.json";
import sr from "./locales/sr.json";
import bg from "./locales/bg.json";
import hr from "./locales/hr.json";
import da from "./locales/da.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    de: { translation: de },
    fr: { translation: fr },
    it: { translation: it },
    es: { translation: es },
    pl: { translation: pl },
    uk: { translation: uk },
    ro: { translation: ro },
    nl: { translation: nl },
    tr: { translation: tr },
    el: { translation: el },
    hu: { translation: hu },
    pt: { translation: pt },
    cs: { translation: cs },
    sv: { translation: sv },
    sr: { translation: sr },
    bg: { translation: bg },
    hr: { translation: hr },
    da: { translation: da },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

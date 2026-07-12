import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const STORAGE_KEY = "language";

// Arabic is the app's original language, so it stays the default for anyone without a saved preference
const savedLanguage = localStorage.getItem(STORAGE_KEY) || "ar";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Keeps <html dir="ltr|rtl"> / lang and localStorage in sync with whatever language is active
const applyDocumentDirection = (language) => {
  document.documentElement.dir = i18n.dir(language);
  document.documentElement.lang = language;
  localStorage.setItem(STORAGE_KEY, language);
};

applyDocumentDirection(i18n.language);
i18n.on("languageChanged", applyDocumentDirection);

export default i18n;

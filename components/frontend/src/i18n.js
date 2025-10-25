import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HTTPApi from "i18next-http-backend";


i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(HTTPApi)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json?v='
    },
    interpolation: {
      escapeValue: false, // React already escapes values
      format: (value, format, lng) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        return value;
      }
    }
  });

export default i18next;
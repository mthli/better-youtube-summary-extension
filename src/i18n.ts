import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      'summarize': 'Summarize',
    },
  },
  zh: {
    translation: {
      'summarize': '总结',
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false,
    },
  })

export default i18n

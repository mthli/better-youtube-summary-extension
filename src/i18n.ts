import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      'settings': 'Settings',
      'summarize': 'Summarize',
      'unfold_less': 'Unfold Less',
      'oops': 'Oops',
    },
  },
  zh: {
    translation: {
      'settings': '设置',
      'summarize': '总结',
      'unfold_less': '折叠',
      'oops': 'Oops',
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

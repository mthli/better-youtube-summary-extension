import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      'summarize': 'Summarize',
      'summarizing': 'Summarizing',
      'summarized': 'Summarized',
      'cancel': 'Cancel',
    },
  },
  zh: {
    translation: {
      'summarize': '总结',
      'summarizing': '总结中',
      'summarized': '已总结',
      'cancel': '取消',
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

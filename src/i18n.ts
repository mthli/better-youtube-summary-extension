import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      'close': 'Close',
      'no_transcript': 'No Subtitles',
      'no_transcript_desc': 'This video cannot be summarized at this time, as no subtitles were found 👀',
      'settings': 'Settings',
      'summarize': 'Summarize',
      'sync_to_video_time': 'Sync to Video Time',
      'unfold_less': 'Unfold Less',
    },
  },
  zh: {
    translation: {
      'close': '关闭',
      'no_transcript': '没有字幕',
      'no_transcript_desc': '这个视频目前无法总结，因为没有找到字幕 👀',
      'settings': '设置',
      'summarize': '总结',
      'sync_to_video_time': '与视频时间同步',
      'unfold_less': '折叠',
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

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      'title': 'Better YouTube Summary',
      'slogan': 'Literally Better YouTube Summary 🎯',

      'gmail': 'Feedback by Email',
      'telegram': 'Join Telegram Group',
      'twitter': 'Follow on Twitter',

      'no_transcript': 'No Subtitles',
      'no_transcript_desc': 'This video cannot be summarized at this time, as no subtitles were found 👀',

      'close': 'Close',
      'settings': 'Settings',
      'summarize': 'Summarize',
      'sync_to_video_time': 'Sync to Video Time',
      'unfold_less': 'Unfold Less',
    },
  },
  zh: {
    translation: {
      'title': 'Better YouTube Summary',
      'slogan': '字面意义上更好的 YouTube 摘要插件 🎯',

      'gmail': '通过邮件反馈',
      'telegram': '加入电报群组',
      'twitter': '在推特上关注',

      'no_transcript': '没有字幕',
      'no_transcript_desc': '这个视频目前无法总结，因为没有找到字幕 👀',

      'close': '关闭',
      'settings': '设置',
      'summarize': '摘要',
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

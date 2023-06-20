import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      'title': 'Better YouTube Summary',
      'slogan': 'Literally Better YouTube Summary 🎯',

      'translation': 'Set Translation Language',
      'gmail': 'Feedback by Email',
      'telegram': 'Join Telegram Group',
      'twitter': 'Follow on Twitter',

      'no_transcript': 'No Subtitles',
      'no_transcript_desc': 'This video cannot be summarized at this time, as no subtitles were found 👀',

      'close': 'Close',
      'more': 'More',
      'settings': 'Settings',
      'summarize': 'Summarize',
      'good': 'Good',
      'bad': 'Bad',
      'sync_to_video_time': 'Sync to Video Time',
      'translate': 'Translate',
      'unfold_less': 'Unfold Less',
    },
  },
  zh: {
    translation: {
      'title': 'Better YouTube Summary',
      'slogan': '字面意义上更好的 YouTube 摘要插件 🎯',

      'translation': '设置翻译语言',
      'gmail': '通过邮件反馈',
      'telegram': '加入电报群组',
      'twitter': '在推特上关注',

      'no_transcript': '没有字幕',
      'no_transcript_desc': '这个视频目前没有摘要，因为没有找到字幕 👀',

      'close': '关闭',
      'more': '更多',
      'settings': '设置',
      'summarize': '摘要',
      'good': '不错',
      'bad': '糟糕',
      'sync_to_video_time': '与视频时间同步',
      'translate': '翻译',
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

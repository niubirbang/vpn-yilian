import { createI18n } from 'vue-i18n'
import zhCN from './messages/zh-CN'
import enUS from './messages/en-US'

let language = navigator.language || navigator.userLanguage
if (language.startsWith('zh')) {
  language = 'zh-CN'
} else {
  language = 'en-US'
}

console.info(`-----i18n language ${language}-----`)

const i18n = createI18n({
  // locale: 'en-US',
  locale: language,
  legacy: false,
  globalInjection: true,
  messages: {
    'en-US': enUS,
    'zh-CN': zhCN,
  },
})

export default i18n
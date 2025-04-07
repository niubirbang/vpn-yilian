// import '@/mock'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/assets/base.css'
import '@/assets/iconfont/iconfont.js'
import '@/assets/iconfont/iconfont.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@/assets/country/country.css'
// import 'flag-icon-css/css/flag-icons.min.css'
import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import i18n from '@/i18n'
import Iconfont from '@/components/common/Iconfont.vue'
import SvgIconfont from '@/components/common/SvgIconfont.vue'
import { $OS } from '@/util'
import directives from '@/util/directives'

console.info(`-----OS: ${$OS()}-----`)

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.component('Iconfont', Iconfont).component('SvgIconfont', SvgIconfont)

app.use(i18n).use(router).use(store).use(ElementPlus)

for (const [key, directive] of Object.entries(directives)) {
  app.directive(key, directive)
}

app.mount('#app')

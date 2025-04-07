<script setup>
import { ref, computed } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const store = useStore()
const { locale } = useI18n()

const _name = computed(() => store.state.name)
const name_cn = computed(() => store.state.name_cn)
const name_en = computed(() => store.state.name_en)
const version = computed(() => store.state.version)

const businessEmail = ref('xhjjsq01@gmail.com')
const antiLossEmail = ref('xhjjsq01@gmail.com')
const officialWebsite = ref('https://oppt.cc')

const name = computed(() => {
  switch (locale.value) {
    case 'en-US':
      return name_en.value
    case 'zh-CN':
      return name_cn.value
    default:
      return _name.value
  }
})

const goOfficialWebsite = () => {
  window.box_system.openURL(officialWebsite.value)
}
const debug = () => {
  window.box_window.debug()
}
</script>

<template>
  <div class="large-full about-us-bg">
    <img
      class="logo"
      src="@/assets/image/logo.png"
    >
    <p class="large-txt bold">{{ name }}</p>
    <p class="third-txt">版本信息: v{{ version }}</p>
    <div class="infos">
    </div>
    <div class="infos bottom">
      <div class="info">
        <p class="bold">官网地址：</p>
        <p
          class="primary pointer"
          @click="goOfficialWebsite"
        >{{ officialWebsite }}</p>
      </div>
      <div class="info">
        <p class="bold">意见反馈：</p>
        <a
          class="primary pointer"
          :href="`mailto:${antiLossEmail}`"
        >{{ antiLossEmail }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding: 8rem 4rem 4rem 4rem;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  gap: 1rem;
}
.logo {
  width: 4rem;
  border-radius: 0.8rem;
  height: auto;
}
.infos {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}
.infos.bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  justify-content: center;
  gap: 1rem;
}
.info {
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  /* justify-content: center; */
  gap: 1rem;
}
</style>
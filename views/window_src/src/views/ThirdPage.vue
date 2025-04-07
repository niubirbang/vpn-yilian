<script setup>
import { ref, onBeforeMount, onMounted } from 'vue'
import { useRoute } from "vue-router"

const route = useRoute()
const html = ref(null)

onBeforeMount(() => {
  if (route.query.url) {
    const now = new Date()

    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const hour = now.getHours()

    html.value = `<webview id="webview" class="webview-page" src="${route.query.url}" partition="${year}-${month}-${day}-${hour}"></webview>`
  }
})

const iframe = ref(null)
const iframeUrl = ref(null)
const iframeLoaded = ref(false)
</script>

<template>
  <div class="full">
    <div
      class="webview"
      v-html="html"
    ></div>
  </div>
</template>

<style scoped>
</style>
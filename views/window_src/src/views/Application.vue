<script setup>
import { ref, onBeforeMount, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();
const html = ref(null);

onBeforeMount(() => {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();

  html.value = `<webview id="webview" class="webview-page" src="${store.state.third_application_url}" partition="${year}-${month}-${day}-${hour}"></webview>`;
});

const iframe = ref(null);
const iframeUrl = ref(null);
const iframeLoaded = ref(false);

// onMounted(() => {
//   const loading = ElLoading.service({
//     lock: true,
//     background: 'rgba(0, 0, 0, 0.7)',
//   })

//   if (route.query.url) {
//     iframeUrl.value = route.query.url
//     iframe.value.onload = () => {
//       iframeLoaded.value = true
//       loading.close()
//     }
//   }
//   setTimeout(() => {
//     loading.close()
//   }, 5000)
// })
</script>

<template>
  <div class="full">
    <div class="webview" v-html="html"></div>
  </div>
</template>


<style scoped>
.webview ::-webkit-scrollbar {
  /* width: 6px; */
  width: 0;
}

.webview ::-webkit-scrollbar-thumb {
  background-color: var(--el-color-info-light-8);
  border-radius: 10px;
  transition: all 0.2s ease-in-out;
}

.webview ::-webkit-scrollbar-track {
  border-radius: 10px;
}

.webview *:has(.page.el-fade-in-leave-active)::-webkit-scrollbar {
  display: none !important;
}

.webview *:has(.page.el-fade-in-enter-active)::-webkit-scrollbar {
  display: none !important;
}
</style>
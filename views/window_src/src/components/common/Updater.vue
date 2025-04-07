<script setup>
import { computed, ref } from 'vue'
import { useRouter } from "vue-router"
import { Error } from '@/notification'

const router = useRouter()

const outdatedShow = ref(false)
const outdatedInfo = ref({
  force: false,
  logs: [],
})
// MOCK
// const outdatedShow = ref(true)
// const outdatedInfo = ref({
//   force: false,
//   logs: [
//     "test.1111",
//     "test.2222",
//   ],
// })
const downloading = ref(false)
const downloadShow = ref(false)
const downloadingInfo = ref({
  percent: 0
})
const downloaded = ref(false)
const installing = ref(false)
const downloadingPercent = computed(() => {
  if (downloaded.value) {
    return 100
  }
  return Math.floor(downloadingInfo.value.percent * 100 * 100) / 100
})

window.box_window.listenData((data) => {
  if (data.action == 'VERSION_OUTDATED') {
    outdatedInfo.value = data.value
    outdatedShow.value = true
    router.push('/')
  }
})
window.box_updater.listenDownloadProgress((data) => {
  downloadingInfo.value = data
})
window.box_updater.listenDownloaded((data) => {
  downloaded.value = true
})
window.box_window.listenData((data) => {
  if (data.action == 'VERSION_DOWNLOADED') {
    downloaded.value = true
    showDownload()
  }
})
const download = () => {
  if (downloading.value) {
    return
  }

  downloading.value = true
  window.box_updater.download().then(() => {
    outdatedShow.value = false
    showDownload()
  }).catch(err => {
    Error(err)
  }).finally(() => {
    setTimeout(() => { downloading.value = false }, 500)
  })
}
const showDownload = () => {
  downloadShow.value = true
}

const install = () => {
  if (installing.value) {
    return
  }

  installing.value = true
  window.box_updater.install().catch(err => {
    installing.value = false
    Error(err)
  })
}
</script>

<template>
  <el-dialog
    v-model="outdatedShow"
    width="70%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :align-center="true"
  >
    <div class="content">
      <img
        class="title-icon"
        src="@/assets/image/dialog-version-icon.png"
      >
      <p class="title bold larger-txt">发现新版本</p>
      <div class="infos">
        <p class="bold large-txt">更新内容</p>
        <p
          class="second-txt"
          v-for="(log, i) in outdatedInfo.logs"
          :key="i"
        >{{ i+1 }}. {{ log }}</p>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <!-- <el-button
          v-if="!outdatedInfo.force"
          @click="outdatedShow = false"
        >知道了</el-button> -->
        <el-button
          class="big-size"
          type="primary"
          :disabled="downloading"
          round
          @click="download"
        >下载</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog
    v-model="downloadShow"
    width="70%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :align-center="true"
  >
    <div class="content">
      <img
        class="title-icon"
        src="@/assets/image/dialog-version-icon.png"
      >
      <p class="title bold larger-txt">下载进度</p>

      <el-progress :percentage="downloadingPercent" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button
          class="big-size"
          type="primary"
          :disabled="!downloaded"
          round
          @click="install"
        >安装</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.content {
  position: relative;
  padding-top: 4rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.content .title-icon {
  width: 12rem;
  position: absolute;
  top: -8rem;
  left: 50%;
  transform: translateX(-50%);
}
.content .title {
  text-align: center;
}
.content .infos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.dialog-footer {
  display: flex;
  flex-direction: column;
}
</style>
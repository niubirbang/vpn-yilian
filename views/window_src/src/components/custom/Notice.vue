<script setup>
import { computed, ref } from 'vue'
import { useRouter } from "vue-router"
import { Error } from '@/notification'

const router = useRouter()

const show = ref(false)
const notices = ref([])
// MOCK
// const show = ref(true)
// const notices = ref([
//   '部分互联网线路优化。',
//   '优化分享体验，试试把你喜欢的内容分 享给好友吧!',
// ])
</script>

<template>
  <el-dialog
    v-model="show"
    width="70%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :align-center="true"
  >
    <div class="content">
      <img
        class="title-icon"
        src="@/assets/image/dialog-notice-icon.png"
      >
      <p class="title bold larger-txt">最新公告</p>
      <div class="infos">
        <p class="bold large-txt">公告内容</p>
        <p
          class="second-txt"
          v-for="(notice, i) in notices"
          :key="i"
        >{{ i+1 }}. {{ notice }}</p>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button
          class="big-size"
          type="primary"
          round
          @click="show = false"
        >我知道了</el-button>
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
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from "vue-router"
import { Error } from '@/notification'

const router = useRouter()

const show = defineModel('show', {
  default: false,
})
// const show = ref(false)
// MOCK

const go_recharge = () => {
  router.push('/recharge')
  show.value = false
}
const go_invite = () => {
  router.push('/invite')
  show.value = false
}
</script>

<template>
  <el-dialog
    v-model="show"
    width="70%"
    :close-on-click-modal="true"
    :close-on-press-escape="false"
    :show-close="false"
    :align-center="true"
  >
    <div class="content">
      <img
        class="title-icon"
        src="@/assets/image/dialog-level-icon.png"
      >
      <p class="title bold larger-txt">温馨提示</p>
      <p class="info small-txt">免费时长已到期，可通过邀请好友来增加时长，或者开通VIP来享受VIP待遇</p>
    </div>
    <template #footer>
      <div class="dialog-footer nomargin">
        <el-button
          class="big-size"
          type="primary"
          round
          @click="go_recharge"
        >立即开通</el-button>
        <el-button
          class="big-size"
          link
          @click="go_invite"
        >邀请好友</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.content {
  position: relative;
  padding-top: 1rem;

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
.content .info {
  text-align: center;
}
.dialog-footer {
  display: flex;
  flex-direction: column;
}
</style>
<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router"

const router = useRouter()

const show = ref(false)

window.box_window.listenData((data) => {
  if (data.action == 'CORE_EXPIRED') {
    // 不做任何事
    // show.value = true
    // router.push('/')
  }
})

const close = () => {
  show.value = false
}
const go_recharge = () => {
  show.value = false
  router.push('/recharge')
}
</script>

<template>

  <el-dialog
    v-model="show"
    width="90%"
    title="您的时长已用完"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :align-center="true"
  >
    <span>您的时长已用完, 代理已自动关闭, 如需继续使用, 请充值!</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close">知道了</el-button>
        <el-button
          type="primary"
          @click="go_recharge"
        >去充值</el-button>
      </div>
    </template>
  </el-dialog>
</template>
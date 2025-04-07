<script setup>
import { ref } from 'vue'
import { useRouter } from "vue-router"

const router = useRouter()

const show = ref(false)

window.box_window.listenData((data) => {
  if (data.action == 'AUTHORIZATION_EXPIRED') {
    // show.value = true
    router.push('/')
  }
})

const close = () => {
  show.value = false
}
const go_login = () => {
  show.value = false
  router.push('/login')
}
</script>

<template>

  <el-dialog
    v-model="show"
    width="90%"
    title="您的授权失效了"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :align-center="true"
  >
    <span>您的授权失效了, 请重新登录, 如果是您的密码被泄露, 请修改密码！</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close">知道了</el-button>
        <el-button
          type="primary"
          @click="go_login"
        >去登录</el-button>
      </div>
    </template>
  </el-dialog>
</template>
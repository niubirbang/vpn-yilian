<script setup>
import { ref, computed } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { PROXY_STATUS_OFF, PROXY_STATUS_ON } from '@/store'
import { Error } from '@/notification'
import { ElLoading } from 'element-plus'
import IconProxyON from '@/assets/image/proxy-on.png'
import IconProxyOFF from '@/assets/image/proxy-off.png'
import { ErrorFoo } from '@/util'

const router = useRouter()
const store = useStore()

const authorized = computed(() => store.state.authorized)
const status = computed(() => store.state.proxy_status)
const current_node = computed(() => store.state.proxy_current_node)
const statusIcon = computed(() => {
  switch (status.value) {
    case PROXY_STATUS_OFF:
      return IconProxyOFF
    case PROXY_STATUS_ON:
      return IconProxyON
  }
})
const statusTxt = computed(() => {
  switch (status.value) {
    case PROXY_STATUS_OFF:
      return '未连接'
    case PROXY_STATUS_ON:
      return '已连接'
  }
})

const changing = ref(false)
const beforeStatus = ref(null)

const changeStatus = () => {
  if (changing.value) {
    return
  }
  if (!authorized.value) {
    router.push('/login')
    return
  }

  let do_func = null
  switch (status.value) {
    case PROXY_STATUS_OFF:
      do_func = window.box_core.start
      break
    case PROXY_STATUS_ON:
      do_func = window.box_core.close
      break
  }
  if (!do_func) {
    return
  }

  beforeStatus.value = status.value
  changing.value = true
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  do_func().then(() => {
    setTimeout(() => {
      loading.close()
    }, 300)
  }).catch(err => {
    console.error('switch failed:', err)

    loading.close()

    if (ErrorFoo(err, 'core_no_usable') || ErrorFoo(err, 'core_current_node_empty') || ErrorFoo(err, 'core_current_node_disabled')) {
      if (!current_node.value) {
        store.commit('setFreeDialogShow', true)
      } else {
        console.log(current_node.value)
        switch (current_node.value) {
          
        }
      }
    } else {
      Error(err)
    }
  }).finally(() => {
    beforeStatus.value = null
    changing.value = false
  })
}

const err_is_core_expired_at_is_empty = (err) => {
  if (err.startsWith('Error:')) {
    err = err.replace('Error:', '')
  }
  err = err.trim()
  return err.startsWith('core_expired_at_is_empty')
}
</script>

<template>
  <div
    class="switch pointer"
    @click="changeStatus"
  >
    <img
      class="icon"
      src="@/assets/image/proxy-switch-icon.png"
    >
    <p>{{ statusTxt }}</p>
    <img
      class="bg pointer"
      :src="statusIcon"
    >
  </div>
</template>

<style scoped>
.switch {
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.switch .bg {
  border-radius: 100%;
  height: 13rem;
  width: auto;
}
.switch .icon {
  position: absolute;
  top: 4rem;
  height: 2.5rem;
  width: auto;
}
.switch p {
  position: absolute;
  top: 7.2rem;
  font-size: 1.1rem;
  color: var(--el-color-white);
}
</style>
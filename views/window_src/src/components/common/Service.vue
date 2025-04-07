<script setup>
import { ref, watch, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { Crisp } from "crisp-sdk-web"
import { ElLoading } from 'element-plus'
import { Error } from '@/notification'

const router = useRouter()
const store = useStore()

const serviceType = ref(null)

const service = computed(() => store.state.third_service)

onMounted(() => {
  Crisp.setColorTheme('orange')
})

const oepnService = () => {
  if (service.value) {
    switch (service.value.type) {
      case 'url':
        open_url(service.value.value)
        break
      case 'livechat':
        open_crisp(service.value.value)
        break
      case 'crisp':
        open_livechat(service.value.value)
        break
      default:
        Error(`暂不支持${service.value.type}客服类型！`)
    }
  } else {
    Error('客服系统加载中！')
  }
}

const open_crisp = (id) => {
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  Crisp.configure(id)
  Crisp.chat.onChatOpened(() => {
    setTimeout(() => {
      loading.close()
    }, 300)
  })
  Crisp.chat.open()
}

const open_livechat = (id) => {
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_system.openWindow(`https://direct.lc.chat/${id}/`, {
    width: 1000,
    height: 800,
  }).then(() => {
    loading.close()
  }).catch(err => {
    loading.close()
    Error(err)
  })
}

const open_url = (url) => {
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  let visiter_id = store.state.device_id
  let visiter_name = store.state.device_name
  if (store.state.user_loaded && store.state.user_id) {
    visiter_id = store.state.user_id
    visiter_name = store.state.user_nickname
  }

  try {
    const u = new URL(url)

    const params = new URLSearchParams(u.search)
    params.set('visiter_id', visiter_id)
    params.set('visiter_name', visiter_name)
    u.search = params.toString()

    window.box_system.openWindow(u.toString(), {
      width: 600,
      height: 800,
    }).then(() => {
      loading.close()
    }).catch(err => {
      loading.close()
      Error(err)
    })
  } catch (err) {
    loading.close()
    Error(err)
  }
}

watch(
  () => store.state.service_show,
  (newVal) => {
    if (newVal) {
      oepnService()
      setTimeout(() => {
        store.commit('setServiceShow', false)
      }, 500)
    }
  }
)
</script>

<template></template>
<script setup>
import { watch, ref, computed, onMounted } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import Navbar from '@/components/common/Navbar.vue'
import Tabbar from '@/components/common/Tabbar.vue'
import Service from '@/components/common/Service.vue'
import AuthorizationListener from '@/components/common/AuthorizationListener.vue'
import Updater from '@/components/common/Updater.vue'
import Notice from '@/components/custom/Notice.vue'
import ExpiredListener from '@/components/proxy/ExpiredListener.vue'
import FreeDialog from '@/components/custom/FreeDialog.vue'

const router = useRouter()
const store = useStore()

const authorizationLoaded = computed(() => store.state.authorization_loaded)
const show_free_dialog = ref(false)

const check_first_authorized = () => {
  if (!store.state.authorized && !localStorage.getItem('ignore_first_authorized')) {
    localStorage.setItem('ignore_first_authorized', true)
    router.push('/login')
  }
}

watch(
  () => store.state.free_dialog_show,
  (newVal) => {
    if (newVal) {
      show_free_dialog.value = true
      store.commit('setFreeDialogShow', false)
    }
  }
)

const visibility_change = () => {
  if (document.hidden) {
    // console.info(`-----window change to hidden-----`)
  } else {
    // console.info(`-----window change to visibility-----`)
  }
}

window.go_test = () => {
  router.push('/test')
}

window.go_path = (path) => {
  router.push(path)
}

window.box_window.listenFocus(() => {
  console.info('window focus')
  // check_fresh_user()
})


let freshing_user = false
let last_fresh_user_time = null
const check_fresh_user = () => {
  if (freshing_user) {
    return
  }

  if (last_fresh_user_time == null || (new Date() - last_fresh_user_time) > 60000) {
    freshing_user = true
    window.box_api.freshUser().then(() => {
      last_fresh_user_time = new Date()
    }).catch(err => {
      console.error('focus fresh user failed:', err)
    }).finally(() => {
      freshing_user = false
    })
  }
}

onMounted(() => {
  router.push('/')
  check_first_authorized()
  document.addEventListener('visibilitychange', visibility_change)
})
</script>

<template>
  <el-container
    id="container"
    v-loading="!authorizationLoaded"
    element-loading-text="初始化..."
  >
    <el-header id="navbar">
      <Navbar />
    </el-header>
    <el-main class="outer-main">
      <RouterView
        class="page"
        v-slot="{ Component }"
      >
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </RouterView>
    </el-main>
    <el-footer id="tabbar">
      <Tabbar />
    </el-footer>
    <Service />
    <AuthorizationListener />
    <Updater />
    <Notice />
    <ExpiredListener />
    <FreeDialog v-model:show="show_free_dialog" />
  </el-container>
</template>

<style scoped>
.outer-main {
  padding: 0;
}
.fade-enter-active {
  transition: opacity 0.2s ease;
}
.fade-leave-active {
  transition: opacity 0s ease;
}
.fade-enter-from {
  opacity: 0;
}
.fade-leave-to {
  opacity: 0;
}
</style>
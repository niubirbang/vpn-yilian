<script setup>
import { computed } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { ElLoading } from 'element-plus'
import { Success, Error } from '@/notification'
import { $DateTimeFormat } from '@/util'

const router = useRouter()
const store = useStore()

const authorized = computed(() => store.state.authorized)
const userLoaded = computed(() => store.state.user_loaded)

// 是否领取过免费时长
const receivedFree = computed(() => store.state.user_received_free)
// 是否已过期
const timestamp = computed(() => store.state.timestamp)
const vipExpiredAt = computed(() => store.state.user_vip_expired_at)
const svipExpiredAt = computed(() => store.state.user_svip_expired_at)
const expired = computed(() => {
  return vipExpiredAt.value < timestamp.value && svipExpiredAt.value < timestamp.value
})
// 是否充值过
const recharged = computed(() => store.state.user_recharged)

const tip = computed(() => {
  if (!authorized.value) {
    return {
      title: '新人福利，赠送5分钟免费时长',
      btn: '领取',
      do: () => {
        router.push('/login')
      }
    }
  }
  if (!receivedFree.value) {
    return {
      title: '新人福利，赠送5分钟免费时长',
      btn: '领取',
      do: () => {
        const loading = ElLoading.service({
          lock: true,
          background: 'rgba(0, 0, 0, 0.7)',
        })
        window.box_api.receiveFree().then(() => {
          setTimeout(() => {
            loading.close()
            Success('领取成功！')
          }, 300)
        }).catch(err => {
          setTimeout(() => {
            loading.close()
            Error(err)
          }, 300)
        })
      }
    }
  }
  if (!recharged.value && receivedFree.value) {
    return {
      title: '开通会员享受专属高速线路',
      btn: '去开通',
      do: () => {
        router.push('/recharge')
      }
    }
  }
  if (recharged.value && expired.value && receivedFree.value) {
    return {
      title: '您的会员已到期，请尽快充值',
      btn: '去充值',
      do: () => {
        router.push('/recharge')
      }
    }
  }
  return null
})
</script>

<template>
  <div class="tip" v-if="tip">
    <p class="info">{{ tip.title }}</p>
    <el-button
      type="primary"
      round
      @click="tip.do()"
    >{{ tip.btn }}</el-button>
  </div>
</template>

<style scoped>
.tip {
  box-sizing: border-box;
  padding: 1.3rem 2rem;
  background: var(--el-color-white);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tip .info {
  font-weight: bold;
  font-size: 1.1rem;
}
</style>
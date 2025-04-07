<script setup>
import { ref, computed } from 'vue'
import { useRouter } from "vue-router"
import { useI18n } from 'vue-i18n'

import IconHome from '@/assets/image/icon-home.png'
import IconHomeActive from '@/assets/image/icon-home-active.png'
import IconInvite from '@/assets/image/icon-invite.png'
import IconInviteActive from '@/assets/image/icon-invite-active.png'
import IconRecharge from '@/assets/image/icon-recharge.png'
import IconRechargeActive from '@/assets/image/icon-recharge-active.png'
import IconApplication from '@/assets/image/icon-application.png'
import IconApplicationActive from '@/assets/image/icon-application-active.png'
import IconUser from '@/assets/image/icon-user.png'
import IconUserActive from '@/assets/image/icon-user-active.png'


const router = useRouter()
const $t = useI18n().t


const show = computed(() => {
  if (router.currentRoute.value.meta && router.currentRoute.value.meta.tabbar) {
    return true
  }
  return false
})
const current = computed(() => {
  return router?.currentRoute?.value?.name
})
const bars = computed(() => {
  return [
    {
      name: 'home',
      icon: IconHome,
      iconActive: IconHomeActive,
      path: '/',
    },
    {
      name: 'invite',
      icon: IconInvite,
      iconActive: IconInviteActive,
      path: '/invite',
    },
    {
      name: 'recharge',
      icon: IconRecharge,
      iconActive: IconRechargeActive,
      path: '/recharge',
    },
    {
      name: 'application',
      icon: IconApplication,
      iconActive: IconApplicationActive,
      path: '/application',
    },
    {
      name: 'user',
      icon: IconUser,
      iconActive: IconUserActive,
      path: '/user',
    },
  ]
})
</script>


<template>
  <div
    class="box"
    v-if="show"
  >
    <div
      class="tabbar pointer"
      v-for="(bar, i) in bars"
      :key="i"
      v-push="bar.path"
    >
      <img :src="current == bar.name ? bar.iconActive : bar.icon">
      <p :class="{ active: current == bar.name }">{{ $t(`tabbar_${bar.name}`) }}</p>
    </div>
  </div>
</template>

<style scoped>
.box {
  border-radius: 1.2rem 1.2rem 0 0;
  height: var(--tabbar-height);
  width: 100%;
  box-sizing: border-box;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.tabbar {
  height: 100%;
  width: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.tabbar img {
  height: 1.6rem;
  width: auto;
}
.tabbar p {
  font-size: 0.85rem;
  color: #BFBFBF;
}
.tabbar img.active {
  color: var(--el-color-primary);
}
.tabbar p.active {
  color: var(--el-color-primary);
}
</style>
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Tip from '@/components/custom/Tip.vue'
import FreeExpiredAt from '@/components/custom/FreeExpiredAt.vue'
import ProxyStatus from '@/components/proxy/Status.vue'
import ProxySwitch from '@/components/proxy/Switch.vue'
import ProxyRule from '@/components/proxy/Rule.vue'
import ProxyCurrent from '@/components/proxy/Current.vue'

const store = useStore()

const version = computed(() => store.state.version)
</script>

<template>
  <div class="large-full main-bg">
    <div class="line1 page-padding">
      <p>v{{ version }}</p>
      <img
        class="pointer"
        src="@/assets/image/service.png"
        v-showService
      >
    </div>
    <Tip class="tip page-padding" />
    <div class="line2 page-padding">
      <ProxySwitch />
      <div class="free-expired-at">
        <FreeExpiredAt />
      </div>
      <ProxyRule />
      <div
        class="invite pointer"
        v-push="'/invite'"
      >
        <img src="@/assets/image/icon-invite-2.png">
        <p>邀请获时长</p>
      </div>
    </div>
    <div
      class="line3 pointer page-padding"
      v-showQuestionAnswer
    >
      <img src="@/assets/image/robot.png">
      <p class="primary">连接失败？点我试试</p>
      <el-icon class="primary">
        <ArrowRight />
      </el-icon>
    </div>
    <ProxyCurrent class="line4 page-padding" />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
}
.page-padding {
  margin: 0 var(--page-padding);
}
.line1 {
  box-sizing: border-box;
  padding: 1rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
}
.line1 img {
  border-radius: 0.5rem;
  box-sizing: border-box;
  padding: 0.3rem;
  background: var(--el-color-white);
  height: 2.2rem;
  width: auto;
}
.tip {
  z-index: 2;
}
.line2 {
  box-sizing: border-box;
  margin-top: -1rem;
  padding: 2rem 2rem 1rem 2rem;
  border-radius: 0 0 3rem 3rem;
  background: url("@/assets/image/home-bg.png") no-repeat;
  background-size: 100% 100%;
  position: relative;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.line2 .free-expired-at {
  height: 2rem;
}
.line2 .invite {
  position: absolute;
  right: 0.5rem;
  top: 13.5rem;

  display: flex;
  align-items: center;
  justify-content: center;
}
.line2 .invite p {
  background: linear-gradient(180deg, #ffba09 0%, #fb7501 100%);
  border-radius: 10rem;
  color: var(--el-color-white);
  box-sizing: border-box;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;

  z-index: 2;
}
.line2 .invite img {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -2.2rem;
  height: 3rem;
  z-index: 1;
}
.line3 {
  align-self: center;
  position: relative;
  margin-top: 1rem;
  margin-bottom: 0;
  width: fit-content;
  background: linear-gradient(180deg, #f1ecff 0%, #f9f7ff 100%);
  border-radius: 999rem;
  box-sizing: border-box;
  padding: 0.8rem 2rem;

  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.line3 img {
  position: absolute;
  left: -2.3rem;
  width: 4.3rem;
  height: auto;
}
.bottom {
  margin-top: auto;
  box-sizing: border-box;
  padding-bottom: 2rem;
}
.line4 {
  margin-top: 1rem;
}
</style>
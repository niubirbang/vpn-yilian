<script setup>
import { computed } from "vue"
import { useRouter } from "vue-router"
import { ElLoading } from 'element-plus'
import { Confirm } from '@/util/directives'
import { Error } from '@/notification'

const router = useRouter()

const submit = () => {
  Confirm({
    message: '确认注销账号？',
    confirmDo: () => {
      deleteAccount()
    },
    cancelDo: () => { },
  })
}

const deleteAccount = () => {
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.deleteAccount().then(() => {
    router.replace('/login')
  }).catch(err => {
    Error(err)
  }).finally(() => {
    loading.close()
  })
}
</script>

<template>
  <div>
    <div class="plate">
      <p class="primary bold">我们对你注销的决定深表遗憾。为保证你的账号安全，在你提交的注销申请生效前，需同时满足以下条件:</p>
      <p>1.账号财产已结清，没有未完成和/或存在争议的服务:账号中没有资产、欠款、未结清的资金和虚拟权益:本账号及通过本账号接入的第三方中没有未完成和/或存在争议的服务。</p>
      <p>2.账号无任何纠纷，包括投诉举报或被投诉举报。</p>
    </div>
    <div class="plate">
      <p class="primary bold">账号注销申请方式:</p>
      <p>点击下方“申请注销账户”填写账户信息，提交申请。</p>
      <p>我们会在您提交后实时进行风控判定、审核、注销处理，如未注销成功或有其他疑问可通过“在线客服”进行反馈。</p>
    </div>
    <div class="plate">
      <p class="bold">
        <span>申请注销账户代表您已阅读并同意</span>
        <span
          class="primary pointer"
          v-showLogoutPolicy
        >注销协议</span>
      </p>
    </div>
    <div class="plate bottom">
      <el-button
        class="big-size"
        type="primary"
        round
        @click="submit"
      >申请注销账号</el-button>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: 4rem;
  padding-bottom: 4rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.plate {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.plate.bottom {
  margin-top: auto;
}
</style>
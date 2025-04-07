<script setup>
import { ref, reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { InviteCodeTest } from '@/util/validate'
import { ElLoading } from 'element-plus'
import { Success, Error } from '@/notification'

const store = useStore()

const binded = computed(() => store.state.user_binded_invite_code ? true : false)

const form = reactive({
  inviteCode: store.state.user_binded_invite_code,
})

const submiting = ref(false)
const submit = () => {
  if (submiting.value) {
    return
  }
  for (const err of [InviteCodeTest(form.inviteCode, true)]) {
    if (err) {
      Error(err)
      return
    }
  }

  submiting.value = true
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.bindInviteCode(form.inviteCode).then(() => {
    form.inviteCode = ''
    loading.close()
    Success('绑定成功')
  }).catch(err => {
    loading.close()
    Error(err)
  }).finally(() => {
    submiting.value = false
  })
}
</script>

<template>
  <div class="large-full invite-bg">
    <div class="plate">
      <div class="title">
        <img src="@/assets/image/title-left.png">
        <p>邀请码绑定</p>
        <img src="@/assets/image/title-right.png">
      </div>
      <div class="content">
        <el-input
          class="invite-code-input no-shadow large-padding"
          input-style="text-align: center;"
          v-model="form.inviteCode"
          placeholder="请输入您的邀请码"
          :disabled="binded"
        />
        <el-button
          class="bind-invite-btn"
          type="primary"
          :disabled="binded"
          @click="submit"
        >{{ binded ? '已绑定邀请码' : '绑定邀请码'}}</el-button>
        <p class="bind-invite-tip">温馨提示: 绑定邀请码，首单付费有优惠哦!</p>
        <div class="my-invite">
          <div
            class="item pointer"
            v-push='"/invite"'
          >
            <div class="icon">
              <img src="@/assets/image/invite-invite.png">
            </div>
            <p>我要邀请</p>
          </div>
          <div
            class="item pointer"
            v-push='"/invite_history"'
          >
            <div class="icon">
              <img src="@/assets/image/invite-promotion.png">
            </div>
            <p>我的推广</p>
          </div>
          <div
            class="item pointer"
            v-push='"/invite_award"'
          >
            <div class="icon">
              <img src="@/assets/image/invite-gift.png">
            </div>
            <p>我的奖励</p>
          </div>
        </div>
        <p class="bind-invite-tip">备注：即日起邀请好友使用有丰富奖励赠送，好友首单支付更有好礼相送，具体活动详情请点开"我要邀请"!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  color: #000;
  box-sizing: border-box;
  padding: 15rem 1rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.plate {
  width: 100%;
  box-sizing: border-box;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.plate .title {
  color: #9f350e;
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}
.plate .title img {
  height: 1rem;
  width: auto;
}
.plate .content {
  box-sizing: border-box;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.invite-code-input {
  height: 4.5rem;
  width: 100%;
  --el-input-bg-color: #f2f2f2;
  --el-input-border-radius: 1.5rem;
  --el-input-placeholder-color: #a9a9ae;
  --el-input-text-color: #000;
  --el-disabled-bg-color: #f5f7fa;
  --el-disabled-text-color: #a8abb2;
}
.bind-invite-btn {
  height: 4.5rem;
  width: 100%;
  border-radius: 1.5rem;
}
.bind-invite-tip {
  font-size: 0.92rem;
  color: #959494;
  line-height: 1.6rem;
}
.my-invite {
  width: 96%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.my-invite .item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.my-invite .item .icon {
  padding: 1rem;
  background: #fff0e7;
  border-radius: 50%;
  display: flex;
  align-items: center;
}
.my-invite .item .icon img {
  height: 1.6rem;
  width: auto;
}
</style>
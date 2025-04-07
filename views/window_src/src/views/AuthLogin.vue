<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { ElLoading } from 'element-plus'
import { Error } from '@/notification'

const router = useRouter()
const store = useStore()

const allow_methods = ref([
  'phone_password',
  'phone_code',
])
const method_names = ref({
  account_password: '账号密码登录',
  email_password: '邮箱密码登录',
  email_code: '邮箱验证码登录',
  phone_password: '手机密码登录',
  phone_code: '手机验证码登录',
})
// const method = ref('account_password')
// const method = ref('email_password')
// const method = ref('email_code')
const method = ref('phone_password')
// const method = ref('phone_code')

const form = reactive({
  account: '',
  email: '',
  phone: '',
  password: '',
  code: '',
})

const changeMethod = (m) => {
  method.value = m
}

const codeSending = ref(false)
const codeCountdown = ref(0)
const emailCodeSend = () => {
  if (codeSending.value) {
    return
  }
  if (!form.email) {
    Error('请输入邮箱！')
    return
  }

  codeSending.value = true
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.ses(1, form.email).then(() => {
    codeCountdown.value = 60
    let ticker = setInterval(() => {
      if (codeCountdown.value <= 0) {
        clearInterval(ticker)
        return
      }
      codeCountdown.value--
    }, 1000)
  }).catch(err => {
    Error(err)
  }).finally(() => {
    codeSending.value = false
    loading.close()
  })
}
const phoneCodeSend = () => {
  if (codeSending.value) {
    return
  }
  if (!form.phone) {
    Error('请输入手机号！')
    return
  }

  codeSending.value = true
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.sms(1, form.phone).then(() => {
    codeCountdown.value = 60
    let ticker = setInterval(() => {
      if (codeCountdown.value <= 0) {
        clearInterval(ticker)
        return
      }
      codeCountdown.value--
    }, 1000)
  }).catch(err => {
    Error(err)
  }).finally(() => {
    codeSending.value = false
    loading.close()
  })
}

const submit = () => {
  let param = {
    method: method.value,
    account: form.account,
    email: form.email,
    phone: form.phone,
    password: form.password,
    code: form.code,
  }
  switch (method.value) {
    case 'account_password':
      if (!param.account) {
        Error('请输入账号!')
        return
      }
      if (!param.password) {
        Error('请输入密码!')
        return
      }
      break
    case 'email_password':
      if (!param.email) {
        Error('请输入邮箱!')
        return
      }
      if (!param.password) {
        Error('请输入密码!')
        return
      }
      break
    case 'email_code':
      if (!param.email) {
        Error('请输入邮箱!')
        return
      }
      if (!param.code) {
        Error('请输入验证码!')
        return
      }
      break
    case 'phone_password':
      if (!param.phone) {
        Error('请输入手机号!')
        return
      }
      if (!param.password) {
        Error('请输入密码!')
        return
      }
      break
    case 'phone_code':
      if (!param.phone) {
        Error('请输入手机号!')
        return
      }
      if (!param.code) {
        Error('请输入验证码!')
        return
      }
      break
  }

  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.login(param).then(() => {
    router.push('/')
  }).catch(err => {
    Error(err)
  }).finally(() => {
    loading.close()
  })
}
</script>

<template>
  <div class="white-bg">
    <p class="title">欢迎登录</p>
    <p class="remark">
      <span>还没有账号</span>
      <span
        class="primary pointer"
        v-push="'/registe'"
      >立即注册</span>
    </p>

    <div class="form">
      <div
        class="field"
        v-if="method === 'account_password'"
      >
        <el-input
          v-model="form.account"
          placeholder="请输入用户名"
        >
          <template #prefix>
            <img
              class="icon"
              src="@/assets/image/form-user.png"
            >
          </template>
        </el-input>
      </div>
      <div
        class="field"
        v-if="method === 'email_password' || method === 'email_code'"
      >
        <el-input
          v-model="form.email"
          placeholder="请输入邮箱"
        >
          <template #prefix>
            <img
              class="icon"
              src="@/assets/image/form-user.png"
            >
          </template>
        </el-input>
      </div>
      <div
        class="field"
        v-if="method === 'phone_password' || method === 'phone_code'"
      >
        <el-input
          v-model="form.phone"
          placeholder="请输入手机号"
        >
          <template #prefix>
            <img
              class="icon"
              src="@/assets/image/form-user.png"
            >
          </template>
        </el-input>
      </div>
      <div
        class="field"
        v-if="method === 'email_code' || method === 'phone_code'"
      >
        <el-input
          v-model="form.code"
          placeholder="请输入验证码"
        >
          <template #prefix>
            <img
              class="icon"
              src="@/assets/image/form-code.png"
            >
          </template>
          <template #suffix>
            <el-button
              v-if="method === 'email_code'"
              type="primary"
              :disabled="codeSending || codeCountdown > 0"
              @click="emailCodeSend"
              link
            >
              获取验证码<template v-if="codeCountdown > 0">{{ `(${codeCountdown})` }}</template>
            </el-button>
            <el-button
              v-if="method === 'phone_code'"
              type="primary"
              :disabled="codeSending || codeCountdown > 0"
              @click="phoneCodeSend"
              link
            >
              获取验证码<template v-if="codeCountdown > 0">{{ `(${codeCountdown})` }}</template>
            </el-button>
          </template>
        </el-input>
      </div>
      <div
        class="field"
        v-if="method === 'account_password' || method === 'email_password' || method === 'phone_password'"
      >
        <el-input
          type="password"
          show-password
          v-model="form.password"
          placeholder="请输入密码"
        >
          <template #prefix>
            <img
              class="icon"
              src="@/assets/image/form-password.png"
            >
          </template>
        </el-input>
      </div>
    </div>

    <el-button
      style="align-self: flex-end"
      link
      v-push="'/forget_password'"
    >忘记密码？</el-button>

    <el-button
      class="large-size"
      type="primary"
      round
      @click="submit"
    >登录</el-button>

    <template
      v-for="(m, i) in allow_methods"
      :key="i"
    >
      <el-button
        v-if="method !== m"
        @click="changeMethod(m)"
        link
      >{{ method_names[m] }}</el-button>
    </template>
  </div>
</template>

<style scoped>
.gray {
  color: #575765;
}
.page {
  box-sizing: border-box;
  padding-top: 8rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.title {
  font-size: 2rem;
  font-weight: bold;
}
.remark {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
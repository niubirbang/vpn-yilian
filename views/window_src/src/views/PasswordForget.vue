<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { ElLoading } from 'element-plus'
import { Error } from '@/notification'

const router = useRouter()
const store = useStore()

const with_again_password = ref(false)
const allow_methods = ref([
  'phone',
])
const method_names = ref({
  email: '邮箱验证',
  phone: '手机验证',
})
// const method = ref('email')
const method = ref('phone')

const form = reactive({
  email: '',
  phone: '',
  password: '',
  againPassword: '',
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
  window.box_api.ses(3, form.email).then(() => {
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
  window.box_api.sms(3, form.phone).then(() => {
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
    email: form.email,
    phone: form.phone,
    password: form.password,
    againPassword: form.againPassword,
    code: form.code,
  }
  switch (method.value) {
    case 'email':
      if (!param.email) {
        Error('请输入邮箱!')
        return
      }
      if (!param.code) {
        Error('请输入验证码!')
        return
      }
      break
    case 'phone':
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
  if (!param.password) {
    Error('请输入密码!')
    return
  }
  if (with_again_password.value) {
    if (!param.againPassword) {
      Error('请再次输入密码!')
      return
    }
    if (param.password !== param.againPassword) {
      Error('两次密码输入不一致!')
      return
    }
  }

  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.forgetPassword(param).then(() => {
    router.push('/login')
  }).catch(err => {
    Error(err)
  }).finally(() => {
    loading.close()
  })
}
</script>

<template>
  <div class="white-bg">
    <p class="title">忘记密码</p>
    <p class="remark">
      <span>知道密码</span>
      <span
        class="primary pointer"
        v-push="'/login'"
      >去登录</span>
    </p>

    <div class="form">
      <div
        class="field"
        v-if="method === 'email'"
      >
        <el-input
          class="no-shadow large-padding"
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
        v-if="method === 'phone'"
      >
        <el-input
          class="no-shadow large-padding"
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
        v-if="method === 'email' || method === 'phone'"
      >
        <el-input
          class="no-shadow large-padding"
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
              v-if="method === 'email'"
              type="primary"
              :disabled="codeSending || codeCountdown > 0"
              @click="emailCodeSend"
              link
            >
              获取验证码<template v-if="codeCountdown > 0">{{ `(${codeCountdown})` }}</template>
            </el-button>
            <el-button
              v-if="method === 'phone'"
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
      <div class="field">
        <el-input
          type="password"
          show-password
          class="no-shadow large-padding"
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
      <div
        class="field"
        v-if="with_again_password"
      >
        <el-input
          type="password"
          show-password
          class="no-shadow large-padding"
          v-model="form.againPassword"
          placeholder="请输入确认密码"
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
      class="large-size"
      type="primary"
      round
      @click="submit"
    >确认</el-button>

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
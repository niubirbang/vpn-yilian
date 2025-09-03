<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from "vue-router"
import { ElLoading } from 'element-plus'
import { Error } from '@/notification'

const router = useRouter()


const modes = ref([
  {
    key: "phone",
    name: "手机",
    methods: [
      // {
      //   key: "password",
      //   name: "密码"
      // },
      {
        key: "code",
        name: "验证码"
      }
    ]
  },
  {
    key: "email",
    name: "邮箱",
    methods: [
      // {
      //   key: "password",
      //   name: "密码"
      // },
      {
        key: "code",
        name: "验证码"
      }
    ]
  },
]);
const mode = ref("phone");
const method = ref("code")
const methods = computed(() => {
  return modes.value.find((m) => m.key === mode.value)?.methods || []
})

const changeMode = (key) => {
  const finded = modes.value.find((m) => m.key === key)
  if (!finded) return
  mode.value = finded.key
  changeMethod(finded.methods[0].key)
}
const changeMethod = (key) => {
  method.value = key;
};


const with_again_password = ref(false)
const with_invite_code = ref(false)

const form = reactive({
  account: '',
  email: '',
  phone: '',
  password: '',
  againPassword: '',
  code: '',
  inviteCode: '',
})

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
    method: `${mode.value}_${method.value}`,
    account: form.account,
    email: form.email,
    phone: form.phone,
    password: form.password,
    againPassword: form.againPassword,
    code: form.code,
    inviteCode: form.inviteCode,
  }
  switch (mode.value) {
    case 'account':
      if (!param.account) {
        Error('请输入账号!')
        return
      }
      break
    case 'email':
      if (!param.email) {
        Error('请输入邮箱!')
        return
      }
      switch (method.value) {
        case "code":
          if (!param.code) {
            Error('请输入验证码!')
            return
          }
          break
      }
      break
    case 'phone':
      if (!param.phone) {
        Error('请输入手机号!')
        return
      }
      switch (method.value) {
        case "code":
          if (!param.code) {
            Error('请输入验证码!')
            return
          }
          break
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
  console.log(param)

  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_api.registe(param).then(() => {
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
    <p class="title">欢迎注册</p>
    <p class="remark">
      <span>已有账号</span>
      <span class="primary pointer" v-push="'/login'">去登录</span>
    </p>
    <div class="modes">
      <p class="pointer" v-for="(m, i) in modes" :key="i" :class="{ active: m.key === mode }"
        @click.stop="changeMode(m.key)">{{ m.name }}注册</p>
    </div>

    <div class="form">
      <div class="field" v-if="mode === 'account'">
        <el-input class="no-shadow large-padding" v-model="form.account" placeholder="请输入用户名">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-user.png">
          </template>
        </el-input>
      </div>
      <div class="field" v-if="mode === 'email'">
        <el-input class="no-shadow large-padding" v-model="form.email" placeholder="请输入邮箱">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-user.png">
          </template>
        </el-input>
      </div>
      <div class="field" v-if="mode === 'phone'">
        <el-input class="no-shadow large-padding" v-model="form.phone" placeholder="请输入手机号">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-user.png">
          </template>
        </el-input>
      </div>
      <div class="field" v-if="method === 'code'">
        <el-input class="no-shadow large-padding" v-model="form.code" placeholder="请输入验证码">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-code.png">
          </template>
          <template #suffix>
            <el-button v-if="mode === 'email'" type="primary" :disabled="codeSending || codeCountdown > 0"
              @click="emailCodeSend" link>
              获取验证码<template v-if="codeCountdown > 0">{{ `(${codeCountdown})` }}</template>
            </el-button>
            <el-button v-if="mode === 'phone'" type="primary" :disabled="codeSending || codeCountdown > 0"
              @click="phoneCodeSend" link>
              获取验证码<template v-if="codeCountdown > 0">{{ `(${codeCountdown})` }}</template>
            </el-button>
          </template>
        </el-input>
      </div>
      <div class="field">
        <el-input type="password" show-password class="no-shadow large-padding" v-model="form.password"
          placeholder="请输入密码">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-password.png">
          </template>
        </el-input>
      </div>
      <div class="field" v-if="with_again_password">
        <el-input type="password" show-password class="no-shadow large-padding" v-model="form.againPassword"
          placeholder="请输入确认密码">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-password.png">
          </template>
        </el-input>
      </div>
      <div class="field" v-if="with_invite_code">
        <el-input class="no-shadow large-padding" v-model="form.inviteCode" placeholder="请输入邀请码">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-code.png">
          </template>
        </el-input>
      </div>
    </div>

    <el-button style="align-self: flex-end" link v-push="'/forget_password'">忘记密码？</el-button>

    <el-button class="large-size" type="primary" round @click="submit">注册</el-button>

    <template v-for="(m, i) in methods" :key="i">
      <el-button v-if="method !== m.key" @click="changeMethod(m.key)" link>{{ m.name }}注册</el-button>
    </template>
  </div>
</template>

<style scoped>
.modes {
  margin-top: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-self: center;
  justify-content: space-around;
  width: 100%;
}

.modes p {
  font-size: 1.2rem;
}

.modes p.active {
  color: var(--el-color-primary);
  font-weight: bold;
}

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
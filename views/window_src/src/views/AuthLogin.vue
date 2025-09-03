<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ElLoading } from "element-plus";
import { Error } from "@/notification";

const router = useRouter();

const modes = ref([
  {
    key: "phone",
    name: "手机",
    methods: [{
      key: "password",
      name: "密码"
    }, {
      key: "code",
      name: "验证码"
    }]
  },
  {
    key: "email",
    name: "邮箱",
    methods: [{
      key: "password",
      name: "密码"
    }, {
      key: "code",
      name: "验证码"
    }]
  },
]);
const mode = ref("phone");
const method = ref("password")
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

const form = reactive({
  account: "",
  email: "",
  phone: "",
  password: "",
  code: "",
});


const codeSending = ref(false);
const codeCountdown = ref(0);
const emailCodeSend = () => {
  if (codeSending.value) {
    return;
  }
  if (!form.email) {
    Error("请输入邮箱！");
    return;
  }

  codeSending.value = true;
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .ses(2, form.email)
    .then(() => {
      codeCountdown.value = 60;
      let ticker = setInterval(() => {
        if (codeCountdown.value <= 0) {
          clearInterval(ticker);
          return;
        }
        codeCountdown.value--;
      }, 1000);
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      codeSending.value = false;
      loading.close();
    });
};
const phoneCodeSend = () => {
  if (codeSending.value) {
    return;
  }
  if (!form.phone) {
    Error("请输入手机号！");
    return;
  }

  codeSending.value = true;
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .sms(2, form.phone)
    .then(() => {
      codeCountdown.value = 60;
      let ticker = setInterval(() => {
        if (codeCountdown.value <= 0) {
          clearInterval(ticker);
          return;
        }
        codeCountdown.value--;
      }, 1000);
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      codeSending.value = false;
      loading.close();
    });
};

const submit = () => {
  let param = {
    method: `${mode.value}_${method.value}`,
    account: form.account,
    email: form.email,
    phone: form.phone,
    password: form.password,
    code: form.code,
  };
  switch (mode.value) {
    case "account":
      if (!param.account) {
        Error("请输入账号!");
        return;
      }
      switch (method.value) {
        case "password":
          if (!param.password) {
            Error("请输入密码!");
            return;
          }
          break;
      }
      break;
    case "phone":
      if (!param.phone) {
        Error("请输入手机号!");
        return;
      }
      switch (method.value) {
        case "password":
          if (!param.password) {
            Error("请输入密码!");
            return;
          }
          break;
        case "code":
          if (!param.code) {
            Error("请输入验证码!");
            return;
          }
          break
      }
      break;
    case "email":
      if (!param.email) {
        Error("请输入邮箱!");
        return;
      }
      switch (method.value) {
        case "password":
          if (!param.password) {
            Error("请输入密码!");
            return;
          }
          break;
        case "code":
          if (!param.code) {
            Error("请输入验证码!");
            return;
          }
          break
      }
      break;
  }

  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .login(param)
    .then(() => {
      router.push("/");
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      loading.close();
    });
};

const deviceLogin = () => {
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .login({
      method: "device",
    })
    .then(() => {
      router.push("/");
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      loading.close();
    });
};
</script>

<template>
  <div class="white-bg">
    <p class="title">欢迎登录</p>
    <p class="remark">
      <span>还没有账号</span>
      <span class="primary pointer" v-push="'/registe'">立即注册</span>
    </p>
    <div class="modes">
      <p class="pointer" v-for="(m, i) in modes" :key="i" :class="{ active: m.key === mode }"
        @click.stop="changeMode(m.key)">{{ m.name }}登录</p>
    </div>

    <div class="form">
      <div class="field" v-if="mode === 'account'">
        <el-input v-model="form.account" placeholder="请输入用户名">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-user.png" />
          </template>
        </el-input>
      </div>
      <div class="field" v-if="mode === 'email'">
        <el-input v-model="form.email" placeholder="请输入邮箱">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-user.png" />
          </template>
        </el-input>
      </div>
      <div class="field" v-if="mode === 'phone'">
        <el-input v-model="form.phone" placeholder="请输入手机号">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-user.png" />
          </template>
        </el-input>
      </div>
      <div class="field" v-if="method === 'code'">
        <el-input v-model="form.code" placeholder="请输入验证码">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-code.png" />
          </template>
          <template #suffix>
            <el-button v-if="mode === 'email'" type="primary" :disabled="codeSending || codeCountdown > 0"
              @click="emailCodeSend" link>
              获取验证码
              <template v-if="codeCountdown > 0">
                {{ `(${codeCountdown})` }}
              </template>
            </el-button>
            <el-button v-if="mode === 'phone'" type="primary" :disabled="codeSending || codeCountdown > 0"
              @click="phoneCodeSend" link>
              获取验证码
              <template v-if="codeCountdown > 0">
                {{ `(${codeCountdown})` }}
              </template>
            </el-button>
          </template>
        </el-input>
      </div>
      <div class="field" v-if="method === 'password'">
        <el-input type="password" show-password v-model="form.password" placeholder="请输入密码">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-password.png" />
          </template>
        </el-input>
      </div>
    </div>

    <el-button style="align-self: flex-end" link v-push="'/forget_password'">忘记密码？</el-button>

    <el-button class="large-size" type="primary" round @click="submit">登录</el-button>

    <template v-for="(m, i) in methods" :key="i">
      <el-button v-if="method !== m.key" @click="changeMethod(m.key)" link>{{ m.name }}登录</el-button>
    </template>

    <div class="others">
      <el-divider>
        <p class="info">其他方式</p>
      </el-divider>
      <el-button class="large-size" round plain @click.stop="deviceLogin">游客登录</el-button>
    </div>
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

.others {
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
}

.others .info {
  color: var(--el-color-info);
}

.others .el-button {
  --el-button-text-color: var(--el-color-primary);
}
</style>
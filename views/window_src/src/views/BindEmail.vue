<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ElLoading } from "element-plus";
import { Error } from "@/notification";

const router = useRouter();

const form = reactive({
  email: "",
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
    .ses(1, form.email)
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
    method: "email",
    email: form.email,
    password: form.password,
    code: form.code,
  };
  if (!param.email) {
    Error("请输入邮箱!");
    return;
  }
  if (!param.password) {
    Error("请输入密码!");
    return;
  }
  if (!param.code) {
    Error("请输入验证码!");
    return;
  }

  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .bind(param)
    .then(() => {
      router.back();
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
  <div class="bind">
    <div class="form">
      <div class="field">
        <p>绑定邮箱</p>
        <el-input v-model="form.email" placeholder="输入邮箱">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-user.png" />
          </template>
        </el-input>
      </div>
      <div class="field">
        <p>密码</p>
        <el-input
          v-model="form.password"
          type="password"
          show-password
          placeholder="输入密码"
        >
          <template #prefix>
            <img class="icon" src="@/assets/image/form-password.png" />
          </template>
        </el-input>
      </div>
      <div class="field">
        <p>验证码</p>
        <el-input v-model="form.code" placeholder="输入验证码">
          <template #prefix>
            <img class="icon" src="@/assets/image/form-code.png" />
          </template>
          <template #suffix>
            <el-button
              type="primary"
              :disabled="codeSending || codeCountdown > 0"
              @click="emailCodeSend"
              link
            >
              获取验证码<template v-if="codeCountdown > 0">{{
                `(${codeCountdown})`
              }}</template>
            </el-button>
          </template>
        </el-input>
      </div>
    </div>
    <div class="opertions nomargin">
      <el-button class="large-size" type="primary" round @click="submit"
        >绑定</el-button
      >
      <el-button type="info" link v-replace="'/bind_phone'">绑定手机</el-button>
    </div>
  </div>
</template>

<style scoped>
.opertions {
  margin-top: 10rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
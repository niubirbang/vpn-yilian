<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { ElLoading } from "element-plus";
import { Error } from "@/notification";

const router = useRouter();

const form = reactive({
  phone: "",
  password: "",
  code: "",
});

const codeSending = ref(false);
const codeCountdown = ref(0);
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
    .sms(1, form.phone)
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
    method: "phone",
    phone: form.phone,
    password: form.password,
    code: form.code,
  };
  if (!param.phone) {
    Error("请输入手机号!");
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
        <p>绑定手机号</p>
        <el-input v-model="form.phone" placeholder="输入手机号">
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
              @click="phoneCodeSend"
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
      <el-button type="info" link v-replace="'/bind_email'">绑定邮箱</el-button>
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
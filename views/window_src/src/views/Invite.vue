<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElLoading } from "element-plus";
import { Success, Error } from "@/notification";
import QRCode from "qrcode";
import useClipboard from "vue-clipboard3";
import html2canvas from "html2canvas";
import InviteBind from "@/components/custom/InviteBind.vue";
import { AUTHORIZATION_TYPE_DEVICE, AUTHORIZATION_TYPE_USER } from "@/store";

const router = useRouter();
const store = useStore();

const { toClipboard } = useClipboard();

const authorized = computed(() => store.state.authorized);
const authorizationType = computed(() => store.state.authorization_type);
const user_binded_invite_code = computed(() =>
  store.state.user_binded_invite_code ? true : false
);
const inviteCode = ref(null);
const inviteURL = ref();
const inviteRules = ref([]);
const inviteQRRef = ref(null);
const inviteQRURL = ref(null);
const show_invite_bind = ref(false);
const showDeviceTip = ref(false);

const copyCode = async () => {
  try {
    await toClipboard(inviteCode.value);
    Success("复制成功");
  } catch (err) {
    console.error("clipboard copy failed:", err);
    Error("复制失败");
  }
};

const copyURL = async () => {
  try {
    await toClipboard(inviteURL.value);
    Success("复制成功");
  } catch (err) {
    console.error("clipboard copy failed:", err);
    Error("复制失败");
  }
};

const saveQR = async () => {
  try {
    const canvas = await html2canvas(inviteQRRef.value);
    const image = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = image;
    a.download = `我的邀请码.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error("save image failed:", err);
  }
};

const load = () => {
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });

  window.box_api
    .inviteInfo()
    .then((data) => {
      inviteCode.value = data.invite_code;
      inviteURL.value = data.invite_link;
      for (let rule of data.invite_rule.split("\n")) {
        rule = rule.trim();
        if (rule) {
          inviteRules.value.push(rule);
        }
      }
      loadQR();
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      loading.close();
      if (
        authorized.value &&
        authorizationType.value === AUTHORIZATION_TYPE_DEVICE
      ) {
        showDeviceTip.value = true;
      }
    });
};

const loadQR = () => {
  try {
    QRCode.toDataURL(
      inviteURL.value,
      {
        errorCorrectionLevel: "H",
        margin: 1,
      },
      (err, url) => {
        if (err) {
          console.error("gen qr code failed:", err);
          url = null;
        }
        inviteQRURL.value = url;
      }
    );
  } catch (err) {
    console.error("gen qr code failed:", err);
  }
};

const showInviteBind = () => {
  if (!authorized.value) {
    router.push("/login");
    return;
  }
  show_invite_bind.value = true;
};

onMounted(() => {
  load();
});
</script>

<template>
  <div class="large-full invite-bg">
    <p class="page-title">邀请奖励指南</p>
    <div class="plate shadow flows">
      <div class="flow">
        <img src="@/assets/image/invite-1.png" />
        <p>邀请好友下载</p>
      </div>
      <img class="split" src="@/assets/image/invite-right.png" />
      <div class="flow">
        <img src="@/assets/image/invite-2.png" />
        <p>好友绑定成功</p>
      </div>
      <img class="split" src="@/assets/image/invite-right.png" />
      <div class="flow">
        <img src="@/assets/image/invite-3.png" />
        <p>双方获得奖励</p>
      </div>
    </div>
    <div class="links">
      <div class="option shadow pointer bg-invite-bind" @click="showInviteBind">
        <img src="@/assets/image/invite-bind.png" />
        <p>
          <template v-if="!authorized || !user_binded_invite_code"
            >绑定好友</template
          >
          <template v-else>已绑定</template>
        </p>
      </div>
      <div
        class="option shadow pointer bg-invite-history"
        v-push="'/invite_award'"
      >
        <img src="@/assets/image/invite-history.png" />
        <p>领取奖励</p>
      </div>
    </div>
    <div class="plate shadow invite-info" :class="{ unauthorize: !authorized }">
      <div class="bg-title">
        <p>邀请好友</p>
      </div>
      <template v-if="authorized">
        <div class="content">
          <img
            class="invite-qr-code pointer"
            ref="inviteQRRef"
            v-if="inviteQRURL"
            :src="inviteQRURL"
            @click="saveQR"
          />
          <div class="invite-code pointer" @click="copyCode">
            <p>邀请码:</p>
            <p>{{ inviteCode }}</p>
            <img src="@/assets/image/icon-copy.png" />
          </div>
          <el-button type="primary" round @click="copyURL"
            >点击复制邀请链接</el-button
          >
        </div>
      </template>
      <template v-else>
        <div class="pointer invite-unauthorize" v-push="'/login'">
          <img src="@/assets/image/icon-lock.png" />
          <p>请登录后邀请</p>
        </div>
      </template>
    </div>
    <div class="plate shadow invite-rules">
      <div class="bg-title">
        <p>奖励内容</p>
      </div>
      <p class="rule" v-for="(rule, i) in inviteRules" :key="i">{{ rule }}</p>
    </div>
    <InviteBind v-model:show="show_invite_bind" v-model:bindSuccess="load" />
    <el-dialog
      class="device-tip-dialog"
      width="60%"
      v-model="showDeviceTip"
      :show-close="false"
      :align-center="true"
    >
      <div class="content">
        <p class="p1">温馨提示</p>
        <p class="p2">邀请奖励需绑定手机号或邮箱后邀请好友获得</p>
        <el-button
          type="primary"
          round
          v-push="'/bind_phone'"
          v-if="authorized && authorizationType === AUTHORIZATION_TYPE_DEVICE"
          >立即绑定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  box-sizing: border-box;
  padding: 6.5rem 1rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.page-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--el-color-white);
}
.plate {
  width: 100%;
  box-sizing: border-box;
  padding: 1.5rem;
  border-radius: 1.5rem;
  background: #fff;
}
.plate.unauthorize {
  background: url("@/assets/image/unlogin-bg.png") no-repeat;
  background-size: 100% auto;
}
.plate:has(.bg-title) {
  position: relative;
  /* margin-top: 1rem; */
  padding-top: 2.5rem;
}
.plate .bg-title {
  position: absolute;
  top: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9;

  width: 8rem;
  height: 2.5rem;

  color: var(--el-color-white);
  font-weight: bold;
  font-size: 1.1rem !important;

  display: flex;
  align-items: center;
  justify-content: center;

  background: url("@/assets/image/inivite-title-bg.png") no-repeat;
  background-size: 100% auto;
}

.flows {
  padding: 0.7rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.flows .flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.flows .flow img {
  width: 3rem;
  height: auto;
}
.flows .flow p {
  font-size: 0.8rem;
}
.flows .split {
  margin-top: -1.5rem;
  width: 0.8rem;
  height: auto;
}

.links {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.links .option {
  flex: 1;
  box-sizing: border-box;
  padding: 1rem 1rem;
  border-radius: 1rem;

  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.links .option img {
  height: 3rem;
  width: auto;
}
.links .option p {
  font-weight: bold;
}
.links .option.bg-invite-bind {
  background: linear-gradient(180deg, #f4efff 0%, #ffffff 56%, #ffffff 100%);
}
.links .option.bg-invite-history {
  background: linear-gradient(180deg, #fff6ef 0%, #ffffff 56%, #ffffff 100%);
}

.invite-info {
  box-sizing: border-box;
  padding-top: 2rem;
  min-height: 20rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
}
.invite-info .content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.invite-info .content .invite-qr-code {
  width: 10rem;
  height: 10rem;
}
.invite-info .content .invite-code {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.invite-info .content .invite-code img {
  width: 1rem;
  height: auto;
}
.invite-info .content .el-button {
  --el-border-radius-round: 3.5rem;
  height: 3.5rem;
  width: 100%;
  font-size: 1.2rem;
  font-weight: bold;
  background: #7747fd;
  box-shadow: 0px 3px 0px 0px #431fa9;
  border-radius: 91px 91px 91px 91px;
}
.invite-info .invite-unauthorize {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.invite-info .invite-unauthorize img {
  height: 4rem;
  width: auto;
}
.invite-info .invite-unauthorize p {
  font-size: 1.2rem;
  font-weight: bold;
}

.invite-rules {
  display: flex;
  flex-direction: column;
}
.invite-rules .rule {
  font-size: 0.9rem;
}
.device-tip-dialog .content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.device-tip-dialog .content .p1 {
  text-align: center;
  font-size: 1.3rem;
}
.device-tip-dialog .content .p2 {
  text-align: center;
}
.device-tip-dialog .content .el-button {
  width: 10rem;
}
</style>
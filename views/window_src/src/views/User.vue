<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElLoading } from "element-plus";
import { Error } from "@/notification";
import {
  USER_LEVEL_NORMAL,
  USER_LEVEL_FREE,
  USER_LEVEL_VIP,
  USER_LEVEL_SVIP,
  USER_LEVEL_FOREVER,
  AUTHORIZATION_TYPE_DEVICE,
  AUTHORIZATION_TYPE_USER,
} from "@/store";
import { $DateFormat, $DateTimeFormat } from "@/util";
import {
  ShowService,
  ShowServicePolicy,
  ShowPrivacyPolicy,
  Confirm,
} from "@/util/directives";

import MenuService from "@/assets/image/menu-service.png";
import MenuServicePolicy from "@/assets/image/menu-service-policy.png";
import MenuAboutUs from "@/assets/image/menu-about-us.png";
import MenuDeleteAcount from "@/assets/image/menu-delete-acount.png";
import MenuInvite from "@/assets/image/menu-invite.png";
import MenuLogout from "@/assets/image/menu-logout.png";
import MenuPrivacyPolicy from "@/assets/image/menu-privacy-policy.png";
import MenuReward from "@/assets/image/menu-reward.png";
import MenuBind from "@/assets/image/menu-bind.png";

const router = useRouter();
const store = useStore();

const authorized = computed(() => store.state.authorized);
const authorizationType = computed(() => store.state.authorization_type);
const id = computed(() => store.state.user_id);
const nickname = computed(() => store.state.user_nickname);
const level = computed(() => store.state.user_level);
const timestamp = computed(() => store.state.timestamp);
const freeExpiredAt = computed(() => store.state.user_free_expired_at || 0);
const vipExpiredAt = computed(() => store.state.user_vip_expired_at || 0);
const svipExpiredAt = computed(() => store.state.user_svip_expired_at || 0);
const freeExpired = computed(() => freeExpiredAt.value < timestamp.value);
const vipExpired = computed(() => vipExpiredAt.value < timestamp.value);
const svipExpired = computed(() => svipExpiredAt.value < timestamp.value);
const version = computed(() => store.state.version);

const notFreeExpireTitle = computed(() => {
  return (_level) => {
    switch (_level) {
      case USER_LEVEL_VIP:
        if (vipExpired.value) {
          return "暂未开通VIP会员";
        } else {
          return `已开通VIP会员`;
        }
      case USER_LEVEL_SVIP:
        if (svipExpired.value) {
          return "暂未开通SVIP会员";
        } else {
          return `已开通SVIP会员`;
        }
    }
    return "";
  };
});
const notFreeExpireTxt = computed(() => {
  return (_level) => {
    switch (_level) {
      case USER_LEVEL_VIP:
        if (vipExpired.value) {
          return "点击开通专属特权";
        } else {
          return `有效期至${$DateFormat(vipExpiredAt.value)}`;
        }
      case USER_LEVEL_SVIP:
        if (svipExpired.value) {
          return "点击开通专属特权";
        } else {
          return `有效期至${$DateFormat(svipExpiredAt.value)}`;
        }
    }
    return "";
  };
});
const freeExpireTxt = computed(() => {
  if (freeExpired.value) {
    return "已到期";
  } else {
    return $DateTimeFormat(freeExpiredAt.value, "YYYY/MM/DD HH:mm");
  }
});

const options = ref([
  {
    name: "绑定手机号/邮箱",
    icon: MenuBind,
    need_authorized: true,
    need_authorized_device: true,
    do: () => {
      router.push("/bind_phone");
    },
  },
  {
    name: "我的奖励",
    icon: MenuReward,
    do: () => {
      router.push("/invite_award");
    },
  },
  {
    name: "联系客服",
    icon: MenuService,
    do: () => {
      ShowService();
    },
  },
  {
    name: "邀请与绑定",
    icon: MenuInvite,
    do: () => {
      router.push("/invite");
    },
  },
  {
    name: "服务协议",
    icon: MenuServicePolicy,
    do: () => {
      ShowServicePolicy();
    },
  },
  {
    name: "隐私协议",
    icon: MenuPrivacyPolicy,
    do: () => {
      ShowPrivacyPolicy();
    },
  },
  {
    name: "关于我们",
    icon: MenuAboutUs,
    do: () => {
      router.push("/about_us");
    },
  },
  {
    name: "注销账号",
    icon: MenuDeleteAcount,
    need_authorized: true,
    need_authorized_user: true,
    do: () => {
      router.push("/delete_account");
    },
  },
  {
    name: "退出登录入口",
    icon: MenuLogout,
    need_authorized: true,
    do: () => {
      logout();
    },
  },
]);

const optionShow = computed(() => {
  return (option) => {
    if (option.need_authorized) {
      if (!authorized.value) {
        return false;
      }
    }
    if (option.need_authorized_user) {
      if (authorizationType.value !== AUTHORIZATION_TYPE_USER) {
        return false;
      }
    }
    if (option.need_authorized_device) {
      if (authorizationType.value !== AUTHORIZATION_TYPE_DEVICE) {
        return false;
      }
    }
    return true;
  };
});

const header_do = () => {
  if (authorized.value) {
    freshUser();
  } else {
    router.push("/login");
  }
};

const logout = () => {
  Confirm({
    message: "确认退出登录？",
    confirmDo: () => {
      const loading = ElLoading.service({
        lock: true,
        background: "rgba(0, 0, 0, 0.7)",
      });
      window.box_api
        .logout()
        .then(() => {
          router.replace("/login");
        })
        .catch((err) => {
          Error(err);
        })
        .finally(() => {
          loading.close();
        });
    },
  });
};

const freshingUser = ref(false);
const freshUser = () => {
  if (freshingUser.value || !authorized.value) {
    return;
  }

  freshingUser.value = true;
  window.box_api
    .freshUser()
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      setTimeout(() => {
        freshingUser.value = false;
      }, 1000);
    });
};

onMounted(() => {
  freshUser();
});
</script>

<template>
  <div class="large-full main-bg">
    <div class="l1 page-padding pointer" @click="header_do">
      <img class="x1" src="@/assets/image/avatar.png" />
      <div class="x2">
        <p class="y1" v-if="authorized">
          <span v-if="authorizationType === AUTHORIZATION_TYPE_DEVICE">
            ID: {{ id }}
          </span>
          <span v-if="authorizationType === AUTHORIZATION_TYPE_USER">
            {{ nickname }}
          </span>
        </p>
        <p class="y1" v-push="'/login'" v-else>请登录</p>

        <p class="y3" v-if="authorized && authorizationType === AUTHORIZATION_TYPE_DEVICE">
          未绑定手机号/邮箱
        </p>

        <div class="y2" v-if="authorized">
          <template v-if="level == USER_LEVEL_FREE">
            <p class="z1" :class="level">免费会员</p>
            <p class="z2">{{ freeExpireTxt }}</p>
          </template>
        </div>
      </div>
      <img v-if="authorized" class="x3" src="@/assets/image/fresh.png" :class="{ animation: freshingUser }" />
    </div>
    <div class="l2 page-padding">
      <div class="x1 pointer vip" v-push="'/recharge?key=vip'">
        <div class="y1">
          <img src="@/assets/image/icon-vip.png" />
          <p class="m1">VIP</p>
        </div>
        <p class="m1">{{ notFreeExpireTitle(USER_LEVEL_VIP) }}</p>
        <p class="m2">{{ notFreeExpireTxt(USER_LEVEL_VIP) }}</p>
      </div>
      <div class="x1 pointer svip" v-push="'/recharge?key=svip'">
        <div class="y1">
          <img src="@/assets/image/icon-svip.png" />
          <p class="m1">SVIP</p>
        </div>
        <p class="m1">{{ notFreeExpireTitle(USER_LEVEL_SVIP) }}</p>
        <p class="m2">{{ notFreeExpireTxt(USER_LEVEL_SVIP) }}</p>
      </div>
    </div>
    <div class="l3 shadow page-padding">
      <p class="x1">我的功能</p>
      <template v-for="(option, i) of options">
        <div :key="i" class="x2 pointer" v-if="optionShow(option)" @click="option.do">
          <img :src="option.icon" />
          <p>{{ option.name }}</p>
          <el-icon size="1rem">
            <ArrowRight />
          </el-icon>
        </div>
      </template>
    </div>
    <p class="l4 page-padding third-txt">v{{ version }}</p>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-padding {
  box-sizing: border-box;
  margin: 0 var(--page-padding);
}

.l1 {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.l1 .x1 {
  width: auto;
  height: 5rem;
  border-radius: 50%;
}

.l1 .x2 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.5rem;
}

.l1 .x2 .y1 {
  font-weight: bold;
  font-size: 1.2rem;
}

.l1 .x2 .y2 {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.l1 .x2 .y2 .z1 {
  background: var(--el-color-primary);
  color: var(--el-color-white);
  border-radius: 999rem;
  box-sizing: border-box;
  padding: 0.3rem 1rem;
  font-size: 0.8rem;
}

.l1 .x2 .y2 .z2 {
  font-size: 0.8rem;
}

.l1 .x2 .y3 {
  color: var(--el-color-info);
  font-size: 0.9rem;
}

.l1 .x3 {
  margin-left: auto;
  width: 1.6rem;
  height: auto;
}

.l1 .x3.animation {
  animation: rotate 2s linear infinite;
}

.l2 {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.l2 .m1 {
  font-weight: bold;
}

.l2 .m2 {
  font-size: 0.8rem;
}

.l2 .x1 {
  box-sizing: border-box;
  padding: 1rem;
  font-size: 1.1rem;

  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.l2 .x1.vip {
  background: url("@/assets/image/vip-bg.png") no-repeat;
  background-size: 100% 100%;
  color: var(--el-color-primary-dark-2);
}

.l2 .x1.svip {
  background: url("@/assets/image/svip-bg.png") no-repeat;
  background-size: 100% 100%;
  color: var(--el-color-primary2-dark-2);
}

.l2 .x1 .y1 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.l2 .x1 .y1 img {
  height: 1.3rem;
  width: auto;
}

.l3 {
  box-sizing: border-box;
  padding: 1rem;
  background: var(--el-color-white);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.l3 .x1 {
  font-size: 1.2rem;
  font-weight: bold;
}

.x2 {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.x2 img {
  width: 1.8rem;
  height: auto;
}

.x2 p {
  font-size: 1.1rem;
}

.x2 .el-icon {
  margin-left: auto;
}

.l4 {
  margin-top: auto;
  margin-bottom: 0.5rem;
  align-self: center;
}
</style>
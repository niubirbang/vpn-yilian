<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { ElLoading } from "element-plus";
import { Error } from "@/notification";
import { $Money, $DateFormat } from "@/util";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { AUTHORIZATION_TYPE_DEVICE, AUTHORIZATION_TYPE_USER } from "@/store";

const router = useRouter();
const route = useRoute();
const store = useStore();

const authorized = computed(() => store.state.authorized);
const authorizationType = computed(() => store.state.authorization_type);
const id = computed(() => store.state.user_id);
const nickname = computed(() => store.state.user_nickname);
const timestamp = computed(() => store.state.timestamp);
const vipExpiredAt = computed(() => store.state.user_vip_expired_at || 0);
const svipExpiredAt = computed(() => store.state.user_svip_expired_at || 0);
const vipExpired = computed(() => vipExpiredAt.value < timestamp.value);
const svipExpired = computed(() => svipExpiredAt.value < timestamp.value);
const currentPlan = ref({});
const currentPrice = ref({});
const currentPayment = ref({});

const plans = ref([]);
const payments = ref([]);
const duration = ref(0);

const duration_info = computed(() => {
  let second = duration.value;
  let minute = parseInt(second / 60);
  second -= minute * 60;
  let hour = parseInt(minute / 60);
  minute -= hour * 60;
  return {
    second,
    minute,
    hour,
  };
});

const changePlan = (plan) => {
  if (currentPlan.value.id == plan.id) {
    return;
  }

  currentPlan.value = plan;

  let price = {};
  if (plan.prices.length > 0) {
    price = currentPlan.value.prices[0];

    for (let _price of currentPlan.value.prices) {
      if (_price.period == currentPrice.value.period) {
        price = _price;
        break;
      }
    }
  }
  changePrice(price);
};

const changePrice = (price) => {
  currentPrice.value = price;
};

const load = async (planKey) => {
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });

  try {
    plans.value = await window.box_api.listPlan();
    if (planKey) {
      for (let plan of plans.value) {
        if (plan.key == planKey) {
          currentPlan.value = plan;
        }
      }
    } else {
      if (plans.value.length > 0) {
        currentPlan.value = plans.value[0];
      }
    }
    if (currentPlan.value.prices.length > 0) {
      currentPrice.value = currentPlan.value.prices[0];
    }
  } catch (err) {
    Error(err);
  }

  try {
    payments.value = await window.box_api.listOrderPayment();
    if (payments.value.length > 0) {
      currentPayment.value = payments.value[0];
    }
  } catch (err) {
    Error(err);
  }

  loading.close();

  // Promise.all([window.box_api.listPlan(), window.box_api.listOrderPayment()]).then(([_plans, _payments]) => {
  //   plans.value = _plans
  //   if (planKey) {
  //     for (let plan of plans.value) {
  //       if (plan.key == planKey) {
  //         currentPlan.value = plan
  //       }
  //     }
  //   } else {
  //     if (plans.value.length > 0) {
  //       currentPlan.value = plans.value[0]
  //     }
  //   }
  //   if (currentPlan.value.prices.length > 0) {
  //     currentPrice.value = currentPlan.value.prices[0]
  //   }

  //   payments.value = _payments
  //   if (payments.value.length > 0) {
  //     currentPayment.value = payments.value[0]
  //   }

  //   loaded.value = true
  // }).catch(err => {
  //   Error(err)
  // }).finally(() => {
  //   loading.close()
  // })
};

const load_for_mock = (planKey) => {
  plans.value = [
    {
      id: 1,
      key: "vip",
      name: "VIP",
      title: "VIP会员",
      remark: "开通VIP，享会员特权",
      recommend: true,
      prices: [
        {
          plan_id: 1,
          period: "month_price",
          name: "月套餐",
          amount: 100,
          originalAmount: 500,
          break: 80,
          unitPrice: 3,
          recommend: false,
        },
        {
          plan_id: 1,
          period: "quarter_price",
          name: "季度套餐",
          amount: 200,
          originalAmount: 1000,
          break: 80,
          unitPrice: 2,
          recommend: false,
        },
        {
          plan_id: 1,
          period: "year_price",
          name: "年套餐",
          amount: 25800,
          originalAmount: 129000,
          break: 80,
          unitPrice: 71,
          recommend: true,
        },
      ],
    },
    {
      id: 2,
      key: "svip",
      name: "SVIP",
      title: "SVIP会员",
      remark: "开通SVIP，享会员特权",
      recommend: false,
      prices: [
        {
          plan_id: 2,
          period: "month_price",
          name: "月套餐",
          amount: 100,
          originalAmount: 500,
          break: 80,
          unitPrice: 3,
          recommend: false,
        },
        {
          plan_id: 2,
          period: "quarter_price",
          name: "季度套餐",
          amount: 200,
          originalAmount: 1000,
          break: 80,
          unitPrice: 2,
          recommend: false,
        },
        {
          plan_id: 2,
          period: "year_price",
          name: "年套餐",
          amount: 46800,
          originalAmount: 234000,
          break: 80,
          unitPrice: 128,
          recommend: true,
        },
      ],
    },
  ];
  if (planKey) {
    for (let plan of plans.value) {
      if (plan.key == planKey) {
        currentPlan.value = plan;
      }
    }
  } else {
    if (plans.value.length > 0) {
      currentPlan.value = plans.value[0];
    }
  }
  if (currentPlan.value.prices.length > 0) {
    currentPrice.value = currentPlan.value.prices[0];
  }

  payments.value = [
    {
      id: 1,
      uuid: "EUKCdaF8",
      payment: "FeiMaoWxpay",
      name: "微信",
      pay_id: "6",
      icon: "https://open.weixin.qq.com/zh_CN/htmledition/res/assets/res-design-download/icon64_appwx_logo.png",
      config:
        '{"url":"http:\\/\\/8.216.128.222","pk":"f8ddc32907efa510c5cf9dc729d4d391","merchant_no":"7151610013"}',
      notify_domain: null,
      handling_fee_fixed: null,
      handling_fee_percent: null,
      enable: 1,
      sort: null,
      created_at: 1721912552,
      updated_at: 1721965100,
    },
    {
      id: 2,
      uuid: "EUKCdaF1",
      payment: "FeiMaoAlipay",
      name: "支付宝",
      pay_id: "5",
      icon: "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/13_Alipay_logo_logos-512.png",
      config:
        '{"url":"http:\\/\\/8.216.128.222","pk":"f8ddc32907efa510c5cf9dc729d4d391","merchant_no":"7151610013"}',
      notify_domain: null,
      handling_fee_fixed: null,
      handling_fee_percent: null,
      enable: 1,
      sort: null,
      created_at: 1721912552,
      updated_at: 1721965134,
    },
  ];
  if (payments.value.length > 0) {
    currentPayment.value = payments.value[0];
  }
};

const pay_info = ref(null);
const pay_qr_code = ref(null);
const show_pay_qr_dialog = ref(false);
const pay = () => {
  if (!authorized.value) {
    router.push("/login");
    return;
  }

  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });
  window.box_api
    .payOrderByPlan(
      currentPrice.value.plan_id,
      currentPrice.value.period,
      currentPayment.value.id
    )
    .then((data) => {
      pay_info.value = data;
      loadPayQRDialog();
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      loading.close();
    });
};

const loadPayQRDialog = () => {
  try {
    QRCode.toDataURL(
      pay_info.value.pay_url,
      {
        errorCorrectionLevel: "H",
        margin: 1,
      },
      (err, url) => {
        if (err) {
          console.error("gen qr code failed:", err);
          url = null;
        }
        pay_qr_code.value = url;
      }
    );
    show_pay_qr_dialog.value = true;
  } catch (err) {
    console.error("gen qr code failed:", err);
  }
};

const show_pay_success_dialog = ref(false);
const listenPaySuccess = () => {
  try {
    window.box_api.listenOrderPaied((data) => {
      if (pay_info.value && data.trade_no == pay_info.value.order_id) {
        show_pay_qr_dialog.value = false;
        show_pay_success_dialog.value = true;
      }
    });
  } catch (err) {
    console.error("listen order paided failed");
  }
};
const close_pay_success = () => {
  show_pay_success_dialog.value = false;
  router.push("/");
};

let duration_interval = null;
const load_duration = () => {
  let time = localStorage.getItem("visit_recharge_time");
  const now = Date.now();
  let _duration = parseInt(now - time);
  if (_duration > 12 * 60 * 60 * 1000) {
    time = Date.now();
    localStorage.setItem("visit_recharge_time", time);
    _duration = parseInt(now - time);
  }
  duration.value = 12 * 60 * 60 - parseInt(_duration / 1000);
  duration_interval = setInterval(() => {
    duration.value = duration.value - 1;
  }, 1000);
};

onMounted(() => {
  load(route.query.key);
  // load_for_mock(route.query.key)
  load_duration();
  listenPaySuccess();
});
onUnmounted(() => {
  clearInterval(duration_interval);
});
</script>

<template>
  <div class="large-full recharge-bg">
    <p class="page-title">会员</p>
    <div class="inner">
      <div class="plan-selector">
        <div
          class="option pointer"
          v-for="(plan, i) of plans"
          :key="i"
          :class="{
            active: plan.id === currentPlan.id,
            vip: plan.key === 'vip',
            svip: plan.key === 'svip',
          }"
          @click="changePlan(plan)"
        >
          <img v-if="plan.key === 'vip'" src="@/assets/image/icon-vip.png" />
          <img v-if="plan.key === 'svip'" src="@/assets/image/icon-svip.png" />
          <p>{{ plan.name }}</p>
          <p v-if="plan.recommend" class="recommend">{{ plan.recommend }}</p>
        </div>
      </div>
      <div class="user-level" :class="currentPlan.key">
        <template v-if="authorized">
          <div class="line">
            <img src="@/assets/image/avatar.png" />

            <p
              class="bold"
              v-if="authorizationType === AUTHORIZATION_TYPE_USER"
            >
              {{ nickname }}
            </p>
            <p
              class="bold"
              v-if="authorizationType === AUTHORIZATION_TYPE_DEVICE"
            >
              ID: {{ id }}
            </p>
          </div>
          <div class="line">
            <template v-if="currentPlan.key === 'vip'">
              <p class="bold" v-if="vipExpired">开通会员享高速权益</p>
              <p class="bold" v-else>
                有效期至: {{ $DateFormat(vipExpiredAt) }}
              </p>
            </template>
            <template v-if="currentPlan.key === 'svip'">
              <p class="bold" v-if="svipExpired">开通会员享高速权益</p>
              <p class="bold" v-else>
                有效期至: {{ $DateFormat(svipExpiredAt) }}
              </p>
            </template>
          </div>
        </template>
        <template v-else>
          <div class="line pointer" v-push="'/login'">
            <img src="@/assets/image/avatar.png" />
            <p class="bold">未登录</p>
          </div>
          <div class="line pointer" v-push="'/login'">
            <p class="bold">开通会员享高速权益</p>
          </div>
        </template>
      </div>
      <div class="equity">
        <p class="title bold">会员专属权益</p>
        <div class="options">
          <div class="option">
            <img src="@/assets/image/recharge-icon-1.png" />
            <p v-if="currentPlan.key === 'vip'">3台设备同时在线</p>
            <p v-if="currentPlan.key === 'svip'">5台设备同时在线</p>
          </div>
          <div class="option">
            <img src="@/assets/image/recharge-icon-2.png" />
            <p v-if="currentPlan.key === 'vip'">不限速不限流</p>
            <p v-if="currentPlan.key === 'svip'">不限速不限流</p>
          </div>
          <div class="option">
            <img src="@/assets/image/recharge-icon-3.png" />
            <p v-if="currentPlan.key === 'vip'">共享百兆宽带</p>
            <p v-if="currentPlan.key === 'svip'">独享千兆宽带</p>
          </div>
        </div>
      </div>
      <div class="prices">
        <p class="title bold">套餐选择</p>
        <div class="options">
          <div
            class="option"
            :class="{ active: price.period === currentPrice.period }"
            v-for="(price, i) of currentPlan.prices"
            :key="i"
            @click="changePrice(price)"
          >
            <p v-if="price.recommend" class="recommend">
              {{ price.recommend }}
            </p>
            <p class="name">{{ price.name }}</p>
            <p class="amount">
              <span class="unit">¥</span>
              <span>{{ $Money(price.amount) }}</span>
            </p>
            <p class="original-amount">¥{{ $Money(price.originalAmount) }}</p>
            <p class="unit-price">每天仅需{{ $Money(price.unitPrice) }}元</p>
          </div>
        </div>
      </div>
      <div class="payments">
        <p class="title bold">支付方式</p>
        <div class="options">
          <div
            class="option pointer"
            v-for="(payment, i) of payments"
            :key="i"
            @click="currentPayment = payment"
          >
            <img :src="payment.icon" />
            <p>{{ payment.name }}</p>
            <Iconfont
              class="selector"
              :class="payment.id == currentPayment.id ? 'selected' : 'unselect'"
              :name="
                payment.id == currentPayment.id
                  ? 'radio-selected'
                  : 'radio-unselect'
              "
            />
          </div>
        </div>
      </div>
      <div
        class="unbind"
        v-if="authorized && authorizationType === AUTHORIZATION_TYPE_DEVICE"
      >
        <span
          >为防止充值成功但会员状态添加失败或丢失，客服无法找回。建议您</span
        >
        <span class="primary pointer" v-push="'/bind_phone'"
          >绑定手机号或邮箱</span
        >
      </div>
    </div>
    <div class="footer shadow">
      <div class="left">
        <div class="line">
          <p>
            <span class="countdown">{{
              String(duration_info.hour).padStart(2, "0")
            }}</span>
            <span> : </span>
            <span class="countdown">{{
              String(duration_info.minute).padStart(2, "0")
            }}</span>
            <span> : </span>
            <span class="countdown">{{
              String(duration_info.second).padStart(2, "0")
            }}</span>
          </p>
          <p class="countdown-remark">后恢复原价</p>
        </div>
        <div class="line">
          <p class="selected-plan-price">
            <span
              >{{ currentPrice?.name
              }}{{ currentPlan?.key?.toUpperCase() }}会员:
            </span>
            <span class="emphasize">¥</span>
            <span class="emphasize large bold">{{
              $Money(currentPrice?.amount || 0)
            }}</span>
          </p>
        </div>
      </div>
      <div class="right">
        <el-button type="primary" round @click="pay">立即开通</el-button>
      </div>
    </div>

    <el-dialog
      class="pay-dialog"
      width="60%"
      v-model="show_pay_qr_dialog"
      :show-close="false"
      :align-center="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="content">
        <p>{{ `请使用手机${currentPayment.name}扫码支付` }}</p>
        <img :src="pay_qr_code" />
        <el-icon
          class="pointer"
          size="2rem"
          @click="show_pay_qr_dialog = false"
        >
          <CircleClose />
        </el-icon>
      </div>
    </el-dialog>
    <el-dialog
      class="pay-success-dialog"
      width="60%"
      v-model="show_pay_success_dialog"
      :show-close="false"
      :align-center="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="content">
        <div class="pay-success-header">
          <img src="@/assets/image/pay-success.png" />
          <p>支付成功</p>
        </div>
        <p v-if="authorized && authorizationType === AUTHORIZATION_TYPE_DEVICE">
          游客状态只能一台设备登录并且充值出现丢失情况无法找回，如需其他设备登录或订单找回，请绑定账号。
        </p>
        <div class="opertions nomargin">
          <el-button
            type="primary"
            round
            v-push="'/bind_phone'"
            v-if="authorized && authorizationType === AUTHORIZATION_TYPE_DEVICE"
            >立即绑定</el-button
          >
          <el-button type="info" plain round @click="close_pay_success"
            >知道了</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.page {
  box-sizing: border-box;
  padding-top: 3.3rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.page-title {
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--el-color-black);
}
.inner {
  flex: 1 1 auto;
  overflow: auto;

  background: var(--el-color-white);
  border-radius: 2rem 2rem 0 0;

  display: flex;
  flex-direction: column;
}

.plan-selector {
  width: 100%;
  align-self: center;
  background: url("@/assets/image/recharge-plan-bg.png") no-repeat;
  background-size: 100% auto;

  display: flex;
}
.plan-selector .option {
  flex: 1;
  box-sizing: border-box;
  padding: 1rem;
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.plan-selector .option.active {
  background: url("@/assets/image/recharge-plan-active-bg.png") no-repeat;
  background-size: 100% auto;
}
.plan-selector .option img {
  height: 1.5rem;
}
.plan-selector .option p {
  font-size: 1.1rem;
  font-weight: bold;
}
.plan-selector .option.active.vip p {
  color: var(--el-color-primary);
}
.plan-selector .option.active.svip p {
  color: var(--el-color-primary2-dark-2);
}
.plan-selector .option .recommend {
  position: absolute;
  right: 1rem;
  top: 0.4rem;

  background: #f54141;
  border-radius: 0.5rem 0.5rem 0.5rem 0;
  color: var(--el-color-white) !important;
  font-size: 0.8rem;
  box-sizing: border-box;
  padding: 0.1rem 0.5rem;
}

.user-level {
  box-sizing: border-box;
  padding: 1rem;
  margin: 0 1rem;
  min-height: 6rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}
.user-level .line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.user-level .line img {
  width: 2rem;
  height: auto;
}
.user-level.vip {
  background: url("@/assets/image/recharge-vip-bg.png") no-repeat;
  background-size: 100% 100%;
  color: var(--el-color-primary);
}
.user-level.svip {
  background: url("@/assets/image/recharge-svip-bg.png") no-repeat;
  background-size: 100% 100%;
  color: var(--el-color-primary2-dark-2);
}

.equity {
  margin: 1rem 1rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.equity .title {
  font-size: 1.2rem;
}
.equity .options {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.equity .options .option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.equity .options .option img {
  height: 3.2rem;
  width: auto;
}
.equity .options .option p {
  font-size: 0.9rem;
}

.prices {
  margin: 1rem 1rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.prices .title {
  font-size: 1.2rem;
}
.prices .options {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.prices .option {
  position: relative;
  width: calc(33.33% - 12px);
  box-sizing: border-box;
  padding: 1rem 0;
  border: 0.01rem solid var(--el-color-info-light-7);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  overflow: hidden;
}
.prices .option.active {
  background: url("@/assets/image/recharge-plan-price-active-bg.png") no-repeat;
  background-size: 100% 100%;
  border-color: var(--el-color-primary);
}
.prices .option .recommend {
  position: absolute;
  right: 0;
  top: 0;

  top: 8px;
  right: -20px;
  background-color: #f54141;
  color: var(--el-color-white);
  font-size: 0.8rem;
  transform: rotate(45deg);
  z-index: 1;
  width: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.prices .option .name {
  font-size: 1rem;
}
.prices .option .amount {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  font-size: 1.6rem;
  font-weight: bold;
  color: #f42323;
}
.prices .option .amount .unit {
  font-size: 0.92rem;
  font-weight: normal;
}
.prices .option .original-amount {
  font-size: 0.92rem;
  color: #78777c;
  text-decoration-line: line-through;
}
.prices .option .unit-price {
  font-size: 0.7rem;
  box-sizing: border-box;
  padding: 0.4rem 0.8rem;
  background: linear-gradient(90deg, #9a77fe 0%, #7a4bfd 100%);
  color: var(--el-color-white);
  border-radius: 0.3rem;
}

.payments {
  margin: 1rem 1rem 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.payments .title {
  font-size: 1.2rem;
}
.payments .options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.payments .options .option {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.payments .options .option img {
  height: 1.6rem;
  width: auto;
}
.payments .options .option .selector {
  margin-left: auto;
  font-size: 1.8rem;
}
.payments .options .option .selector.selected {
  color: var(--el-color-primary);
}
.payments .options .option .selector.unselect {
  color: var(--el-color-primary);
}

.unbind {
  margin: 1rem 1rem 1rem 1rem;
  gap: 1rem;
}

.footer {
  background: var(--el-color-white);
  box-sizing: border-box;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.footer .left {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.footer .left .line {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.footer .right {
  width: 10rem;
  height: 100%;
}
.footer .right .el-button {
  height: 100%;
  width: 100%;
  border-radius: 999rem;
}
.footer .countdown {
  font-size: 0.8rem;
  box-sizing: border-box;
  padding: 0.1rem;
  color: var(--el-color-white);
  background: #f42323;
  border-radius: 0.3rem;

  text-align: center;
}
.footer .countdown-remark {
  font-size: 0.8rem;
  color: var(--el-color-info-light-4);
}
.footer .selected-plan-price {
  font-size: 0.85rem;
}
.footer .emphasize {
  color: #f42323;
}
.footer .large {
  font-size: 1.6rem;
}

.pay-dialog .content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.pay-success-dialog .content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.pay-success-dialog .content .pay-success-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.pay-success-dialog .content .pay-success-header img {
  height: 4rem;
  width: auto;
}
.pay-success-dialog .content .pay-success-header p {
  font-weight: bold;
  font-size: 1.3rem;
  color: #0084ff;
}
.pay-success-dialog .content .opertions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.pay-success-dialog .content .opertions .el-button {
  width: 10rem;
}
</style>
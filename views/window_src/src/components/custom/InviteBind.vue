<script setup>
import { reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { Success, Error } from "@/notification";
import { ElLoading } from "element-plus";

const router = useRouter();
const store = useStore();

const show = defineModel("show", {
  default: false,
});

const bindSuccess = defineModel("bindSuccess", {
  default: () => {},
});

const user_binded_invite_code = computed(() =>
  store.state.user_binded_invite_code ? true : false
);

const form = reactive({
  invite_code: store.state.user_binded_invite_code,
});

const submit = () => {
  const loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });

  window.box_api
    .bindInviteCode(form.invite_code)
    .then(() => {
      form.invite_code = "";
      loading.close();
      Success("绑定成功");
      show.value = false;
      if (typeof bindSuccess.value === "function") {
        bindSuccess.value();
      }
    })
    .catch((err) => {
      loading.close();
      Error(err);
    });
};
</script>

<template>
  <el-dialog
    v-model="show"
    width="70%"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :show-close="true"
    :align-center="true"
  >
    <div class="content">
      <p class="title bold larger-txt">绑定邀请码</p>
      <div class="form">
        <div class="field">
          <el-input
            v-model="form.invite_code"
            :disabled="user_binded_invite_code"
            placeholder="请输入邀请码"
          >
          </el-input>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer nomargin">
        <el-button
          class="big-size"
          type="primary"
          round
          :disabled="user_binded_invite_code"
          @click="submit"
        >
          <template v-if="user_binded_invite_code">已绑定</template>
          <template v-else>绑定</template>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.content {
  position: relative;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.content .title {
  text-align: center;
}
.dialog-footer {
  display: flex;
  flex-direction: column;
}
</style>
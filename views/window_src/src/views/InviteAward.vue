<script setup>
import { ref, onMounted } from "vue";
import { ElLoading } from "element-plus";
import { Error } from "@/notification";
import { $DateTimeFormat } from "@/util";

const total_duration = ref(0);
const awards = ref([]);
const loading = ref(false);

const load = () => {
  loading.value = true;
  const _loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });

  window.box_api
    .inviteAward()
    .then((data) => {
      total_duration.value = Math.ceil(data.total_duration / 60);
      awards.value = data.data;
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      _loading.close();
      loading.value = false;
    });
};

const award_all = () => {
  const _loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });

  window.box_api
    .inviteAwardAll()
    .then(() => {
      load();
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      _loading.close();
    });
};
const award_item = (id) => {
  const _loading = ElLoading.service({
    lock: true,
    background: "rgba(0, 0, 0, 0.7)",
  });

  window.box_api
    .inviteAwardItem(id)
    .then(async () => {
      await load();
    })
    .catch((err) => {
      Error(err);
    })
    .finally(() => {
      _loading.close();
    });
};

onMounted(() => {
  load();
});
</script>

<template>
  <div>
    <div class="award shadow">
      <div class="item">
        <p class="key">
          <span>您有</span>
          <span class="primary bold">{{ total_duration }}个小时</span>
          <span>的免费时长待领取</span>
        </p>
        <el-button
          class="value"
          type="primary"
          :disabled="!total_duration"
          round
          @click="award_all"
          >一键领取</el-button
        >
      </div>
    </div>
    <p class="no-data" v-if="!loading && awards.length == 0">暂无数据</p>
    <div class="award shadow" v-for="(award, i) in awards">
      <div class="item">
        <p class="key">奖励类型</p>
        <p class="value">{{ award?.type }}</p>
      </div>
      <div class="item">
        <p class="key">奖励内容</p>
        <p class="value">{{ award?.content }}</p>
      </div>
      <div class="item">
        <p class="key">被邀请人</p>
        <p class="value">{{ award?.tel }}</p>
      </div>
      <div class="item">
        <p class="key">奖励发放时间</p>
        <p class="value">{{ award?.create_time }}</p>
        <el-button
          :type="award?.status === 1 ? 'primary' : 'info'"
          :disabled="award?.status !== 1"
          round
          @click="award_item(award?.id)"
        >
          <template v-if="award?.status === 1">领取</template>
          <template v-if="award?.status === 2">已领取</template>
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  gap: 1rem;
}
.award {
  box-sizing: border-box;
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.item .value {
  display: flex;
  align-items: center;
  gap: 1rem;
}
</style>
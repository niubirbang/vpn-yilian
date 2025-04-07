<script setup>
import { ref, computed } from "vue"
import { useStore } from 'vuex'
import { PROXY_MODE_SYSTEM, PROXY_MODE_TUN } from '@/store'
import { Error } from '@/notification'
import { ElLoading } from 'element-plus'

const store = useStore()

const show = ref(false)

const modes = ref([PROXY_MODE_SYSTEM, PROXY_MODE_TUN])
const mode = computed(() => store.state.proxy_mode)

const changing = ref(false)

const change = (r) => {
  if (changing.value) {
    return
  }

  changing.value = true
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  show.value = false
  window.box_core.changeMode(r).catch(err => {
    Error(err)
  }).finally(() => {
    changing.value = false
    setTimeout(() => {
      loading.close()
    }, 300)
  })
}
</script>

<template>
  <div
    class="box pointer"
    @click="show = true"
  >
    <div class="left">
      <Iconfont name="rule-cn" />
      <div class="info">
        <p>代理模式</p>
        <p class="v">{{ $t(`proxy_mode_${mode}`) }}</p>
      </div>
    </div>
    <el-icon class="right">
      <ArrowRight />
    </el-icon>
    <el-dialog
      v-model="show"
      title="请选择代理模式"
      :align-center="true"
      width="90%"
    >
      <div class="dialog">
        <div
          class="selector pointer"
          v-for="(r, i) in modes"
          :key="i"
          @click.stop="change(r)"
        >
          <div class="left">
            <Iconfont :name="`mode-${r}`" />
            <div class="content">
              <p class="name">{{ $t(`proxy_mode_${r}`) }}</p>
              <p class="info">{{ $t(`proxy_mode_${r}_remark`) }}</p>
            </div>
          </div>
          <div class="right">
            <Iconfont
              class="radio"
              :class="mode == r ? 'selected' : 'unselect'"
              :name="mode == r ? 'radio-selected' : 'radio-unselect'"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.box {
  flex: 1;
  height: 3rem;
  background: #2d2d3c;
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.box .left {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.box .left .icon {
  font-size: 2rem;
}
.box .left .info {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  font-size: 0.86rem;
}
.box .left .info .v {
  font-size: 1.1rem;
  color: #efd29e;
}

.dialog {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.dialog .selector {
  color: #fff;
  background: #2d2d3c;
  border-radius: 1rem;
  width: 100%;
  height: 5rem;
  box-sizing: border-box;
  padding: 0 1rem;
  display: flex;
  align-items: center;
}
.dialog .selector .left {
  width: 90%;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.dialog .selector .left .icon {
  font-size: 2rem;
}
.dialog .selector .left .content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.dialog .selector .left .content .name {
  color: #efd29e;
  font-size: 1.2rem;
}
.dialog .selector .left .content .info {
  font-size: 0.9rem;
}
.dialog .selector .right {
  margin-left: auto;
  display: flex;
  align-items: center;
}
.dialog .selector .right .van-icon {
  font-size: 1.5rem;
}
.dialog .selector .right .icon {
  font-size: 1.5rem;
}
.dialog .selected {
  color: #ffb111;
}
.dialog .unselect {
  color: #d1ab68;
}
</style>
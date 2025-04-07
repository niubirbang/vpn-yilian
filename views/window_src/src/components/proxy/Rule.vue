<script setup>
import { ref, computed } from "vue"
import { useStore } from 'vuex'
import { PROXY_RULE_CN, PROXY_RULE_GLOBAL } from '@/store'
import { Error } from '@/notification'
import { ElLoading } from 'element-plus'

const store = useStore()

const show = ref(false)

const rules = ref([PROXY_RULE_CN, PROXY_RULE_GLOBAL])
const rule = computed(() => store.state.proxy_rule)

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
  window.box_core.changeRule(r).catch(err => {
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
  <div class="box pointer">
    <p
      class="option"
      :class="{ active: rule === PROXY_RULE_CN }"
      @click="change(PROXY_RULE_CN)"
    >{{ $t(`proxy_rule_${PROXY_RULE_CN}`) }}</p>
    <p
      class="option"
      :class="{ active: rule === PROXY_RULE_GLOBAL }"
      @click="change(PROXY_RULE_GLOBAL)"
    >{{ $t(`proxy_rule_${PROXY_RULE_GLOBAL}`) }}</p>
  </div>
</template>

<style scoped>
.box {
  background: var(--el-color-white);
  border-radius: 999rem;
  box-sizing: border-box;
  padding: 0.4rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
}
.option {
  padding: 0.8rem 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.option.active {
  border: 0.16rem solid var(--el-color-primary);
  background: var(--el-color-primary-light-8);
  border-radius: 999rem;
  color: var(--el-color-primary);
}
</style>
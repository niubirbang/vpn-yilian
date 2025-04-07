<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { PROXY_STATUS_OFF, PROXY_STATUS_ON } from '@/store'

const store = useStore()

const status = computed(() => store.state.proxy_status)
const statusCN = computed(() => {
  switch (status.value) {
    case PROXY_STATUS_OFF:
      return '未连接'
    case PROXY_STATUS_ON:
      return '已连接'
  }
})
</script>

<template>
  <p
    class="status"
    :class="status"
  >{{ statusCN }}</p>
</template>

<style scoped>
.status {
  box-sizing: border-box;
  padding: 0.7rem 1rem;
  background: #1b1b27;
  border-radius: 999rem;
  display: flex;
  align-items: center;
}
.status.off::before {
  content: "";
  width: 0.5rem;
  height: 0.5rem;
  background: #ff2724;
  border-radius: 50%;
  margin-right: 0.5rem;
}
.status.on::before {
  content: "";
  width: 0.5rem;
  height: 0.5rem;
  background: #0fd405;
  border-radius: 50%;
  margin-right: 0.5rem;
}
</style>
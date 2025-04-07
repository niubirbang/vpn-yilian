<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { ElLoading } from 'element-plus'
import { Error } from '@/notification'

const store = useStore()

const currentNode = computed(() => store.state.proxy_current_node)
const currentNodeIcon = computed(() => {
  return null
})
const currentNodeName = computed(() => {
  if (!currentNode.value) {
    return '暂未匹配节点'
  }
  return currentNode.value.name
})

</script>

<template>
  <div class="box">
    <p class="title">选择线路</p>
    <div
      class="current-proxy shadow pointer"
      v-push="'/node'"
    >
      <p class="node country-emoji">{{ currentNodeName }}</p>
      <el-icon>
        <ArrowRight />
      </el-icon>
    </div>
    <p class="remark">如网络不稳定，请尝试切换节点或退出APP重新连接</p>
  </div>
</template>

<style scoped>
.box {
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.box .title {
  font-size: 1.3rem;
}
.box .remark {
  font-size: 0.9rem;
  align-self: center;
}
.current-proxy {
  box-sizing: border-box;
  padding: 2rem 1.5rem;
  background: var(--el-color-white);
  border-radius: 1.5rem;

  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
}
.current-proxy .el-icon {
  margin-left: auto;
}
</style>
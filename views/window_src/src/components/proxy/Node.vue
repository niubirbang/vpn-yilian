<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from "vue-router"
import { useStore } from 'vuex'
import { ElLoading } from 'element-plus'
import { USER_LEVEL_FREE, USER_LEVEL_VIP, USER_LEVEL_SVIP } from '@/store'
import { Error } from '@/notification'
import { ErrorFoo } from '@/util'

const router = useRouter()
const store = useStore()

const userLevel = computed(() => store.state.user_level)
const currentNames = computed(() => store.state.proxy_current_names)
const subscribe = computed(() => store.state.proxy_subscribe)
const delaies = computed(() => store.state.proxy_delaies)

const selectedGroup = ref('全部')

const groupName = computed(() => {
  return (group) => {
    switch (group.extra.type) {
      case 'free':
        return '免费'
      case 'vip':
        return 'VIP'
      case 'svip':
        return 'SVIP'
      default:
        return null
    }
  }
})

const nodeIcon = computed(() => {
  return (node) => {
    return null
  }
})

const nodeName = computed(() => {
  return (node) => {
    return node.name
  }
})

const nodeDelay = computed(() => {
  return (node) => {
    if (!delaies.value) {
      return null
    }
    return delaies.value[node.url]
  }
})

const nodeSelected = computed(() => {
  return (group, node) => {
    if (!currentNames.value || currentNames.value.length != 2) {
      return false
    }
    return group.name == currentNames.value[0] && node.name == currentNames.value[1]
  }
})

const changing = ref(false)
const change = (group, node) => {
  if (changing.value) {
    return
  }

  changing.value = true
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  window.box_core.changeNode([group.name, node.name], true).then(() => {
    setTimeout(() => {
      router.replace('/')
      loading.close()
    }, 300)
  }).catch(err => {
    console.error('change node failed:', err)

    loading.close()

    if (ErrorFoo(err, 'core_node_disabled')) {
      switch (group.extra.type) {
        case 'free':
          store.commit('setFreeDialogShow', true)
          break
        default:
          Error('该线路需充值后使⽤')
          router.push(`/recharge?key=${group.extra.type}`)
          break
      }
    } else {
      Error(err)
    }
  }).finally(() => {
    changing.value = false
  })
}

const load = () => {
  window.box_api.refreshSubscribe().catch(err => {
    console.error('refresh subscribe failed:', err)
  })
}

onMounted(() => {
  load()
  switch (userLevel.value) {
    case USER_LEVEL_FREE:
      selectedGroup.value = 'free'
      break
    case USER_LEVEL_VIP:
      selectedGroup.value = 'vip'
      break
    case USER_LEVEL_SVIP:
      selectedGroup.value = 'svip'
      break
    default:
      selectedGroup.value = 'vip'
      break
  }
})
</script>

<template>
  <div class="box">
    <div class="groups">
      <div
        class="group pointer"
        :class="{ active: '全部' == selectedGroup }"
        @click="selectedGroup = '全部'"
      >全部</div>
      <div
        class="group pointer"
        v-for="(group, i) in subscribe"
        :key="i"
        :class="{ active: group.extra.type == selectedGroup }"
        @click="selectedGroup = group.extra.type"
      >{{ groupName(group) }}</div>
    </div>
    <div class="group-nodes">
      <template
        v-for="(group, i) of subscribe"
        :key="i"
      >
        <div
          class="group-simple"
          v-if="selectedGroup == '全部'"
        >
          <p :class="group.extra.type">{{ group.name }}</p>
          <!-- <img
            v-if="group.extra.type == 'vip'"
            src="@/assets/image/icon-vip.png"
          >
          <img
            v-if="group.extra.type == 'svip'"
            src="@/assets/image/icon-vip.png"
          > -->
        </div>

        <template
          v-for="(node, j) of group.children"
          v-if="selectedGroup == '全部' || selectedGroup == group.extra.type"
          :key="j"
        >
          <div
            class="node shadow pointer"
            :class="group.extra.type"
            @click="change(group, node)"
          >
            <div class="left">
              <!-- TODO ICON -->
              <p class="country-emoji">{{ nodeName(node) }}</p>
            </div>
            <div class="right">
              <p v-if="nodeDelay(node)">{{ nodeDelay(node) }} ms</p>
              <Iconfont
                v-if="nodeSelected(group, node)"
                class="node-selector selected"
                name="radio-selected"
              />
              <Iconfont
                v-else
                class="node-selector unselect"
                name="radio-unselect"
              />
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
}
.groups {
  height: 3.6rem;
  border-radius: 3.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.group {
  color: #777777;
  font-size: 1.1rem;
  height: 2.6rem;
  box-sizing: border-box;
  padding: 0 1rem;

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.group.active {
  color: var(--el-color-primary);
  font-weight: bold;
}
.group.active::after {
  content: "";
  position: absolute;
  bottom: -0.3rem;
  height: 0.2rem;
  width: 1.5rem;
  background-color: var(--el-color-primary);
  border-radius: 1rem;
}

.group-nodes {
  box-sizing: border-box;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.group-simple {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}
/* .group-simple .vip {
  color: #fe891e;
}
.group-simple .svip {
  color: #feb137;
} */
.group-simple img {
  height: 1rem;
  width: auto;
}
.node {
  width: 100%;
  height: 4.6rem;
  box-sizing: border-box;
  padding: 1rem;
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}
.node.free {
  background: var(--el-color-white);
}
.node.vip {
  background: var(--el-color-primary-light-8);
}
.node.vip::before {
  content: "vip";
  position: absolute;
  top: 8px;
  left: -20px;
  background-color: var(--el-color-primary);
  color: var(--el-color-white);
  font-size: 0.8rem;
  transform: rotate(-45deg);
  z-index: 1;
  width: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.node.svip {
  background: var(--el-color-primary2-light-8);
}
.node.svip::before {
  content: "svip";
  position: absolute;
  top: 8px;
  left: -20px;
  background-color: var(--el-color-primary2);
  color: var(--el-color-white);
  font-size: 0.8rem;
  transform: rotate(-45deg);
  z-index: 1;
  width: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.node .left {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.node .right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.node-selector {
  font-size: 1.8rem;
}
.node-selector.selected {
  color: var(--el-color-primary);
}
.node-selector.unselect {
  color: #cacaca;
}
</style>
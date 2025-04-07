<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { USER_LEVEL_FREE } from '@/store'
import { $DurationTypeB } from '@/util'

const store = useStore()

const level = computed(() => store.state.user_level)
const timestamp = computed(() => store.state.timestamp)
const freeExpiredAt = computed(() => store.state.user_free_expired_at)
const expired = computed(() => {
  return freeExpiredAt.value <= timestamp.value
})

const show = computed(() => {
  return level.value == USER_LEVEL_FREE && !expired.value
})
const duration = computed(() => {
  const second = freeExpiredAt.value - timestamp.value
  if (second <= 0) {
    return ''
  }
  if (second > 72 * 60 * 60) {
    const day = second / (24 * 60 * 60)
    return `${Math.ceil(day)}天`
  }
  return $DurationTypeB(second)
})
</script>

<template>
  <p
    v-if="show"
    class="free-expired-at"
  >
    <span>
      剩余免费时长
    </span>
    <span class="value">
      {{ duration }}
    </span>
  </p>
</template>

<style scoped>
.free-expired-at {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.6rem;
}
.free-expired-at .value {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
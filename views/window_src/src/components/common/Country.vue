<script setup>
import { computed } from "vue"

const props = defineProps({
  // https://flagicons.lipis.dev/
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: '1rem',
  },
  round: {
    type: Boolean,
  },
})

const iconClass = computed(() => {
  let v = ['flag-icon', `flag-icon-${props.name}`]
  if (props.round) {
    v.push('round')
  }
  return v
})
const iconStyle = computed(() => {
  let v = {
    fontSize: '1rem',
  }
  if (props.size) {
    v.fontSize = props.size
  }
  if (props.round) {
    v.borderRadius = `calc(${v.fontSize} * 0.2)`
  }
  return v
})
</script>

<template>
  <span
    :class="iconClass"
    :style="iconStyle"
  ></span>
</template>

<style scoped>
</style>
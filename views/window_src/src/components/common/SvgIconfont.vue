<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
  },
  class: {
    type: String,
  }
})

const iconName = computed(() => {
  return `#icon-${props.name}`
})
</script>

<template>
  <el-icon
    :size="size"
    :class="class"
  >
    <svg aria-hidden="true">
      <use v-bind:xlink:href="iconName" />
    </svg>
  </el-icon>
</template>
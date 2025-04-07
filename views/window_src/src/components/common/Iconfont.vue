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
  color: {
    type: String,
  },
  class: {
    type: String,
  }
})

const iconStyle = computed(() => {
  let _style = {}
  if (props.size) {
    _style.fontSize = props.size
  }
  if (props.color) {
    _style.color = props.color
  }
  return _style
})
const iconClass = computed(() => {
  let _class = [`icon-${props.name}`]
  if (props.class) {
    _class.push(props.class)
  }
  return _class
})
</script>

<template>
  <i
    class="icon iconfont"
    :class="iconClass"
    :style="iconStyle"
  ></i>
</template>
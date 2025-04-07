<script setup>
// import Rule from '@/components/proxy/Rule.vue'
// import Mode from '@/components/proxy/Mode.vue'
import Node from '@/components/proxy/Node.vue'
import { $OS } from '@/util'

import { ref } from 'vue'
const os = ref($OS())
</script>

<template>
  <div>
    <!-- <div class="proxy">
      <Rule />
      <Mode v-if="os == 'windows'" />
    </div> -->
    <Node />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
}
.proxy {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
</style>
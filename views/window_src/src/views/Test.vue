<script setup>
const install = () => {
  console.info('5000秒后安装新asar')
  setTimeout(() => {
    window.box_updater.install().catch(err => {
      console.error(err)
    })
  }, 5000)
}
</script>

<template>
  <div>
    <el-button @click="install">安装新版本</el-button>
  </div>
</template>
<script setup="">
  import {ref} from 'vue'
  const source = ref('')
</script>
<template>
  <video width="320" height="240" controls>
    <source :src="source" type="video/mp4">
    您的浏览器不支持Video标签。
  </video>
</template>
<style scoped>
</style>
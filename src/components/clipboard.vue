<script setup="">
  import useClipboard from 'vue-clipboard3'
  import $Message from "@/utils/message.js";
  const {toClipboard} = useClipboard()
  const copy = async (text) => {
    text = text || ''
    try {
      await toClipboard(text)
      $Message.success('已复制到剪贴板', 2)
    } catch (e) {
      $Message.error('复制失败', 2)
    }
  }
  defineExpose({
    copy
  })
</script>
<template>

</template>
<style scoped>
</style>
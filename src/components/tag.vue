<script setup>
  import { computed} from "vue";
  import {hexToRgba} from '@/utils/hex_rgb.js'
  const props = defineProps({
    color: {
      type: String,
      default: '#666',
      required: false
    },
    text: {
      type: String,
      default: '标签内容',
      required: false
    },
    opacity: {
      type: Number,
      default: 1,
      required: false
    }
  })
  /* 根据传入的文本颜色参数生成背景色和边框色
  * 1. 如果是16进制则转换为rgba
  * 2. 如果是rgba则修改透明度
  * 3. 默认边框透明度为0.25
  * 4.
  *  */
  const style = computed(() => {
    let bdc = hexToRgba(props.color, 0.25);
    let bc = hexToRgba(props.color, props.opacity);
    return {color: props.color, borderColor: bdc, backgroundColor: bc}
  })
</script>
<template>
  <div class="main" :style="style">
    {{props.text}}
  </div>
</template>
<style scoped lang="less">
.main {
  display: inline-block;
  padding: 2px 8px;
  text-align: center;
  border: 1px solid #FFFFFF;
  -webkit-border-radius: 20px;
  -moz-border-radius: 20px;
  border-radius: 20px;
  font-size: 12px;
}
</style>
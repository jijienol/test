<script setup="">
  import {computed, ref} from 'vue'
  import myQrcode from './qrcode.vue'
  import {globalStore} from "../store/modules/global.js";
  const global = globalStore()
  // const str = global.env.fileUrl.replace('upload', '') + 'xw2_dev.apk'
  const str = global.env.fileUrl.replace('upload', '') + 'xw2_prod.apk'
  console.log(str)
  const width = 46
  const height = 46
  const props = defineProps({
    width: 0,
    height: 0
  })
  const widthC = computed(() => {
    return props.width || width
  })
const heightC = computed(() => {
  return props.height || height
})
</script>
<template>
  <div class="main">
    <my-qrcode :height="heightC" :width="widthC" :str="str"></my-qrcode>
  </div>
</template>
<style scoped>
.main {

}
</style>

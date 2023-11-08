<script setup="">
import {ref, watch} from 'vue'
import {renderAsync} from 'docx-preview'
// const docx = import.meta.glob('docx-preview')
// const docx = require('docx-preview')
  import {urlToBlob,urlToBlob2} from "@/utils/url_blob_base64.js";
  import previewDocJs from '@/libs/previewDoc'
  const docRef = ref(null)
  const props = defineProps({
    url: ''
  })
  watch(() => props.url, (n) => {
    if(n) {
      console.log(n);
      view()

    }
  },{immediate: true})

  function view() {
    // console.log(renderAsync);
    urlToBlob(props.url, (blob) => {
      if (blob) {
        // _vite_plugin_require_transform_renderAsync(blob,  docRef.value).then(res => {
        renderAsync(blob,  docRef.value).then(res => {
          console.log(res);
        }).catch(err => {
          console.log('getPreview', err)
          // this.$Message.warning('请先上传笔录文件')
        })
        // previewDocJs.dp(blob, docRef.value)
      } else {
        console.log(blob);

      }
    })
  }
</script>
<template>
<div class="main">
  <div class="con" ref="docRef" ></div>
</div>
</template>
<style scoped>
.main {
  height: 100%;
  overflow-y: scroll;
}
.con {
  min-height: 100%;
}
</style>

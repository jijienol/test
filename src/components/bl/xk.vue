<script setup="">
import { ref, watch} from "vue";
import {getXkFile} from '@/api/file.js'
import {ajListStore} from "@/store/modules/ajList.js";
import xkUpload from '@/components/fileUpload/kan_upload.vue'
import {globalStore} from "@/store/modules/global.js";
import {storeToRefs} from "pinia";

const ajStore = ajListStore()
const {caseInfo} = storeToRefs(ajStore)
const global = globalStore()
const emits = defineEmits(['close'])
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
const fileSrc = ref('')
const modalVisible = ref(false)
// const uploadVisible = ref(false)
function upCall(data) {

  if(data) {
    fileSrc.value = ''
    let _o = data.replace(/\/mnt\/data\/upload/g,'')
    let last = _o.charAt(_o.length - 1);
    if(last != '/') {
      _o = _o + '/'
    }
    let s = global.env.fileUrl + _o
	  console.log(s)
    fileSrc.value = s + 'index.html'
    caseInfo.value.sfscxk = 1
    modalVisible.value = false
  }
}
function getSrc() {
  fileSrc.value = ''
  getXkFile({caseId:ajStore.caseId}).then(res => {
    let {code, data} = res.data;
    if(code == 200) {
      if(data) {
        let _o = data.indexUrl.replace(/\/mnt\/data\/upload/g,'')
        let last = _o.charAt(_o.length - 1);
        if(last != '/') {
          _o = _o + '/'
        }
        let s = global.env.fileUrl + _o + 'index.html'
        console.log(s);
        fileSrc.value = s
      }
    }
  })
}
function add() {
  modalVisible.value = true
  // uploadVisible.value = !uploadVisible.value
}
function close() {
  // uploadVisible.value = false
  emits('close', '')
}
watch(() => props.visible, (n) => {
  if(n) {
    if(!fileSrc.value) {
      getSrc()
    }
  }
  // fileSrc.value = previewDoc.src(n)
}, {immediate: true})
</script>
<template>
  <Layout class="layout">
    <Content class="layout-content">

      <p v-show="!fileSrc" style="text-align: center;line-height: 50px;">暂无现勘文件</p>
      <iframe v-show="fileSrc" :src="fileSrc" width="100%" height="100%"></iframe>

    </Content>
    <Footer class="layout-footer">
      <Button @click="close">关闭</Button><Button v-show="ajStore.caseId" type="primary" @click="add()" style="margin: 0 10px;">添加</Button>
    </Footer>
  </Layout>
  <Modal v-model="modalVisible" :footer-hide="true" :mask-closable="false">
    <xk-upload :caseId="ajStore.caseId" @upload="upCall"></xk-upload>
  </Modal>
</template>
<style scoped lang="less">
.layout {
  height: 100%;
  background-color: #fff;
  //border: 1px solid red;
}
.layout-header {
  padding: 0;
  background-color: #fff;
}
.layout-content {
  height: 100%;
}
.layout-footer {
  padding: 10px 10px 0;
  border-top: 1px solid #eee;
  background-color: #fff;
  text-align: right;
}
</style>

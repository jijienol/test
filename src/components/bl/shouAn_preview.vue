<script setup="">
/* 受案登记表 */
import {ref, reactive, computed, watch, nextTick} from "vue";
import {ajListStore} from "@/store/modules/ajList.js";
import {globalStore} from "@/store/modules/global.js";
import qtUpload from '../fileUpload/qt_upload.vue'
import previewDoc from "@/libs/previewDoc.js";
import {delReportAttach} from "@/api/report.js";
import {storeToRefs} from "pinia";
import fileUtil from '@/utils/fileSaver.js'
import $Message from '@/utils/message'
import {permissionStore} from "@/store/modules/permission.js";
import UpdateImg from "@/views/details/evidence/components/updateImg.vue";
const fileSrc = ref('')
const modalVisible = ref(false)
const ajStore = ajListStore()
const global = globalStore()
const emits = defineEmits(['close'])
const permission = permissionStore()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
const {caseInfo} = storeToRefs(ajStore)


function add() {
  modalVisible.value = true
}

function close() {
  emits('close', '')
}
watch(() => caseInfo.value.writtenDecisionOfCaseFiling, (n) => {
  if(n) {
    nextTick(() => {
      
      if(caseInfo.value.writtenDecisionOfCaseFiling) {
        let r = caseInfo.value.writtenDecisionOfCaseFiling
        let _o = r.replace(/\/mnt\/data\/upload/g,'')
        let s
        if( _o.startsWith("/")){
          s = global.env.fileUrl + _o
        }else {
          s = global.env.fileUrl +"/"+ _o
        }
        setSrc(s)
      }
    })
  }
}, {immediate: true})
watch(() => props.visible, (n) => {
  if(n) {
    nextTick(() => {
      
      if(caseInfo.value.writtenDecisionOfCaseFiling) {
        let r = caseInfo.value.writtenDecisionOfCaseFiling
        let _o = r.replace(/\/mnt\/data\/upload/g,'')
        let s
        if( _o.startsWith("/")){
          s = global.env.fileUrl + _o
        }else {
          s = global.env.fileUrl +"/"+ _o
        }
        setSrc(s)
      }
    })
  }
}, {immediate: true})

function setSrc(s) {
  fileSrc.value = s
  // if(permission.networkType) {
  //   fileSrc.value = s
  // } else {
  //   fileSrc.value = previewDoc.src(s)
  // }
  console.log( '受案',fileSrc.value)
}
function getData(url){
if(url){
  caseInfo.value.writtenDecisionOfCaseFiling = url
  
  let _o = url.replace(/\/mnt\/data\/upload/g,'')
  let s
  if( _o.startsWith("/")){
    s = global.env.fileUrl + _o
  }else {
    s = global.env.fileUrl +"/"+ _o
  }
  setSrc(s)
}
  modalVisible.value = false
}
</script>
<template>
  <Layout class="layout">
    <Content class="layout-content">
      <p v-show="!fileSrc" style="text-align: center;line-height: 50px;">暂无文件</p>
<!--      <docx-preview v-if="permission.networkType && fileType== 'pdf'" :url="fileSrc" :type="'office'"></docx-preview>-->
      <iframe v-show="fileSrc" :src="fileSrc" width="100%" height="100%"></iframe>
    </Content>
    <Footer class="layout-footer">
      <Button @click="close">关闭</Button><Button v-show="ajStore.caseId" type="primary" @click="add()" style="margin: 0 10px;">添加</Button>
    </Footer>
  </Layout>
  <Modal v-model="modalVisible" :footer-hide="true" :mask-closable="false">
    <updateImg :caseId="ajStore.caseId" :imgType="4" :title1="`点击或拖拽上传受案登记表`"   @getDrawproofImgs="getData"></updateImg>
  </Modal>
</template>
<style scoped lang="less">
.layout {
  height: 100%;
  background-color: #fff;
}
.header {
  padding: 0;
  background-color: #fff;
}
.layout-content {
  height: 88%;
}
.layout-footer {
  padding: 10px 10px 0;
  border-top: 1px solid #eee;
  background-color: #fff;
  text-align: right;
}
</style>

<script setup>
import { reactive, ref, watch} from "vue";
import {permissionStore} from "@/store/modules/permission.js";
import $Message from "@/utils/message.js";
const permission = permissionStore()
import {ajListStore} from "@/store/modules/ajList.js";
import {storeToRefs} from "pinia";
const props = defineProps(['param','flag','caseId'])
const ajStore = ajListStore()

const {fileUploading} = storeToRefs(ajStore)
const emit = defineEmits(['finish','remove'])
// const fileUploading = ref(false)
const fileInfo = reactive({
  name: '',
  size:'',
  file: ''
})

const uploadRef = ref(null)
const uploadModule = reactive({
  param: {
    caseId: '',
    param: ''// caseRegistrationForm writtenDecisionOfCaseFiling
  },
  format: ['pdf'],
  fileList: [],
  headers: {
    Authorization: permission.token
  },
  action: '/api/detectCase/upload/caseAttachment',
  beforeUpload: (file) => {
    // 读取文件名
    fileInfo.name = file.name// .substring(0, file.name.lastIndexOf('.'))
    fileUploading.value = true
    if(props.caseId) {
      uploadModule.param.caseId = props.caseId
    }
    if(props.param) {
      uploadModule.param.param = props.param
    }
  },
  uploadSuccess: (response, file, fileList) => {
    if (response.code == '200') {
      fileInfo.file = response.data.filePath
      fileInfo.size = file.size
      $Message.success(file.name+'已上传')
      uploadModule.fileList = fileList
      emit('finish', fileInfo)
      // uploadRef.value.clearFiles()
      fileUploading.value = false
    } else {
      $Message.error(response.message)
      fileUploading.value = false
    }
  },
  fileExceededSize: (file, fileList) => {
    $Message.warning('文件大小超出限制')
    fileUploading.value = false
  },
  formatError: () => {
    
    $Message.warning('格式不正确，请上传'+ '文件！')
    fileUploading.value = false
    
  },
  removeFile: (file) => {
    $Message.info('已移除文件' + file.name)
    emit('remove',  file.name)
  },
  uploadError: (response) => {
    // console.log(response);
    $Message.error('出现错误')
  }
})

watch(()=>props.flag,(val)=>{
  if(!val){
    reset()
  }
},{deep:true})
function reset() {
  uploadRef.value.clearFiles()
  uploadModule.fileList = []
}
defineExpose({
  reset
})
</script>
<template>
  <Upload
    multiple
    type="drag"
    ref="uploadRef"
    :max-size="2000000"
    :show-upload-list="true"
    :multiple="false"
    :format="uploadModule.format"
    :headers="uploadModule.headers"
    :action="uploadModule.action"
    :data="uploadModule.param"
    :before-upload="uploadModule.beforeUpload"
    :on-success="uploadModule.uploadSuccess"
    :on-error="uploadModule.uploadError"
    :on-exceeded-size="uploadModule.fileExceededSize"
    :on-format-error="uploadModule.formatError"
    :on-remove="uploadModule.removeFile"
  >
    <div style="padding: 20px 0">
      <p>点击或拖拽上传{{uploadModule.content}}文件</p>
      <Spin fix :show="fileUploading">正在上传...</Spin>
    </div>
  </Upload>
</template>
<style scoped lang="less">
.iconfont {
  font-size: 30px;
  color: #A4CA39;
}
:deep(.ivu-upload-list-remove) {
  color: #333;
  font-size: 24px;
  display: inline-block;
  line-height: 30px;
  padding: 0 5px;
  &:hover {
    background-color: rgba(64, 158, 255, 0.35);
  }
}
</style>

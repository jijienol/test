<script setup>
import {computed, reactive, ref} from "vue";
import {permissionStore} from "@/store/modules/permission.js";
import $Message from "@/utils/message.js";
const permission = permissionStore()
import {ajListStore} from "@/store/modules/ajList.js";
import {storeToRefs} from "pinia";
import {Modal} from "view-ui-plus";
const props = defineProps({
  param: {
    caseId: ''
  }
})
const ajStore = ajListStore()
const percent = ref(0)
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
  fileList: [],
  content: computed(() => {
    return  uploadModule.format.join(',')
  }),
  param: {
    caseId: ''
  },
  headers: {
    Authorization: permission.token
  },
  action: '/api/file/uploadFile?type=apkTraceFile',
  format:['apk'],
  beforeUpload: (file) => {
    if(uploadModule.fileList.length  == 0) {
      // 读取文件名

      if(file.name.split('.')[file.name.split('.').length-1]!='apk'){
        $Message.warning('请将后缀改成.apk')
        return false
      }
      fileInfo.name = file.name// .substring(0, file.name.lastIndexOf('.'))
  
      fileUploading.value = true
    } else {
      $Message.warning('只能上传一个APK文件！')
      return false
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
    let f = uploadModule.content
    $Message.warning('格式不正确，请上传'+ f + '文件！')
    fileUploading.value = false

  },
  removeFile: (file) => {
    Modal.confirm({
      title: '提示',
      content: `请确认是否要移出文件《${ file.name}》`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        $Message.info('已移除文件' + file.name)
        for(let k in fileInfo) {
          fileInfo[k] = ''
        }
        uploadModule.fileList = []//查找目标文件
        emit('remove', fileInfo)
      },
      onCancel: () => {
        $Message.info(`已取消`);
      }
    });

  },
  uploadError: (response) => {
    console.log(response);
    $Message.error('出现错误')
    fileUploading.value = false
  
  },
  uploadProgress: (event, file, fileList) => {
    percent.value = Math.floor(file.percentage);
    if (file.percentage == 100) {
      fileUploading.value = false;
      // $Message.success(file.percentage)
    }
  }
})

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
      type="drag"
      ref="uploadRef"
      :max-size="665600"
      :show-upload-list="true"
      :multiple="false"
      :format="uploadModule.format"
      :headers="uploadModule.headers"
      :action="uploadModule.action"
      :data="uploadModule.param"
      :before-upload="uploadModule.beforeUpload"
      :on-progress="uploadModule.uploadProgress"
      :on-success="uploadModule.uploadSuccess"
      :on-error="uploadModule.uploadError"
      :on-exceeded-size="uploadModule.fileExceededSize"
      :on-format-error="uploadModule.formatError"
      :on-remove="uploadModule.removeFile"
  >
    <div style="padding: 20px 0">
      <i class="iconfont icon-f-apk"></i>
      <p>点击或拖拽上传{{uploadModule.content}}文件</p>
      <Spin fix :show="fileUploading">正在上传...</Spin>
    </div>
  </Upload>
  <Progress v-show="fileUploading" :percent="percent" :stroke-width="4"></Progress>
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
:deep(.ivu-upload-list-file .ivu-progress) {
  display: none!important;
}
</style>

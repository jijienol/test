<script setup="">
import {ref, reactive} from "vue";
import {storeToRefs} from "pinia";
import {permissionStore} from "@/store/modules/permission.js";
import $Message from '@/utils/message'
const permission = permissionStore()

const uploadRef = ref(null)
const fileUploading = ref(false)
const percent = ref(0)
const {token} = storeToRefs(permission)
const emit = defineEmits(['upload']);
const uploadModule = reactive({
  format: ['zip'],
  param: {
    // caseId: '',
    name: '',
    size: '',
    file: ''
  },
  headers:{
    Authorization: token
  },
  // action: '/api/file/uploadZip',
  action: '/api/iiTask/uploadInternetResult',
  beforeUpload: (file) => {
    uploadModule.param.name = file.name.split('.')[0]
    uploadModule.param.file = file
    uploadModule.param.size = file.size
    fileUploading.value = true
  },
  uploadSuccess: (response) => {
    // console.log('uploadSuccess',response);
    if (response.code === 200) {
      $Message.success('上传成功！')
      fileUploading.value = false
      // console.log(uploadDocx.value);
      uploadRef.value.clearFiles()
      uploadModule.param.name = ''
      uploadModule.param.file = ''
      uploadModule.param.size = ''
      emit('upload', response.data)
    } else {
      $Message.error(response.message)
      fileUploading.value = false
    }
  },
  fileExceededSize: () => {
    $Message.warning('文件大小超出限制！')
    fileUploading.value = false
  },
  removeFile: () => {
    uploadModule.param.name = ''
    uploadModule.param.file = ''
    uploadModule.param.size = ''
  },
  formatError: () => {
    fileUploading.value = false
    $Message.warning('格式不正确，请上传zip文件！')
  },
  uploadError: (response) => {
    // console.log(response);
    $Message.error('出现错误')
    fileUploading.value = false
  },
  uploadProgress: (event, file, fileList) => {
    percent.value = Math.floor(file.percentage);
    if (file.percentage == 100) {
      fileUploading.value = false;
    }
  }

})
</script>
<template>
  <div>
    <Upload
        type="drag"
        ref="uploadRef"
        :multiple="false"
        :format="uploadModule.format"
        :max-size="555555"
        :disabled="fileUploading"
        :headers="uploadModule.headers"
        :before-upload="uploadModule.beforeUpload"
        :on-success="uploadModule.uploadSuccess"
        :on-error="uploadModule.uploadError"
        :on-exceeded-size="uploadModule.fileExceededSize"
        :on-format-error="uploadModule.formatError"
        :on-remove="uploadModule.removeFile"
        :action="uploadModule.action"
        :data="uploadModule.param"
    >
      <div style="padding: 20px;">
        <p>点击或拖拽上传文件压缩包（zip格式）</p>
        <Spin fix :show="fileUploading"></Spin>
      </div>
    </Upload>
    <Progress v-show="fileUploading" :percent="percent" :stroke-width="4"></Progress>
  </div>
</template>
<style scoped lang="less">
:deep(.ivu-upload-list-file .ivu-progress) {
  display: none!important;
}
</style>
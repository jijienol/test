<script setup="">
import {ref, reactive} from "vue";
import {storeToRefs} from "pinia";
import {permissionStore} from "@/store/modules/permission.js";
import zipUtil from '@/utils/zip.js'
import $Message from '@/utils/message'

const permission = permissionStore()
const {token} = storeToRefs(permission)
const emit = defineEmits(['upload']);
const fileUploading = ref(false)
const uploadRef = ref(null)
const percent = ref(0)
const docFileName = ref('')
const props = defineProps({
  caseId: ''
})
const uploadModule = reactive({
  format: ['zip','rar'],
  param: {
    caseId: '',
    name: '',
    size: '',
    file: ''
  },
  headers: {
    Authorization: token
  },
  action: '/api/detectCase/resolveCaseZipFile',
  beforeUpload: (file) => {
    uploadModule.param.caseId = props.caseId
    uploadModule.param.name = file.name.split('.')[0]
    uploadModule.param.file = file
    uploadModule.param.size = file.size
    fileUploading.value = true
    /*zipUtil.loadZip(file).then(res => {
      // console.log(res);
      for(let k in res) {
        if(k.indexOf('.doc')!= -1) {
          docFileName.value = k.split('.')[0]
        }
      }
    }).catch(err => {
      console.log(err);
    })*/

  },
  uploadSuccess: (response) => {
    // console.log('uploadSuccess',response);
    if (response.code === 200) {
      $Message.success('文件上传成功！')
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
    $Message.warning('格式不正确，请上传zip或rar！')
  },
  uploadError: (response) => {
    console.log(response);
    $Message.error('上传出现错误，请检查网络后重试或联系管理员')
    fileUploading.value = false
  },
  uploadProgress: (event, file, fileList) => {
    percent.value = Math.floor(file.percentage);
    if(file.percentage == 100) {
      fileUploading.value = false;
      // $Message.success(file.percentage)
    }

  }
})
</script>
<template>
  <div>
    <!--    <p>{{uploadModule.param.name}}&nbsp;{{docFileName}}</p>-->
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
        :on-progress="uploadModule.uploadProgress"
        :on-error="uploadModule.uploadError"
        :on-exceeded-size="uploadModule.fileExceededSize"
        :on-format-error="uploadModule.formatError"
        :on-remove="uploadModule.removeFile"
        :action="uploadModule.action"
        :data="uploadModule.param"
    >
      <div style="padding: 20px;font-size: 16px;">
        <p>点击或拖拽上传案件压缩包（zip、rar格式）</p>
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
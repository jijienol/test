<script setup="">
import {ref, reactive, computed} from "vue";
import {storeToRefs} from "pinia";
import {permissionStore} from "@/store/modules/permission.js";
import messagebox from '@/utils/message'
const permission = permissionStore()
const {token} = storeToRefs(permission)
const emit = defineEmits(['upload']);
const fileUploading = ref(false)
const uploadRef = ref(null)

const props = defineProps({
  caseId: ''
})
const uploadModule = reactive({
  content: computed(() => {
    return  uploadModule.format.join(',')
  }),
  format: ['pdf'],
  param: {
    caseId: '',
    name: '',
    size: '',
    file: ''
  },
  headers: {
    Authorization: token
  },
  action: '/api/caseFile/insertCaseFile?type=caseFile',
  beforeUpload: (file) => {
    uploadModule.param.caseId = props.caseId
    uploadModule.param.name = file.name.split('.')[0]
    uploadModule.param.file = file
    uploadModule.param.size = file.size
    fileUploading.value = true

  },
  uploadSuccess: (response) => {
    // console.log('uploadSuccess',response);
    if (response.code === 200) {
      messagebox.success('文件上传成功！')
      fileUploading.value = false
      // console.log(uploadDocx.value);
      uploadRef.value.clearFiles()
      uploadModule.param.name = ''
      uploadModule.param.file = ''
      uploadModule.param.size = ''
      emit('upload', response.data)
    } else {
      messagebox.error(response.message)
      fileUploading.value = false
    }
  },
  fileExceededSize: () => {
    messagebox.warning('文件大小超出限制！')
    fileUploading.value = false
  },
  removeFile: () => {
    uploadModule.param.name = ''
    uploadModule.param.file = ''
    uploadModule.param.size = ''
  },
  formatError: () => {
    fileUploading.value = false
    messagebox.warning('格式不正确，请上传pdf！')
  },
  uploadError: (response) => {
    console.log(response);
    messagebox.error('出现错误')
    fileUploading.value = false
  },
})
</script>
<template>
  <Upload type="drag"
          ref="uploadRef"
          :max-size="2000000"
          :multiple="true"
          :show-upload-list="true"
          :action="uploadModule.action"
          :data="uploadModule.param"
          :format="uploadModule.format"
          :headers="uploadModule.headers"
          :before-upload="uploadModule.beforeUpload"
          :on-success="uploadModule.uploadSuccess"
          :on-error="uploadModule.uploadError"
          :on-exceeded-size="uploadModule.fileExceededSize"
          :on-format-error="uploadModule.formatError"
          :on-remove="uploadModule.removeFile"
  >
    <div style="padding: 20px 0;font-size: 16px;">
<!--      <i class="iconfont icon-excel"></i>-->
      <p>点击或拖拽上传{{uploadModule.content}}文件</p>
      <Spin fix :show="fileUploading">正在上传...</Spin>
    </div>
  </Upload>
</template>
<style scoped>
</style>
<script setup="">
import {ref, reactive, computed} from "vue";
import {permissionStore} from "@/store/modules/permission.js";
import $Message from "@/utils/message.js";
const emit = defineEmits(['finish','remove'])
const permission = permissionStore()
const props = defineProps({
  param: {
    taskChannelId: '',
    caseId: ''
  }
})
const fileUploading = ref(false)
const fileInfo = reactive({
  uid:'',
  name:'',
  url:'',
  // type:'letterReturnFile',
  size:'',
  subType: '1',
  ext: ''
})
const uploadRef = ref(null)
const uploadModule = reactive({
  content: computed(() => {
    return  uploadModule.format.join(',')
  }),
  param: {
    taskChannelId: '',
    caseId: ''
  },
  headers: {
    Authorization: permission.token
  },
  action: '/api/file/uploadFile?type=letterReturnFile',
  format:['xls','xlsx'],
  beforeUpload: (file) => {
    // 读取文件名
    fileUploading.value = true
    // 格式化参数
    uploadModule.param.caseId = props.param.caseId
    uploadModule.param.taskChannelId = props.param.taskChannelId
  },
  uploadSuccess: (response, file, fileList) => {
    if (response.code == '200') {
      fileInfo.uid = file.uid
      fileInfo.name = response.data.fileName
      fileInfo.size = file.size,
      fileInfo.ext = response.data.ext
      fileInfo.url = response.data.filePath
      fileInfo.subType = '1'
      $Message.success(file.name+'已上传，请标记要参与碰撞的数据！')
      fileUploading.value = false
      emit('finish', fileInfo)
      uploadRef.value.clearFiles()
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
  },
  removeFile: (file) => {
    $Message.info('已移除文件' + file.name)
    for(let k in fileInfo) {
      fileInfo[k] = ''
    }
    emit('remove', fileInfo)
  },
  uploadError: (response) => {
    console.log(response);
    $Message.error('出现错误')
  }

})

defineExpose({})
</script>
<template>
  <Upload type="drag"
          ref="uploadRef"
          :max-size="2000000"
          :multiple="false"
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
    <div style="padding: 20px 0">
      <i class="iconfont icon-excel"></i>
      <p>点击或拖拽上传{{uploadModule.content}}文件</p>
      <Spin fix :show="fileUploading">正在上传...</Spin>
    </div>
  </Upload>
</template>
<style scoped>
.iconfont {
  font-size: 30px;
  color: #107C41;
}
</style>
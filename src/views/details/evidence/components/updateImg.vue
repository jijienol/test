<script setup>

import {reactive, ref,defineProps,defineEmits,getCurrentInstance} from "vue";
import {permissionStore} from "../../../../store/modules/permission.js";
import {storeToRefs} from "pinia";
const {proxy} = getCurrentInstance()
const permission = permissionStore()
const {token} = storeToRefs(permission)
const fileUploading1 = ref(false)
const props = defineProps(['caseId','imgType',"title1"])
const emits = defineEmits(['getDrawproofImgs'])
const imageUpload1 = reactive({
  url: '',
  param: {
    caseId:'',
    imgType:''
  },
  headers: {
    Authorization: token
  },
  action: '/api/companyInfo/uploadFile',
  beforeUpload: (file) => {
    fileUploading1.value = true
    imageUpload1.param.caseId = props.caseId
    imageUpload1.param.imgType = props.imgType
    
  },
  uploadSuccess: (response) => {
    if(response.code==200){
      proxy.$Message.success('上传成功')
      emits('getDrawproofImgs',response.data.filePath)
      fileUploading1.value = false
    }else {
      proxy.$Message.error("上传失败")
      fileUploading1.value = false
    }

  },
  fileExceededSize: () => {
    proxy.$Message.warning('文件大小超出限制！')
    fileUploading1.value = false
  },
  removeFile: () => {
    imageUpload1.param.name = ''
    imageUpload1.param.file = ''
    imageUpload1.param.size = ''
  },
  formatError: () => {
    fileUploading1.value = false
    proxy.$Message.warning('格式不正确，请上传图片格式文件！')
  },
  uploadError: (response) => {
    // console.log(response);
    proxy.$Message.error('出现错误')
    fileUploading1.value = false
  }
})

</script>

<template>
  <Upload type="drag"
          ref="uploadRef"
          :format="['jpg','jpeg','png','pdf']"
          :max-size="50000"
          :show-upload-list="false"
          :disabled="fileUploading1"
          :headers="imageUpload1.headers"
          :before-upload="imageUpload1.beforeUpload"
          :on-success="imageUpload1.uploadSuccess"
          :on-error="imageUpload1.uploadError"
          :on-exceeded-size="imageUpload1.fileExceededSize"
          :on-format-error="imageUpload1.formatError"
          :on-remove="imageUpload1.removeFile"
          :action="imageUpload1.action"
          :data="imageUpload1.param"
  >
    <div style="padding: 20px;height: 60px">
      <p><span>{{props.title1}}</span>
      </p>
    </div>
  </Upload>
</template>
<style scoped>

</style>

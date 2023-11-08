<script setup="">
import {reactive, ref} from "vue";
import {uploadAndResolve} from "../../api/file.js";
import image from '@/assets/icons/image.png'
const  imageFilePathList = ref([])
const fileUploading = ref(false)
const loading1 = ref(false)
import messagebox from '@/utils/message'
import {permissionStore} from "@/store/modules/permission.js";
import {storeToRefs} from "pinia/dist/pinia.js";
const {token} = storeToRefs(permission)
const emit = defineEmits(['upload']);
const props = defineProps({
  caseId: '',
  modalType:''
})
async function save(){
  loading1.value = true
  const parms = {
    imageFilePathList:imageFilePathList.value,
    caseId: props.caseId
  }
  const res = await  uploadAndResolve(parms)
  fileUploading.value = false
  if(res.data.code==200) {
    loading1.value = false
    emit('upload', res.data.data)
    messagebox.success('照片上传成功！')

  } else {
    loading1.value = false
  }
}
const uploadModuleImage = reactive({
  param: {
    caseId: '',
    name: '',
    size: '',
    file: ''
  },
  headers:{
    Authorization: token
  },
  action: '/api/takeDownResolve/upload',
  beforeUpload: (file) => {
    uploadModuleImage.param.caseId = props.caseId
    uploadModuleImage.param.name = file.name.split('.')[0]
    uploadModuleImage.param.files = file
    uploadModuleImage.param.size = file.size
    fileUploading.value = true
  },
  uploadSuccess: (response) => {
    imageFilePathList.value.push(response.data.filePath)
    // if (response.code === 200) {
    //   messagebox.success('笔录上传成功！')
    fileUploading.value = false
    //   // console.log(uploadDocx.value);
    //   uploadDocx.value.clearFiles()
    //   uploadModule.param.name = ''
    //   uploadModule.param.file = ''
    //   uploadModule.param.size = ''
    //   emit('upload', response.data)
    // } else {
    //   messagebox.error(response.message)
    //   fileUploading.value = false
    // }
  },
  fileExceededSize: () => {
    messagebox.warning('文件大小超出限制！')
    fileUploading.value = false
  },
  removeFile: () => {
    uploadModuleImage.param.name = ''
    uploadModuleImage.param.file = ''
    uploadModuleImage.param.size = ''
  },
  formatError: () => {
    fileUploading.value = false
    messagebox.warning('格式不正确，请上传图片格式文件！')
  },
  uploadError: (response) => {
    console.log(response);
    messagebox.error('出现错误')
    fileUploading.value = false
  }
})
</script>
<template>
  <div>
    <Upload type="drag"
            multiple
            ref="uploadDocx"
            :format="['jpg','jpeg','png']"
            :max-size="307200"
            :show-upload-list="true"
            :disabled="fileUploading"
            :headers="uploadModuleImage.headers"
            :before-upload="uploadModuleImage.beforeUpload"
            :on-success="uploadModuleImage.uploadSuccess"
            :on-error="uploadModuleImage.uploadError"
            :on-exceeded-size="uploadModuleImage.fileExceededSize"
            :on-format-error="uploadModuleImage.formatError"
            :on-remove="uploadModuleImage.removeFile"
            :action="uploadModuleImage.action"
            :data="uploadModuleImage.param"
    >
      <div style="padding: 20px;">
        <!--      <div class="iconfont icon-WORD"></div>-->
        <img :src="image" alt="" width="40">
        <p>点击或拖拽上传笔录图片（支持jpg,jpeg,png格式）</p>
        <Spin fix :show="fileUploading"></Spin>
      </div>
    </Upload>
    <Button type="primary" @click="save" :loading="loading1" >上传</Button>
  </div>
</template>
<style scoped>
</style>
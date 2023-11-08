<script setup="">
  import {ref, reactive} from "vue";
  import {storeToRefs} from "pinia";
  import {permissionStore} from "@/store/modules/permission.js";
  // import {ajListStore} from "@/store/modules/ajList.js";
  import messagebox from '@/utils/message'
  import wordPng from '@/assets/icons/word-ext.png'
  import image from '@/assets/icons/image.png'
  import {uploadAndResolve} from "../../api/file.js";
  const permission = permissionStore()
  // const ajStore = ajListStore()
  // const caseId = ajStore.caseId
  const uploadDocx = ref(null)
  const uploadImages = ref(null)
  const fileUploading = ref(false)
  const props = defineProps({
    caseId: '',
    modalType:''
  })
  const {token} = storeToRefs(permission)
  const emit = defineEmits(['upload']);
  const uploadModule = reactive({
    param: {
      caseId: '',
      name: '',
      size: '',
      file: ''
    },
    headers:{
      Authorization: token
    },
    action: '/api/file/uploadFile/docx?type=fileDocx',
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
        messagebox.success('笔录上传成功！')
        fileUploading.value = false
        // console.log(uploadDocx.value);
        uploadDocx.value.clearFiles()
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
      messagebox.warning('格式不正确，请上传docx或pdf文件！')
    },
    uploadError: (response) => {
      console.log(response);
      messagebox.error('出现错误')
      fileUploading.value = false
    },
  
  })
  const  imageFilePathList = ref([])
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
      uploadModuleImage.param.file = file
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
      messagebox.warning('格式不正确，请上传doc、docx或pdf格式文件！')
    },
    uploadError: (response) => {
      console.log(response);
      messagebox.error('出现错误')
      fileUploading.value = false
    }
  })
  const loading1 = ref(false)
 async function save(){
    loading1.value = true
      const parms = {
        imageFilePathList:imageFilePathList.value,
        caseId: props.caseId
      }
			
			
			try{
				const res = await  uploadAndResolve(parms)
				fileUploading.value = false
				if(res.data.code==200){
					loading1.value = false
					emit('upload', res.data.data)
					uploadImages.value.clearFiles()
					imageFilePathList.value=[]
					messagebox.success('上传成功！')
					
				}else {
					messagebox.error(res.data.message)
					loading1.value = false
				}
			}catch (e) {
				loading1.value = false
				messagebox.error(e.data.message)
			}

  }
</script>
<template>
<div  v-if="props.modalType=='office'">
  <Upload type="drag"
          ref="uploadDocx"
          :format="['docx','doc','pdf']"
          :max-size="307200"
          :show-upload-list="true"
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
    <div style="padding: 20px;font-size: 16px;">
<!--      <div class="iconfont icon-WORD"></div>-->
      <img :src="wordPng" alt="" width="40">
      <p>点击或拖拽上传笔录文件（支持doc、docx、pdf格式）</p>
      <Spin fix :show="fileUploading"></Spin>
    </div>
  </Upload>
</div>
  <div v-else>
    <Upload type="drag"
            multiple
            ref="uploadImages"
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
    <Button type="primary" @click="save" :disabled="imageFilePathList.length==0" :loading="loading1" >上传</Button>
  </div>
</template>
<style scoped>
.iconfont {
  font-size: 30px;
  color: #185ABD;
}
</style>

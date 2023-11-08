<script setup>
import {ref, reactive, getCurrentInstance, onMounted} from 'vue';
import {permissionStore} from "@/store/modules/permission.js";
import {ajListStore} from "@/store/modules/ajList.js";
import {storeToRefs} from "pinia";
import {insertApk} from "@/api/trace.js";
import apkUpload from '@/components/fileUpload/apkUpload.vue'
import $Message from "@/utils/message.js";
import {getAllTraceByCaseId} from 'src/api/trace.js'
import OfflineTaskUpload from "../../../../components/fileUpload/offlineTaskUpload.vue";

const permission = permissionStore()
const ajStore = ajListStore()
const {fileUploading, caseInfo} = storeToRefs(ajStore)
const {token} = storeToRefs(permission)
const formRef = ref(null)
const emit = defineEmits(['callback'])
const form = reactive({
  caseId: ajStore.caseId,
  name: '', // 文件名
  pkg: '', // 包名
  downloadUrl: '',
  categoryId: '',
  categoryName: '',
  firstAllDay: '',
  lastAllDay: '',
  installedDays: '',
	parentId:'',
  size: '',
  file: '',
  activity: 0,
  thirdAssist: 0,
  thirdSdk: 0,
  firstDetect: 0,
  remark: ''
  // iiTrace: {}
})
const rules = ref({
  name: [{required: true, message: '应用名称不能为空', trigger: 'blur'}]
})
const uploadComp = ref(null)
const upload = reactive({
  param: {
    caseId: ajStore.caseId
  },
  finish: (res) => {
    form.file = res.file
    form.size = res.size
    form.name = res.name.substring(0, res.name.lastIndexOf('.'))
  },
  remove: (res) => {
    form.file = res.file
    form.size = res.size
    form.name = res.name
  }
})
const submitLoading = ref(false)
const form1 = reactive( {attachmentInfos:[]})
const upload1 = reactive({
	param: {
		caseId: ajStore.caseId
	},
	finish: (res) => {
		console.log(res)
		form1.attachmentInfos.push({
			name:res.name,
			size:res.size,
			url:res.file
		})
		// form.file = res.file
		// form.size = res.size
		// form.name = res.name.substring(0, res.name.lastIndexOf('.'))
	},
	remove: (res) => {
		form1.attachmentInfos = form1.attachmentInfos.filter(item=>{
			if(item.name != res){
				return true
			}
		})
	}
})
const submit = (formRef, uploadComp) => {
  formRef.validate((valid) => {
    if (valid) {
      if (!form.file) {
        $Message.warning('请先上传应用安装包')
        return false
      }
      submitLoading.value = true
      let param = form;
      param['iiTrace.type'] = 'firstDetect'
      param['iiTrace.trackType'] = 'apk'
      param['iiTrace.trackTypeName'] = 'APK'
      param['iiTrace.traceId'] = ''
      param['iiTrace.name'] = param.name
      param['iiTrace.caseId'] = param.caseId
      param['iiTrace.parentId'] = ''
      param['iiTrace.groupId'] = ''
      param['iiTrace.firstDetect'] = '0'
	    form1.attachmentInfos.forEach((item,index)=>{
		    param[`attachmentInfos[${index}].name`]=item.name
		    param[`attachmentInfos[${index}].url`]=item.url
		    param[`attachmentInfos[${index}].size`]=item.size
	    })
      insertApk(param).then(res => {
        
        if (res.data.code == '200') {
          $Message.success('添加成功!')
          formRef.resetFields()
          uploadComp.reset()
          submitLoading.value = false
          emit('callback', true)
        } else {
          submitLoading.value = false
          $Message.error(res.data.message)
        }
        
      }).catch((err) => {
        $Message.error(err.data.message || '出现未知错误')
        submitLoading.value = false
      })
    }
  })
  
}
const traceList = ref([])
const getAllTrace = async ()=>{
	console.log(ajStore.caseId)
	const res = await getAllTraceByCaseId(ajStore.caseId)
	if(res.data.code ==200){
		traceList.value = res.data.data
	}
}
onMounted(()=>{
	getAllTrace()
})
</script>
<template>
  <div>
    <Form ref="formRef"
          :label-width="120"
          :model="form"
          :rules="rules">
      <Row>
	      <Col span="24">
		      <FormItem label="父线索">
			      <Select v-model="form.parentId">
				      <Option v-for="item in traceList"
				              :value="item.id"
				              :key="item.value">{{ item.trackTypeName }}:{{item.name}}</Option>
			      </Select>
		      </FormItem>
	      </Col>
        <Col span="12">
          <FormItem label="上传应用" prop="">
            <apk-upload ref="uploadComp" :param="upload.param" @finish="upload.finish"
                        @remove="upload.remove"></apk-upload>
          </FormItem>
        </Col>
	 
        <Col span="12">
          <FormItem label="应用名称" prop="name">
            <Input v-model="form.name"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="包名" prop="pkg">
            <Input v-model="form.pkg"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="互联网下载地址" prop="downloadUrl">
            <Input v-model="form.downloadUrl"></Input>
          </FormItem>
        </Col>
	      <Col span="12">
		      <FormItem label="上传文件" prop="">
			      <offline-task-upload ref="uploadComp" :flag="submitLoading" :param="upload1.param" @finish="upload1.finish" @remove="upload1.remove"/>
		      </FormItem>
	      </Col>
        <Col span="24">
          <FormItem label="备注说明" prop="remark">
            <Input v-model="form.remark" :rows="8" type="textarea"></Input>
          </FormItem>
        </Col>
      </Row>
    
    
    </Form>
    
    <div style="text-align:center">
      <Button :loading="submitLoading || fileUploading" type="primary" @click="submit(formRef, uploadComp)">提交</Button>
    </div>
  
  </div>
</template>
<style scoped>
:deep(.ivu-input) {
  height: 40px;
}
</style>

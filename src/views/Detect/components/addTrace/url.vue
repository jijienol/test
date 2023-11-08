<script setup>
import {ref, reactive, getCurrentInstance, onMounted} from 'vue';
import {insertUrl} from '@/api/trace.js';
import {ajListStore} from '@/store/modules/ajList.js';
import {formatUrl} from '@/libs/format.js'
import {reg_url} from '@/utils/regExp.js';
import {getAllTraceByCaseId} from 'src/api/trace.js'
import OfflineTaskUpload from "../../../../components/fileUpload/offlineTaskUpload.vue";

const {proxy} = getCurrentInstance()
const ajStore = ajListStore()
const caseId = ajStore.caseId
const emit = defineEmits(['callback'])
const submitLoading = ref(false)
const formRef = ref(null)
const form = reactive({
	caseId: caseId,
	name: '',
	type: 'url',
	activity: 0,
	register: 0,
	firstDetect: 0,
	// iiTrace: {},
	parentId: '',
	
	peopleType: '',
	remark: ''
})
const validateCheckUrl = (rule, value, callback) => {
	if (value === '') {
		rule.message = 'url不能为空'
		callback(new Error('不能为空'));
	} else {
		if (!reg_url(value)) {
			rule.message = 'url格式有误'
			callback(new Error('格式有误!'));
		} else {
			form.name = formatUrl(form.name)
			callback();
			
		}
		
	}
}
const rules = ref({
	name: [{required: true, message: 'url不能为空', trigger: 'blur', validator: validateCheckUrl}]
})

function handleUrl () {
	form.name = formatUrl(form.name)
}

/*function formatUrl (str) {
 let index = str.indexOf('//')
 let noPre;
 if (index > -1) {
 noPre = str.slice(index + 2)
 } else {
 noPre = str
 }
 if(noPre.indexOf('?')!= -1) {
 noPre = noPre.split("?")[0]
 }
 let lastIndex = noPre.lastIndexOf('/')
 if(lastIndex!= -1) {
 // console.log(lastIndex);
 noPre = noPre.slice(0, lastIndex)
 }
 return noPre
 }*/
const form1 = reactive({attachmentInfos: []})
const upload = reactive({
	param: {
		caseId: ajStore.caseId
	},
	finish: (res) => {
		console.log(res)
		form1.attachmentInfos.push({
			name: res.name,
			size: res.size,
			url: res.file
		})
		// form.file = res.file
		// form.size = res.size
		// form.name = res.name.substring(0, res.name.lastIndexOf('.'))
	},
	remove: (res) => {
		form1.attachmentInfos = form1.attachmentInfos.filter(item => {
			if (item.name != res) {
				return true
			}
		})
	}
})
const submit = (formRef) => {
	formRef.validate((valid) => {
		if (valid) {
			
			let param = form;
			submitLoading.value = true
			
			param['iiTrace.type'] = 'firstDetect'
			param['iiTrace.trackType'] = 'url'
			param['iiTrace.trackTypeName'] = 'URL'
			param['iiTrace.traceId'] = ''
			param['iiTrace.name'] = formatUrl(param.name)
			param['iiTrace.caseId'] = param.caseId
			param['iiTrace.parentId'] = ''
			param['iiTrace.groupId'] = ''
			param['iiTrace.firstDetect'] = '0'
			form1.attachmentInfos.forEach((item,index)=>{
				param[`attachmentInfos[${index}].name`]=item.name
				param[`attachmentInfos[${index}].url`]=item.url
				param[`attachmentInfos[${index}].size`]=item.size
			})
			insertUrl(param).then(res => {
				let {code, data} = res.data;
				if (code == 200) {
					proxy.$Message.success('添加成功!')
					formRef.resetFields()
					submitLoading.value = false
					emit('callback', true)
				} else {
					proxy.$Message.error('添加失败！')
					submitLoading.value = false
				}
			}).catch(err => {
				proxy.$Message.error(err.data.message || '出现未知错误')
				submitLoading.value = false
			})
		}
		
	})
	
}
const traceList = ref([])
const getAllTrace = async () => {
	console.log(ajStore.caseId)
	const res = await getAllTraceByCaseId(ajStore.caseId)
	if (res.data.code == 200) {
		traceList.value = res.data.data
	}
}
onMounted(() => {
	getAllTrace()
})
</script>
<template>
	<div>
		<Form ref="formRef" :label-width="120" :model="form" :rules="rules">
			<Row :gutter="40">
				<Col span="24">
					<FormItem label="父线索" prop="parentId">
						<Select v-model="form.parentId">
							<Option v-for="item in traceList"
							        :key="item.value"
							        :value="item.id">{{item.trackTypeName}}:{{item.name}}
							</Option>
						</Select>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem class="urlNameItem" label="url地址" prop="name">
						<Input v-model.trim="form.name" clearable style="width: 300px;margin-right: 5px;"></Input>
						<Tooltip content="" max-width="300" placement="right" theme="light" transfer>
							<template #content>url输入将自动截取有效部分</template>
							<Icon color="#2D8CF0" size="18" type="ios-alert-outline"/>
						</Tooltip>
						<!--          <Icon class="format-btn" type="md-link" @click="handleUrl" title="截取有效url"/>-->
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="上传附件" prop="">
						<offline-task-upload ref="uploadComp" :flag="submitLoading" :param="upload.param" @finish="upload.finish" @remove="upload.remove"/>
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
			<Button :loading="submitLoading" type="primary" @click="submit(formRef)">提交</Button>
		</div>
	</div>
</template>
<style lang="less" scoped>
.urlNameItem {
	position: relative;
	
	.format-btn {
		position: absolute;
		right: -22px;
		top: 8px;
		color: dodgerblue;
		font-size: 18px;
		cursor: pointer;
	}
}
</style>

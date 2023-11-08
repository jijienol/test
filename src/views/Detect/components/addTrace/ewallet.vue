<script setup="">
import {ref, reactive, getCurrentInstance, defineEmits, onMounted} from 'vue';
import OfflineTaskUpload from "../../../../components/fileUpload/offlineTaskUpload.vue";

const {proxy} = getCurrentInstance()
import {dictStore} from '@/store/modules/dictionary.js';
import {insertEwallet} from '@/api/trace.js';
import {ajListStore} from '@/store/modules/ajList.js';
import {getAllTraceByCaseId} from 'src/api/trace.js'

const dict = dictStore()
const formRef = ref(null)
const submitLoading = ref(false)
const ajStore = ajListStore()
const caseId = ajStore.caseId
const emit = defineEmits(['callback'])
const form1 = reactive( {attachmentInfos:[]})

const form = reactive({ // ewallet_sub_type
                        // iiTrace: {},
	caseId: caseId,
	subType: '',
	name: '',
	peopleType: '',
	remark: '',
	parentId: ''
})
const rules = ref({
	name: [{required: true, message: '卡号不能为空', trigger: 'blur'}]
})

const peopleType = ref([])
let Msg = reactive({
	subType: {key: '类别', value: ''},
	peopleType: {key: '人员类型', value: ''},
})

function formatMsg (obj, form) {
	let msg = []
	for (let k in obj) {
		if (obj[k].value == '') {
			obj[k].value = form[k]
		}
		msg.push(obj[k])
	}
	return JSON.stringify(msg)
}

function submit (formRef) {
	formRef.validate((valid) => {
		if (valid) {
			
			let param = form;
			submitLoading.value = true
			param['iiTrace.type'] = 'firstDetect'
			param['iiTrace.trackType'] = 'ewallet'
			param['iiTrace.trackTypeName'] = '电子钱包'
			param['iiTrace.traceId'] = ''
			param['iiTrace.name'] = param.name
			param['iiTrace.caseId'] = param.caseId
			param['iiTrace.parentId'] = ''
			param['iiTrace.groupId'] = ''
			param['iiTrace.firstDetect'] = '0'
			param['iiTrace.msg'] = formatMsg(Msg, param)
			form1.attachmentInfos.forEach((item,index)=>{
				param[`attachmentInfos[${index}].name`]=item.name
				param[`attachmentInfos[${index}].url`]=item.url
				param[`attachmentInfos[${index}].size`]=item.size
			})
			insertEwallet(param).then(res => {
				let {code, data} = res.data
				if (code == 200) {
					proxy.$Message.success('添加成功')
					Msg = reactive({
						subType: {key: '类别', value: ''},
						peopleType: {key: '人员类型', value: ''},
					})
					formRef.resetFields()
					submitLoading.value = false
					emit('callback', true)
				} else {
					submitLoading.value = false
					proxy.$Message.error(res.data.message)
				}
			}).catch((err) => {
				proxy.$Message.error(err.data.message || '出现未知错误')
				submitLoading.value = false
			})
		}
	})
	
}

function peopleTypeHandler (code) {
	let obj = proxy.$lodash.find(peopleType.value, o => {
		return o.value == code
	})
	Msg.peopleType.value = obj ? obj.label : ''
}

// onMounted(() => {

dict.getDict('peopleType').then(res => {
	peopleType.value = res
})
// }
const traceList = ref([])
const getAllTrace = async () => {
	console.log(ajStore.caseId)
	const res = await getAllTraceByCaseId(ajStore.caseId)
	if (res.data.code == 200) {
		traceList.value = res.data.data
	}
}
const upload = reactive({
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
					<FormItem label="名称" prop="name">
						<Input v-model="form.name"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="类别" prop="subType">
						<Input v-model="form.subType"></Input>
					
					</FormItem>
				</Col>

				<Col span="12">
					<FormItem label="人员类别" prop="peopleType">
						<Select v-model="form.peopleType" clearable @on-change="peopleTypeHandler">
							<Option v-for="item in peopleType" :key="item.value" :value="item.value">{{item.label}}</Option>
						</Select>
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
<style scoped>
:deep(.ivu-input) {
	height: 40px;
}
</style>

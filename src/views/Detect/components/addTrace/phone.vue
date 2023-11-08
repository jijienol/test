<script setup>
import {ref, reactive, getCurrentInstance, onMounted} from 'vue';
import {dictStore} from '@/store/modules/dictionary.js';
import {insertPhone} from '@/api/trace.js';
import {ajListStore} from '@/store/modules/ajList.js';
import {reg_phone} from '@/utils/regExp.js';
import {getAllTraceByCaseId} from 'src/api/trace.js'
import OfflineTaskUpload from '../../../../components/fileUpload/offlineTaskUpload.vue';

const {proxy} = getCurrentInstance()
const dict = dictStore()
const ajStore = ajListStore()
const formRef = ref(null)
const submitLoading = ref(false)
const peopleType = ref([])
const validateCheckPhone = (rule, value, callback) => {
	if (value === '') {
		rule.message = '手机号不能为空！'
		callback(new Error('不能为空！'));
	}  else {
		callback();
	}
// else if (!reg_phone(value)) {
// 		rule.message = '手机号格式不正确'
// 		callback(new Error('格式不正确!'));
// 	}
}
const rules = ref({
	name: [{required: true, message: '手机号不能为空', trigger: 'blur', validator: validateCheckPhone}]
})
const caseId = ajStore.caseId
const emit = defineEmits(['upload']);
const form = reactive({
	caseId: caseId,
	name: '',
	imei: '',
	imsi: '',
	mac: '',
	peopleType: '',
	remark: '',
	parentId: '',
	
	userName: ''
	
})


// 人员类型选择
function peopleTypeHandler (code) {
	let obj = proxy.$lodash.find(peopleType.value, o => {
		return o.value == code
	})
	Msg.peopleType.value = obj ? obj.label : ''
}

let Msg = reactive({
	peopleType: {key: '人员类型', value: ''},
	userName: {key: '姓名', value: ''},
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

function submit (formRef) {
	formRef.validate((valid) => {
		if (valid) {
			
			let param = form;
			submitLoading.value = true
			param['iiTrace.type'] = 'firstDetect'
			param['iiTrace.trackType'] = 'phone'
			param['iiTrace.trackTypeName'] = '手机号'
			param['iiTrace.traceId'] = ''
			param['iiTrace.name'] = param.name
			param['iiTrace.caseId'] = param.caseId
			param['iiTrace.parentId'] = ''
			param['iiTrace.groupId'] = ''
			param['iiTrace.firstDetect'] = '0'
			param['iiTrace.msg'] = formatMsg(Msg, param)
			form1.attachmentInfos.forEach((item, index) => {
				param[`attachmentInfos[${index}].name`] = item.name
				param[`attachmentInfos[${index}].url`] = item.url
				param[`attachmentInfos[${index}].size`] = item.size
			})
			insertPhone(param).then(res => {
				let {code, data} = res.data
				if (code == 200) {
					proxy.$Message.success('添加成功')
					Msg = reactive({
						peopleType: {key: '人员类型', value: ''},
						userName: {key: '姓名', value: ''},
					})
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

/*if(peopleType.length < 1) {
 dict.getDict('peopleType')
 }*/
// onMounted(() => {
const phoneType = ref([])
dict.getDict('peopleType').then(res => {
	peopleType.value = res
})
dict.getDict('phoneType').then(res => {
	phoneType.value = res
})
// })
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
					<FormItem label="手机号" prop="name">
						<Input v-model="form.name" type="number"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="子类别" prop="phoneType">
						<Select v-model="form.phoneType" clearable @on-change="peopleTypeHandler">
							<Option v-for="item in phoneType" :key="item.value" :value="item.value">{{item.label}}</Option>
						</Select>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="姓名" prop="userName">
						<Input v-model="form.userName"></Input>
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
<style lang="less" scoped>
:deep(.ivu-input) {
	height: 40px;
}
</style>

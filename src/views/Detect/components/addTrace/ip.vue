<script setup>
import {ref, reactive, defineEmits, getCurrentInstance, onMounted} from 'vue';

import {insertIp} from '@/api/trace.js';
import {ajListStore} from '@/store/modules/ajList.js';
import {reg_ip} from '@/utils/regExp.js';
import $Message from '@/utils/message.js';
import {getAllTraceByCaseId} from 'src/api/trace.js'
import OfflineTaskUpload from "../../../../components/fileUpload/offlineTaskUpload.vue";


const {proxy} = getCurrentInstance()
const formRef = ref(null)
const submitLoading = ref(false)
const validateCheckIp = (rule, value, callback) => {
	if (value === '') {
		rule.message = 'ip不能为空！'
		callback(new Error('不能为空！'));
	} else if (!reg_ip(value)) {
		rule.message = 'ip格式不正确'
		callback(new Error('格式不正确!'));
	} else {
		callback();
	}
};
const rules = ref({
	name: [{required: true, message: '输入不正确', trigger: 'blur', validator: validateCheckIp}]
})
const ajStore = ajListStore()
const caseId = ajStore.caseId
const emit = defineEmits(['callback'])
const form = reactive({
	caseId: caseId,
	name: '',
	type: 'ip',
	activity: 0,
	register: 0,
	firstDetect: 0,
	// iiTrace: {},
	parentId: '',
	
	peopleType: '',
	remark: ''
})

// 人员类型选择
function peopleTypeHandler (code) {
	console.log(code)
	// let obj = proxy.$lodash.find(peopleType.value , o => {
	//   return o.value == code
	// })
	Msg.ipType.value = code
}

let Msg = reactive({
	ipType: {key: 'IP类型', value: ''}
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
			param['iiTrace.trackType'] = 'ip'
			param['iiTrace.trackTypeName'] = 'IP'
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
			insertIp(param).then(res => {
				let {code, data} = res.data
				if (code == 200) {
					$Message.success('添加成功')
					Msg = reactive({
						ipType: {key: 'IP类型', value: ''}
					})
					formRef.resetFields()
					submitLoading.value = false
					emit('callback', true)
				} else {
					submitLoading.value = false
					$Message.error(res.data.message)
				}
			}).catch(err => {
				$Message.error(err.data.message || '出现未知错误')
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
					<FormItem label="ip地址" prop="name">
						<Input v-model.trim="form.name" clearable style="width: auto;margin-right: 5px;"></Input>
						<Tooltip content="" max-width="500" placement="right" theme="light" transfer>
							<template #content>IP地址仅支持ipv4格式</template>
							<Icon color="#2D8CF0" size="18" type="ios-alert-outline"/>
						</Tooltip>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="人员类别" prop="peopleType">
						<Select v-model="form.peopleType" clearable @on-change="peopleTypeHandler">
							<Option key="1" value="服务器">服务器</Option>
							<Option key="2" value="家庭宽带">家庭宽带</Option>
							<Option key="3" value="移动设备">移动设备</Option>
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

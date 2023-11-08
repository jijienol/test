<script setup>
import {ref, reactive, defineEmits, onMounted} from 'vue';
import {dictStore} from '@/store/modules/dictionary.js';
import {insertWifi} from '@/api/trace.js';
import {ajListStore} from '@/store/modules/ajList.js';
import $Message from '@/utils/message.js';
import _ from 'lodash'
import {reg_mac} from '@/utils/regExp.js';
import OfflineTaskUpload from '../../../../components/fileUpload/offlineTaskUpload.vue';

import {getAllTraceByCaseId} from 'src/api/trace.js'

const dict = dictStore()
const formRef = ref(null)
const submitLoading = ref(false)
const ajStore = ajListStore()
const caseId = ajStore.caseId

const emit = defineEmits(['callback'])
const form = reactive({
	name: '',
	wifiType: '',
	bssid: '',
	remark: '',
	caseId: caseId,
	subType: '',
	parentId: '',
	
	firstDetect: 0,
	iiTrace: {}
})
const validateCheckMac = (rule, value, callback) => {
	if (value === '') {
		rule.message = 'mac不能为空'
		callback(new Error('不能为空'));
	} else {
		if (!reg_mac(value)) {
			rule.message = 'mac格式不正确，请看提示'
			callback(new Error('mac格式不正确'));
		} else {
			form.name = form.name.toUpperCase().replace(/-/g, ':')
			callback();
		}
	}
}
const rules = ref({
	name: [{required: true, message: '不能为空', trigger: 'blur', validator: validateCheckMac}],
	wifiType: [{required: true, message: '不能为空', trigger: 'blur'}]
})
const wifiType = ref([])

let Msg = reactive({
	bssid: {key: '设备名称', value: ''},
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
			param['iiTrace.trackType'] = 'wifi'
			param['iiTrace.trackTypeName'] = 'MAC'
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
			insertWifi(param).then(res => {
				let {code, data} = res.data
				if (code == 200) {
					$Message.success('添加成功')
					Msg = reactive({
						bssid: {key: '设备名称', value: ''},
					})
					formRef.resetFields()
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

/*if(wifiType.length < 1) {
 dict.getDict('wifiType')
 }*/
// onMounted(() => {
dict.getDict('wifiType').then(res => {
	wifiType.value = res
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
			<Row>
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
					<FormItem label="mac地址" prop="name">
						<Input v-model.trim="form.name" clearable style="width: auto;margin-right: 5px;"></Input>
						<Tooltip content="" max-width="300" placement="right" theme="light" transfer>
							<template #content>MAC标准格式：<br>2c:61:04:8e:52:c2(2C:61:04:8E:52:C2) <br>或2c-61-04-8e-52-c2(2C-61-04-8E-52-C2)，<br> 输入将统一为冒号“:”,并转换成大写</template>
							<Icon color="#2D8CF0" size="18" type="ios-alert-outline"/>
						</Tooltip>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="mac类型" prop="wifiType">
						<Select
							v-model="form.wifiType"
							clearable
							style="width: 100%"
			>
							<Option
								v-for="item in wifiType"
								:key="item.value"
								:value="item.value">
								{{item.label}}
							</Option>
						</Select>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="设备名称" prop="bssid">
						<Input v-model="form.bssid"></Input>
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

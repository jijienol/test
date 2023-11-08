<script setup>

import {computed, getCurrentInstance, reactive, ref, watch} from 'vue';
import {dictStore} from '@/store/modules/dictionary.js';

import {permissionStore} from '@/store/modules/permission.js';
import {ajListStore} from '@/store/modules/ajList.js';
import {insertCase} from '@/api/ajJs.js';
import moment from 'moment'
import {reg_caseno, reg_money} from '@/utils/regExp.js';

import UploadBiao from './uploadBiao.vue';
import {extractingCaseInfo} from '../../../api/ajJs.js';

const {proxy} = getCurrentInstance()
const ajList = ajListStore()
const permission = permissionStore()
const dict = dictStore()
const emit = defineEmits(['callback', 'cancel'])
const props = defineProps(['visible', 'title'])

const addCaseParams = ref({
	num: '',
	jjdbh: '',
	name: '',
	type: '',
	alarmPeoplePhone: '', // 报警人电话
	alarmPeople: '', // 报警人姓名
	alarmPeopleSex: '1', // 报警人姓别
	address: '',
	description: '',
	bjsjDt: '', // 报警时间
	fasjsxDt: '', // 发案时间上限
	fasjxxDt: '', // 发案时间下限
	createTime: '',
	money: '',
	sfCsal: 0,
	faddXzqh:'',
	faddXzqhdm:'',
	caseRegistrationForm: '',
	writtenDecisionOfCaseFiling: ''
})
const validateCaseno = (rule, value, callback) => {
	if (reg_caseno(value)) {
		callback()
	} else {
		rule.message = '请输入字母或数字，不支持中文和特殊字符'
		callback(new Error('请输入字母或数字，不支持中文和特殊字符'))
	}
}
const validateMoney = (rule, value, callback) => {
	
	if (reg_money(value)) {
		callback()
	} else {
		rule.message = '请输入正确的金额'
		callback(new Error('请输入正确的金额'))
	}
	
}
const ruleInCase = ref({
	// num: [{required: true, message: '案件编号不能为空', validator: validateCaseno}],
	num: [{required: true, message: '案件编号不能为空', trigger: 'blur'}],
	// jjdbh: [{required: true, message: '警情编号不能为空', validator: validateCaseno}],
	name: [{required: true, message: '名称不能为空', trigger: 'blur'}],
	// type: [{required: true, message: '类型不能为空'}],
	// createTime: [{required: true, message: '案发时间不能为空'}],
	// address: [{required: true, message: '案发地点不能为空'}],
	// description: [{required: true, message: '简要案情不能为空'}],
	// money: [{required: true, validator: validateMoney}]
})


//案件类型列表


const detectCaseType = computed(() => dict.dict.detectCaseType.list)

const cnStreet = computed(() => dict.dict.cnStreet.list)
if (cnStreet.value.length < 1) {
	dict.getDict('cnStreet')
}

const initCaseNum = () => {
	let time = moment().format('yyyyMMDDHHmmss')
	// yyyy-MM-dd HH:mm
	addCaseParams.value.num = 'AJ' + time + '_autoCreate'
	let systime = moment().format('yyyy-MM-DD HH:mm')
	addCaseParams.value.bjsjDt = systime.split('.')[0].replace(/T/, ' ')
	addCaseParams.value.createTime = getLatelyDays(15)
	getFasj(addCaseParams.value.createTime)
}
const getFasj = (dataTimeArr) => {
	console.log(dataTimeArr, addCaseParams.value.createTime)
	
	addCaseParams.value.fasjsxDt = dataTimeArr[0]
	addCaseParams.value.fasjxxDt = dataTimeArr[1]
}

// 格式化时间：yyyy-MM-dd hh:mm
function formatDateTime (d) {
	const getHandledValue = num => {
		return num < 10 ? '0' + num : num
	}
	const year = d.getFullYear()
	const month = getHandledValue(d.getMonth() + 1)
	const date = getHandledValue(d.getDate())
	const hours = getHandledValue(d.getHours())
	const minutes = getHandledValue(d.getMinutes())
	return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes
}

// 最近num天
function getLatelyDays (num) {
	const endDate = new Date()
	const end = formatDateTime(endDate)
	const startDate = endDate.getTime() - num * 24 * 60 * 60 * 1000
	const start = formatDateTime(new Date(startDate))
	return [start, end]
}

function changeType (a) {
	cnStreet.value.forEach(item=>{
		if(item.value==a){
			addCaseParams.value.faddXzqh = item.label
		}
	})
}

// 立案时间
function getBjsjDt (time) {
	if (time) {
		addCaseParams.value.bjsjDt = time
		
	} else {
		addCaseParams.value.bjsjDt = null
		
	}
}

// 是否显示测试案件
const sfCaseFlag = computed(() => permission.sfCaseFLag)


// 初始化表单
function initAddCaseParams () {
	addCaseParams.value = {
		num: '',
		jjdbh: '',
		name: '',
		type: '',
		alarmPeoplePhone: '', // 报警人电话
		alarmPeople: '', // 报警人姓名
		alarmPeopleSex: '1', // 报警人姓别
		address: '',
		description: '',
		bjsjDt: '', // 报警时间
		fasjsxDt: '', // 发案时间上限
		fasjxxDt: '', // 发案时间下限
		createTime: '',
		money: '',
		sfCsal: 0,
		faddXzqhdm:'',
		faddXzqh:'',
		caseRegistrationForm: '',
		writtenDecisionOfCaseFiling: ''
	}
}

// 取消添加
function cancel () {
	saveLoading.value = false
	emit('cancel', '')
	ajList.addInfo = {}
	initAddCaseParams()
}


//保存
const saveLoading = ref(false)
const addCaseForm = ref()

function addCase () {
	// return false
	if (addCaseParams.value.bjsjDt) {
		addCaseParams.value.bjsjDt = moment(addCaseParams.value.bjsjDt).format('YYYY-MM-DD HH:mm')
	}
	
	addCaseForm.value.validate(async (valid) => {
		if (valid) {
			saveLoading.value = true
			try {
				const res = await insertCase(addCaseParams.value)
				if (res.data.code == 200) {
					saveLoading.value = false
					emit('cancel', '')
					ajList.addInfo = {}
					initAddCaseParams()
					addCaseForm.value.resetFields()
					if (props.title == '新增案件') {
						proxy.$Message.success('添加成功')
					} else {
						proxy.$Message.success('修改成功')
					}
					emit('callback', true)
				} else {
					saveLoading.value = false
					proxy.$Message.error('添加失败')
				}
			}
			catch (error) {
				saveLoading.value = false
				console.log(error)
				proxy.$Message.error(error.data.message)
			}
		} else {
			saveLoading.value = false
		}
	})
}

const upload = reactive({
	finish: (res) => {
		addCaseParams.value.writtenDecisionOfCaseFiling = res.file
		
	},
	remove: (res) => {
		addCaseParams.value.writtenDecisionOfCaseFiling = ''
	}
})

const Loading = ref(false)
const upload1 = reactive({
	finish: async (res) => {
		addCaseParams.value.caseRegistrationForm = res.file
		Loading.value = true
		try {
			const {data} = await extractingCaseInfo({path: res.file})
			
			if (data.code == 200) {
				Loading.value = false
				if(data.data.caseNO){
					addCaseParams.value.num = data.data.caseNO
					
				}
				addCaseParams.value.description = data.data.caseDetail
				addCaseParams.value.alarmPeople = data.data.name
				addCaseParams.value.name = data.data.caseName
			}
		}
		catch (err) {
			Loading.value = false
			proxy.$Message.message(err.message)
		}
		
	},
	remove: (res) => {
		addCaseParams.value.caseRegistrationForm = ''
	}
})
//初始化

watch(() => props.visible, (val) => {
	if (ajList.addInfo.id) {
		console.log(ajList.addInfo)
		addCaseParams.value = {
			num: ajList.addInfo.num,
			jjdbh: ajList.addInfo.jjdbh,
			name: ajList.addInfo.name,
			type: ajList.addInfo.type ? JSON.stringify(ajList.addInfo.type) : '',
			alarmPeoplePhone: ajList.addInfo.alarmPeoplePhone, // 报警人电话
			alarmPeople: ajList.addInfo.alarmPeople, // 报警人姓名
			alarmPeopleSex: ajList.addInfo.alarmPeopleSex, // 报警人姓别
			address: ajList.addInfo.address,
			description: ajList.addInfo.description,
			bjsjDt: ajList.addInfo.bjsjDt, // 报警时间
			fasjsxDt: ajList.addInfo.fasjsxDt, // 发案时间上限
			fasjxxDt: ajList.addInfo.fasjxxDt, // 发案时间下限
			createTime: [ajList.addInfo.fasjsxDt, ajList.addInfo.fasjxxDt],
			money: ajList.addInfo.money,
			sfCsal: ajList.addInfo.sfCsal,
			faddXzqhdm:ajList.addInfo.faddXzqhdm,
			faddXzqh:ajList.addInfo.faddXzqh,
			caseRegistrationForm: ajList.addInfo.caseRegistrationForm,
			writtenDecisionOfCaseFiling: ajList.addInfo.writtenDecisionOfCaseFiling,
			id: ajList.addInfo.id
		}
	} else {
		if (val) initCaseNum()
		
	}
})
</script>
<script>
export default {
	name: 'addAj'
}

</script>
<template>
	<div class="add-case-base">
		<Form ref="addCaseForm" :label-width="105" :model="addCaseParams" :rules="ruleInCase">
			<Row>
				<Col span="24">
					<Spin :show="Loading" fix>
						<Icon class="demo-spin-icon-load" size=18 type="ios-loading"></Icon>
						<div>受案登记表解析中</div>
					</Spin>
					<FormItem label="受案登记表" prop="alarmPeople">
						<UploadBiao :flag='props.visible' @finish="upload1.finish" @remove="upload1.remove"></UploadBiao>
						<p style="color: #24B493">(上传受案登记表可以自动解析并提取内容)</p>
					</FormItem>
				
				</Col>
				<Col span="12">
					<FormItem label="案件编号" prop="num">
						<Input v-model.trim="addCaseParams.num" type="text"> </Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="警情编号" prop="jjdbh">
						<Input v-model.trim="addCaseParams.jjdbh" type="text"></Input>
					</FormItem>
				</Col>
				<Col v-if="sfCaseFlag" span="12">
					<FormItem label="测试案例" prop="num">
						<RadioGroup v-model="addCaseParams.sfCsal">
							<Radio :label="'0'">否</Radio>
							<Radio :label="'1'">是</Radio>
						</RadioGroup>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<FormItem label="案件名称" prop="name"><Input v-model="addCaseParams.name" type="text"> </Input></FormItem>
				</Col>
				<Col span="12">
					<FormItem label="案件类型" prop="type">
						<Select v-model="addCaseParams.type" placeholder="请选择案件类型">
							<Option v-for="item in detectCaseType" :key="item.value" :label="item.label" :value="item.value">{{item.label}}</Option>
						</Select>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<FormItem label="立案时间">
						<DatePicker
							v-model="addCaseParams.bjsjDt"
							format="yyyy-MM-dd HH:mm"
							style="width: 100%"
							type="datetime"
							@on-change="getBjsjDt"
						></DatePicker>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="报警人姓名" prop="alarmPeople">
						<Input v-model="addCaseParams.alarmPeople" type="text"> </Input>
					</FormItem>
				</Col>
				
				<Col span="24">
					<FormItem label="立案决定书" prop="alarmPeople">
						<UploadBiao :flag='props.visible' @finish="upload.finish" @remove="upload.remove"></UploadBiao>
					</FormItem>
				</Col>
				
				<Col span="12">
					<FormItem label="报警人电话" prop="alarmPeoplePhone">
						<Input v-model="addCaseParams.alarmPeoplePhone" type="text"> </Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="案发时间" prop="createTime">
						<DatePicker
							v-model="addCaseParams.createTime"
							format="yyyy-MM-dd HH:mm"
							placeholder="发案时间上限-发案时间下限"
							style="width: 100%"
							type="datetimerange"
							@on-change="getFasj"
						></DatePicker>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="案发地点" prop="address"><Input v-model="addCaseParams.address" type="text"> </Input></FormItem>
				</Col>
				<Col span="12">
					<FormItem label="所属派出所" prop="faddXzar">
						<Select v-model="addCaseParams.faddXzqhdm" placeholder="请选择" @on-change="changeType">
							<Option v-for="item in cnStreet" :key="item.value" :label="item.label" :value="item.value">{{item.label}}</Option>
						</Select>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="金额（元）" prop="money"><Input v-model.number="addCaseParams.money" type="text"> </Input>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="24">
					<FormItem label="简要案情" prop="description">
						<Input v-model="addCaseParams.description" :rows="5" placeholder="上传受案登记表可以自动解析简要案情" type="textarea"> </Input>
					</FormItem>
				</Col>
			</Row>
		</Form>
		<div class="btn-group">
			<Button class="btn" @click="cancel()">取消</Button>
			<Button :loading="saveLoading" class="btn" type="primary" @click="addCase()">保存</Button>
		</div>
	</div>
</template>
<style lang="less" scoped>
.demo-spin-icon-load {
	animation: ani-demo-spin 1s linear infinite;
}

.add-case-base {
	.ivu-form-item-content {
		width: 60%;
	}
}

.btn-group {
	.btn {
		margin: 0 4px;
	}
}
</style>

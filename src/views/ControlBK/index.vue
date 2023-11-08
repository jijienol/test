<script setup>
import {getCurrentInstance, onMounted, reactive, ref, watch} from 'vue';
import {delReturnVisit} from '../../api/QuestionnaireList.js';
import Pagination from '../../components/viewui/pagination.vue';
import {swdtStore} from '@/store/modules/swdt.js';
import {deletePeople, findDeployCompanyList, findDeployHistoryList, findDeployUserList, finishDeploy, getPage} from '../../api/ControlBK.js';
import PeopleV from '@/components/sign/components/addSign/peopleXQ.vue';
import {storeToRefs} from 'pinia';
import {noteStore} from '@/store/modules/note.js';
import channelQrcode from '@/views/Detect/components/channelQrcode.vue'
import {cloneDeep} from 'lodash';
import {globalStore} from 'src/store/modules/global.js'
import {downloadBkExcel} from '@/api/ControlBK.js'
import {updatePeople} from 'src/api/ajJs.js'
import aes from 'src/libs/aes.js'
import BkList from '@/views/ControlBK/BkList.vue'
import {bus} from 'vue3-eventbus'

const global = globalStore()
const swdt = swdtStore()
const {proxy} = getCurrentInstance()
const {qrcode} = storeToRefs(swdt)
const note = noteStore()
const column = [
	{
		title: '案件名称',
		key: 'caseName'
	}, {
		title: '人员号码',
		key: 'phone'
	}, {
		title: '人员名称',
		key: 'name',
		width: '140'
	}, {
		title: '证件号码',
		key: 'idcard'
	},
	{
		title: '标定民警',
		key: 'pcName'
	}, {
		title: '警号',
		key: 'pcNo'
	}, {
		title: '警官联系方式',
		key: 'pcPhone'
	}, {
		title: '是否布控',
		slot: 'isDeployed',
		width: '120'
	},
	{
		title: '操作',
		slot: 'operation',
		width: '450'
	}
]
let queryFrom = reactive({
	caseName: '',//案件名称
	caseNo: '',//案件编号
	isDeployed: '',//是否布控，
	name: '',
	phone: ''
})
const tableLoading = ref(false)
const table = ref([])
const pageOpt = ref({
	total: 0,
	pageNo: 1,
	pageSize: 10
})

const modalOpt = ref({
	visible: false,
	title: '',
	rowInfo: {}
})


function closeBD (val) {
	modalOpt.value.visible = false
	// console.log(val)
	if (val == 'sx') {
		getList()
	}
}

function getList () {
	tableLoading.value = true
	let param = {
		pageNo: pageOpt.value.pageNo,
		pageSize: pageOpt.value.pageSize,
		...queryFrom
	}
	getPage(param).then(res => {
		let {code, data} = res.data
		if (code == 200) {
			table.value = data.list
			pageOpt.value.total = data.total
			tableLoading.value = false
		} else {
			tableLoading.value = false
		}
	}).catch(() => {
		tableLoading.value = false
	})
}

function handleSearch () {
	pageOpt.value.pageNo = 1
	getList()
}

function resetForm () {
	pageOpt.value.pageNo = 1
	queryFrom.caseName = ''
	queryFrom.caseNo = ''
	queryFrom.name = ''
	queryFrom.isDeployed = ''
	queryFrom.phone = ''
	getList()
}

const cityList = [
	{
		value: '1',
		label: '已布控'
	},
	{
		value: '0',
		label: '未布控'
	}
]


const BKGSList = ref([])
const BKRYList = ref([])
const flag = ref(false)

function pl () {
	flag.value = false
	note.BkListVisible = true
}

function edit (row) {
	
	flag.value = true
	BKRYList.value = [row]
	note.BkListVisible = true
}

async function save () {
	note.addSign.loading = true
	console.log(note.addSign)
	try {
		updatePeople(note.peopleForm).then(res => {
			if (res.data.code == '200') {
				if (BKRYList.value.length == 1) {
					BKRYList.value = [note.peopleForm]
				}
				// BKRYList.value = note.peopleForm
				note.addSign.loading = false
				note.addSign.addSignVisible = false
				proxy.$Message.success('保存成功')
				note.addSign.flag = !note.addSign.flag
				note.openSign(note.signOpenType, note.signParams.caseId, note.signParams.traceId, note.signParams.virtualId)
				
			} else {
				note.addSign.loading = false
				note.addSign.addSignVisible = false
				proxy.$Message.error(res.data.message)
			}
		}).catch(err => {
			console.log(err);
			note.addSign.loading = false
			proxy.$Message.error(err.data.message)
		})
	}
	catch (err) {
		note.addSign.loading = false
		
		if (err.data.code != '200') {
			proxy.$Message.error(err.data.message)
		}
	}
	
}

async function dele (id) {
	try {
		const res = await deletePeople({id: id})
		const {code, data, message} = res.data
		console.log(code, data, message)
		if (code == 200) {
			proxy.$Message.success('删除成功')
			getList()
		} else {
			console.log(123)
			proxy.$Message.error(message)
		}
	}
	catch (e) {
		console.log(e)
	}
	
}

function BK (row) {
	note.BK1 = 'xg'
	note.addSign.addSignVisible = true
	console.log(row)
	note.peopleForm = {
		id: row.pid,
		name: row.name,
		type: row.ptype,
		gender: row.gender,
		idcard: row.idcard,
		phone: row.phone,
		age: row.age,
		remark: row.remark,
		objectSourceId: row.id
	}
}

async function qx (row) {
	try {
		const res = await finishDeploy(row.id)
		if (res.data.code == 200) {
			proxy.$Message.success('取消成功')
			getList()
		} else {
			proxy.$Message.error(res.data.message)
		}
	}
	catch (e) {
		console.log(e)
		proxy.$Message.error(e)
		
	}
	
}

watch(() => note.addSign.addSignVisible, (val) => {
	console.log(val)
	if (!val) getList()
})


async function getBKData () {
	
	try {
		const res = await findDeployCompanyList({name: ''})
		if (res.data.code == 200) {
			BKGSList.value = res.data.data
			
		} else {
			proxy.$Message.error(res.data.message)
		}
	}
	catch (e) {
		console.log(e)
		proxy.$Message.error(e)
		
	}
	
	if (!flag.value) {
		try {
			const res1 = await findDeployUserList({peopleId: ''})
			if (res1.data.code == 200) {
				BKRYList.value = res1.data.data
				
			} else {
				proxy.$Message.error(res1.data.message)
			}
		}
		catch (e) {
			console.log(e)
			proxy.$Message.error(e)
		}
	}
	console.log(BKGSList.value, BKRYList.value)
}

watch(() => note.BkListVisible, (val) => {
	if (val) {
		getBKData()
	}
})
watch(() => note.addSign.addSignVisible, (val) => {
	if (!val) {
		getBKData()
	}
	
})

function relevancy (item) {
//案件间的跳转
	
	console.log(item)
	let origin = window.location.origin
	let param = aes.encrypt(JSON.stringify({caseId: item.caseId}))
	
	window.open(origin + '/detect?param=' + param, '_blank')
	
}

// 详情
const xqInfo = ref({
	visible: false,
	data: [],
	loading: false
	
})

async function xq (row) {
	try {
		xqInfo.value.loading = true
		const res1 = await findDeployHistoryList({idcard: row.idcard})
		if (res1.data.code == 200) {
			xqInfo.value.loading = false
			xqInfo.value.visible = true
			xqInfo.value.data = res1.data.data.list
		} else {
			proxy.$Message.error(res1.data.message)
			xqInfo.value.loading = false
			
		}
	}
	catch (e) {
		xqInfo.value.loading = false
		
		console.log(e)
		proxy.$Message.error(e)
	}
}

const gswj = ref('')
const bkgs = ref(null)
const batchNo1 = ref('')

//选择公司
bus.on('gs', ({border, bkBatchNo}) => {
	batchNo1.value = bkBatchNo
	bkgs.value = border.name
	if (border.deployTemplate) {
		gswj.value = border.deployTemplate
	} else {
		gswj.value = ''
	}
})

//下载附件
function xzgswj () {
	if (gswj.value) {
		// 下载
		let url = gswj.value.replace(/\/mnt\/data\/upload/g, '')
		
		// 用你从后端获取的下载链接替换 'YOUR_DOWNLOAD_LINK' 这部分
		// console.log( global.env.fileUrl + url)
		let downloadLink = global.env.fileUrl + url;
		
		
		// 创建一个隐藏的<a>标签来模拟点击下载链接
		const a = document.createElement('a');
		a.href = downloadLink;
		// a.download = 'file_name.ext'; // 可以设置下载文件的默认名称
		a.style.display = 'none';
		
		// 将<a>标签添加到页面并模拟点击
		document.body.appendChild(a);
		a.click();
		
		// 清理掉<a>标签
		document.body.removeChild(a);
		proxy.$Message.success('正在下载！')
		
	}
}

//下载附件
async function xzgswj2 () {
	
	try {
		const res = await downloadBkExcel(batchNo1.value)
		const {data, code} = res.data
		if (code == 200) {
			console.log(data)
			if (data) {
				// 下载
				let url = data.replace(/\/mnt\/data\/upload/g, '')
				
				// 用你从后端获取的下载链接替换 'YOUR_DOWNLOAD_LINK' 这部分
				// console.log( global.env.fileUrl + url)
				let downloadLink = global.env.fileUrl + url;
				
				
				// 创建一个隐藏的<a>标签来模拟点击下载链接
				const a = document.createElement('a');
				a.href = downloadLink;
				// a.download = 'file_name.ext'; // 可以设置下载文件的默认名称
				a.style.display = 'none';
				
				// 将<a>标签添加到页面并模拟点击
				document.body.appendChild(a);
				a.click();
				
				// 清理掉<a>标签
				document.body.removeChild(a);
				proxy.$Message.success('正在下载！')
				
			}
		}
	}
	catch (e) {
		console.log(e)
	}
}

onMounted(() => {
	getList()
})
</script>
<script>
export default {
	name: 'QuestionnaireList'
}

</script>
<template>
	<Card style="width:99%;margin: .1rem">
		<template #title>
			<div style="display: flex;align-items: center">
				<h2 style="margin-right: .2rem">嫌疑人管理</h2>
			</div>
		</template>
		<!--    查询-->
		<Form ref="queryFromRef" :model="queryFrom">
			<Row :gutter="30">
				<Col span="3">
					<FormItem prop="name">
						<Select v-model="queryFrom.isDeployed" clearable filterable  placeholder="是否布控">
							<Option v-for="item in cityList" :key="item.value" :value="item.value">{{item.label}}</Option>
						</Select>
					</FormItem>
				</Col>
				<Col span="3">
					<FormItem prop="mobile">
						<Input v-model="queryFrom.caseNo" placeholder="案件编号"></Input>
					</FormItem>
				</Col>
				<Col span="3">
					<FormItem prop="bh">
						<Input v-model="queryFrom.caseName" placeholder="案件名称"></Input>
					</FormItem>
				</Col>
				<Col span="3">
					<FormItem prop="bh">
						<Input v-model="queryFrom.name" placeholder="布控人员名称"></Input>
					</FormItem>
				</Col>
				<Col span="3">
					<FormItem prop="bh">
						<Input v-model="queryFrom.phone" placeholder="布控人员号码"></Input>
					</FormItem>
				</Col>
				<Col span="6">
					<Button icon="ios-search" style="margin-left: 8px" type="primary" @click="handleSearch">查询</Button>
					<Button icon="md-refresh" style="margin-left: 8px" @click="resetForm">重置</Button>
					<Button icon="md-done-all" style="margin-left: 8px" type="primary" @click="pl">批量布控</Button>
				</Col>
			</Row>
		</Form>
		<div style="border: 1px solid #cccccc">
			<Table :columns="column" :data="table" :loading="tableLoading">
				<template #isDeployed="{ row }">
					<div style="display: flex;align-items: center">
						<div v-if="row.isDeployed=='1'" style="background: #2D8CF0;size: 36px;width: 10px;height: 10px;border-radius: 30px"></div>	<strong v-if="row.isDeployed=='1'">已布控</strong>
						<div v-if="row.isDeployed=='0'" style="background: #FFAC2F;size: 36px;width: 10px;height: 10px;border-radius: 30px"></div>	<strong v-if="row.isDeployed=='0'">未布控</strong>
						<div v-if="row.isDeployed=='2'" style="background: #2D8C12;size: 36px;width: 10px;height: 10px;border-radius: 30px"></div>	<strong v-if="row.isDeployed=='2'">已完成</strong>
				
					</div>
				</template>
				<template v-slot:operation="{ row, index }">
					<Button style="margin-right: 6px" @click="relevancy(row)">关联案件</Button>
					<Button style="margin-right: 6px" type="primary" @click="BK(row)">修改</Button>
					<Button style="margin-right: 6px" type="success" @click="edit(row)">布控</Button>
					<Button v-if="row.isDeployed=='2'||row.isDeployed=='1'" style="margin-left: 8px" type="primary" @click="xq(row)">详情</Button>
					<Poptip v-if="row.isDeployed=='0'"
					        confirm
					        title="此操作将删除选中项，是否继续?"
					        @on-ok="dele(row.pid)">
						<Button style="margin-left: 8px" type="error">删除</Button>
					</Poptip>
					<Poptip v-if="row.isDeployed=='1'"
					        confirm
					        title="此操作将取消选中项，是否继续?"
					        @on-ok="qx(row)">
						<Button style="margin-left: 8px" type="primary">取消布控</Button>
					</Poptip>
				</template>
			</Table>
		</div>
	</Card>
	<Footer style="position: absolute;bottom: .2rem">
		<pagination v-model:pageNo="pageOpt.pageNo" v-model:pageSize="pageOpt.pageSize" :render="getList"
		            :total="pageOpt.total" show-elevator show-total/>
	
	</Footer>
	<!--  二维码-->
	<Modal v-model="qrcode.visible" :footer-hide="true">
		<channel-qrcode :id="qrcode.traceId" :default="qrcode.channelType" :list="qrcode.params" :visible="qrcode.visible"></channel-qrcode>
		<Poptip
			confirm
			title="下载并填写完布控涵后，请务盖章完毕后，再到App端拍照上传，感谢您的配合！这将确保您的操作顺利完成。"
			@on-ok="xzgswj"
		>
			<Button v-if="gswj" type="primary">下载布控涵1</Button>
		</Poptip>
		<Poptip
			confirm
			title="下载打印后，请务盖章完毕后，再到App端拍照上传，感谢您的配合！这将确保您的操作顺利完成。"
			@on-ok="xzgswj2"
		>
			<Button v-if="bkgs == '滴滴'" style="margin: 0 5px" type="primary">下载布控涵2</Button>
		</Poptip>
	
	</Modal>
	<Modal
		v-model="xqInfo.visible"
		title="布控详情"
		@on-cancel="xqInfo.visible = false">
		<div v-for="item in xqInfo.data" :key="item" class="item11">
			<Tag v-if="item.deployStatus==0" color="#59bb73">已申请布控</Tag>
			<Tag v-if="item.deployStatus==1" color="#4ad2fb">布控中</Tag>
			<div>布控公司：{{item.companyName}}</div>
			<div>{{item.createdTime}}</div>
		</div>
	
	</Modal>
	<Modal
		v-model="note.addSign.addSignVisible"
		footer-hide
		title="标定人员详情"
		width="800">
		<people-v @save="save"></people-v>
	
	</Modal>
	<Modal
		v-model="note.BkListVisible"
		footer-hide
		title="批量布控"
		width="800">
		
		
		<bk-list :BKGSList='BKGSList' :BKRYList="BKRYList"/>
	</Modal>
</template>
<style lang="less">
.ivu-table-wrapper {
	overflow: visible;
	
	.ivu-table {
		overflow: visible;
	}
}

.item11 {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px 10px;
	margin-bottom: 10px;
	border: 1px solid #ccc;
	border-radius: 10px;
}
</style>

<script setup>
import {onMounted, reactive, ref, getCurrentInstance, watchEffect, computed, resolveComponent} from 'vue';
import {dictStore} from '@/store/modules/dictionary.js';
import {deleteOffice, exportOfficeSql, getAreaList, officeList, saveOffice, syncOffice} from '../../api/office.js';
import Pagination from '../../components/viewui/pagination.vue';
import {selectOfficeList} from '@/api/dict.js';
import {permissionStore} from '@/store/modules/permission.js';
import {storeToRefs} from 'pinia';
import {globalStore} from '@/store/modules/global.js';
import fileUtil from '@/utils/fileSaver.js';

const global = globalStore()
const permission = permissionStore()
const {token} = storeToRefs(permission)

const {proxy} = getCurrentInstance()
const dict = dictStore()
const columns1 = [
	{
		title: '部门名称',
		minWidth: 85,
		tooltip: true,
		key: 'name'
	},
	{
		title: '归属区域',
		minWidth: 85,
		tooltip: true,
		render: (h, params) => {
			return h('div', params.row.area.name)
		}
	},
	{
		title: '部门编码',
		minWidth: 100,
		tooltip: true,
		key: 'sn'
	},
	{
		title: '部门类型',
		minWidth: 120,
		tooltip: true,
		key: 'typeName'
	},
	{
		title: 'LOGO',
		Width: 80,
		tooltip: true,
		key: 'logo',
		render: (h, params) => {
			return params.row.logo ? h('div', [
				h(resolveComponent('img'), {
					src: global.env.fileUrl + params.row.logo,
					style: {
						width: '40px',
						height: '40px'
					},
				}),
			
			]) : '';
		}
	},
	{
		title: '操作',
		minWidth: 185,
		slot: '操作'
	}
]
const ruleInline = {
	isFormal: [
		{required: true, message: '不能为空', trigger: 'blur'}
	],
	name: [
		{required: true, message: '部门名称不能为空', trigger: 'blur'}
	],
	// parentSn: [
	//   { required: true, message: '上级部门不能为空', trigger: 'blur' }
	// ],
	type: [
		{required: true, message: '部门类型不能为空', trigger: 'blur'}
	],
	sn: [
		{required: true, message: '部门编码不能为空', trigger: 'blur'}
	],
	areaId: [
		{required: true, message: '归属区域不能为空', trigger: 'blur'}
	],
	code: [
		{required: true, message: '区域编码不能为空', trigger: 'blur'}
	],
	// manager: [
	//   { required: true, message: '负责人不能为空', trigger: 'blur' }
	// ],
	ftpIp: [
		{required: true, message: 'FTP IP不能为空', trigger: 'blur'}
	],
	ftpPort: [
		{required: true, message: 'FTP 端口号不能为空', trigger: 'blur'}
	],
	ftpUsername: [
		{required: true, message: 'FTP 用户名不能为空', trigger: 'blur'}
	],
	ftpPassword: [
		{required: true, message: 'FTP 密码不能为空', trigger: 'blur'}
	],
	grade: [
		{required: false, message: '部门等级不能为空'}
	]
}
const defaultform = {
	id: '',
	parentSn: null,
	name: '',
	type: '',
	sn: '',
	sort: '',
	areaId: '',
	code: '',
	manager: '',
	phone: '',
	address: '',
	grade: '',
	remark: '',
	Authorization: ''
}
const pageOpt = reactive({
	pageNo: 1,
	pageSize: 10,
	total: 0
})
const queryForm = reactive({
	name: '',
	sn: '',
	type: ''
})
const queryFormRef = ref()
const tableData = ref([])
const officeTypeList = computed(() => dict.dict.officeType.list)

// 加载列表
function getTableData () {
	let data = {
		type: queryForm.type,
		sn: queryForm.sn,
		name: queryForm.name,
		pageNo: pageOpt.pageNo,
		pageSize: pageOpt.pageSize,
	}
	officeList(data).then((res) => {
		if (res.data.code === 200) {
			tableData.value = res.data.data.list
			pageOpt.total = res.data.data.total
		} else {
			proxy.$Message.info(res.data.message)
		}
	})
}

let officeArr = ref([])

function getOfficeList () {
	selectOfficeList()
		.then((res) => {
			if (res.data.code === 200) {
				res.data.data.forEach(node => {
					let arr = []
					if (node.children) {
						node.children.forEach(item => {
							officeArr.value.push({
								value: item.sn,
								title: item.name
							})
						})
					}
					officeArr.value.push({
						value: node.sn,
						title: node.name,
						
					})
				})
			}
		})
}

// 重置搜索条件
function resetForm (name) {
	queryFormRef.value.resetFields()
	pageOpt.pageNo = 1
	getTableData()
}

function   // 条件搜索
handleSearch () {
	pageOpt.pageNo = 1
	getTableData()
}

//弹框
const modal1 = reactive({
	visible: false,
	title: '',
	loading: false
})
let addform = ref({
	id: '',
	parentSn: null,
	name: '',
	type: '',
	sn: '',
	sort: '',
	areaId: '',
	code: '',
	manager: '',
	phone: '',
	address: '',
	grade: '',
	remark: '',
	isFormal: '0',
	enableFtp: false,
	ftpIp: '',
	ftpPort: '',
	ftpUsername: '',
	ftpPassword: '',
	logo: ''
	
})
const areaList = ref([])


function findAreaList () {
	let data = {
		pageNo: 1,
		pageSize: 100,
	}
	getAreaList(data).then((res) => {
		if (res.data.code == 200) {
			areaList.value = res.data.data.list
		} else {
			proxy.$Message.info(res.data.message)
		}
	})
}

const addFormRef = ref()

function cancel () {
	addFormRef.value.resetFields()
	modal1.visible = false
}

function add () {
	modal1.title = '添加部门'
	modal1.visible = true
}

function changeArea (e) {
	for (var index in areaList.value) {
		if (areaList.value[index].id === e) {
			addform.value.code = areaList.value[index].code
			break
		}
	}
}

function changeArea1 (e) {
	console.log(e)
	for (var index in officeArr.value) {
		if (officeArr.value[index].value === e) {
			addform.value.parentSn = officeArr.value[index].value
			break
		}
	}
}

const loadingSave = ref(false)

function save () {
	addFormRef.value.validate((valid) => {
		if (valid) {
			modal1.loadingSave = true
			if (!addform.value.parentSn) {
				addform.value.parentSn = '0'
			}
			const params = Object.assign({}, addform.value)
			
			saveOffice(params).then((res) => {
				if (res.data.code === 200) {
					proxy.$Message.success('保存成功')
					addform.value = Object.assign({}, defaultform)
					addFormRef.value.resetFields()
					modal1.visible = false
					loadingSave.value = false
					getTableData()
				} else {
					loadingSave.value = false
					proxy.$Message.info(res.data.message)
				}
			})
			
			
		}
	})
}

function update (row) {
	
	addform.value = {
		id: row.id,
		parentSn: row.parentSn == '0' ? null : row.parentSn,
		sn: row.sn,
		name: row.name,
		grade: row.grade,
		type: row.type,
		code: row.code,
		areaId: row.areaId,
		manager: row.manager,
		phone: row.phone,
		address: row.address,
		remark: row.remark,
		isFormal: row.isFormal,
		enableFtp: row.enableFtp,
		ftpIp: row.ftpIp,
		ftpPort: row.ftpPort ? String(row.ftpPort) : '',
		ftpUsername: row.ftpUsername,
		ftpPassword: row.ftpPassword,
		logo: row.logo
	}
	modal1.visible = true
	modal1.title = '修改部门'
}

function remove (id) {
	let params = {
		id: id
	}
	deleteOffice(params).then((res) => {
		if (res.data.code === 999) {
			proxy.$Message.info('token过期，请重新登录')
		} else {
			proxy.$Message.info('删除成功')
			getTableData()
		}
	}).catch((err) => {
		console.log(err)
	})
}

onMounted(() => {
	dict.getDict('officeType')
	getTableData()
	findAreaList()
	getOfficeList()
})
const uploadRef = ref()
const fileUploading = ref(false)
const imageUpload = reactive({
	headers: {
		Authorization: token
	},
	param: {},
	action: 'api/a/sys/office/uploadLogo',
	beforeUpload: (file) => {
		fileUploading.value = true
		
	},
	uploadSuccess: (response) => {
		fileUploading.value = false
		// console.log(response.data.filePath);
		// imageUpload.url = response
		// console.log(response.filePath);
		// imageUpload.url = response.data.filePath
		if (response.data.filePath.startsWith('/')) {
			addform.value.logo = response.data.filePath
			
		} else {
			addform.value.logo = '/' + response.data.filePath
			
		}
		proxy.$Message.success('上传成功')
		
		uploadRef.value.clearFiles()
	},
	fileExceededSize: () => {
		proxy.$Message.warning('文件大小超出限制！')
		fileUploading.value = false
	},
	removeFile: () => {
		imageUpload.param.name = ''
		imageUpload.param.file = ''
		imageUpload.param.size = ''
	},
	formatError: () => {
		fileUploading.value = false
		proxy.$Message.warning('格式不正确，请上传图片格式文件！')
	},
	uploadError: (response) => {
		// console.log(response);
		proxy.$Message.error('出现错误')
		fileUploading.value = false
	}
})
const fileSrc = ref('')
const downloadUrl = ref('')
const fileType = ref('')

async function exp (row) {
	console.log(row)
	const {data} = await exportOfficeSql({officeId: row.id})
	
	// console.log(code,data)
	if (data.code == 200) {
		fileSrc.value = ''
		downloadUrl.value = ''
		let _t = data.data.split('.')[1]
		const name = data.data.split('/')[2]
		
		fileType.value = _t
		let _o = data.data.replace(/\/mnt\/data\/upload/g, '')
		let s = global.env.fileUrl + _o
		downloadUrl.value = s
		// console.log(downloadUrl.value)
		fileUtil.downloadTxtFile(downloadUrl.value, name)
	}
	
}
async function tb (row) {
	const {data} = await syncOffice({sn: row.sn})
	if (data.code == 200) {
		proxy.$Message.success('同步成功')
	}else {
		proxy.$Message.error(data.message)
	}
}

</script>


<template>
	<!-- 查询条件 -->
	<Card style="width:99%;margin: .1rem">
		<template #title>
			<div style="display: flex;align-items: center">
				<h2 style="margin-right: .2rem">部门信息管理</h2>
			</div>
		</template>
		<Form ref="queryFormRef" :model="queryForm">
			<Row :gutter="30">
				<Col span="3">
					<FormItem prop="name">
						<Input v-model="queryForm.name" placeholder="请填写部门名称"></Input>
					</FormItem>
				</Col>
				<Col span="3">
					<FormItem prop="sn">
						<Input v-model="queryForm.sn" placeholder="请填写部门编码"></Input>
					</FormItem>
				</Col>
				<Col span="3">
					<FormItem prop="type">
						<Select v-model="queryForm.type" filterable clearable placeholder="请填写部门类型" style="width:100%">
							<Option v-for="item in officeTypeList" :key="item.value" :value="item.value">{{item.label}}</Option>
						</Select>
					</FormItem>
				</Col>
				<Col span="6">
					<Button icon="ios-search" type="primary" @click="handleSearch">查询</Button>
					<Button icon="md-refresh" style="margin-left: 8px" @click="resetForm()">重置</Button>
					<Button icon="md-add" style="margin-left:10px" type="primary" @click="add()">添加部门</Button>
				</Col>
			</Row>
		</Form>
		<!-- 列表信息 -->
		<div style="border: 1px solid #CCC">
			<Table :columns="columns1" :data="tableData">
				<template #操作="{ row, index }">
					<Button size="small" style="margin-right: 5px" type="primary" @click="update(row)">修改</Button>
					<Poptip
						confirm
						title="此操作将删除选中项，是否继续?"
						@on-ok="remove(row.id)">
						<Button icon="ios-trash" size="small" style="margin-left: 5px" type="error">删除</Button>
					
					</Poptip>
					<Button size="small" style="margin-left: 10px" type="primary" @click="exp(row)">导出</Button>
					<Button size="small" style="margin-left: 10px" type="primary" @click="tb(row)">同步</Button>
				</template>
			</Table>
		</div>
	</Card>
	<Footer style="position: absolute;bottom: .2rem">
		<pagination v-model:pageNo="pageOpt.pageNo" v-model:pageSize="pageOpt.pageSize" :render="getTableData" :total="pageOpt.total" show-elevator show-total/>
	</Footer>
	<!-- 部门添加 -->
	<Modal v-model="modal1.visible" :loading="modal1.loading" :title="modal1.title" footer-hide width="1000" @on-cancel="cancel()">
		<Form ref="addFormRef" :label-width="120" :model="addform" :rules="ruleInline">
			<Row>
				<Col span="12">
					<FormItem label="上级部门" prop="parentSn">
						<Select v-model="addform.parentSn" clearable filterable style="width:100%" @on-change="changeArea1">
							<Option v-for="item in officeArr" :key="item.value" :value="item.value">{{item.title}}</Option>
						</Select>
					
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="部门名称" prop="name">
						<Input v-model="addform.name"></Input>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<FormItem label="归属区域" prop="areaId">
						<Select v-model="addform.areaId" clearable filterable style="width:100%" @on-change="changeArea">
							<Option v-for="item in areaList" :key="item.id" :value="item.id">{{item.name}}</Option>
						</Select>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="区域代码" prop="code">
						<Input v-model="addform.code" readonly></Input>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<FormItem label="部门类型" prop="type">
						<Select v-model="addform.type" clearable filterable style="width:100%">
							<Option v-for="item in officeTypeList" :key="item.value" :value="item.value">{{item.label}}</Option>
						</Select>
					</FormItem>
				</Col>
				<Col>
					<FormItem label="是否开通内网" prop="isFormal">
						<RadioGroup v-model="addform.isFormal">
							<Radio label="0">否</Radio>
							<Radio label="1">是</Radio>
						</RadioGroup>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<FormItem label="负责人" prop="manager">
						<Input v-model="addform.manager"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="联系电话" prop="phone">
						<Input v-model="addform.phone"></Input>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<FormItem label="联系地址" prop="address">
						<Input v-model="addform.address"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="备注" prop="remark">
						<Input v-model="addform.remark" type="textarea"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="LOGO">
						<Upload
							ref="uploadRef"
							:action="imageUpload.action"
							:before-upload="imageUpload.beforeUpload"
							:data="imageUpload.param"
							:disabled="fileUploading"
							:format="['jpg','jpeg','png','ico','svg']"
							:headers="imageUpload.headers"
							:max-size="50000"
							:multiple="false"
							:on-error="imageUpload.uploadError"
							:on-exceeded-size="imageUpload.fileExceededSize"
							:on-format-error="imageUpload.formatError"
							:on-remove="imageUpload.removeFile"
							:on-success="imageUpload.uploadSuccess"
							:show-upload-list="true"
						>
							<div style="display: flex;">
								<Button icon="ios-cloud-upload-outline">上传LOGO</Button>
								<img v-if="addform.logo" :src="global.env.fileUrl+addform.logo" fit="cover" height="50" width="50"/>
								<Spin :show="fileUploading" fix></Spin>
							</div>
						</Upload>
					
					</FormItem>
				</Col>
				<Col v-if="(!addform.parentSn || addform.parentSn == 0)" span="12">
					<FormItem label="是否启用ftp" prop="enableFtp">
						<RadioGroup v-model="addform.enableFtp">
							<Radio :label="false">否</Radio>
							<Radio :label="true">是</Radio>
						</RadioGroup>
					</FormItem>
				</Col>
			</Row>
			<Row v-if="(!addform.parentSn || addform.parentSn == 0) && addform.enableFtp">
				
				<Col span="12">
					<FormItem label="FTP IP" prop="ftpIp">
						<Input v-model="addform.ftpIp"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="FTP 端口号" prop="ftpPort">
						<Input v-model="addform.ftpPort"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="FTP 用户名" prop="ftpUsername">
						<Input v-model="addform.ftpUsername"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="FTP 密码" prop="ftpPassword">
						<Input v-model="addform.ftpPassword"></Input>
					</FormItem>
				</Col>
			</Row>
		</Form>
		<div style="text-align: right">
			<Button :loading="loadingSave" type="primary" @click="save">保存</Button>
			<Button style="margin-left: 8px" @click="cancel">取消</Button>
		</div>
	</Modal>
</template>
<style lang="less" scoped>
.ivu-table-wrapper {
	overflow: visible;
	
	.ivu-table {
		overflow: visible;
	}
}
</style>

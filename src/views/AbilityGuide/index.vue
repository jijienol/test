<script setup="">
import {getList, save, del} from '@/api/AbilityGuide.js';
import {onMounted, reactive, ref, getCurrentInstance, computed, watch} from 'vue';
import Pagination from '@/components/viewui/pagination.vue';
import {dictStore} from '@/store/modules/dictionary.js';

const trackType = trackTypeStore()
const dictS = dictStore()
const {proxy} = getCurrentInstance()

const columns = [
	{
		title: '渠道类别',
		key: 'channelTypeName'
	},
	{
		title: '描述',
		key: 'description',
		minWidth: 300,
	},
	{
		title: '线索类别',
		key: 'traceTypeName'
	}, {
		title: '线索子类',
		key: 'traceSubTypeName'
	}, {
		title: '接口调用方法',
		key: 'solutionCode'
	}, {
		title: '数据返回解析方法',
		key: 'transferCode'
	},
	{
		title: '标签',
		key: 'label'
	},
	{
		title: '操作',
		slot: 'caozuo',
		width: 300,
	}
]
//分页
const pageOpt = reactive({
	total: 0,
	pageNo: 1,
	pageSize: 10
})

// 列表数据
const DataList = ref([])

async function getDataList () {
	let param = {
		pageNo: pageOpt.pageNo,
		pageSize: pageOpt.pageSize,
		...queryFrom
	}
	const res = await getList(param)
	if (res.data.code) {
		pageOpt.total = res.data.data.total
		DataList.value = res.data.data.list
	}
}

const queryFrom = reactive({
	channelType: null,
	traceSubType: null,
	traceType: null,
	
})
const queryFromRef = ref()

// 条件搜索
function handleSearch () {
	pageOpt.pageNo = 1
	getDataList()
}

// 重置搜索条件
function resetForm () {
	queryFrom.channelType = null
	queryFrom.traceSubType = null
	queryFrom.label = null
	queryFrom.traceType = null
	pageOpt.pageNo = 1
	getDataList()
}

const addForm = ref({
	channelType: '',
	description: '',
	label: '',
	traceSubType: '',
	traceType: '',
	key: '',
	value: '',
	transferCode: '',
	solutionCode: ''
})

const modalOpt = reactive({
	visible: false,
	title: ''
})

function update (row) {
	console.log(row)
	modalOpt.visible = true
	modalOpt.title = '修改'
	addForm.value = {
		channelType: row.channelType,
		description: row.description,
		label: row.label,
		traceSubType: row.traceSubType,
		traceType: row.traceType,
		id: row.id,
		key: row.key,
		value: row.value,
		autoFr: row.autoFr,
		transferCode: row.transferCode,
		solutionCode: row.solutionCode
	}
}

function add () {
	modalOpt.visible = true
	modalOpt.title = '添加'
	addForm.value = {
		channelType: '',
		description: '',
		label: '',
		traceSubType: '',
		traceType: '',
		key: '',
		value: '',
		autoFr: null,
		transferCode: '',
		solutionCode: ''
	}
}

async function save1 () {
	if (addForm.value.channelType.length == 0 || addForm.value.description.length == 0 || addForm.value.label.length == 0) {
		proxy.$Message.error('必须选择渠道类别、线索子类、标签')
		return
	}
	
	
	try {
		const res = await save(addForm.value)
		if (res.data.code == 200) {
			modalOpt.visible = false
			proxy.$Message.success('保存成功')
		} else {
			proxy.$Message.error(res.message)
		}
	}
	catch (e) {
		proxy.$Message.error(e.data.message)
	}
	getDataList()
}

async function remove (id) {
	const res = await del(id)
	if (res.data.code == 200) {
		modalOpt.visible = false
		proxy.$Message.success('删除成功')
	} else {
		proxy.$Message.error(res.data.message)
	}
	getDataList()
}

const traceSubTypeList = ref([])
const trackTypeList = computed(() => dictS.dict.trackType.list)
onMounted(() => {
	getDataList()
	dictS.getDict('trackType')
})
const cityList = [
	{
		value: 'drawProof',
		label: '调证能力'
	},
	{
		value: 'offlineDetect',
		label: '线下侦查'
	}
]


import {columns1, columnsOutField, columnsDataType, columnsInField, ruleInlineDataType} from 'src/views/trackType/trackType.js'
import {deleteData, getDataTypeList, saveDataType} from 'src/api/trackType.js'
import {trackTypeStore} from 'src/store/modules/trackType.js'
import {selectChildByParentId} from 'src/api/AbilityGuide.js'

const showDataType = ref(false)

const addformDataType = ref({
	solutionId: '',
	returnType: '',
	sheetName: '',
	targetTable: '',
	columnMap: '',
	sort: '',
	info: ''
})
const updateformDataType = ref({
	solutionId: '',
	returnType: '',
	sheetName: '',
	targetTable: '',
	columnMap: '',
	sort: '',
	info: ''
})
const isAddDataType = ref(false)

function addDataType () {
	addformDataType.value = {
		solutionId: trackType.row.id,
		returnType: '',
		sheetName: '',
		targetTable: '',
		columnMap: '',
		sort: ''
	}
	isAddDataType.value = true
}

const loadingAddDataType = ref(false)
const addformDataTypeRef = ref()
const dataTypeList = ref([])

function dataTypeView (row) {
	console.log(row)
	trackType.row = row
	showDataType.value = true
	getDataType()
}

function getDataType () {
	let params = {
		solutionId: trackType.row.id
	}
	getDataTypeList(params)
		.then((res) => {
			if (res.data.code === 200) {
				dataTypeList.value = res.data.data.list
			} else {
				proxy.$Message.error(res.data.message)
			}
		})
		.catch((err) => {
			proxy.$Message.error(err)
		})
}

function updateDataType (row) {
	updateformDataType.value = {
		id: row.id,
		solutionId: row.solutionId,
		returnType: row.returnType,
		sheetName: row.sheetName,
		targetTable: row.targetTable,
		columnMap: row.columnMap,
		sort: row.sort,
		info: row.info
	}
	isUpdateDataType.value = true
}

const isUpdateDataType = ref(false)

function cancelAddDataType (name) {
	addformDataTypeRef.value.resetFields()
	isAddDataType.value = false
}

function deleteDataType (row) {
	let params = {
		id: row.id
	}
	deleteData(params)
		.then((res) => {
			if (res.data.code === 200) {
				proxy.$Message.success('删除成功')
				getDataType()
			} else {
				proxy.$Message.error(res.data.message)
			}
		})
		.catch((err) => {
			proxy.$Message.error(err)
		})
}

function insertDataType (name) {
	addformDataTypeRef.value.validate((valid) => {
		if (valid) {
			loadingAddDataType.value = true
			const params = Object.assign({}, addformDataType.value)
			saveDataType(params)
				.then((res) => {
					if (res.data.code == '200') {
						addformDataTypeRef.value.resetFields()
						isAddDataType.value = false
						loadingAddDataType.value = false
						proxy.$Message.success('添加成功')
						getDataType()
					} else {
						loadingAddDataType.value = false
						proxy.$Message.error(res.data.message)
					}
				})
				.catch((err) => {
					loadingAddDataType.value = false
					proxy.$Message.error(err)
				})
		}
	})
}

const updateformDataTypeRef = ref()
const loadingUpdateDataType = ref(false)

function cancelUpdateDataType (name) {
	updateformDataTypeRef.value.resetFields()
	isUpdateDataType.value = false
}

function updateSaveDataType (name) {
	updateformDataTypeRef.value.validate((valid) => {
		if (valid) {
			loadingUpdateDataType.value = true
			const params = Object.assign({}, updateformDataType.value)
			saveDataType(params)
				.then((res) => {
					if (res.data.code == '200') {
						getDataType()
						updateformDataTypeRef.value.resetFields()
						isUpdateDataType.value = false
						loadingUpdateDataType.value = false
						proxy.$Message.success('修改成功')
					} else {
						loadingUpdateDataType.value = false
						proxy.$Message.error(res.data.message)
					}
				})
				.catch((err) => {
					loadingUpdateDataType.value = false
					proxy.$Message.error(err)
				})
		}
	})
}

watch(() => modalOpt.visible, (val) => {
	if (!val) {
		traceSubTypeList.value = []
	}
})

function getTrackTypeList (val) {
	trackTypeList.value.forEach(async (item) => {
		if (item.value == val) {
			const res = await selectChildByParentId(item.id)
			console.log(val, res.data.data)
			traceSubTypeList.value = res.data.data
		}
	})
}

watch(() => queryFrom.traceType, (val) => {
	if (val) {
		getTrackTypeList(val)
		
	}
})
watch(() => addForm.value.traceType, (val) => {
	if (val) {
		getTrackTypeList(val)
	}
})
</script>

<template>
	<Card style="width:99%;margin: .1rem;">
		<template #title>
			<div style="display: flex;align-items: center">
				<h2 style="margin-right: .2rem">能力指引管理</h2>
			</div>
		</template>
		<!--    查询-->
		<Form ref="queryFromRef" :model="queryFrom">
			<Row :gutter="30">
				<Col span="4">
					<FormItem prop="username">
						<Select v-model="queryFrom.channelType" clearable filterable  placeholder="选择渠道类别">
							<Option v-for="item in cityList" :key="item.value" :value="item.value">{{item.label}}</Option>
						</Select>
					</FormItem>
				</Col>
				<Col span="4">
					<FormItem prop="no">
						<Input v-model="queryFrom.label" placeholder="标签 "></Input>
					</FormItem>
				</Col>
				<Col span="4">
					<FormItem prop="traceType">
						<Select v-model="queryFrom.traceType" clearable filterable placeholder="选择线索类别">
							<Option v-for="item in trackTypeList" :key="item.id" :value="item.value">{{item.label}}</Option>
						</Select>
					</FormItem>
				</Col>
				<Col span="4">
					<FormItem v-if="queryFrom.traceType" prop="no">
						<Select v-model="queryFrom.traceSubType" clearable filterable placeholder="选择线索子类">
							<Option v-for="item in traceSubTypeList" :key="item.id" :value="item.shortName">{{item.label}}</Option>
						</Select>
					</FormItem>
				</Col>
				
				<Col span="8">
					<Button icon="ios-search" style="margin-left: 8px" type="primary" @click="handleSearch">查询</Button>
					<Button icon="md-refresh" style="margin-left: 8px" @click="resetForm">重置</Button>
					<Button icon="md-add" style="margin-left: 10px" type="primary" @click="add">添加</Button>
				
				</Col>
			</Row>
		</Form>
		<div style="padding: .2rem 0;height: 90vh;overflow: auto;">
			<Table :columns="columns" :data="DataList" border>
				<template #caozuo="{ row, index }">
					<Button style="margin-right: 5px" type="primary" @click="update(row)">修改</Button>
					<Poptip
						confirm
						title="此操作将删除选中项，是否继续?"
						@on-ok="remove(row.id)">
						<Button type="error">删除</Button>
					</Poptip>
					<Button style="margin-left: 5px" type="warning" @click="dataTypeView(row)">配置出参</Button>
				</template>
			</Table>
		</div>
	</Card>
	<Modal v-model="modalOpt.visible" :title="modalOpt.title" footer-hide width="40%">
		<Form :label-width="100" :model="addForm">
			<FormItem label="渠道类别">
				<Select v-model="addForm.channelType" clearable filterable >
					<Option v-for="item in cityList" :key="item.value" :value="item.value">{{item.label}}</Option>
				</Select>
			</FormItem>
			<FormItem label="线索类别">
				<Select v-model="addForm.traceType" clearable filterable placeholder="选择线索类别">
					<Option v-for="item in trackTypeList" :key="item.id" :value="item.value">{{item.label}}</Option>
				</Select>
			</FormItem>
			<FormItem v-if="addForm.traceType" label="线索子类别">
				<Select v-model="addForm.traceSubType" clearable filterable placeholder="选择线索子类">
					<Option v-for="item in traceSubTypeList" :key="item.id" :value="item.shortName">{{item.label}}</Option>
				</Select>
			</FormItem>
			<FormItem label="标签">
				<Input v-model="addForm.label"></Input>
			</FormItem>
			<FormItem label="关键字">
				<Input v-model="addForm.key"></Input>
			</FormItem>
			<FormItem label="关键值">
				<Input v-model="addForm.value"></Input>
			</FormItem>
			<FormItem label="自动发起">
				<RadioGroup v-model="addForm.autoFr">
					<Radio :label="1">是</Radio>
					<Radio :label="0">否</Radio>
				</RadioGroup>
			</FormItem>
			<FormItem label="接口调用方法">
				<Input v-model="addForm.solutionCode"></Input>
			</FormItem>
			<FormItem label="数据返回解析方法">
				<Input v-model="addForm.transferCode"></Input>
			</FormItem>
			<FormItem label="描述">
				<Input v-model="addForm.description" :autosize="{minRows: 2,maxRows: 5}" type="textarea"></Input>
			</FormItem>
		</Form>
		<div style="text-align: right">
			<Button style="margin-right: .1rem" type="primary" @click="save1">保存</Button>
			<Button style="margin-right: .1rem" @click="modalOpt.visible = false">关闭</Button>
		</div>
	</Modal>
	
	
	<!-- 数据类型列表 -->
	<Drawer v-model="showDataType" :closable="false" :scrollable="true" class="DrawerRc" title="数据类型列表" width="30%">
		<div>
			<Button icon="md-add" style="margin-bottom: 10px" type="primary" @click="addDataType">添加</Button>
			<Table :columns="columnsDataType" :data="dataTypeList" :loading="loadingDataType" border>
				<template #操作="{ row, index }">
					<Button size="small" type="primary" @click="updateDataType(row)">修改</Button>
					<Poptip
						confirm
						title="此操作将删除选中项，是否继续?"
						@on-ok="deleteDataType(row)">
						<Button size="small" style="margin-left: 5px" type="error">删除</Button>
					</Poptip>
				
				</template>
			</Table>
		</div>
	</Drawer>
	<!-- 数据类型添加 -->
	<Modal
		v-model="isAddDataType"
		:scrollable="false"
		footer-hide
		title="数据类型添加"
		width="1000"
		@on-cancel="cancelAddDataType('addformDataType')"
	>
		<Form ref="addformDataTypeRef" :label-width="160" :model="addformDataType" :rules="ruleInlineDataType">
			<Row>
				<Col span="12">
					<FormItem label="方案返回对象类型" prop="returnType">
						<Input v-model="addformDataType.returnType"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="表格sheet名称" prop="sheetName">
						<Input v-model="addformDataType.sheetName"></Input>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<FormItem label="数据存储目标库" prop="targetTable">
						<Input v-model="addformDataType.targetTable"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="排序" prop="sort">
						<Input v-model="addformDataType.sort" type="number"></Input>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<FormItem label="数据信息说明" prop="info">
						<Input v-model="addformDataType.info"></Input>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="24">
					<FormItem label="字段映射json" prop="columnMap">
						<Input v-model="addformDataType.columnMap" class="json-text" type="textarea"></Input>
					</FormItem>
				</Col>
			</Row>
		</Form>
		<div style="text-align: right">
			<Button :loading="loadingAddDataType" type="primary" @click="insertDataType('addformDataType')">保存</Button>
			<Button style="margin-left: 8px" @click="cancelAddDataType('addformDataType')">取消</Button>
		</div>
	</Modal>
	<!-- 数据类型修改 -->
	<Modal
		v-model="isUpdateDataType"
		:scrollable="false"
		footer-hide
		title="数据类型修改"
		width="1000"
		@on-cancel="cancelUpdateDataType('updateformDataType')"
	>
		<Form ref="updateformDataTypeRef" :label-width="160" :model="updateformDataType" :rules="ruleInlineDataType">
			<Row>
				<Col span="12">
					<FormItem label="方案返回对象类型" prop="returnType">
						<Input v-model="updateformDataType.returnType"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="表格sheet名称" prop="sheetName">
						<Input v-model="updateformDataType.sheetName"></Input>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<FormItem label="数据存储目标库" prop="targetTable">
						<Input v-model="updateformDataType.targetTable"></Input>
					</FormItem>
				</Col>
				<Col span="12">
					<FormItem label="排序" prop="sort">
						<Input v-model="updateformDataType.sort" type="number"></Input>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="12">
					<FormItem label="数据信息说明" prop="info">
						<Input v-model="updateformDataType.info"></Input>
					</FormItem>
				</Col>
			</Row>
			<Row>
				<Col span="24">
					<FormItem label="字段映射json" prop="columnMap">
						<Input v-model="updateformDataType.columnMap" class="json-text" rows="50" type="textarea"></Input>
					</FormItem>
				</Col>
			</Row>
		</Form>
		<div style="text-align: right">
			<Button :loading="loadingUpdateDataType" type="primary" @click="updateSaveDataType('updateformDataType')">
				保存
			</Button>
			<Button style="margin-left: 8px" @click="cancelUpdateDataType('updateformDataType')">取消</Button>
		</div>
	</Modal>
	<Footer style="position: absolute;bottom: .2rem">
		<pagination v-model:pageNo="pageOpt.pageNo" v-model:pageSize="pageOpt.pageSize" :render="getDataList" :total="pageOpt.total" show-elevator show-total/>
	</Footer>
</template>
<style lang="less" scoped>
.ivu-table-wrapper {
	overflow: visible;
	
	.ivu-table {
		overflow: visible;
		
	}
}
</style>

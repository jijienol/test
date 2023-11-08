<script setup>
import {reactive, ref, getCurrentInstance, onMounted} from 'vue';
import Pagination from '../../components/viewui/pagination.vue';
import {deleteDict, dictList, getTypeList, saveDict, selectDictList} from '../../api/dict.js';

const {proxy} = getCurrentInstance()
const queryForm = ref({
	type: '',
	label: ''
})
const pageOpt = reactive({
	pageSize: 10,
	pageNo: 1,
	total: 0
})
const columns1 = [
	{
		title: '键值',
		minWidth: 85,
		tooltip: true,
		key: 'value'
	},
	{
		title: '标签',
		minWidth: 85,
		tooltip: true,
		key: 'label'
	},
	{
		title: '类型',
		minWidth: 100,
		tooltip: true,
		key: 'type'
	},
	{
		title: '描述',
		minWidth: 120,
		tooltip: true,
		key: 'description'
	},
	{
		title: '操作',
		minWidth: 85,
		slot: '操作'
	}
]
const ruleInline = {
	value: [
		{required: true, message: '键值不能为空', trigger: 'blur'}
	],
	label: [
		{required: true, message: '标签不能为空', trigger: 'blur'}
	],
	type: [
		{required: true, message: '类型不能为空', trigger: 'blur'}
	],
	description: [
		{required: true, message: '描述不能为空', trigger: 'blur'}
	],
	sort: [
		{required: true, message: '排序不能为空'}
	]
}
const tableData = ref([])
const addform = ref({
	id: '',
	value: '',
	label: '',
	type: '',
	description: '',
	sort: '',
	parentId: null,
	property: '',
	remark: ''
})
const modal1 = reactive({
	visible: false,
	title: '',
	loading: false
})

// 加载列表
function getTableData () {
	let data = {
		type: queryForm.value.type,
		label: queryForm.value.label,
		pageNo: pageOpt.pageNo,
		pageSize: pageOpt.pageSize
	}
	dictList(data).then((res) => {
		if (res.data.code === 200) {
			tableData.value = res.data.data.list
			pageOpt.total = res.data.data.total
		} else {
			proxy.$Message.info(res.data.message)
		}
	})
}

const formRef = ref()

const typeList = ref([])

function findTypeList () {
	getTypeList().then((res) => {
		if (res.data.code == 200) {
			typeList.value = res.data.data
			typeList.value.unshift({
				description: '案件类别',
				type: 'detectCaseType',
				id: '11'
			})
			
		} else {
			proxy.$Message.info(res.data.message)
		}
	})
}

// 条件搜索
function handleSearch () {
	pageOpt.pageNo = 1
	getTableData()
}

// 重置搜索条件
function resetForm () {
	formRef.value.resetFields()
	pageOpt.pageNo = 1
	getTableData()
}

const addformRef = ref()

function cancel () {
	addformRef.value.resetFields()
	modal1.visible = false
}

function add () {
	modal1.visible = true
	modal1.title = '添加字典'
}

const data1 = ref([])

function recursion (arr) {
	arr.forEach(item => {
		data1.value.push(item)
		if (item.children) {
			recursion(item.children)
		}
	})
	
}


function getSelectDictList () {
	selectDictList().then((res) => {
		if (res.data.code === 200) {
			data1.value = []
			recursion(res.data.data)
		} else {
			proxy.$Message.info(res.data.message)
		}
	})
}

function update (row) {
	modal1.visible = true
	modal1.title = '修改字典'
	addform.value = Object.assign({}, {
		id: row.id,
		value: row.value,
		label: row.label,
		type: row.type,
		description: row.description,
		sort: row.sort,
		property: row.property,
		parentId: row.parentId === '0' ? null : row.parentId,
		remark: row.remark
	})
}

const loadingSave = ref(false)
const defaultform = {
	id: '',
	value: '',
	label: '',
	type: '',
	description: '',
	sort: '',
	parentId: null,
	property: '',
	remark: ''
}

function save (name) {
	addformRef.value.validate((valid) => {
		if (valid) {
			loadingSave.value = true
			if (addform.value.parentId === null || addform.value.parentId === '' || addform.value.parentId === undefined) {
				addform.value.parentId = '0'
			}
			const params = Object.assign({}, addform.value)
			saveDict(params).then((res) => {
				if (res.data.code === 200) {
					proxy.$Message.success('保存成功')
					addform.value = Object.assign({}, defaultform)
					addformRef.value.resetFields()
					modal1.visible = false
					loadingSave.value = false
					getTableData()
				} else {
					proxy.$Message.info(res.data.message)
				}
			}).catch((err) => {
				loadingSave.value = false
				proxy.$Message.error(err.data.message)
				
			})
		}
	})
}

function remove (id) {
	let params = {
		id: id
	}
	deleteDict(params).then((res) => {
		if (res.data.code === 200) {
			proxy.$Message.info('删除成功')
			getTableData()
		} else {
			proxy.$Message.info(res.data.message)
		}
	})
}

onMounted(() => {
	getTableData()
	findTypeList()
	getSelectDictList()
})
</script>
<script>
export default {
	name: 'dict'
}

</script>
<template>
	<!-- 查询条件 -->
	<Card style="width:99%;margin: .1rem">
		<template #title>
			<div style="display: flex;align-items: center;justify-content: space-between">
				<h2 style="margin-right: .2rem">字典信息管理
				</h2>
			</div>
		</template>
		<Form ref="formRef" :model="queryForm">
			<Row :gutter="30">
				<Col span="6">
					<FormItem prop="type">
						<Select v-model="queryForm.type" clearable filterable placeholder="请选择" style="width:100%" @on-clear="resetForm">
							<Option v-for="item in typeList" :key="item.id" :value="item.type">{{item.type}}&nbsp;{{item.description}}</Option>
						</Select>
					</FormItem>
				</Col>
				<Col span="6">
					<FormItem prop="label">
						<Input v-model="queryForm.label" placeholder="填写标签"></Input>
					</FormItem>
				</Col>
				<Col span="6">
					<Button icon="ios-search" style="margin-left: 8px" type="primary" @click="handleSearch">查询</Button>
					<Button icon="md-refresh" style="margin-left: 8px" @click="resetForm">重置</Button>
					<Button icon="md-add" style="margin-left:10px" type="primary" @click="add">添加字典</Button>
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
						<Button size="small" type="error">删除</Button>
					</Poptip>
				</template>
			</Table>
		</div>
	</Card>
	<Footer style="position: absolute;bottom: .2rem">
		<pagination v-model:pageNo="pageOpt.pageNo" v-model:pageSize="pageOpt.pageSize" :render="getTableData" :total="pageOpt.total" show-elevator show-total/>
	</Footer>
	<!-- 字典添加 -->
	<Modal v-model="modal1.visible" :loading="modal1.loading" :title="modal1.title" footer-hide width="600" @on-cancel="cancel">
		<Form ref="addformRef" :label-width="80" :model="addform" :rules="ruleInline">
			<FormItem label="父级字典" prop="parentId">
				<Select v-model="addform.parentId" clearable filterable placeholder="请选择">
					<Option v-for="item in data1" :key="item.id" :value="item.id">{{item.label}}&nbsp;</Option>
				</Select>
			</FormItem>
			<FormItem label="键值" prop="value">
				<Input v-model="addform.value"></Input>
			</FormItem>
			<FormItem label="标签" prop="label">
				<Input v-model="addform.label"></Input>
			</FormItem>
			<FormItem label="类型" prop="type">
				<Input v-model="addform.type"></Input>
			</FormItem>
			<FormItem label="描述" prop="description">
				<Input v-model="addform.description"></Input>
			</FormItem>
			<FormItem label="排序" prop="sort">
				<Input v-model="addform.sort" type="number"></Input>
			</FormItem>
			<FormItem label="其他" prop="property">
				<Input v-model="addform.property"></Input>
			</FormItem>
			<FormItem label="备注" prop="remark">
				<Input v-model="addform.remark" type="textarea"></Input>
			</FormItem>
		</Form>
		<div style="text-align: right">
			<Button :loading="loadingSave" type="primary" @click="save('addform')">保存</Button>
			<Button style="margin-left: 8px" @click="cancel('addform')">取消</Button>
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

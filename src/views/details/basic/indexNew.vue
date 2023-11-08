<!-- 线下能力 -->
<script setup>
import {ref, reactive, getCurrentInstance, watch, nextTick, onMounted, computed} from 'vue';
import {storeToRefs} from 'pinia';
import {ajListStore} from '@/store/modules/ajList.js';
import {swdtStore} from '@/store/modules/swdt.js';
import {globalStore} from '@/store/modules/global.js';
import {getOfflineAbility, getAttachmentJson, insertAttachment, delAttachment, insertAttachmentBd, updateOfflineFile} from '@/api/details.js';
import fileUtil from '@/utils/fileSaver.js'
import attathUpload from '@/components/fileUpload/attachUpload2.vue'
import bdTable from '../components/exceljson.vue'
import Pagination from '@/components/viewui/pagination.vue'
import dropComp from '../components/detailContextMenu.vue'
import {noteStore} from '@/store/modules/note.js';
import {noteTableInfo} from '../../../utils/note.js';
import {dictStore} from '@/store/modules/dictionary.js';
import vTableDrag from '@/directives/tableDrag.js';
import clip from '@/components/clipboard.vue'
import ipCollision from '../components/ipCollision.vue'
import {reg_ip} from '@/utils/regExp.js';
import bus from 'vue3-eventbus';

const clipRef = ref(null)
const note = noteStore()
const ajStore = ajListStore()
const swdt = swdtStore()
const global = globalStore()
const dict = dictStore()
const {proxy} = getCurrentInstance()
let {traceTypeOptions, traceInfo} = storeToRefs(ajStore)
const bdTableRef = ref(null)
const solutionTypes = ref([])

/*dict.getDict('xxzc_dbsx').then(res => {
 solutionTypes.value = res
 })*/
const Sort = reactive({
	sortType: '',
	sortKey: '',
	tableDefaultSort: {},
	orderBy: computed(() => {
		if (Sort.sortType && Sort.sortKey) {
			return Sort.sortKey + ' ' + Sort.sortType
		} else {
			return ''
		}
	}),
	sortHandler: (c) => {
		if (c.order == 'normal') {
			return false
		}
		Sort.sortType = c.order
		
		Sort.sortKey = c.key
		
		File.getFileData()
		/*Sort.tableOrderMap.forEach(o => {
		 if(o.name == c.column.targetTable) {
		 o.value = c.order
		 }
		 })*/
		// console.log('Sort',Sort);
	}
})
const props = defineProps({
	id: {
		type: String,
		default: ''
	},
	traceId: {
		type: String,
		default: ''
	},
	taskId: {
		type: String,
		default: ''
	},
	taskChannelList: {
		type: Array,
		default: []
	},
	task: {
		type: Object,
		default: {}
	},
	type: {
		type: String,
		default: ''
	}
})
const modalOpt = reactive({
	upload: {
		visible: false,
		title: '',
		param: {
			taskChannelId: '',
			caseId: '',
			channelSolutionExtendId: '',
			detectType: ''
		},
		close: () => {
			modalOpt.upload.visible = false
		},
		finish: (data) => {
			if (data) {
				modalOpt.upload.param.taskChannelId = data
				Data.taskChannelId = data
				ajStore.setDeepDetectParam({traceTaskChannelId: data})
				ajStore.modifyAbilityTabList(props.id, 'taskId', data)
			}
			
			// solutionVal.value = ''
			getFileList()
			swdt.getData(ajStore.caseId)
			// modalOpt.upload.visible = false
			/*Data.insertParam = res
			 modalOpt.upload.visible = false
			 // 打开数据碰撞标记
			 modalOpt.bd.param.id = res.url
			 modalOpt.bd.param.type = '1'
			 modalOpt.bd.visible = true*/
			// insert()
		}
	},
	bd: {
		visible: false,
		param: {
			id: '',
			type: '1'
		},
		inertLoading: false,
		callback: (res) => {
			// console.log('bdcallback', res);
		}
	},
	ipc: {
		visible: false,
		title: '',
		param: {
			caseId: '',
			ip: '',
			virtualId: ''
		},
		open () {
			// 判断是否ip
			
			// this.cell = row[_column[ind].key]
			let k = File.colSelected.targetColumn
			let p = File.row[k]
			if (reg_ip(p)) {
				modalOpt.ipc.title = p + ' C段碰撞'// ?是否要全路径展示，label + 表名 + ip
				modalOpt.ipc.param = {
					caseId: ajStore.caseId,
					ip: p,
					virtualId: File.row.id
				}
				modalOpt.ipc.visible = true
			} else {
				proxy.$Message.warning('只有ip才能进行C段碰撞')
			}
			
		}
	}
	
})
const flag = ref(false)
const Data = reactive({
	fileTypelList: [],
	insertParam: {
		type: '', // 方案类别
		name: '',
		url: '', // 文件地址
		subType: '', // 0调证函 1 调证返回文件
		data: [],
		fieldList: [],
		// content: '',
		caseId: '',
		ext: '', // 文件后缀
		// keyName: '', // 主键列名,
		taskSubType: '', // 0 单个任务 1 批量任务
		taskChannelId: '', // 单个任务的taskChannelId
		// multiId: '' // 批量任务的multiId
	},
	solution: '',
	taskChannelId: '',
	resetActive: () => { // 清空样式
		Data.fileTypelList.forEach(d => {
			if (d.fileList && d.fileList.length) {
				d.fileList.forEach(f => {
					f.active = false
				})
			}
		})
	},
	detail: (file) => {
		flag.value = !flag.value
		File.pageOpt.pageNo = 1
		File.fileSelected = file
		Data.resetActive()
		File.url = file.url
		File.id = file.id
		File.name = file.name
		File.subType = file.subType
		File.channelExtendId = file.channelExtendId
		File.solutionLabel = file.solutionLabel
		File.getFileData('qie')
		file.active = true
	},
})
const fileLoading = ref(false)
const fileTableRef = ref(null)
const File = reactive({
	rowClassName: (row, index) => {
		if (row.markNum > 0) {
			return 'demo-table-info-row'
		} else {
			return ''
		}
	},
	fileSelected: null,
	id: '',
	url: '',
	subType: '',
	channelExtendId: '',
	pageOpt: {
		pageNo: 1,
		pageSize: 10,
		total: 0,
	},
	query: {// 请求参数
		attachmentId: '',
		pageNo: 0,
		pageSize: 0,
		orderBy: ''
	},
	name: '',
	solutionLabel: '',
	table: [],
	columns: [],
	loading: false,
	colIndex: 0,
	colSelected: '',
	row: '',
	getFileData: (val) => {
		// console.log(val)
		File.table = []
		File.columns = []
		let param = File.query
		param.attachmentId = File.id
		param.pageNo = File.pageOpt.pageNo
		param.pageSize = File.pageOpt.pageSize
		param.orderBy = Sort.orderBy
		console.log(val)
		if (val != 'qie') {
			
			if (query.value.key) {
				param.extend = {[query.value.key]: query.value.value}
			}
		} else if (val == 'qie') {
			param.extend = null
			query.value = {
				key: '',
				value: ''
			}
		}
		let _sortKey = Sort.sortKey
		let _sortType = Sort.sortType
		fileLoading.value = true
		getAttachmentJson(param).then(res => {
			let {code, data} = res.data;
			File.pageOpt.total = data.pageInfo.total
			if (code == 200) {
				
				let _fields = data.fieldList
				let _column = []
				let filter = ['extend', 'note', 'mark', 'case_id', 'task_channel_id', 'id']
				_fields.forEach(item => {
					if (!filter.includes(item.targetCode)) {
						let field = {
							align: 'center',
							tooltip: false,
							title: item.fieldName,
							key: item.targetCode,
							width: 'auto',
							minWidth: 230,
							// collisionType: 'file',
							// targetTable: 'ii_attachment', // ii_attachment
							targetColumn: item.targetCode,
							dataType: item.dataType,
							renderHeader: '',
							sortable: true
						}
						if (field.sortable) {
							if (_sortKey && field.targetColumn == _sortKey) {
								field.sortType = _sortType
							} else {
								field.sortType = ''
							}
						}
						if (item.collision == 1) {
							let label = ajStore.getTraceType(item.dataType)
							let signedLabel = '(' + label + ')'
							field.renderHeader = (h, column) => {
								return h('span', {
										style: {
											marginRight: '5px',
											color: '#19BE6B',
											backgroundColor: '#EFF9FF'
										}
									},
									item.fieldName + signedLabel)
							}
						}
						_column.push(field)
					}
				})
				
				_column.push({
					align: 'center',
					tooltip: false,
					title: '标识',
					key: 'EXTEND',
					width: 230,
					minWidth: 180,
					collisionType: 'file',
					dataType: '',
					renderHeader: '',
					fixed: 'right',
					slot: 'EXTEND',
					className: 'EXTEND'
				})
				_column = proxy.$lodash.sortBy(_column, col => {
					return col.collision == 1
				})
				File.columns = _column
				File.table = data.pageInfo.list
				// console.log(data.pageInfo.list);
				// console.log(File.columns);
				fileLoading.value = false
				
			} else {
				proxy.$Message.error(data.message)
				fileLoading.value = false
			}
			
		}).catch(err => {
			fileLoading.value = false
		})
	},
	cellContextHandler: (row, event) => { // 单元格右击事件
		let pageX = event.pageX
		let except = ['noteNum', 'extend', 'virtualId', 'signNum', 'tableName']
		
		let colIndex = 0
		if (fileTableRef.value) {
			colIndex = File.getIndex(fileTableRef.value, pageX)
		}
		let col = File.columns[colIndex]
		File.colIndex = colIndex
		File.colSelected = col
		File.row = row
		swdt.deepParams.traceName = row[col.key].trim()
		note.traceName = row[col.key]
		note.virtualId = row.id
		note.rowInfo = JSON.stringify(noteTableInfo(File.row, File.columns, File.name))
	},
	cellClick: (row, column, v, event) => { // 单元格左击事件
		if (column.key != 'EXTEND') {
			clipRef.value.copy(v)
		}
		
	},
	getIndex: (tableObj, pageX) => {
		
		let arr = []
		let leftPx = ''
		for (let i in tableObj.columnsWidth) {
			let msg = {}
			if (i == 0) {
				msg = {
					index: i,
					startWidth: 0,
					endWidth: tableObj.columnsWidth[i].width
				}
			} else {
				msg = {
					index: i,
					startWidth: arr[i - 1].endWidth,
					endWidth: tableObj.columnsWidth[i].width + arr[i - 1].endWidth
				}
			}
			arr.push(msg)
		}
		leftPx = pageX - tableObj.$el.getBoundingClientRect().left
		let scrollLeft = tableObj.$refs.body.scrollLeft
		for (let i in arr) {
			if (leftPx < arr[i].endWidth - scrollLeft) {
				return i
			}
		}
	},
})
/*watch(() => [...props.taskChannelList], (n) => {
 console.log(n);
 Data.taskChannelList = n
 })*/
watch(() => props.traceId, (n, o) => {
	empty()
	if (n && n != o && props.type == 'offlineDetect') getFileList()
}, {immediate: true})

// 上传文件弹窗
function uploadFile (id, label) {
	Data.solution = id || ''
	Data.solution = Data.solution ? Data.solution : Data.fileTypelList[Data.fileTypelList.length - 1].id
	modalOpt.upload.title = '上传' + (label || '') + '文件'
	modalOpt.upload.param = {
		taskChannelId: props.taskId || traceInfo.value.traceTaskChannelId,
		caseId: ajStore.caseId,
		channelSolutionExtendId: Data.solution,
		traceId: props.traceId,
		detectType: 'offlineDetect'
	}
	// console.log(modalOpt.upload.param);
	solutionVal.value = Data.solution
	modalOpt.upload.visible = true
	
	
}

function insert () {
	if (modalOpt.bd.param.type == '1') {
		insertFirst()
	} else if (modalOpt.bd.param.type == 2) {
		insertTwice()
	}
}

// 上传文件
function insertFirst () {
	let fields = bdTableRef.value.Data.originColumns
	let bdColumns = bdTableRef.value.Data.bdColumns
	// console.log(bdTableRef.value.Data);
	/*if(bdColumns.length == 0) { // 没有标记任何列
	 modalOpt.bd.visible = false
	 return false
	 }*/
	if (bdColumns.length) {
		fields.forEach(item => {
			bdColumns.forEach(b => {
				if (item.targetCode == b.key) {
					item.collision = 1
					item.dataType = b.bdData
				}
			})
		})
	}
	
	let param = Object.assign({}, Data.insertParam)
	param.channelSolutionExtendId = solutionVal.value || Data.solution
	param.taskChannelId = props.taskId || traceInfo.value.traceTaskChannelId
	param.traceId = props.traceId
	param.caseId = ajStore.caseId
	param.fieldList = fields
	param.data = null
	param.type = props.type
	// console.log(bdTableRef.value.Data);
	// console.log('insert',param);
	modalOpt.bd.inertLoading = true
	insertAttachment(param).then(res => {
		// console.log(res);
		let {code, data} = res.data
		if (code == 200) {
			if (data) {
				Data.taskChannelId = data
				ajStore.setDeepDetectParam({traceTaskChannelId: data})
				ajStore.modifyAbilityTabList(props.id, 'taskId', data)
				proxy.$Message.success('保存成功！')
				modalOpt.bd.visible = false
				modalOpt.bd.inertLoading = false
				solutionVal.value = ''
				getFileList()
				swdt.getData(ajStore.caseId)
			} else {
				proxy.$Message.error('出现未知错误！')
				modalOpt.bd.inertLoading = false
			}
			
		} else {
			modalOpt.bd.inertLoading = false
		}
		
		// 如果没有taskChannelId,
	}).catch(err => {
		console.log(err);
		modalOpt.bd.inertLoading = false
		proxy.$Message.error('出现未知错误')
	})
}

function insertTwice () {
	modalOpt.bd.inertLoading = true
	let fields = bdTableRef.value.Data.originColumns
	let bdColumns = bdTableRef.value.Data.bdColumns
	if (bdColumns.length) {
		fields.forEach(item => {
			bdColumns.forEach(b => {
				if (item.targetCode == b.key) {
					item.collision = 1
					item.dataType = b.bdData
				}
			})
		})
	} else {
		modalOpt.bd.visible = false
		modalOpt.bd.inertLoading = false
	}
	
	let param = Object.assign({}, Data.insertParam)
	param.channelSolutionExtendId = File.channelExtendId
	param.taskChannelId = props.taskId || traceInfo.value.traceTaskChannelId
	param.traceId = props.traceId
	param.caseId = ajStore.caseId
	param.fieldList = fields
	param.data = undefined
	param.type = props.type
	param.name = File.name
	param.subType = File.subType
	param.url = File.url
	param.attachmentId = File.id
	insertAttachmentBd(param).then(res => {
		// console.log(res);
		let {code, data} = res.data
		if (code == 200) {
			modalOpt.bd.visible = false
			modalOpt.bd.inertLoading = false
			Data.detail(File.fileSelected)
		} else {
			proxy.$Message.error(res.data.message)
			modalOpt.bd.visible = false
			modalOpt.bd.inertLoading = false
		}
		
	}).catch(err => {
		console.log(err);
		proxy.$Message.error('出现未知错误')
		modalOpt.bd.inertLoading = false
	})
}

function getFileList () { // 获取文件列表， 默认打开第一个
	Data.fileTypelList = []
	// traceId     taskChannelId
	let traceId = props.traceId
	let taskId = props.taskId || traceInfo.value.traceTaskChannelId
	let channelType = props.type
	getOfflineAbility({traceId: traceId, taskChannelId: taskId, channelType: channelType}).then(res => {
		let {code, data} = res.data;
		let _list = []
		if (code == 200) {
			data.forEach(d => {
				if (d.fileList && d.fileList.length) {
					d.fileList.forEach(f => {
						f.active = false
						f.solutionLabel = d.offLineTaskLabel
					})
				} else {
					d.fileList = []
				}
				d.link = ''
				let desc = d.description
				if (desc) {
					if (desc.charAt(desc.length - 1) == '#') {
						d.description = d.description.slice(0, -1);
					} else {
						let _arr = desc.split('#')
						d.description = _arr[0]
						d.link = _arr[1]
					}
				}
				
				_list.push({
					link: d.link,
					description: d.description,
					id: d.channelSolutionExtendId,
					label: d.offLineTaskLabel,
					value: d.offLineTaskValue,
					fileList: d.fileList,
					active: false
				})
			})
			Data.fileTypelList = _list
			let _sa = []
			_list.forEach((i) => {
				_sa.push({label: i.label, value: i.id})
			})
			solutionTypes.value = _sa
			nextTick(() => {
				if (Data.fileTypelList.length) {// 默认打开第一类的第一个文件
					let fileType = proxy.$lodash.find(Data.fileTypelList, o => {
						return o.fileList.length > 0
					})
					if (fileType) {
						Data.detail(fileType.fileList[0])
					}
				}
			})
		}
	})
}

// Extend slot 操作
const task = note.dblData
const Ext = reactive({
	collision: (row) => {
		swdt.openCollisionList(File, row)
	},
	sign: (row) => {
		task.virtualId = row.id
		note.openSign('xianxia', task.caseId, task.id, task.virtualId)
	},
	note: (row) => {
		task.virtualId = row.id
		note.openList(task, 'biao')
	}
})

function contextMenuCallback (res) {
	
	const task = note.dblData
	task.taskChannelId = File.row.task_channel_id
	task.sourceType = File.row.tableName
	task.virtualId = File.row.id
	task.rowInfo = JSON.stringify(noteTableInfo(File.row, File.columns, File.name))
	// console.log(res);
	// console.log(File);
	// console.log(task);
	if (res == 'note') {
		note.openList(task)
	} else if (res == 'deep') {
		// console.log(File.colSelected);
		// console.log(task);
		task.deepTrackType = File.colSelected.dataType
		swdt.openDeep(task)
	} else if (res.indexOf('collision') != -1) {
		// console.log(File.colIndex);
		// console.log(File.colSelected);
		let k = File.colSelected.targetColumn
		let t = res.split('_')[1]
		// console.log(File.row[k]);
		ajStore.setTraceItem({
			'traceName': File.row[k],
			'traceId': props.traceId,
			'caseId': ajStore.caseId,
			'taskChannelId': File.row.task_channel_id,
			'traceType': t
		})
		ajStore.setTraceListVisible(true)
	} else if (res == 'ipc') {
		// console.log(res);
		modalOpt.ipc.open()
	} else {
		note.addOpenSign(res, task, File)
	}
}

const Operate = reactive({
	btnActive: '',
	btnList: [
		{label: '全部', value: '', active: true},
		{label: '碰撞', value: '', active: false},
		{label: '笔记', value: '', active: false},
		{label: '标定', value: '', active: false},
	],
	btnLoading: false,
	btnHandler: (btn, i) => {
		// console.log(i);
		if (i === Operate.btnActive) {
			return
		} else {
			Operate.btnActive = i
			
			// btn.active = true
			Operate.filterQuery()
		}
	},
	filterQuery: () => { // 按条件过滤
	
	},
	edit: () => { // 二次标记
		modalOpt.bd.param.id = File.id
		modalOpt.bd.param.type = '2'
		modalOpt.bd.visible = true
	},
	download: () => {
		let url = global.env.fileUrl + (File.url.startsWith('/') ? File.url : '/' + File.url)
		
		fileUtil.save(File.name, url)
	},
	del: () => { // 删除
		// 删除后清空File.id，并刷新文件列表
		Operate.btnLoading = true
		delAttachment({id: File.id}).then(res => {
			let {code, data} = res.data
			if (code == 200) {
				proxy.$Message.success('删除成功')
				Operate.btnLoading = false
				File.id = ''
				getFileList()
			} else {
				Operate.btnLoading = false
			}
		})
	},
	delCancel () {
	
	}
	
})

function empty () {
	Data.fileTypelList = []
	Data.solution = ''
	Data.taskChannelId = ''
	File.table = []
	File.columns = []
	File.fileSelected = null
	File.url = ''
	File.id = ''
	File.subType = ''
	File.name = ''
	File.solutionLabel = ''
	File.pageOpt.pageNo = 1
}

onMounted(() => {
	empty()
})
// 刷新列表
bus.on('table', (param) => {
	let arr = []
	if (param == 'note') {
		if (note.addNoteParams.rowInfo) {
			arr = JSON.parse(note.addNoteParams.rowInfo)
			let idObj = arr.find(o => {
				return o.id
			})
			File.table.forEach(d => {
				// noteNum
				if (d.ID == idObj.id || d.id == idObj.id || d.virtualId == idObj.id) {
					d.noteNum = d.noteNum + 1
				}
			})
		}
		
	} else if (param == 'sign') {
		if (note.addSign.rowInfo) {
			arr = JSON.parse(note.addSign.rowInfo)
			// markNum
			let idObj = arr.find(o => {
				return o.id
			})
			File.table.forEach(d => {
				// noteNum
				if (d.ID == idObj.id || d.id == idObj.id || d.virtualId == idObj.id) {
					d.markNum = d.markNum + 1
				}
			})
		}
		
	}
})

const solutionVal = ref('')

function solutionSel (val) {
	// console.log(val.value);
	// Data.solution = val.value
	// console.log(Data.solution);
	modalOpt.upload.param.channelSolutionExtendId = val.value
	
}

const dragItemId = ref()
const dragItemIndex = ref()
const dragEndItemId = ref()

function dragstart (parent, i) {
	dragItemId.value = parent.id
	dragItemIndex.value = i
}

function handleDragOver (ev) {
	ev.preventDefault()
}

function handleDrop (parent, i) {
	
	if (dragItemId.value !== null && dragItemIndex.value !== null) {
		let enterPnode = Data.fileTypelList.find(obj => obj.id === dragEndItemId.value)
		
		if (dragItemId.value != dragEndItemId.value) {
			const leaveList = Data.fileTypelList.find(obj => obj.id === dragItemId.value).fileList;
			const enterList = enterPnode.fileList;
			const dragItem = leaveList[i];
			// console.log(dragItem);
			let attachmentIdList = [dragItem.id]
			let channelSolutionExtendId = dragEndItemId.value
			updateOfflineFile({attachmentIdList: attachmentIdList, channelSolutionExtendId: channelSolutionExtendId}).then(res => {
				// console.log(res);
				let {code, data} = res.data;
				if (code == 200) {
					enterList.push(dragItem) // 修改extendId
					leaveList.splice(i, 1)
					
				}
				enterPnode.active = false
			})
			/*enterList.push(dragItem) // 修改extendId
			 leaveList.splice(i, 1)*/
			
		} else {
			enterPnode.active = false
		}
		
	}
}

function dragEnterHandler (pNode) {
	// console.log('enter_' + pNode.id);
	// ev.preventDefault();
	dragEndItemId.value = pNode.id
	pNode.active = true
}

function dragLeaveHandler (pNode) {
	// console.log('leave_' + id);
	// ev.preventDefault();
	pNode.active = false
}

const query = ref({
	key: '',
	value: ''
})
const queryCom = (val) => {
	if (val === 'cz') {
		query.value.key = ''
		query.value.value = ''
		File.getFileData()
		return
	}
	// console.log(query.value)
	if (!query.value.key) {
		proxy.$Message.error('请选择表头参数')
		return
	} else if (!query.value.value) {
		proxy.$Message.error('请输入查询参数')
		return
	}
	const data = {
		[query.value.key]: query.value.value
	}
	File.getFileData(data)
}
</script>
<template>
	<Layout class="layout">
		<Sider class="layout-sider" witdh="240">
			<ul class="file-ul">
				<li v-for="(item) in Data.fileTypelList" :key="item.id" :class="{'active': item.active}" class="type-item" @dragenter="dragEnterHandler(item)" @dragleave="dragLeaveHandler(item)">
					<p class="type-item-p">
						<a v-if="item.link" :href="item.link" :title="item.label" class="company-name link" target="_blank">{{item.label}}</a>
						<span v-else :title="item.label" class="company-name">{{item.label}}</span>
						<span class="operate">

              <Tooltip content="" max-width="180" placement="top" theme="light" transfer>
                <template #content>{{item.description}}</template>
                <span class="guide">[查看指引]</span>
	              <!--                <Icon type="md-help-circle" color="#1d83ff" size="22"/>-->
              </Tooltip>
               <Icon color="#1d83ff" size="22" type="md-add-circle" @click="uploadFile(item.id,item.label)"/>

            </span>
					
					</p>
					<div>
						<List border class="file-list" footer="" header="" size="small">
							<ListItem v-for="(file, fIndex) in item.fileList" :key="item.id + '_' + fIndex" :class="{'active': file.active}" class="file-list-item" @click="Data.detail(file)">
								<div :title="file.name" class="item-name" draggable="true" @dragend="handleDrop(item,fIndex)" @dragstart="dragstart(item,fIndex)" @dragover.stop="handleDragOver">{{file.name}}</div>
							</ListItem>
						</List>
					</div>
				</li>
				<Button v-show="Data.fileTypelList.length" class="upload-common" @click="uploadFile()">上传线下任务返回文件</Button>
			</ul>
		</Sider>
		<Layout v-show="File.id" style="height: 100%;padding: 10px;  background-color: #fff;">
			<Header class="layout-header">
				<div class="header-wrap">
					<div class="file-info">{{File.name}}&nbsp;&nbsp;<Tag v-if="File.solutionLabel" color="primary" type="border">{{File.solutionLabel}}</Tag>
						<Select v-model="query.key" clearable style="width:200px">
							<Option v-for="item in File.columns" :key="item" :value="item.key">{{item.title}}</Option>
						</Select>
						<Input v-model="query.value" enter-button placeholder="输入查询值" search style="width: 260px;margin: 0 10px" @on-search="queryCom"/>
						<Button style="margin: 0 10px" @click="queryCom('cz')">重置</Button>
					
					</div>
					
					<div class="file-operate">
						<!--            <ButtonGroup>
													<Button v-for="(btn, i) in Operate.btnList" :type=" i === Operate.btnActive ? 'primary' : ''" :key="i" @click="Operate.btnHandler(btn, i)">{{btn.label}}</Button>
												</ButtonGroup>-->
						&nbsp;
						&nbsp;
						&nbsp;
						&nbsp;
						<ButtonGroup>
							<Button icon="ios-create" @click="Operate.edit()">编辑</Button>
							<Button icon="md-download" @click="Operate.download()">下载</Button>
							<Poptip
								confirm
								title="确定要删除该文件?"
								transfer
								@on-ok="Operate.del()"
								@on-cancel="Operate.delCancel()">
								<Button :loading="Operate.btnLoading" icon="md-trash">删除</Button>
							</Poptip>
						</ButtonGroup>
					</div>
				</div>
			</Header>
			<Content class="layout-content">
				<Table ref="fileTableRef" v-table-drag :columns="File.columns"
				       :data="File.table"
				       :fixed-shadow="'hide'"
				       :loading="fileLoading"
				       :rowClassName="File.rowClassName"
				       :stripe="false"
				       context-menu
				       show-context-menu
				       style="flex: 1"
				       @on-contextmenu="File.cellContextHandler"
				       @on-cell-click="File.cellClick"
				       @on-sort-change="Sort.sortHandler">
					<template #contextMenu>
						<drop-comp @callback="contextMenuCallback"></drop-comp>
					</template>
					<template #EXTEND="{row, index}">
						<b v-if="row.extendNum > 0" class="row-state collision" @click="Ext.collision(row)">碰撞<span class="num">{{row.extendNum}}</span></b>
						<b v-if="row.noteNum > 0" class="row-state note" @click="Ext.note(row, index)">笔记 <span class="num">{{row.noteNum}}</span></b>
						<b v-if="row.markNum > 0" class="row-state mark" @click="Ext.sign(row, index)">标定<span class="num">{{row.markNum}}</span></b>
					</template>
				</Table>
			</Content>
			<Footer v-if="flag" class="layout-footer">
				<Pagination v-model:pageNo="File.pageOpt.pageNo" v-model:pageSize="File.pageOpt.pageSize" :render="File.getFileData" :total="File.pageOpt.total"></Pagination>
			</Footer>
			<Footer v-else class="layout-footer">
				<Pagination v-model:pageNo="File.pageOpt.pageNo" v-model:pageSize="File.pageOpt.pageSize" :render="File.getFileData" :total="File.pageOpt.total"></Pagination>
			</Footer>
		</Layout>
	</Layout>
	<Modal v-model="modalOpt.upload.visible" :footer-hide="true" :mask-closable="false" :title="modalOpt.upload.title" closable>
		<p>
			<Select v-model="solutionVal" clearable placeholder="选择来源" style="margin-bottom: 10px" @on-select="solutionSel">
				<Option v-for="(item, index) in solutionTypes" :key="'s_' + index" :value="item.value">{{item.label}}</Option>
			</Select>
			<attath-upload :param="modalOpt.upload.param" :visible="modalOpt.upload.visible" @close="modalOpt.upload.close" @finish="modalOpt.upload.finish"></attath-upload>
		</p>
	</Modal>
	<Modal v-model="modalOpt.bd.visible" :mask-closable="false" title="" width="80%">
		<template #header>
			<p style="color: red;">请标记需要碰撞的数据列</p>
		</template>
		<div class="bd-content">
			<bdTable :id="modalOpt.bd.param.id" ref="bdTableRef" :type="modalOpt.bd.param.type" :visible="modalOpt.bd.visible"></bdTable>
		</div>
		<template #footer>
			<Button :loading="modalOpt.bd.inertLoading" type="primary" @click="insert()">保存</Button>
			<Button @click="modalOpt.bd.visible = false">关闭</Button>
		</template>
	</Modal>
	<clip ref="clipRef"></clip>
	<Modal v-model="modalOpt.ipc.visible" :mask="false" :title="modalOpt.ipc.title" draggable>
		<ipCollision :param="modalOpt.ipc.param" :visible="modalOpt.ipc.visible"></ipCollision>
	</Modal>
</template>

<style lang="less" scoped>
.layout {
	height: 100%;
	background-color: #fff;
}

.layout-sider {
	height: 100%;
	padding-right: 15px;
	background-color: #fff;
	width: 250px !important;
	min-width: 250px !important;
	max-width: 250px !important;
	flex: 0 0 250px !important;
	/*flex:  0 0 300px!important;
	max-width: 300px;
	width: 300px!important;*/
}

.layout-header {
	padding: 0;
	background-color: #fff;
	height: 40px;
	line-height: 1;
}

.layout-content {
	height: 100%;
	display: flex;
	flex-direction: column;
	border: 1px solid #eeeeee;
}

.layout-footer {
	background-color: #fff;
	padding: 0;
	height: 40px;
	line-height: 1;
}

ul li {
	list-style: none;
}

.header-wrap {
	display: flex;
	justify-content: space-between;
	
	.file-info {
		//flex: 0 1 auto;
		display: flex;
		align-items: center;
	}
	
	.file-operate {
		flex: 0 1 auto;
	}
}

.bd-content {
	height: 650px;
}

.file-ul {
	.type-item {
		//margin-bottom: 15px;
		padding: 10px;
		
		&.active {
			background-color: rgba(45, 140, 240, 0.12);
		}
		
		.type-item-p {
			display: flex;
			justify-content: space-between;
			position: relative;
			height: 30px;
			line-height: 30px;
			
			&::before {
				content: '-'; // ♥
				position: absolute;
				top: 5px;
				width: 20px;
				height: 20px;
				line-height: 15px;
				background-color: rgba(248, 248, 249, 1);
				color: rgba(102, 102, 102, 1);
				border: 1px solid rgba(112, 112, 112, 0.19);
				text-align: center;
				z-index: 2;
			}
			
			.company-name {
				flex: 1;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				padding-left: 30px;
				/*&:hover {
					text-decoration: underline;
					color: rgba(64, 158, 255, 0.95);
				}*/
				
				&.link {
					color: #2d8cf0;
					text-decoration: underline;
					cursor: pointer;
				}
			}
			
			.operate {
				flex: 0 0 auto;
				height: 30px;
				font-size: 0;
				
				.guide {
					font-size: 14px;
					color: #F19260;
					margin-right: 8px;
					user-select: none;
				}
				
				.ivu-icon {
					vertical-align: middle;
					margin-bottom: 8px;
				}
			}
		}
	}
	
	.ivu-list-bordered {
		border: none;
	}
	
	.file-list {
		//padding-left: 50px;
		.file-list-item {
			position: relative;
			height: 32px;
			line-height: 32px;
			background-color: transparent;
			margin: 8px 0;
			border-bottom: none;
			//word-break: break-all;
			//border-radius: 2px;
			padding-left: 50px;
			padding-right: 0;
			
			&::before {
				content: '';
				position: absolute;
				left: 10px;
				top: -22px;
				width: 40px;
				height: 40px;
				-webkit-border-radius: 4px;
				-moz-border-radius: 4px;
				border-radius: 4px;
				border-left: 1px dashed #c8c8c8;
				border-right: 1px dashed transparent;
				border-top: 1px dashed transparent;
				border-bottom: 1px dashed #c8c8c8;
			}
			
			.item-name {
				width: 100%;
				padding: 0 10px;
				border-radius: 2px;
				background-color: #F6F6F7;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			
			&.active {
				.item-name {
					color: #fff;
					background-color: #3F86FF;
				}
			}
			
		}
		
	}
	
	.upload-common {
		width: 100%;
		height: 40px;
		line-height: 40px;
		/*border: 1px solid #eee;
		height: 40px;
		line-height: 40px;
		font-size: 13px;
		text-indent: 10px;*/
	}
}

/*:deep(.ivu-select-dropdown) {
  height: auto!important;
}*/

.row-state {
	margin: 0 4px;
	padding: .05rem;
	
	&:hover {
		color: #1D83FF;
		text-decoration: underline;
	}
	
	.num {
		margin-left: .05rem;
		color: #1D83FF;
	}
}

:deep(.ivu-table-sort) {
	transform: scale(1.5);
}

:deep(.ivu-table .demo-table-info-row td) {
	background-color: #D8F9D8 !important;
}
</style>

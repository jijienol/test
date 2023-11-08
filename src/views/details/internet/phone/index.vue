<script setup>
import {computed, getCurrentInstance, nextTick, reactive, ref, watch, onMounted} from 'vue';
import dropComp from '@/views/details/components/detailContextMenu.vue'
import {getTaskChannelGroupAbility, internetTableData, internetTableDataAnShu, getAppCategory} from '@/api/details.js'
import Pagination from '@/components/viewui/pagination.vue'
import {ajListStore} from '@/store/modules/ajList.js';
import {swdtStore} from '@/store/modules/swdt.js';
import {noteStore} from '@/store/modules/note.js';
import character from './character.vue'
import clip from '@/components/clipboard.vue'

const clipRef = ref(null)
const note = noteStore()
const swdt = swdtStore()
const {proxy} = getCurrentInstance()
const isLoading = ref(false)
const fileTableRef = ref(null)
const ajStore = ajListStore()
import {clientH} from '@/utils/vueuse.js';
import NO_PICTURE from '@/assets/images/nopic.jpg'
import {noteTableInfo} from '@/utils/note.js';
import vTableDrag from '@/directives/tableDrag.js';
import bus from 'vue3-eventbus'

const props = defineProps({
	type: '',
	traceId: {
		type: String,
		default: ''
	}
})
const Sort = reactive({
	sortType: '',
	sortKey: '',
	
	tableDefaultSort: {
		'II_AS_RETURN_APP': {
			'FIRST_REPORT_TIME_TRULY': 'asc'
		},
		'II_AS_RETURN_FOUR_CODE': {
			'END_TIME': 'desc'
		},
		'II_AS_RETURN_WIFI': {
			'COUNT': 'desc'
		},
		'II_AS_RETURN_IP': {
			'COUNT': 'desc'
		},
		'II_AS_RETURN_TRAJECTORY': {
			'DATE': 'desc'
		}
	},
	// tableOrderMap: [], // 规则 column空格sort 多个逗号分隔 a desc,b asc，每个表格默认只有一个排序
	querySortDefault: computed(() => {
		let s = Sort.tableDefaultSort[Data.tabValue]
		let str = ''
		if (s) {
			for (let k in s) {
				str = k + ' ' + s[k]
			}
		}
		return str
	}),
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
		
		if (c.column.targetTable == 'II_AS_RETURN_APP') {
			Sort.sortKey = c.column.targetColumn
			
		} else {
			Sort.sortKey = c.key
		}
		Data.getTableByName()
		/*Sort.tableOrderMap.forEach(o => {
		 if(o.name == c.column.targetTable) {
		 o.value = c.order
		 }
		 })*/
	}
})
const Data = reactive({
	rowClassName: (row, index) => {
		if (row.appTagNameList) {
			return 'demo-table-info-row1'
		} else if (row.isSmallApp == '是') {
			return 'demo-table-info-row2'
		}
		
		if (row.markNum > 0) {
			return 'demo-table-info-row'
		} else {
			return ''
		}
	},
	abilityList: [],
	tableList: [],
	tableInfoMap: [],
	columns: [],
	columnMaps: [
		{
			table: 'II_AS_RETURN_COLLISION_WIFI', columns: [
				{
					title: '手机号',
					align: 'center',
					key: 'phone',
					minWidth: 180,
					width: 'auto',
					tooltip: false,
					collisionType: 'table',
					targetTable: '',
					targetColumn: '',
					dataType: '',
					renderHeader: ''
				},
				{
					title: '同wifi次数',
					align: 'center',
					key: 'COUNT',
					minWidth: 180,
					width: 'auto',
					tooltip: false,
					collisionType: 'table',
					targetTable: '',
					targetColumn: '',
					dataType: '',
					renderHeader: ''
				},
				{
					title: '连接次数',
					align: 'center',
					key: 'connectingTimes',
					minWidth: 180,
					width: 'auto',
					tooltip: false,
					collisionType: 'table',
					targetTable: '',
					targetColumn: '',
					dataType: '',
					renderHeader: ''
				},
				{
					title: 'imei1',
					align: 'center',
					key: 'imei1',
					minWidth: 180,
					width: 'auto',
					tooltip: false,
					collisionType: 'table',
					targetTable: '',
					targetColumn: '',
					dataType: '',
					renderHeader: ''
				},
				{
					title: 'imei2',
					align: 'center',
					key: 'imei2',
					minWidth: 180,
					width: 'auto',
					tooltip: false,
					collisionType: 'table',
					targetTable: '',
					targetColumn: '',
					dataType: '',
					renderHeader: ''
				},
				{
					title: '设备名称',
					align: 'center',
					key: 'ssid',
					minWidth: 180,
					width: 'auto',
					tooltip: false,
					collisionType: 'table',
					targetTable: '',
					targetColumn: '',
					dataType: '',
					renderHeader: ''
				},
				{
					title: '设备mac',
					align: 'center',
					key: 'mac',
					minWidth: 180,
					width: 'auto',
					tooltip: false,
					collisionType: 'table',
					targetTable: '',
					targetColumn: '',
					dataType: '',
					renderHeader: ''
				}
			]
		}
	],
	userInfo: {},
	userColumn: [],
	tableData: [],
	loading: false,
	tabValue: 'II_AS_RETURN_APP',
	query: { // 条件查询
		orderBy: '',
		extend: undefined,
		name: '',
		pkg: '',
		clsOne: '',
		sfmg: '' // 0 1
	},
	pageOpt: {
		pageNo: 1,
		pageSize: 10,
		total: 0,
	},
	appCateList: [],
	tableSelected: computed(() => {
		let obj = proxy.$lodash.find(Data.tableList, o => {
			return o.targetTable == Data.tabValue
		})
		return obj ? obj : {info: '', columnMap: ''}
	}),
	scrollH: computed(() => {
		if (clientH.value > 0) {
			return clientH.value - 150
			
		} else {
			return 500
		}
	}),
	appCateHandler: (cate) => {
		console.log(cate)
		Data.appCateList.forEach(item => {
			item.active = false
		})
		cate.active = true
		if (cate.label == '全部') {
			// this.internetListParam.extend = undefined
			Data.query.clsOne = ''
			Data.query.sfmg = 0
		} else if (cate.label.indexOf('敏感') != -1) {
			// this.internetListParam.extend = {
			// APP_TAG_NAME_LIST: cate.label
			// CLS_ONE: cate.label
			// }
			Data.query.sfmg = 1
			Data.query.clsOne = cate.label
		} else {
			Data.query.clsOne = cate.label
			Data.query.sfmg = 0
		}
		Data.pageOpt.pageNo = 1// 第一页
		Data.getTableDataAnshu()
	},
	cellContextHandler: (row, event, v, column) => { // 单元格右击事件
		let pageX = event.pageX
		let except = ['noteNum', 'extend', 'virtualId', 'signNum', 'tableName']
		let colIndex = 0
		if (fileTableRef.value) {
			colIndex = Data.getIndex(fileTableRef.value, pageX)
		}
		colIndex = parseInt(colIndex)
		let col = Data.columns[colIndex]
		Data.colIndex = colIndex
		Data.colSelected = col
		Data.row = row
		
		swdt.deepParams.traceName = row[col.key].trim()
		note.traceName = row[col.key]
		note.virtualId = row.ID
		// 文件行数据
		Data.tableInfoMap.forEach(item => {
			
			if (item.name == Data.tabValue) {
				Data.name = item.label
			}
		})
		note.rowInfo = JSON.stringify(noteTableInfo(Data.row, Data.columns, Data.name))
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
	getTableByName: () => {
		if (Data.tabValue == 'II_AS_RETURN_APP') {
			Data.getTableDataAnshu()
			if (Data.appCateList.length == 0) {
				Data.getAppCate()
			}
		} else {
			Data.getTableData()
		}
	},
	getAppCate: () => {
		Data.appCateList = []
		let param = {taskChannelId: Data.abilityList[0].id, targetMap: Data.tabValue}
		getAppCategory(param).then(res => {
			let {code, data} = res.data
			if (code == 200) {
				if (data.length > 0) {
					let total = {label: '全部', num: 0, active: true}
					data.forEach(item => {
						// total.num += item.num
						item.active = false
					})
					data.unshift(total)
				}
				Data.appCateList = data
			}
			
		}).catch(() => {
		
		})
	},
	getTableData: (val) => {
		Data.tableData = []
		Data.columns = []
		Data.loading = true
		Data.query.orderBy = Sort.orderBy || Sort.querySortDefault
		let param = {
			targetMap: Data.tabValue,
			info: Data.tableSelected.info,

			orderBy: Data.query.orderBy,
			extend: Data.query.extend,
			pageNo: Data.pageOpt.pageNo,
			pageSize: Data.pageOpt.pageSize,
			taskChannelId: Data.abilityList[0].id
		}
		let _targetTable = Data.tabValue
		let _sortKey = Sort.sortKey
		let _sortType = Sort.sortType
		let _defaultSort = Sort.tableDefaultSort
		
		Data.loading = false
		if (val) {
			param.orderBy = val
			
		}
		internetTableData(param).then(res => {
			let {code, data} = res.data
			if (code == 200) {
				Data.pageOpt.total = data.pageInfo.total
				let _list = data.pageInfo.list
				let fieldList = data.fieldList
				let tableColumns = []
				
				if (_list.length < 1) {
					proxy.$Message.info('未查询到数据')
					Data.loading = false
					// return
				}
				_list.forEach(tableRow => { // 有两种格式的数据，在这里对不一致的字段进行统一
					if (tableRow.EXTEND == undefined || tableRow.EXTEND == null) {
						tableRow.EXTEND = ''
					} else {
						if (tableRow.extend) {
							tableRow.EXTEND = tableRow.extend
						}
					}
					
					if (tableRow.MARK == undefined || tableRow.MARK == null) {
						tableRow.MARK = ''
					} else {
						if (tableRow.mark) {
							tableRow.MARK = tableRow.mark
						}
					}
					
					if (tableRow.NOTE == undefined || tableRow.NOTE == null) {
						tableRow.NOTE = ''
					} else {
						if (tableRow.note) {
							tableRow.NOTE = tableRow.note
						}
					}
				})
				if (fieldList == null) { // 未获取到数据
					proxy.$Message.info('暂无数据')
					Data.loading = false
					return
				}
				fieldList.forEach(f => {
					let field = {
						title: f.fieldName,
						align: 'center',
						key: f.sourceCode,
						minWidth: 180,
						width: 'auto',
						tooltip: false,
						// collisionType: 'table',
						targetCode: f.targetCode,
						targetTable: _targetTable,
						targetColumn: f.sourceCode,
						dataType: f.dataType,
						renderHeader: '',
						sortable: 'custom'
					}
					if (field.sortable) {
						if (_sortKey && field.targetColumn == _sortKey) {
							field.sortType = _sortType
						} else {
							field.sortType = _defaultSort ? _defaultSort[field.targetColumn] : ''
						}
					}
					if (f.collision === 1) { // 可碰撞列的表头操作
						field.renderHeader = (h, column) => {
							return h(
								'span',
								{
									style: {
										marginRight: '5px',
										color: '#19BE6B',
										backgroundColor: '#EFF9FF'
									},
									/* domProps: {
									 innerHTML: column.column.title + 'aa', //自定义的列头的标题
									 }, */
									on: {
										
										contextmenu: (e) => {
											e.preventDefault()
											
										}
									}
								},
								field.title
							)
						}
					} else {
						field.renderHeader = (h, column) => {
							return h(
								'span',
								{
									style: {
										marginRight: '5px',
										color: 'black',
										backgroundColor: '#EFF9FF'
									},
									
									on: {
										
										contextmenu: (e) => {
											e.preventDefault()
											
										}
									}
								},
								field.title
							)
						}
					}
					tableColumns.push(field)
				})
				// 添加碰撞标识列slot
				/*tableColumns.forEach(col => {
				 if (col.key.toLowerCase() == 'extend') {
				 col.slot = 'EXTEND'
				 col.minWidth = 180
				 // col.maxWidth = 300;
				 col.ellipsis = true
				 col.fixed = 'right'
				 }
				 })*/
				tableColumns.push({
					title: '标记 ',
					slot: 'EXTEND',
					key: 'EXTEND',
					align: 'center',
					minWidth: 180,
					ellipsis: true,
					fixed: 'right',
					className: 'EXTEND'
				})
				Data.tableData = _list
				Data.columns = tableColumns
				Data.loading = false
			} else {
				Data.loading = false
			}
		}).catch(() => {
			Data.loading = false
			proxy.$Message.info('暂无数据')
		})
	},
	getTableDataAnshu: (orderBy) => {
		Data.loading = true
		Data.query.orderBy = Sort.orderBy || Sort.querySortDefault
		let param = {
			targetMap: Data.tabValue,
			info: Data.tableSelected.info,

			orderBy: orderBy ? orderBy : Data.query.orderBy,
			extend: {
				...Data.query.extend,
				clsOne: Data.query.clsOne,
				name: Data.query.name,
				pkg: Data.query.pkg
			},
			pageNo: Data.pageOpt.pageNo,
			pageSize: Data.pageOpt.pageSize,
			taskChannelId: Data.abilityList[0].id,
			sfmg: Data.query.sfmg,
			
			
		}
		
		let _targetTable = Data.tabValue
		let _sortKey = Sort.sortKey
		let _sortType = Sort.sortType
		let _defaultSort = Sort.tableDefaultSort
		internetTableDataAnShu(param).then(res => {
			let {code, data} = res.data
			if (code == 200) {
				Data.pageOpt.pageNo = data.pageInfo.pageNo
				Data.pageOpt.total = data.pageInfo.total
				let tableData = data.pageInfo.list
				
		
				
				if (tableData.length == 0) {
					Data.loading = false
					proxy.$Message.info('暂无数据')
					// return
				}
				
				tableData.forEach(tableRow => {
					tableRow.isSmallApp = tableRow.isSmallApp == 'Y' ? '是' : '否'
					tableRow.isSystemApp = tableRow.isSystemApp == 'Y' ? '是' : '否'
					
					if (tableRow.EXTEND == undefined || tableRow.EXTEND == null) {
						tableRow.EXTEND = ''
					} else {
						if (tableRow.extend) {
							tableRow.EXTEND = tableRow.extend
						} else {
							tableRow.EXTEND = ''
						}
					}
					
					if (tableRow.MARK == undefined || tableRow.MARK == null) {
						tableRow.MARK = ''
					} else {
						if (tableRow.mark) {
							tableRow.MARK = tableRow.mark
						} else {
							tableRow.MARK = ''
						}
					}
					
					if (tableRow.NOTE == undefined || tableRow.NOTE == null) {
						tableRow.NOTE = ''
					} else {
						if (tableRow.note) {
							tableRow.NOTE = tableRow.note
						} else {
							tableRow.NOTE = ''
						}
					}
				})
				let tableColumns = []
				
				let fieldList = null
				let fieldListtemp = null
				let taskChannel = Data.tableSelected
				
				fieldListtemp = JSON.parse(taskChannel.columnMap).list
				
				fieldList = proxy.$lodash.filter(fieldListtemp, o => {
					return o.show == 1
				})
				if (fieldList == null) { // 未获取到数据
					proxy.$Message.info('暂无数据')
					Data.loading = false
					return
				}
				fieldList.forEach(f => {
					let field = {
						title: f.fieldName,
						align: 'center',
						key: f.sourceCode,
						minWidth: 180,
						width: 'auto',
						tooltip: false,
						targetTable: _targetTable,
						targetCode: f.targetCode,
						targetColumn: f.sourceCode,
						dataType: f.dataType,
						renderHeader: '',
						sortable: 'custom',
						sortType: ''
					}
					if (f.sourceCode == 'icon') {
						field.width = 80
						field.render = (h, params) => {
							return h('img', {
								src: params.row.icon,
								style: 'width: 40px;border-radius: 2px;',
								on: {
									error: (e) => {
										e.path[0].src = NO_PICTURE
									}
								}
							})
						}
					}
					if (field.sortable) {
						if (_sortKey && field.targetColumn == _sortKey) {
							field.sortType = _sortType
						} else {
							field.sortType = _defaultSort ? _defaultSort[field.targetColumn] : ''
						}
					}
					
					if (f.collision === 1) { // 可碰撞列的表头操作
						field.renderHeader = (h, column) => {
							return h(
								'span',
								{
									style: {
										marginRight: '5px',
										color: '#19BE6B',
										backgroundColor: '#EFF9FF'
									},
									
									on: {
										
										contextmenu: (e) => {
											e.preventDefault()
											
										}
									}
								},
								field.title
							)
						}
					} else { // 禁用表头右键
						field.renderHeader = (h, column) => {
							return h(
								'span',
								{
									style: {
										marginRight: '5px',
										color: 'black',
										backgroundColor: '#EFF9FF'
									},
									
									on: {
										
										contextmenu: (e) => {
											e.preventDefault()
											
										}
									}
								},
								field.title
							)
						}
					}
					tableColumns.push(field)
				})
				// 添加碰撞标识列slot
				tableColumns.forEach(col => {
					if (col.key.toLowerCase() == 'extend') {
						col.slot = 'EXTEND'
						col.minWidth = 230
						// col.maxWidth = 300;
						col.ellipsis = true
						
						col.fixed = 'right'
					}
				})
				if (_targetTable == 'II_AS_RETURN_COLLISION_WIFI') {
					//
					let listdata = []
					tableData.forEach(item => {
						
						let temp = JSON.parse(item.LIST_DATA)
						temp.forEach(t => {
							t.COUNT = item.COUNT
							t.rowspan = 1
							listdata.push(t)
						})
					})
					for (let i = 0, len = listdata.length; i < len; i++) {
						for (let j = i + 1, jLen = listdata.length; j < jLen; j++) {
							if (listdata[i].COUNT == listdata[j].COUNT && listdata[i].phone == listdata[j].phone) {
								listdata[i].rowspan++
								listdata[j].rowspan--
							}
						}
						i = i + listdata[i].rowspan - 1
					}
					tableData = listdata
					tableColumns = proxy.$lodash.find(Data.columnMaps, o => {
						return o.table == _targetTable
					}).columns
				}
				if(orderBy){
					Data.tableData = tableData
					Data.loading = false
					
					return
				}
				Data.columns = tableColumns
				Data.tableData = tableData
				Data.loading = false
			} else {
				Data.loading = false
			}
		}).catch(() => {
			Data.loading = false
		})
	},
	getUserInfo: () => {
		Data.userInfo = {}
		Data.userColumn = []
		let _targetTable = 'II_AS_RETURN_USER_INFO';
		let param = JSON.parse(JSON.stringify(Data.query))
		/*let obj = proxy.$lodash.find(Data.tableInfoMap, o => {
		 return o.name == _targetTable
		 })*/
		let obj2 = proxy.$lodash.find(Data.tableList, o => {
			return o.targetTable == _targetTable
		})
		if (!obj2) return false
		param.targetMap = _targetTable
		param.orderBy = ''
		param.info = '手机返回用户信息'

		param.taskChannelId = Data.abilityList[0].id
		internetTableData(param).then(res => {
			let {code, data} = res.data;
			if (code == 200) {
				let tableData = data.pageInfo.list
				let tableColumns = []
				let fieldList = data.fieldList
				if (fieldList == null) { // 未获取到数据
					proxy.$Message.info('暂无数据')
					return
				}
				fieldList.forEach(f => {
					let field = {
						title: f.fieldName,
						align: 'center',
						key: f.sourceCode,
						minWidth: 180,
						width: 'auto',
						tooltip: false,
						// collisionType: 'table',
						targetTable: '',
						targetColumn: f.sourceCode, // 修改取值
						dataType: f.dataType,
						renderHeader: '',
						// sortable: f.sort == 1
					}
					tableColumns.push(field)
				})
				Data.userInfo = tableData[0]
				Data.userColumn = tableColumns
				console.log(tableData[0], tableColumns)
			}
		})
	},
	
	resetApp () {
		Data.query.name = ''
		Data.query.pkg = ''
		Data.pageOpt.pageNo = 1
		Data.query.extend = undefined
		Data.query.orderBy = ''
		Data.appCateHandler(Data.appCateList[0])
		// Data.getTableDataAnshu()
	},
	searchApp () {
		Data.query.sfmg = 0
		Data.query.clsOne = ''
		Data.pageOpt.pageNo = 1
		Data.getTableDataAnshu()
	},
	spanMethod ({row, column, rowIndex, columnIndex}) {
		if (columnIndex == 0 || columnIndex == 1) {
			return {
				rowspan: row.rowspan,
				colspan: 1
			}
		}
	},
})
watch(() => props.traceId, () => {
	
	getInternetAbility()
})
onMounted(() => {
	if (props.type == 'internet') getInternetAbility()
})

function getInternetAbility () {
	Data.tableInfoMap = []
	Data.abilityList = []
	isLoading.value = true
	// let param = {traceId: ajStore.traceInfo.id}
	let param = {traceId: props.traceId}
	getTaskChannelGroupAbility(param).then(res => {
		
		let {code, data} = res.data;
		if (code == 200) {
			if (data && data.length > 0) {
				let arr = []
				data.forEach((d, i) => {
					d.Index = i.toString()
					if (d.children && d.children.length) {
						d.children.forEach(child => {
							//child.checked = false
							arr.push(child)
						})
					}
				})
				Data.abilityList = proxy.$lodash.filter(arr, o => {
					return o.abilityValue == props.type
				})
				if (Data.abilityList.length) {
					Data.abilityList[0].tableList.forEach(item => {
						item.targetTable = item.targetTable.toUpperCase()
						if (item.targetTable != 'II_AS_RETURN_USER_INFO') {
							Data.tableInfoMap.push({name: item.targetTable, label: item.info})
						}
					})
					Data.tableList = Data.abilityList[0].tableList
					isLoading.value = false
					Data.tabValue = Data.tableInfoMap[0].name
					tabHandler(Data.tabValue)
					Data.getUserInfo()
				}
				
			}
		} else {
			isLoading.value = false
			proxy.$Message.error(data.message)
		}
		
	}).catch(err => {
		isLoading.value = false
		proxy.$Message.error(err.message)
	});
}

function contextMenuCallback (res) {
	const task = note.dblData
	task.taskChannelId = Data.row.TASK_CHANNEL_ID
	task.sourceType = Data.row.tableName
	task.sourceId = Data.row.ID
	task.virtualId = Data.row.ID
	task.rowInfo = JSON.stringify(noteTableInfo(Data.row, Data.columns, Data.name))
	if (res == 'note') {
		note.openList(task)
	} else if (res == 'deep') {
		// 判断无内容
		if (!swdt.deepParams.traceName) {
			proxy.$Message.info('该单元格无内容')
			return false
		}
		task.deepTrackType = Data.colSelected.dataType
		swdt.openDeep(task)
	} else if (res.indexOf('collision') != -1) {
		
		let k = Data.colSelected.targetColumn
		let t = res.split('_')[1]
		
		ajStore.setTraceItem({
			'traceName': Data.row[k],
			'traceId': props.traceId,
			'caseId': ajStore.caseId,
			'taskChannelId': Data.row.TASK_CHANNEL_ID,
			'traceType': t
		})
		ajStore.setTraceListVisible(true)
	} else {
		note.addOpenSign(res, task, Data, 'xs')
	}
}

function tabHandler (val) {
	// 切换tab时初始化查询条件
	Data.appCateList = []
	Data.tableData = []
	Data.columns = []
	Data.pageOpt.pageNo = 1
	Data.query.orderBy = ''
	Data.query.extend = undefined
	Sort.sortKey = ''
	Sort.sortType = ''
	nextTick(() => {
		Data.getTableByName()
	})
}

// Extend slot 操作
const task = note.dblData
const Ext = reactive({
	collision: (row) => {
		swdt.openCollisionList(Data, row)
	},
	sign: (row) => {
		task.virtualId = row.ID
		note.openSign('internet', task.caseId, task.id, task.virtualId)
		
	},
	note: (row) => {
		task.virtualId = row.ID
		note.openList(task, 'biao') //表格打开笔记
	}
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
			
			Data.tableData.forEach(d => {
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
			
			Data.tableData.forEach(d => {
				// noteNum
				if (d.ID == idObj.id || d.id == idObj.id || d.virtualId == idObj.id) {
					d.markNum = d.markNum + 1
				}
			})
		}
		
	}
})

function sort (val) {
	console.log(val)

	Sort.sortType = val.order
	Sort.sortKey = val.column.targetCode
	Data.getTableDataAnshu(val.column.targetCode + ' ' + val.order)
}
</script>
<template>
	<Layout class="layout-main">
		<Sider class="user-sider" width="250">
			<Scroll :height="Data.scrollH || 500">
				<character :columns="Data.userColumn" :info="Data.userInfo"></character>
			</Scroll>
		</Sider>
		<Layout>
			<Header class="content-header">
				<Tabs v-model="Data.tabValue" @on-click="tabHandler">
					
					<TabPane v-for="(tab, i) in Data.tableInfoMap" :key="i" :label="tab.label" :name="tab.name"></TabPane>
				
				</Tabs>
				
				<div v-if="Data.tabValue == 'II_AS_RETURN_APP'" class="search-wrap">
					<Input v-model.trim="Data.query.name" class="inp" clearable placeholder="应用名称"></Input>
					<Input v-model.trim="Data.query.pkg" class="inp" clearable placeholder="应用包名"></Input>
					<Button class="btn" @click="Data.resetApp()">重置</Button>
					<Button :loading="Data.loading" class="btn" type="primary" @click="Data.searchApp()">查询</Button>
				</div>
				<ul v-if="Data.tabValue == 'II_AS_RETURN_APP'" class="cate-ul">
					<li v-for="(cate, ci) in Data.appCateList" :key="'cate-'+ci" :class="{'active': cate.active}"
					    @click="Data.appCateHandler(cate)">
						<span v-if="cate.num > 0">{{cate.label + '（' + cate.num + '）'}}</span>
						<span v-else>{{cate.label}}</span>
					</li>
				</ul>
			</Header>
			<Content class="content-body">
				<Table ref="fileTableRef"
				       v-table-drag
				       :columns="Data.columns"
				       :data="Data.tableData" :fixed-shadow="'hide'" :loading="Data.loading"
				       :row-class-name="rowClassName"
				       :rowClassName="Data.rowClassName"
				       :span-method="Data.tabValue == 'II_AS_RETURN_COLLISION_WIFI' ? Data.spanMethod : ()=>{}"
				       :stripe="false"
				       context-menu
				       show-context-menu
				
				       style="flex: 1;"
				       @on-cell-click="Data.cellClick"
				       @on-contextmenu="Data.cellContextHandler"
				       @on-sort-change="sort">
					<template #contextMenu>
						<drop-comp @callback="contextMenuCallback"></drop-comp>
					</template>
					<template #EXTEND="{row, index}">
						<b v-if="row.extendNum > 0" class="row-state collision" @click="Ext.collision(row, index)">碰撞<span class="num">{{row.extendNum}}</span></b>
						<b v-if="row.noteNum > 0" class="row-state note" @click="Ext.note(row, index)">笔记 <span class="num">{{row.noteNum}}</span></b>
						<b v-if="row.markNum > 0" class="row-state mark" @click="Ext.sign(row, index)">标定<span class="num">{{row.markNum}}</span></b>
					</template>
				</Table>
			</Content>
			<Footer class="content-footer">
				<Pagination v-model:pageNo="Data.pageOpt.pageNo" v-model:pageSize="Data.pageOpt.pageSize" :render="Data.getTableByName" :total="Data.pageOpt.total"></Pagination>
			</Footer>
		</Layout>
	</Layout>
	<clip ref="clipRef"></clip>
</template>

<style lang="less" scoped>
.user-sider {
	padding: 0 10px 0 0;
	background-color: #fff;
}

.layout-main {
	height: 100%;
}

.content-header {
	padding: 0 0 10px;
	height: auto;
	background-color: #fff;
	
	.search-wrap {
		height: 30px;
		display: flex;
		color: #000;
		
		.inp {
			flex: 0 0 200px;
			margin-right: 12px;
		}
		
		.btn {
			margin: 0 4px;
		}
	}
}

.content-body {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.content-footer {
	padding: 0;
	height: 40px;
	background-color: #fff;
}

:deep(.ivu-input::-webkit-input-placeholder) {
	color: #777;
}

:deep(.ivu-input::-ms-input-placeholder) {
	color: #777;
}

.cate-ul {
	flex: 0 0 auto;
	display: flex;
	flex-wrap: wrap;
	padding: 0;
	
	li {
		list-style: none;
		flex: 0 0 auto;
		margin: 0 4px;
		padding: 0 4px;
		cursor: pointer;
		height: 30px;
		line-height: 30px;
		-webkit-border-radius: 4px;
		-moz-border-radius: 4px;
		border-radius: 4px;
		
		&.active {
			//font-weight: bold;
			//background-color: #2d8cf0;
			//color: #f0faff;
			color: #2d8cf0;
		}
	}
}

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

:deep(.ivu-table .demo-table-info-row1 td) {
	background-color: #c84031;
	
	color: #fff;
}

:deep(.ivu-table .demo-table-info-row2 td) {
	background-color: #a56b47;
	
	color: #fff;
}

</style>

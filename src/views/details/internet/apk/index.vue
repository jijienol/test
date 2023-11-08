<script setup>
import {computed, getCurrentInstance, nextTick, reactive, ref, watch, onMounted} from 'vue';
import dropComp from '@/views/details/components/detailContextMenu.vue'
import {getTaskChannelGroupAbility, internetTableData} from '@/api/details.js';
import Pagination from '@/components/viewui/pagination.vue'
import {ajListStore} from '@/store/modules/ajList.js';
import AppInfo from '@/components/appInfo/index.vue'
import {noteStore} from '@/store/modules/note.js';
import {swdtStore} from '@/store/modules/swdt.js';
import {Table} from 'view-ui-plus';
import vTableDrag from '@/directives/tableDrag.js';
import {noteTableInfo} from '@/utils/note.js';
import clip from '@/components/clipboard.vue'
import bus from 'vue3-eventbus';

const clipRef = ref(null)
const swdt = swdtStore()
const note = noteStore()
const {proxy} = getCurrentInstance()
const isLoading = ref(false)
const fileTableRef = ref(null)
const ajStore = ajListStore()
const props = defineProps({
	type: {
		type: String,
		default: ''
	},
	traceId: {
		type: String,
		default: ''
	}
})
const Data = reactive({
	rowClassName: (row, index) => {
		if (row.markNum > 0) {
			return 'demo-table-info-row'
		} else {
			return ''
		}
	},
	showFooter: computed(() => {
		if (Data.tabValue == 'basicInfo' || Data.tabValue == 'II_CHANNEL_RETURN_APP_APKINFO') {
			return false
		} else {
			return true
		}
		
	}),
	appParam: {
		taskChannelId: '',
		caseId: ajStore.caseId
	},
	abilityList: [],
	tableList: [],
	tableInfoMap: [],
	columns: [],
	tableData: [],
	loading: false,
	tabValue: 'basicInfo',
	query: { // 条件查询
		orderBy: '',
		extend: undefined
	},
	pageOpt: {
		pageNo: 1,
		pageSize: 10,
		total: 0,
	},
	tableSelected: computed(() => {
		let obj = proxy.$lodash.find(Data.targetTable, o => {
			return o.targetTable == Data.tabValue
		})
		return obj ? obj : {info: '', columnMap: ''}
	}),
	cellContextHandler: (row, event, v, column) => { // 单元格右击事件
		// console.log(row,event.v,column)
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
	getTableData: (val) => {
		let obj = proxy.$lodash.find(Data.tableList, o => {
			return o.targetTable == Data.tabValue
		})
		
		if (!obj) {
			return false
		}
		Data.tableData = []
		Data.columns = []
		Data.loading = true
		let _targetTable = Data.tabValue
		let _sortKey = Sort.sortKey
		let _sortType = Sort.sortType
		let _defaultSort = Sort.tableDefaultSort
		Data.query.orderBy = Sort.orderBy || Sort.querySortDefault
		
		let param = {
			targetMap: Data.tabValue,
			info: obj.info,
			orderBy: Data.query.orderBy,
			extend: Data.query.extend,
			pageNo: Data.pageOpt.pageNo,
			pageSize: Data.pageOpt.pageSize,
			taskChannelId: Data.abilityList[0].id
		}
		if (val) {
			param.orderBy = val
			console.log(val)
		}
		internetTableData(param).then(res => {
			let {code, data} = res.data
			if (code == 200) {
				let tableData = data.pageInfo.list
				Data.pageOpt.total = data.pageInfo.total
				if (tableData.length == 0) {
					Data.loading = false
					proxy.$Message.info('暂无数据')
					// return
				}
				let tableColumns = []
				let fieldList = data.fieldList
				if (fieldList == null) { // 未获取到数据
					proxy.$Message.info('未查询到数据')
					Data.loading = false
					// return
				}
				tableData.forEach(tableRow => {
					
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
				fieldList.forEach(f => {
					let field = {
						title: f.fieldName,
						align: 'center',
						key: f.sourceCode,
						minWidth: 300,
						width: 'auto',
						tooltip: false,
						// collisionType: 'table',
						targetCode: f.targetCode,
						targetTable: _targetTable,
						targetColumn: f.sourceCode, // 修改取值
						dataType: f.dataType,
						renderHeader: '',
						sortable: true
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
									/* domProps: {
									 innerHTML: column.column.title + 'aa', //自定义的列头的标题
									 }, */
									on: {
										/* click: (e) => {
										 _this.tableHeaderClick(e, column)
										 }, */
										contextmenu: (e) => {
											e.preventDefault()
											// console.log(column);
											// _this.contextMenuClick(e, column)
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
				 col.minWidth = 230
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
				if (_targetTable == 'II_CHANNEL_RETURN_APP_APKINFO') {
					let provinceList = []
					tableData.forEach(row => {
						let province = JSON.parse(row.PROVINCES)
						provinceList = province
						provinceList.forEach(pro => {
							pro.district = []
							if (pro.city.length) {
								// pro.city = this.$lodash.sortBy(pro.city, 'count').reverse()
								pro.city.forEach(city => {
									if (city.district.length) {
										city.district.forEach(district => {
											district.city = city.name
											district.cityCount = city.count
											district.rowspan = 1
											pro.district.push(district)
										})
									}
								})
							}
						})
					})
					provinceList.forEach(p => {
						for (let i = 0, len = p.district.length; i < len; i++) {
							for (let j = i + 1, jLen = p.district.length; j < jLen; j++) {
								if (p.district[i].city == p.district[j].city) {
									p.district[i].rowspan++
									p.district[j].rowspan--
								}
							}
							i = i + p.district[i].rowspan - 1
						}
					})
					let _installTable = proxy.$lodash.sortBy(provinceList, 'count').reverse()
					installTable.tableData = _installTable
				} else {
					if(val){
						Data.tableData =tableData
						Data.loading = false
						
						return
					}
					Data.tableData = tableData
					Data.columns = tableColumns
				}
				
				Data.loading = false
			} else {
				Data.loading = false
			}
		}).catch(() => {
			Data.loading = true
		})
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
		},
		'II_CHANNEL_RETURN_FIRST_INSTALL': {
			'rank': 'desc'
		},
		'II_CHANNEL_RETURN_APPKG': {
			'rank': 'desc'
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
		/*Sort.tableOrderMap.forEach(o => {
		 if(o.name == c.column.targetTable) {
		 o.value = c.order
		 }
		 })*/
		// console.log('Sort',Sort);
	}
})

const installTable = reactive({
	
	tableData: [],
	columns: [
		{
			type: 'expand',
			width: 50,
			render: (h, params) => {
				if (params.row.district.length) {
					let district = params.row.district
					return h(Table, {
						// props: {
						data: district,
						columns: [{key: 'city'}, {key: 'cityCount'}, {key: 'name'}, {key: 'count'}],
						spanMethod: ({row, column, rowIndex, columnIndex}) => {
							if (columnIndex == 0 || columnIndex == 1) {
								return {
									rowspan: row.rowspan,
									colspan: 1
								}
							}
						},
						showHeader: false,
						border: true
						// }
					})
				} else {
					return h(Table, {
						// props: {
						data: params.row.city,
						columns: [{key: 'name'}, {key: 'count'}],
						showHeader: false,
						border: true
						// }
					})
				}
			}
		},
		{
			title: '省',
			align: 'center',
			key: 'name'
		},
		{
			title: '安装数',
			align: 'center',
			key: 'count'
		}
	]
})

function tabHandler (val) {
	// 切换tab时初始化查询条件
	Data.tableData = []
	Data.columns = []
	Data.pageOpt.pageNo = 1
	Data.query.orderBy = ''
	Data.query.extend = undefined
	Sort.sortType = ''
	Sort.sortKey = ''
	
	nextTick(() => {
		if (val != 'basicInfo') Data.getTableData()
	})
}

watch(() => props.traceId, () => {
	if (props.type == 'internet') {
		// Data.appParam.taskChannelId = ''
		nextTick(() => {
			getInternetAbility()
		})
	}
})
onMounted(() => {
	getInternetAbility()
})

function getInternetAbility () {
	Data.tableInfoMap = []
	Data.abilityList = []
	isLoading.value = true
	// Data.appParam.taskChannelId = ''
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
						
						if (item.targetTable == 'II_CHANNEL_RETURN_APPKG' || item.targetTable == 'II_CHANNEL_RETURN_FIRST_INSTALL' || item.targetTable == 'II_CHANNEL_RETURN_APP_APKINFO') {
							
							item.targetTable = item.targetTable.toUpperCase()
							
							Data.tableInfoMap.push({name: item.targetTable, label: item.info})
						}
					})
					Data.tableList = Data.abilityList[0].tableList
					isLoading.value = false
					// Data.tabValue = Data.tableInfoMap[0].name
					Data.appParam.taskChannelId = Data.abilityList[0].id
					Data.tabValue = 'basicInfo'
					tabHandler(Data.tabValue)
					
					
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

// 右击确定
function contextMenuCallback (res) {
	console.log(Data.row, 'apk')
	const task = note.dblData
	task.taskChannelId = Data.row.TASK_CHANNEL_ID
	task.sourceType = Data.row.tableName
	task.sourceId = Data.row.ID
	task.virtualId = Data.row.ID
	task.rowInfo = JSON.stringify(noteTableInfo(Data.row, Data.columns, Data.name))
	if (res == 'note') {
		note.openList(task)
	} else if (res == 'deep') {
		if (!swdt.deepParams.traceName) {
			proxy.$Message.info('该单元格无内容')
			return false
		}
		task.deepTrackType = Data.colSelected.dataType
		swdt.openDeep(task)
	} else if (res.indexOf('collision') != -1) {
		// console.log(File.colIndex);
		// console.log(File.colSelected);
		let k = Data.colSelected.targetColumn
		let t = res.split('_')[1]
		// console.log(File.row[k]);
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
					// console.log(d);
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
					// console.log(d);
					d.markNum = d.markNum + 1
				}
			})
		}
		
	}
})

function sort (val) {
	Sort.sortType = val.order
	Sort.sortKey = val.column.targetCode
	Data.getTableData(val.column.targetCode + ' ' + val.order)
}
</script>
<template>
	<Layout class="layout">
		<Header class="layout-header">
			<Tabs v-model="Data.tabValue" @on-click="tabHandler">
				<TabPane :key="'basicInfo'" :name="'basicInfo'" label="基本信息">
					<AppInfo v-show="Data.tabValue == 'basicInfo'" :param="Data.appParam"></AppInfo>
				</TabPane>
				<TabPane v-for="(tab, i) in Data.tableInfoMap" :key="i" :label="tab.label" :name="tab.name"></TabPane>
			
			</Tabs>
		</Header>
		<Content v-show="Data.tabValue!= 'basicInfo'" class="layout-content">
			<Table v-if="Data.tabValue == 'II_CHANNEL_RETURN_APP_APKINFO'" v-table-drag :columns="installTable.columns"
			       :data="installTable.tableData" :loading="isLoading" border class="table-con" @on-sort-change="sort"
			>
			</Table>
			<Table v-else ref="fileTableRef" v-table-drag :columns="Data.columns" :data="Data.tableData"
			       :fixed-shadow="'hide'"
			       :loading="Data.loading"
			       :rowClassName="Data.rowClassName"
			       :stripe="false"
			       class="table-con"
			       context-menu
			       show-context-menu
			       @on-sort-change="sort"
			       @on-cell-click="Data.cellClick"
			       @on-contextmenu="Data.cellContextHandler"
			>
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
		<Footer v-show="Data.showFooter" class="layout-footer">
			<Pagination v-model:pageNo="Data.pageOpt.pageNo" v-model:pageSize="Data.pageOpt.pageSize" :render="Data.getTableData" :total="Data.pageOpt.total"></Pagination>
		
		</Footer>
		<clip ref="clipRef"></clip>
	</Layout>
</template>
<style lang="less" scoped>
.layout {
	height: 100%;
}

.layout-header {
	padding: 0;
	height: 40px;
	background-color: #fff;
}

.layout-content {
	min-height: 100px;
	height: 100%;
	display: flex;
	flex-direction: column;
	
	.table-con {
		flex: 1;
	}
}

.layout-footer {
	padding: 0;
	height: 40px;
	background-color: #fff;
}

:deep(.ivu-table-expanded-cell) {
	padding: 0;
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
</style>

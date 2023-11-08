<script setup="">
import {computed, getCurrentInstance, nextTick, reactive, ref, watch, onMounted} from 'vue';
import dropComp from '@/views/details/components/detailContextMenu.vue'
import {getTaskChannelGroupAbility} from '@/api/details.js';
import {internetTableData} from '@/api/details.js'
import Pagination from '@/components/viewui/pagination.vue'
import {ajListStore} from '@/store/modules/ajList.js';
import {swdtStore} from '@/store/modules/swdt.js';
import {noteStore} from '@/store/modules/note.js';
import {noteTableInfo} from '@/utils/note.js';
import {dictStore} from '@/store/modules/dictionary.js';
import clip from '@/components/clipboard.vue'
import {Button} from 'view-ui-plus'
import {updateUrlCDN} from 'src/api/swdt.js'
import {permissionStore} from 'src/store/modules/permission.js'
import {storeToRefs} from 'pinia'
import ChannelQrcode from 'src/views/Detect/components/channelQrcode.vue'

const permission = permissionStore()
const clipRef = ref(null)
const note = noteStore()
const swdt = swdtStore()
const dict = dictStore()
const {proxy} = getCurrentInstance()
const isLoading = ref(false)
const ajStore = ajListStore()
const fileTableRef = ref(null)
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
	abilityList: [],
	tableList: [],
	tableInfoMap: [],
	columns: [],
	tableData: [],
	loading: false,
	tabValue: '',// ii_channel_return_url_url
	query: { // 条件查询
		orderBy: '',
		extend: undefined
	},
	pageOpt: {
		pageNo: 1,
		pageSize: 10,
		total: 0,
	},
	ipBasicInfo: [
		{fieldName: 'IP地址', sourceCode: 'ip', highlight: false},
		{fieldName: 'IP类型', sourceCode: 'ipType', highlight: false},
		{fieldName: 'IP归属地', sourceCode: 'ipCountry', highlight: false},
		// { fieldName: 'IP归属地', sourceCode: 'IP_COUNTRY + IP_PROVINCE + IP_CITY + IP_DISTRICT' },
		{fieldName: 'IP是否境内', sourceCode: 'ipChineFlag', highlight: true},
		{fieldName: 'IP服务商', sourceCode: 'ipOrg', highlight: false},
		{fieldName: 'IP服务商是否境内', sourceCode: 'orgChineFlag', highlight: true},
		{fieldName: '运营商', sourceCode: 'iplsp', highlight: false}
	],
	urlBasicInfo: [
		
		{fieldName: '网站地址', sourceCode: 'webUrl', highlight: false},
		{fieldName: '域名', sourceCode: 'domain', highlight: false},
		{fieldName: '域名服务器', sourceCode: 'whoisServer', highlight: false},
		{fieldName: 'DNS', sourceCode: 'dnsServer', highlight: false},
		{fieldName: '存活状态', sourceCode: 'activeStatus', highlight: false},
		{fieldName: '网站许可证号', sourceCode: 'serviceLicence', highlight: false},
		{fieldName: '所有者', sourceCode: 'owner', highlight: false},
		{fieldName: '注册商', sourceCode: 'registrar', highlight: true},
		{fieldName: '邮箱', sourceCode: 'email', highlight: false},
		{fieldName: '联系电话', sourceCode: 'phone', highlight: false},
		{fieldName: '备案号', sourceCode: 'siteLicense', highlight: false},
		{fieldName: '备案公司', sourceCode: 'companyName', highlight: true},
		{fieldName: '公司类型', sourceCode: 'companyType', highlight: false},
		{fieldName: '是否限制接入', sourceCode: 'limitAccess', highlight: false},
		{fieldName: '创建时间', sourceCode: 'creationDate', highlight: false},
		{fieldName: '过期时间', sourceCode: 'expirationDate', highlight: false},
		{fieldName: '审核时间', sourceCode: 'verifyTime', highlight: false},
		{fieldName: '域名状态', sourceCode: 'domainStatus', highlight: false}
	
	],
	tableSelected: computed(() => {
		let obj = proxy.$lodash.find(Data.tableList, o => {
			return o.targetTable == Data.tabValue
		})
		return obj ? obj : {info: '', columnMap: ''}
	}),
	cellContextHandler: (row, event, v, column) => { // 单元格右击事件
		let pageX = event.pageX
		let except = ['noteNum', 'extend', 'virtualId', 'signNum', 'tableName']
		let colIndex = 0
		if (fileTableRef.value) {
			colIndex = Data.getIndex(fileTableRef.value, pageX)
		}
		colIndex = parseInt(colIndex) + 1
		
		let col = Data.columns[colIndex]
		Data.colIndex = colIndex
		Data.colSelected = col
		Data.row = row
		note.traceName = row[col.key]
		swdt.deepParams.traceName = row[col.key].trim()
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
			
		}
		internetTableData(param).then(res => {
			let {code, data} = res.data
			if (code == 200) {
				Data.pageOpt.total = data.pageInfo.total
				let _list = data.pageInfo.list
				let fieldList = data.fieldList
				let tableColumns = []
				Data.loading = false
				if (_list.length < 1) {
					proxy.$Message.info('未查询到数据')
					Data.loading = false
					return
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
						collisionType: 'table',
						targetTable: '',
						targetColumn: f.sourceCode, // 修改取值
						dataType: f.dataType,
						renderHeader: ''
						// sortable: f.sort == 1
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
				tableColumns.forEach(col => {
					if (col.key.toLowerCase() == 'extend') {
						col.slot = 'EXTEND'
						
						col.minWidth = 230
						// col.maxWidth = 300;
						col.ellipsis = true
						col.fixed = 'right'
					}
				})

				if (Data.tabValue == 'II_CHANNEL_RETURN_URL_URL') {
					Data.tableData = _list
					Data.setIpBasicInfo()
					Data.setUrlBasicInfo()
				} else {
					
					if(val){
						Data.tableData = _list
						Data.loading = false
						
						return
					}
					Data.tableData = _list
					Data.columns = tableColumns
				}
				
			} else {
				Data.loading = false
			}
		}).catch(() => {
			Data.loading = false
			proxy.$Message.info('暂无数据')
		})
		
		
	},
	setIpBasicInfo: () => {
		let infoObj = Data.tableData[0]
		Data.ipBasicInfo.forEach(t => {
			if (t.sourceCode == 'ipCountry') {
				t.value = (infoObj.ipCountry || '') + ' ' + (infoObj.ipProvince || '') + ' ' + (infoObj.ipCity || '') + ' ' + (infoObj.ipDistrict || '')
			} else if (t.sourceCode == 'ipChinaFlag') {
				t.value = infoObj[t.sourceCode] === '1' ? '是' : (infoObj[t.sourceCode] === '0' ? '否' : '未知')
			} else if (t.sourceCode == 'orgChinaFlag') {
				t.value = infoObj[t.sourceCode] === '1' ? '是' : (infoObj[t.sourceCode] === '0' ? '否' : '未知')
			} else if (t.sourceCode == 'ipType') {
				let r = dict.getIpTypeByKey(infoObj[t.sourceCode])
				r = r ? ('：' + r) : ''
				t.value = infoObj[t.sourceCode] + r
			} else {
				t.value = infoObj[t.sourceCode]
			}
		})
		
	},
	setUrlBasicInfo: () => {
		let infoObj = Data.tableData[0]
		Data.urlBasicInfo.forEach(t => {
			if (t.sourceCode == 'activeStatus') {
				t.value = infoObj[t.sourceCode] === '1' ? '存活' : '不存活'
			} else {
				t.value = infoObj[t.sourceCode]
			}
		})
	}
})

watch(() => props.traceId, () => {
	Data.ipBasicInfo.forEach(i => {
		i.value = ''
	})
	Data.urlBasicInfo.forEach(u => {
		u.value = ''
	})
	
	nextTick(() => {
		getInternetAbility()
	})
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
						Data.tableInfoMap.push({name: item.targetTable, label: item.info})
					})
					Data.tableList = Data.abilityList[0].tableList
					isLoading.value = false
					Data.tabValue = Data.tableInfoMap[0].name
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

function tabHandler (val) {
	// 切换tab时初始化查询条件
	Data.tableData = []
	Data.columns = []
	Data.pageOpt.pageNo = 1
	Data.query.orderBy = ''
	Data.query.extend = undefined
	nextTick(() => {
		Data.getTableData()
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

function infoCopy (v) {
	clipRef.value.copy(v)
}

function sort (val) {
	console.log(val)
	Data.getTableData(val.key + ' ' + val.order)
}

const cdnVisible = ref(false)
const {qrcode} = storeToRefs(swdt)

async function sfcdn (val) {
	if (val === 3) {
		console.log(123123)
		swdt.qrcode = {
			visible: true,
			channelType: 'url',
			url: {
				taskChannelId: Data.abilityList[0].id,
				urlId: Data.tableData[0].id,
				urlName: Data.tableData[0].webUrl
			}
		}
		return
	}
	cdnVisible.value = false
	const res = await updateUrlCDN({
		id: Data.tableData[0].id,
		sfcdn: val,
		targetMap: 'II_CHANNEL_RETURN_URL_URL',
		url: Data.tableData[0].webUrl
	})
	if (res.data.code == 200) {
		proxy.$Message.success('设置成功')
		Data.getTableData()
		
	} else {
		proxy.$Message.success(res.data.message)
	}
	
}

const columns = {
	nmap: [
		{
			title: '序号',
			type: 'index'
		},
		{
			title: '用途',
			key: 'use'
		},
		{
			title: '端口',
			key: 'port'
		},
		{
			title: '状态',
			key: 'status'
		}
	],
	catalog: [
		{
			title: '序号',
			type: 'index'
		},
		{
			title: '网址',
			key: 'name'
		},
	]
}


const ipB = computed(() => {
	if (Data.tableData.length > 0) {
		return Data.tableData[0].sfcdn == 0;
	} else {
		return false
	}
})
const data1 = computed(() => {
	if (Data.tableData.length > 0) {
		if (!Data.tableData[0].nmap) return []
		return JSON.parse(Data.tableData[0].nmap)
	} else {
		return []
	}
})
const data2 = computed(() => {
	if (Data.tableData.length > 0) {
		if (!Data.tableData[0].catalog) return []
		return JSON.parse(Data.tableData[0].catalog).map(item => {
			return {name: item}
		})
	} else {
		return []
	}
})
const data3 = computed(() => {
	if (Data.tableData.length > 0) {
		if (!Data.tableData[0].subDomain) return []
		return JSON.parse(Data.tableData[0].subDomain).map(item => {
			return {name: item}
		})
	} else {
		return []
	}
})

</script>
<template>
	<Layout class="layout-main">
		<Header class="layout-header">
			<Tabs v-model="Data.tabValue" @on-click="tabHandler">
				<TabPane v-for="(tab, i) in Data.tableInfoMap" :key="i" :label="tab.label" :name="tab.name"></TabPane>
			
			</Tabs>
		</Header>
		<Content class="layout-content">
			<div v-if="Data.tabValue == 'II_CHANNEL_RETURN_URL_URL'" class="info">
				<div class="info-title">URL信息</div>
				<ul class="info-ul">
					<li v-for="(item, i) in Data.urlBasicInfo" :key="i" :class="{'red': item.highlight}">
						<div class="label">{{item.fieldName}}</div>
						
						<Tooltip v-if="item.value" :content="item.value" :max-width="300" placement="top-start">
							<div class="txt" @click="infoCopy(item.value)">{{item.value}}</div>
						</Tooltip>
					</li>
				</ul>
				<div class="info-title">IP信息</div>
				<ul class="info-ul">
					<li v-for="(item, i) in Data.ipBasicInfo" :key="i" :class="{'red': item.highlight}">
						<div class="label">{{item.fieldName}}</div>
						<div class="txt" @click="infoCopy(item.value)">{{item.value}}
							<span v-if="item.fieldName=='IP地址'&&item.value" style="margin-right: 100px">
														<span v-if="Data.tableData[0].sfcdn" :class="{'red':Data.tableData[0].sfcdn == '0'}">({{Data.tableData[0].sfcdn == '0' ? '非CND加速' : 'CDN加速'}})</span>
														<Button v-else size="small" type="primary" @click.stop="cdnVisible=true">是否CDN</Button>
													</span>
						</div>
					
					</li>
				</ul>
				<div style="margin-top:15px ">
					<h4>nmap端口扫描</h4>
					<Table :columns="columns.nmap" :data="data1"></Table>
				</div>
				<div style="margin-top:15px ">
					<h4>JSFinder子目录扫描</h4>
					<div style="display: flex;justify-content: space-between">
						<Table :columns="columns.catalog" :data="data2" style="width: 49vw"></Table>
						<Table :columns="columns.catalog" :data="data3" style="width: 49vw"></Table>
					</div>
				
				</div>
			</div>
			<div v-else class="table-wrapper">
				<Table ref="fileTableRef" :columns="Data.columns" :data="Data.tableData" :fixed-shadow="'hide'"
				       :loading="Data.loading"
				       :rowClassName="Data.rowClassName"
				       :stripe="false"
				       context-menu
				       show-context-menu
				       style="flex: 1"
				       @on-cell-click="Data.cellClick"
				       @on-sort-change="sort"
				       @on-contextmenu="Data.cellContextHandler">
					<template #contextMenu>
						<drop-comp @callback="contextMenuCallback"></drop-comp>
					</template>
					<template #EXTEND="{row, index}">
						<b v-if="row.extendNum > 0" class="row-state collision" @click="Ext.collision(row, index)">碰撞<span class="num">{{row.extendNum}}</span></b>
						<b v-if="row.noteNum > 0" class="row-state note" @click="Ext.note(row, index)">笔记 <span class="num">{{row.noteNum}}</span></b>
						<b v-if="row.markNum > 0" class="row-state mark" @click="Ext.sign(row, index)">标定<span class="num">{{row.markNum}}</span></b>
					</template>
				</Table>
			</div>
		</Content>
		<Footer class="layout-footer">
			<Pagination v-show="Data.tabValue !== 'II_CHANNEL_RETURN_URL_URL'" v-model:pageNo="Data.pageOpt.pageNo" v-model:pageSize="Data.pageOpt.pageSize" :render="Data.getTableData" :total="Data.pageOpt.total"></Pagination>
		</Footer>
	</Layout>
	<clip ref="clipRef"></clip>
	<Modal
		v-model="cdnVisible"
		footer-hide
		title="请选择IP是否为CDN加速"
		width="300"
	>
		<div style="display: flex;justify-content: space-evenly">
			<Button type="primary" @click="sfcdn(1)">是</Button>
			<Button v-if="!permission.networkType" @click="sfcdn(0)">否</Button>
			<Button v-else @click="sfcdn(3)">否</Button>
		</div>
	</Modal>
	<!--	&lt;!&ndash;  二维码&ndash;&gt;-->
	<!--	<Modal v-model="qrcode.visible" :footer-hide="true">-->
	<!--		<channel-qrcode :id="qrcode.traceId" default="url" :list="qrcode.params"-->
	<!--		                :visible="qrcode.visible"></channel-qrcode>-->
	<!--	</Modal>-->

</template>
<style lang="less" scoped>
.layout-main {
	height: 100%;
	background-color: #fff;
}

.layout-header {
	padding: 0;
	background-color: #fff;
	height: 50px;
}

.layout-footer {
	padding: 0;
	height: 40px;
	background-color: #fff;
}

.layout-content {
	//height: 100%;
}

.red {
	color: red;
}

.info-title {
	font-weight: bold;
	font-size: 17px;
	line-height: 60px;
}

.info-ul {
	padding-left: 15px;
	font-size: 14px;
	display: flex;
	flex-wrap: wrap;
	
	li {
		flex: 0 0 32%;
		display: flex;
		text-align: left;
		line-height: 28px;
		
		&.red {
			color: red;
		}
		
		.label {
			flex: 0 0 150px;
		}
		
		.txt {
			flex: 1;
		}
	}
}

.row-state {
	margin: 0 4px;
	padding: .05rem;
	
	.num {
		margin-left: .05rem;
		color: #1D83FF;
	}
}

.table-wrapper {
	height: 100%;
	display: flex;
	flex-direction: column;
}

:deep(.ivu-table .demo-table-info-row td) {
	background-color: #D8F9D8 !important;
}
</style>

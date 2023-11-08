<script setup="">
import {computed, getCurrentInstance, nextTick, reactive, ref, watch, onMounted} from "vue";
import dropComp from '@/views/details/components/detailContextMenu.vue'
import {getTaskChannelGroupAbility} from '@/api/details.js';
import {internetTableData} from '@/api/details.js'
import Pagination from '@/components/viewui/pagination.vue'
import {ajListStore} from "@/store/modules/ajList.js";
import {swdtStore} from "@/store/modules/swdt.js";
import {noteStore} from "@/store/modules/note.js";
import vTableDrag from "@/directives/tableDrag.js";
import clip from '@/components/clipboard.vue'
const clipRef = ref(null)
import {noteTableInfo} from "@/utils/note.js";
import bus from "vue3-eventbus";
const note = noteStore()
const swdt = swdtStore()
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
const Sort = reactive({
	sortType: '',
	sortKey: '',
	
	tableDefaultSort: {
		'II_AS_RETURN_WIFI_TASK': {
			'connectTime': 'desc'
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
  rowClassName:(row, index) => {
    if(row.markNum > 0) {
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
  tabValue: 'II_AS_RETURN_WIFI_TASK',
  query: { // 条件查询
    orderBy: '',
    extend: undefined
  },
  pageOpt: {
    pageNo: 1,
    pageSize: 10,
    total: 0,
  },
  basicInfo: [
    { fieldName: 'IP地址', sourceCode: 'ip', highlight: false },
    { fieldName: 'IP归属地', sourceCode: 'ipCountry', highlight: false },
    // { fieldName: 'IP归属地', sourceCode: 'IP_COUNTRY + IP_PROVINCE + IP_CITY + IP_DISTRICT' },
    { fieldName: 'IP是否境内', sourceCode: 'ipChineFlag', highlight: true },
    { fieldName: 'IP服务商', sourceCode: 'ipOrg', highlight: false },
    { fieldName: 'IP服务商是否境内', sourceCode: 'orgChineFlag', highlight: true },
    { fieldName: '运营商', sourceCode: 'iplsp', highlight: false }
  ],
  tableSelected: computed(() => {
    let obj = proxy.$lodash.find(Data.tableList, o => {
      return o.targetTable == Data.tabValue
    })
    return obj ? obj: {info: '', columnMap: ''}
  }),
  cellContextHandler: (row, event,v,column) => { // 单元格右击事件
    let pageX = event.pageX
    let except = ['noteNum', 'extend', 'virtualId', 'signNum', 'tableName']
    let colIndex = 0
    if(fileTableRef.value) {
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
    Data.tableInfoMap.forEach(item=>{
      if(item.name == Data.tabValue){
        Data.name = item.label
      }
    })
    note.rowInfo = JSON.stringify(noteTableInfo(Data.row, Data.columns, Data.name))
  },
  cellClick: (row, column, v, event) => { // 单元格左击事件
    if(column.key != 'EXTEND') {
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
    if(!obj) return false
    Data.tableData = []
    Data.columns = []
    Data.loading = true
    // Data.query.orderBy = ''
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
		
	  }
    internetTableData(param).then(res => {
      let { code, data } = res.data
      if(code == 200) {
        Data.pageOpt.total = data.pageInfo.total
        let _list = data.pageInfo.list
        let fieldList = data.fieldList
	      let _sortKey = Sort.sortKey
	      let _sortType = Sort.sortType
	      let _defaultSort = Sort.tableDefaultSort
	
	      let tableColumns = []
        Data.loading = false
        if(_list.length < 1) {
          proxy.$Message.info('未查询到数据')
          Data.loading = false
          // return
        }
        _list.forEach(tableRow => { // 有两种格式的数据，在这里对不一致的字段进行统一
          if (tableRow.EXTEND == undefined || tableRow.EXTEND == null) {
            tableRow.EXTEND = ''
          } else {
            if(tableRow.extend) {
              tableRow.EXTEND = tableRow.extend
            }
          }
          
          if (tableRow.MARK == undefined || tableRow.MARK == null) {
            tableRow.MARK = ''
          } else {
            if(tableRow.mark) {
              tableRow.MARK = tableRow.mark
            }
          }
          
          if (tableRow.NOTE == undefined || tableRow.NOTE == null) {
            tableRow.NOTE = ''
          } else {
            if(tableRow.note) {
              tableRow.NOTE = tableRow.note
            }
          }
        })
        if (fieldList == null) { // 未获取到数据
          proxy.$Message.info('暂无数据')
          // return
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
	          targetCode: f.targetCode,
            renderHeader: '',
            // sortable: f.sort == 1
            sortable: true
          }
	        if (field.sortable) {
		        if (_sortKey && field.targetColumn == _sortKey) {
			        field.sortType = _sortType
		        } else {
			        field.sortType = _defaultSort ? _defaultSort[field.targetColumn] : ''
		        }
	        }
          if (f.sourceCode == 'wifiMac') {
            field.className = 'blue-wifi'
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
        /*tableColumns.forEach(col => {
          if (col.key.toLowerCase() == 'extend') {
            col.slot = 'EXTEND'
            col.minWidth = 230
            // col.maxWidth = 300;
            col.ellipsis = true
            col.fixed = 'right'
          }
        })*/
        tableColumns.push( {
          title:"标记 ",
          slot : 'EXTEND',
          key:'EXTEND',
          align: 'center',
          minWidth : 180,
          ellipsis : true,
          fixed : 'right',
          className: 'EXTEND'
        })
	      if(val){
		      Data.tableData =  _list
		      Data.loading = false
		
		      return
	      }
        Data.tableData = _list
        Data.columns = tableColumns
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
    Data.basicInfo.forEach(t => {
      if (t.sourceCode == 'ipCountry') {
        t.value = (infoObj.ipCountry || '') + ' ' + (infoObj.ipProvince || '') + ' ' + (infoObj.ipCity || '') + ' ' + (infoObj.ipDistrict || '')
      } else if (t.sourceCode == 'ipChinaFlag') {
        t.value = infoObj[t.sourceCode] === '1' ? '是' : (infoObj[t.sourceCode] === '0' ? '否' : '未知')
      } else if (t.sourceCode == 'orgChinaFlag') {
        t.value = infoObj[t.sourceCode] === '1' ? '是' : (infoObj[t.sourceCode] === '0' ? '否' : '未知')
      } else {
        t.value = infoObj[t.sourceCode]
      }
    })
    
  }
})
/*watch(() => props.traceId, (n) => {
  if(n) getInternetAbility()
}, {immediate:true})*/
watch(()=> props.traceId, () => {
  if(props.type == 'internet') {
    nextTick(() => {
      getInternetAbility()
    })
  }
})
onMounted(() => {
  getInternetAbility()
})
function getInternetAbility() {
  Data.abilityList = []
  Data.tableInfoMap = []
  isLoading.value = true
  // let param = {traceId: ajStore.traceInfo.id}
  let param = {traceId: props.traceId}
  getTaskChannelGroupAbility(param).then(res => {
    
    let {code, data} = res.data;
    if(code == 200) {
      if(data && data.length > 0) {
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
        if(Data.abilityList.length) {
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
function contextMenuCallback(res) {
  const task = note.dblData
  task.taskChannelId = Data.row.TASK_CHANNEL_ID
  task.sourceType = Data.row.tableName
  task.sourceId = Data.row.ID
  task.virtualId = Data.row.ID
  if(res == 'note'){
    task.rowInfo =  JSON.stringify(noteTableInfo(Data.row, Data.columns, Data.name))
    note.openList(task)
  }else if(res == 'deep'){
    // 判断无内容
    if(!swdt.deepParams.traceName) {
      proxy.$Message.info('该单元格无内容')
      return false
    }
    task.deepTrackType = Data.colSelected.dataType
    swdt.openDeep(task)
  } else if(res.indexOf('collision')!= -1) {
    // console.log(File.colIndex);
    // console.log(File.colSelected);
    let k = Data.colSelected.targetColumn
    let t  = res.split('_')[1]
    // console.log(File.row[k]);
    ajStore.setTraceItem({
      "traceName": Data.row[k],
      "traceId": props.traceId,
      "caseId": ajStore.caseId,
      "taskChannelId": Data.row.TASK_CHANNEL_ID,
      "traceType": t
    })
    ajStore.setTraceListVisible(true)
  }else {
    note.addOpenSign(res,task,Data,'xs')
  }
}
function tabHandler(val) {
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
    swdt.openCollisionList(Data,row)
  },
  sign: (row) => {
    task.virtualId = row.ID
    note.openSign('internet',task.caseId,task.id,task.virtualId)
    
  },
  note: (row) => {
    task.virtualId = row.ID
    note.openList(task,'biao') //表格打开笔记
  }
})

// 刷新列表
bus.on('table', (param) => {
  let arr = []
  if(param == 'note') {
    if(note.addNoteParams.rowInfo){
      arr = JSON.parse(note.addNoteParams.rowInfo)
      let idObj = arr.find(o => {
        return o.id
      })
      Data.tableData.forEach(d => {
        // noteNum
        if(d.ID == idObj.id || d.id == idObj.id || d.virtualId == idObj.id) {
          d.noteNum = d.noteNum + 1
        }
      })
    }
    
  } else if(param == 'sign') {
    if(note.addSign.rowInfo){
      arr = JSON.parse(note.addSign.rowInfo)
      // markNum
      let idObj = arr.find(o => {
        return o.id
      })
      Data.tableData.forEach(d => {
        // noteNum
        if(d.ID == idObj.id || d.id == idObj.id || d.virtualId == idObj.id) {
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
  <Layout class="layout-main">
    <Header class="layout-header">
      <Tabs v-model="Data.tabValue" @on-click="tabHandler">
        <TabPane :label="tab.label" :name="tab.name" v-for="(tab, i) in Data.tableInfoMap" :key="i"></TabPane>
      </Tabs>
    </Header>
    <Content class="layout-content">
      <div class="info" v-if="Data.tabValue == 'II_CHANNEL_RETURN_IP_URL'">
        <ul class="info-ul">
          <li :class="{'red': item.highlight}" v-for="(item, i) in Data.basicInfo" :key="i">
            <div class="label">{{item.fieldName}}</div><div class="txt" >{{item.value}}</div>
          </li>
        </ul>
      </div>
      <div class="table-wrapper" v-else>
        <Table style="flex: 1" :data="Data.tableData" :columns="Data.columns" ref="fileTableRef"
               v-table-drag
               context-menu
               show-context-menu
               :stripe="false"
               :rowClassName="Data.rowClassName"
               :fixed-shadow="'hide'"
               :loading="Data.loading"
               @on-sort-change="sort"
               @on-cell-click="Data.cellClick"
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
    <Footer class="layout-footer" v-if="Data.tabValue !== 'II_CHANNEL_RETURN_IP_URL'">
      <Pagination v-model:pageNo="Data.pageOpt.pageNo" v-model:pageSize="Data.pageOpt.pageSize" :render="Data.getTableData" :total="Data.pageOpt.total"></Pagination>
    </Footer>
  </Layout>
  <clip ref="clipRef"></clip>
</template>
<style scoped lang="less">
.layout-main {
  height: 100%;
}
.layout-header{
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
  height: 100%;
}
.info-ul {
  padding-left: 15px;
  font-size: 14px;
  li {
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
}
.blue-wifi {
  color: #689DF3;
}
.row-state {
  margin: 0 4px;
  padding: .05rem;
  .num{
    margin-left: .05rem;
    color: #1D83FF;
  }
}
.table-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.ivu-table-sort) {
  transform: scale(1.5);
}
:deep(.ivu-table .demo-table-info-row td) {
  background-color: #D8F9D8!important;
}
</style>

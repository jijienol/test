<script setup>


//常用wifi findWifiConnectByTaskChannelId
import {getCurrentInstance, onMounted, reactive, ref} from 'vue'

import Pagination from '@/components/viewui/pagination.vue'
import {noteTableInfo} from '@/utils/note.js'
import dropComp from '@/views/details/components/detailContextMenu.vue'
import {noteStore} from '@/store/modules/note.js'
import {swdtStore} from '@/store/modules/swdt.js'
import {ajListStore} from '@/store/modules/ajList.js'
import {relationMaps} from '@/api/details.js'
const swdt = swdtStore()
const note = noteStore()
const ajStore = ajListStore()
const {proxy} = getCurrentInstance()
const props = defineProps({
  
  taskId: {
    type: String,
    default: ''
  },
  
})
const fileTableRef = ref(null)

const Data = reactive({
  pageOpt: {
    pageNo: 1,
    pageSize: 10,
    total:0
  },
  tableData: [],
  columns: [
    {
      title: '序号',
      type: 'index',
      width: 80,
      align: 'center'
    },
    {
      title: 'WIFI名称',
      align: 'center',
      key: 'ssid',
      minWidth: 180,
    }, {
      title: 'MAC地址',
      align: 'center',
      key: 'wifiMac',
      minWidth: 180,
    },
    // {
    //   title: 'WIFI地址',
    //   align: 'center',
    //   key: 'ssid',
    //   minWidth: 180,
    // },
    {
      title: '最早连接时间',
      align: 'center',
      key: 'beginTimes',
      minWidth: 180,
    }, {
      title: '最晚连接时间',
      align: 'center',
      key: 'endTimes',
      minWidth: 180,
    }, {
      title: '连接次数',
      align: 'center',
      key: 'times',
      minWidth: 180,
    }, {
      title: '标签',
      align: 'center',
      key: 'type',
      minWidth: 180,
    },{
      title: "标记 ",
      slot: 'EXTEND',
      key: 'EXTEND',
      align: 'center',
      minWidth: 180,
      ellipsis: true,
      fixed: 'right',
      className: 'EXTEND'
    }
  ],
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
  cellContextHandler: (row, event, v, column) => { // 单元格右击事件
    console.log(row)
    let pageX = event.pageX
    let colIndex = 0
    if (fileTableRef.value) {
      colIndex = Data.getIndex(fileTableRef.value, pageX)
    }
    colIndex = parseInt(colIndex)
    let col = Data.columns[colIndex]
    Data.colIndex = colIndex
    Data.colSelected = col
    Data.row = row
    Data.row.tableName= "II_YS_RETURN_WIFI_CONNECTION"
    swdt.deepParams.traceName = row[col.key].trim()
    note.traceName = row[col.key]
    note.virtualId = row.id
  },
})
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

async function getWifiInfo () {
  try {
    const {data} = await relationMaps({ taskChannelId: props.taskId})
    
    if (data.code == 200) {
      Data.tableData = data.data

    } else {
      proxy.$Message.error(data.message)
    }
  } catch (e) {
    proxy.$Message.error(e)
  }
}

function contextMenuCallback (res) {

  const task = note.dblData
  task.taskChannelId = Data.row.taskChannelId
  task.sourceType = Data.row.tableName
  task.sourceId = Data.row.id
  task.virtualId = Data.row.id
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
      "traceName": "yunsheng_wifi",
      "traceId": props.traceId,
      "caseId": ajStore.caseId,
      "taskChannelId": Data.row.taskChannelId,
      "traceType": t
    })
    ajStore.setTraceListVisible(true)
  } else {
    note.addOpenSign(res, task, Data)
  }
}

onMounted(() => {
  getWifiInfo()
})
</script>

<template>
  <div>
    <div style=" border-left: 4px solid #1D83FF; padding-left: 15px;font-size: 16px;">WIFI列表<span style="color: #cccccc;font-size: 14px;margin-left: 30px;line-height: 16px">常连Wi-FI计算周期为近30天，白天常连Wi-Fi计算时间段为10:00-16:00，夜晚常连WI-Fi计算时间段为21:00-06:00</span>
    </div>
    <Table ref="fileTableRef"
          max-height="1200"
           v-table-drag
           :columns="Data.columns"
           :data="Data.tableData" :fixed-shadow="'hide'" :loading="Data.loading"
           :rowClassName="Data.rowClassName"
           :span-method="Data.tabValue == 'II_AS_RETURN_COLLISION_WIFI' ? Data.spanMethod : ()=>{}"
           :stripe="false"
           context-menu
           show-context-menu
           style="flex: 1;"
           @on-cell-click="Data.cellClick"
           @on-contextmenu="Data.cellContextHandler"
 >
      <template #contextMenu>
        <drop-comp @callback="contextMenuCallback"></drop-comp>
      </template>
      <template #EXTEND="{row, index}">
        <b v-if="row.extendNum > 0" class="row-state collision" @click="Ext.collision(row, index)">碰撞<span class="num">{{ row.extendNum }}</span></b>
        <b v-if="row.noteNum > 0" class="row-state note" @click="Ext.note(row, index)">笔记 <span class="num">{{ row.noteNum }}</span></b>
        <b v-if="row.markNum > 0" class="row-state mark" @click="Ext.sign(row, index)">标定<span class="num">{{ row.markNum }}</span></b>
      </template>
    </Table>
  </div>
</template>
<style lang="less" scoped>
:deep(.ivu-table td){
  &.EXTEND{
    background-color: #edf7fb;

  }
}

.content-footer {
  position: absolute;
  padding: 0;
  height: 40px;
  background-color: #fff;
}
</style>

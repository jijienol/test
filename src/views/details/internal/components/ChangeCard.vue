<script setup>
import * as echarts from 'echarts';
import {getCurrentInstance, onMounted, ref, reactive, computed, watch} from 'vue'
import {noteStore} from '@/store/modules/note.js'
import {swdtStore} from '@/store/modules/swdt.js'
import {ajListStore} from '@/store/modules/ajList.js'
import Pagination from '@/components/viewui/pagination.vue'
import {noteTableInfo} from '@/utils/note.js'
import dropComp from '@/views/details/components/detailContextMenu.vue'

const swdt = swdtStore()
const note = noteStore()
const ajStore = ajListStore()
const {proxy} = getCurrentInstance()
const props = defineProps({
  
  imeiList: {
    type: Array,
    default: ''
  }
  
})
const imeiList = computed(() => props.imeiList)
const fileTableRef = ref(null)

function contextMenuCallback (res) {
  
  
  const task = note.dblData
  task.taskChannelId = Data.row.taskChannelId
  task.sourceType = Data.row.tableName
  task.sourceId = Data.row.ID
  task.virtualId = Data.row.ID
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

const task = note.dblData
const Ext = reactive({
  collision: (row) => {
    swdt.openCollisionList(Data, row)
  },
  sign: (row) => {
    task.virtualId = row.id
    note.openSign('internet', task.caseId, task.id, task.virtualId)
    
  },
  note: (row) => {
    task.virtualId = row.ID
    note.openList(task, 'biao') //表格打开笔记
  }
})

const Data = reactive({
  pageOpt: {
    pageNo: 1,
    pageSize: 10,
    total: 0
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
      title: '手机号码',
      align: 'center',
      key: 'phone',
      minWidth: 180,
    },
    {
      title: 'GID',
      align: 'center',
      key: 'gid',
      minWidth: 180,
    }, {
      title: 'IMEI',
      align: 'center',
      key: 'imei',
      minWidth: 180,
    }, {
      title: 'IMSI',
      align: 'center',
      key: 'imsi',
      minWidth: 180,
    }, {
      title: 'MAC地址',
      align: 'center',
      key: 'mac',
      minWidth: 180,
    }, {
      title: '创建时间',
      align: 'center',
      key: 'createdTime',
      minWidth: 180,
    }, {
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
    Data.row.tableName = "II_YS_RETURN_IMEI"
    swdt.deepParams.traceName = row[col.key].trim()
    note.traceName = row[col.key]
    note.virtualId = row.ID
    
  },
})


function initChart (data1, data2) {
  const chartDom = document.getElementById('main')
  const myChart = echarts.init(chartDom)
  const option = {
    
    series: {
      type: 'sankey',
      layout: 'none',
      left: '10%',
      emphasis: {
        focus: 'adjacency'
      },
      
      data: data1,
      links: data2
    }
  }
  
  option && myChart.setOption(option);
}

watch(() => imeiList.value, (data) => {
  
  const data1 = []
  const data2 = []
  
  function mergeAndDistinctKeys (array) {
    const arr = []
    array.forEach(item => {
      if(item.imei){
        arr.push('imei:' + item.imei)
  
      }
      if(item.imsi){
        arr.push('imsi:' + item.imsi)
  
      }
      if(item.phone){
        arr.push('手机号:' + item.phone)
  
      }
    })
    return [...new Set(arr)];
  }
  
  const mergedKeysArray = mergeAndDistinctKeys(data);
  mergedKeysArray.forEach(item => {
    if (item.startsWith("手机号")) {
      data1.push({
        name: item,
        label: {
          position: 'left', // 节点B名称显示在节点下方
          overflow: 'none', // 节点A名称超出节点边界时完整显示
        },
        itemStyle: {
          color: '#027DD6', // 节点A的颜色为红色
        }
      },)
    } else {
      data1.push({
        name: item,
        itemStyle: {
          color: '#85C2EE', // 节点A的颜色为红色
        },
      })
    }
  })
  const filteredData = data.map(obj => {
    return {
      imei: obj.imei,
      imsi: obj.imsi,
      phone: obj.phone
    };
  });
  filteredData.forEach(item => {
    if (item.imei) {
      data2.push({
        source: '手机号:' + item.phone,
        target: 'imei:' + item.imei,
        value: 1,
        lineStyle: {
          color: {
            type: 'linear',
            colorStops: [
              {
                offset: 0,
                color: '#027DD6', // 渐变色起始位置为红色
              },
              {
                offset: 1,
                color: '#85C2EE', // 渐变色结束位置为绿色
              },
            ],
          },
        },
      })
    }
    if (item.imsi) {
      data2.push({
        source: '手机号:' + item.phone,
        target: 'imsi:' + item.imsi,
        value: 1,
        lineStyle: {
          color: {
            type: 'linear',
            colorStops: [
              {
                offset: 0,
                color: '#027DD6', // 渐变色起始位置为红色
              },
              {
                offset: 1,
                color: '#85C2EE', // 渐变色结束位置为绿色
              },
            ],
          },
        },
      })
      
    }
  })
  // console.log(data1, data2)
  initChart(data1, data2)
})
onMounted(() => {


})

</script>
<template>
  <div style="width: 100%;height: 100vh">
    <div style=" border-left: 4px solid #1D83FF; padding-left: 15px;font-size: 16px;">卡码关联情况</div>
    
    <div id="main" style="width:95%; height: 400px;  "></div>
    <div style=" border-left: 4px solid #1D83FF; padding-left: 15px;margin-bottom:20px;font-size: 16px;">卡码关联详情列表</div>
    <Table ref="fileTableRef"
           v-table-drag
           :columns="Data.columns"
           :data="imeiList" :fixed-shadow="'hide'" :loading="Data.loading"
    
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

</style>

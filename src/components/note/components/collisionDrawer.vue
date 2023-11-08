<script setup>
import {computed, nextTick, ref, watch, getCurrentInstance, onMounted} from "vue";
import {ajListStore} from "@/store/modules/ajList.js";
import {swdtStore} from "@/store/modules/swdt.js";
import {getCollisionDetail, getCollisionInfo} from "@/api/swdt.js";
import lodash from "lodash";

let {proxy} = getCurrentInstance()

const swdt = swdtStore()
const ajList = ajListStore()

const caseId = computed(() => ajList.caseInfo.id)
const channelName = ref({
  internet: '互联网',
  offlineDetect: '线下',
  drawProof: '调证'
})
const traceKeyMap = {
  apk: "APK",
  ewallet: "电子钱包",
  url: "URL",
  phone: "手机号",
  virtualId: "虚拟身份",
  bankCard: "卡类",
  ip: "IP",
  idcard: "证件号码",
  wifi: "MAC",
  offlineTask: "其他线索"
};
const traceTypes = ref([])


const typeList = ref([])
const dataMap = ref(new Map())

const column = ref([
  {
    align: 'center',
    tooltip: false,
    title: '碰撞源',
    key: 'fromProperty',
    width: 'auto',
    renderHeader: ''
  },
  {
    align: 'center',
    tooltip: false,
    title: '源表名',
    key: 'fromTableName',
    width: 'auto',
    renderHeader: ''
  },
  {
    align: 'center',
    tooltip: false,
    title: '碰撞目的',
    key: 'targetProperty',
    width: 'auto',
    renderHeader: ''
  },
  {
    align: 'center',
    tooltip: false,
    title: '目的线索',
    key: 'targetTraceName',
    width: 'auto',
    renderHeader: ''
  },
  {
    align: 'center',
    tooltip: false,
    title: '能力类型',
    key: 'targetChannelType',
    width: 'auto',
    renderHeader: '',
    render: (h, params) => {
      let level = params.row.targetChannelType
      
      return h('span', channelName[level])
    }
  },
  {
    align: 'center',
    tooltip: false,
    title: '目的表名',
    key: 'targetTableName',
    width: 'auto',
    renderHeader: ''
  },
])
const collisionTabs = ref([])
const fromTableMap = ref([])
const targetTableMap = ref([])
const targetName = ref('')
const fromName = ref('')

async function getCollisionInfo1 (obj) {
  if (obj.active) {
    return
  }
  fromTableMap.value = []
  targetTableMap.value = []
  typeList.value.forEach(t => {
    let arr = dataMap.value.get(t.key);
    arr.forEach(a => {
      a.active = false
    })
  })
  obj.active = true
  let param = {
    property: obj.value,
    dataType: obj.type,
    from: swdt.node.from,
    to: swdt.node.to
  };
  const res = await getCollisionInfo(param)
  let {code, data} = res.data;
  if (code == 200) {
    // console.log(data)
    let from_list = data.source
    from_list.forEach(tableItem => {
      // console.log(tableItem)
      let column = JSON.parse(tableItem.column)
      let columnData = []
      for (let f in column) {
  
        if(column[f].sourceCode != 'id' && column[f].sourceCode != 'case_id' && column[f].sourceCode != 'task_channel_id'&& column[f].ftargetCode != 'id' && column[f].ftargetCode != 'case_id' && column[f].ftargetCode != 'task_channel_id'){
    
          columnData.push({
            align: 'center',
            title: column[f].fieldName,
            key: column[f].sourceCode? column[f].sourceCode: column[f].targetCode,
            minWidth: 150,
            tooltip: false,
            renderHeader: ''
          })
        }

      }
      tableItem.columns = columnData
      
      // tableItem.key = k
      // console.log(tableItem);
      fromTableMap.value.push(tableItem)
      
      
    })
    console.log(fromTableMap)
    fromName.value = traceKeyMap[data.sourceTraceType] + data.sourceTraceName
    let target_list = data.target
    target_list.forEach(tableItem => {
      let column = JSON.parse(tableItem.column)
      let columnData = []
      for (let f in column) {
     
        if(column[f].targetCode != 'id' && column[f].targetCode != 'case_id' && column[f].targetCode != 'task_channel_id'&& column[f].ftargetCode != 'id' && column[f].ftargetCode != 'case_id' && column[f].ftargetCode != 'task_channel_id'){

          columnData.push({
            align: 'center',
            title: column[f].fieldName,
            key: column[f].sourceCode? column[f].sourceCode: column[f].targetCode,
            minWidth: 150,
            tooltip: false,
            renderHeader: ''
          })
        }
 
      }
      tableItem.columns = columnData
      
      
      targetTableMap.value.push(tableItem)
      
    })
    
    targetName.value = traceKeyMap[data.targetTraceType] + data.targetTraceName
  }
}

async function getCollisionDetail1 () {
  typeList.value = []
  dataMap.value.clear()
  let param = {from: swdt.node.from, to: swdt.node.to}
  const res = await getCollisionDetail(param)
  
  let {code, data} = res.data;
  if (code == 200) {
    data.forEach(d => {
      d.active = false
    })
    let group = lodash.groupBy(data, (o) => {
      return o.type
    })
    
    for (let k in group) {
      group[k].forEach(item => {
        item.active = false
      })
      typeList.value.push({
        key: k,
        count: group[k].length
      })
      dataMap.value.set(k, group[k])
    }
    nextTick(() => {
      let defaultFirst = typeList.value[0];
      getCollisionInfo1(dataMap.value.get(defaultFirst.key)[0])
    })
  }
  
}

function setTraceLabel (key) {
  
  let obj = lodash.find(ajList.traceTypeOptions, o => {
    return o.value == key
  })
  // console.log(obj)
  return obj.label
}


watch(() => swdt.node.to, (n) => {
  console.log(n)
  if (n) {
    fromTableMap.value = []
    targetTableMap.value = []
    nextTick(() => {
      getCollisionDetail1()
    })
  }
  if(n == null){
    fromTableMap.value = []
    targetTableMap.value = []
    nextTick(() => {
      getCollisionDetail1()
    })
  }
})
</script>
<script>
export default {
  name: "collisionDrawer"
}

</script>
<template>
  <div class="main">
    <div class="top">
      <span style="position: absolute;left: .1rem;font-size: .18rem">碰撞</span>
      <div class="title">{{ fromName }}&nbsp;&nbsp;和&nbsp;&nbsp;{{ targetName }}</div>
    </div>
    <Row>
      <Col span="3" style="margin-right: .2rem;max-height: 5.6rem;overflow-y: auto;">
        <div v-for="(item, index) in typeList" :key="index">
          <div class="trace-type">{{ setTraceLabel(item.key) }}</div>
          <div class="trace-ul">
            <div v-for="item in dataMap.get(item.key)" :class="{'active': item.active}" :title="item.value" class="item" @click="getCollisionInfo1(item)">{{ item.value }}</div>
          </div>
        </div>
      </Col>
      <Col span="20" style="max-height: 5.6rem;overflow-y: auto;">
        <div v-for="table in fromTableMap">
          <div class="table-title">源数据：{{ fromName + '/' }} {{ table.solutionName  }}{{table.solutionName?'/':'' }} {{ table.table }}</div>
          <Table :columns="table.columns" :data="table.data"></Table>
        </div>
        <div v-for="table in targetTableMap">
          <div class="table-title">目标数据：{{ targetName + '/' }} {{ table.solutionName  }}{{table.solutionName?'/':'' }} {{ table.table }}</div>
          <Table :columns="table.columns" :data="table.data"></Table>
        </div>
      </Col>
    </Row>
  </div>
</template>
<style lang="less" scoped>
.main {
  max-height: 6rem;
  //overflow: auto;
}

.top {
  position: relative;
  padding-bottom: .1rem;
  margin-bottom: .1rem;
  border-bottom: 1px solid #ccc;
}

.title {
  text-align: center;
  font-size: .2rem;
}

.table-title {
  font-size: .16rem;
  color: #000;
  margin: .1rem;
}

.trace-ul {
  //margin: .1rem;
  .item {
    height: .4rem;
    line-height: .4rem;
    max-width: 3rem;
    background: #f6f6f7;
    margin-top: .1rem;
    padding-left: .2rem;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .active {
    background: #1D83FF;
    color: #FFF;
  }
}
</style>

<script setup>
import {swdtStore} from "../../../store/modules/swdt.js";
import {computed, defineProps, ref, watch} from "vue";
import {getCollisionList, findDataCollisionListTitle, findDataCollisionListDetail} from "../../../api/swdt.js";
import {filter} from "lodash";
import {ajListStore} from '@/store/modules/ajList.js'

const ajStore = ajListStore()
const swdt = swdtStore()
const {collisionDetail} = defineProps(['collisionDetail'])
const collisionTable = ref([])
const collisionTabs = ref([])
const originColumn = ref([])
const originData = ref([])
const collisionTabValue = ref('')
const originTable = ref('')
const isLoading = ref(false)

const collisionTableComputed = ref([])
const param2 = ref({})
watch(() => swdt.collisionDetail.visible, async (n) => {
  if (n) {
    isLoading.value = true
    collisionTable.value = []
    collisionTabs.value = []
    
    originColumn.value = collisionDetail.originColumn.filter(item => item.slot != "EXTEND")
    originData.value = collisionDetail.originData
    originTable.value = collisionDetail.originTable
    let param
    if (swdt.type12 == 'internet') {
      param = {
        targetId: collisionDetail.virtualId,
        tableName: collisionDetail.tableName,
        caseId: ajStore.caseInfo.id
      }
      param2.value = param
    } else {
      param = {
        virtualId: collisionDetail.virtualId,
        tableName: collisionDetail.tableName,
        caseId: ajStore.caseInfo.id
        
      }
      param2.value = param
      
    }
    
    const res = await findDataCollisionListTitle(param)
    let {code, data} = res.data
    if (code == 200) {
      let arr = []
      isLoading.value = false
      // console.log(data)
      data.forEach(item => {
        collisionTabs.value.push(item)
      })
      // data.forEach(item => {
      //   for (let k in item) {
      //     collisionTabs.value.push(k)
      //     item[k].forEach(tableItem => {
      //       let clounm = JSON.parse(tableItem.clounm)
      //       let columnData = []
      //       for (let f in clounm) {
      //         columnData.push({
      //           align: 'center',
      //           title: clounm[f],
      //           key: f,
      //           minWidth: 150,
      //           tooltip: false,
      //           renderHeader: ''
      //         })
      //       }
      //       tableItem.columns = columnData
      //
      //       tableItem.data = JSON.parse(tableItem.data)
      //       tableItem.data.forEach(d => {
      //         if (d.IP_CHINA_FLAG != undefined) {
      //           d.IP_CHINA_FLAG = d.IP_CHINA_FLAG == 1 ? '是' : '否'
      //         }
      //         if (d.ORG_CHINA_FLAG != undefined) {
      //           d.ORG_CHINA_FLAG = d.ORG_CHINA_FLAG == 1 ? '是' : '否'
      //         }
      //         if (d.ACTIVE_STATUS != undefined) {
      //           d.ACTIVE_STATUS = d.ACTIVE_STATUS == 1 ? '是' : '否'
      //         }
      //       })
      //       tableItem.key = k
      //     })
      //     arr = arr.concat(item[k])
      //   }
      // })
      collisionTable.value = arr
      collisionTabValue.value = collisionTabs.value[0].property
      
    } else {
      isLoading.value = false
    }
    
    
  } else {
    collisionTable.value = []
    // collisionTabs.value = []
    originColumn.value = []
    originData.value = []
    originTable.value = ''
  }
}, {
  immediate: true
})


async function getTable () {
  let param1
  collisionTabs.value.forEach(item => {
    if (item.property == collisionTabValue.value) {
      param1 = {
        ...param2.value,
        traceType: item.traceType.value,
        property: item.property
      }
    }
  })
  
  const res1 = await findDataCollisionListDetail(param1)
  collisionTableComputed.value = []
  res1.data.data.forEach(item => {
    // console.log(item)
    const data = item.data
    const columns = JSON.parse(item.field)
    const columnData = []
    // console.log(columns)
    for (let f in columns) {
      if (columns[f].targetCode != "extend" && columns[f].targetCode != "mark" && columns[f].targetCode != "note"&& columns[f].targetCode !="id"&& columns[f].targetCode !="case_id"&& columns[f].targetCode !="task_channel_id") {
        columnData.push({
          align: 'center',
          title: columns[f].fieldName,
          key: columns[f].targetCode,
          minWidth: 150,
          tooltip: false,
          renderHeader: ''
        })
      }
      
    }
    // console.log(columnData)
    
    collisionTableComputed.value.push({
      data, columnData, traceName: item.traceName
    })
  })
}

watch(() => collisionTabValue.value, () => {
  getTable()
},{
  deep:true
})
</script>
<script>
export default {
  name: "filePzDialog"
}

</script>
<template>
  <Layout class="main">
    <Header class="layout-header">
      <div class="table-con">
        <div class="label">{{ originTable }}</div>
        <Table :columns="originColumn" :data="originData" :loading="isLoading" border>
        </Table>
      </div>
    </Header>
    <Tabs v-model="collisionTabValue">
      <TabPane v-for="(tab, i) in collisionTabs" :key="i" :label="tab.traceType.label+':'+tab.property" :name="tab.property" class="tab"></TabPane>
    </Tabs>
    <Content class="layout-content">
      <div v-for="(table, index) in collisionTableComputed" :key="'table-' + index" class="table-con">
        <!--        <div class="label">{{ '线索：' + table.traceName }}</div>-->
        <Table :columns="table.columnData" :data="table.data" :loading="isLoading" border>
        </Table>
      </div>
    </Content>
  </Layout>
</template>
<style lang="less" scoped>
.main {
  background-color: #fff;
  max-height: 70vh;
  overflow: auto;
}

.layout-header {
  //height: 40px;
  line-height: 1;
  padding: 0;
  background-color: #fff;
  height: 30%;
}

.layout-content {
  //height: 100%;
  overflow-y: scroll;
}

.ivu-layout-header {
  background-color: #fff;
}

.label {
  font-size: 16px;
  font-weight: bold;
  background: #fff;
  line-height: 40px;
}

.table-con {
  padding: 10px;
  margin-bottom: 10px;
  
}

.tab {
  color: #2d8cf0;
  font-size: 15px;
}

.ivu-tabs {
  background-color: #fff;
}
</style>


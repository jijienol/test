<script setup>
import Echarts from "@/components/echarts.vue"
import {onMounted, ref} from "vue";
import {$moment} from "@/utils/moment.js"
import {getE1, getE2, getE3, getE4, getE5, getE6} from "../../api/homePage.js";
import Message from "../../utils/message.js";
import {cloneDeep} from "lodash";
import fileUtil from "@/utils/fileSaver.js";
import {globalStore} from "../../store/modules/global.js";
const global = globalStore()
const E1 = ref(null)
const E2 = ref(null)


const colorList = [
  '#4DC4EA',
  '#6C6FBE',
  '#F8674A',
  '#79C346',
  '#F9B41B',
  '#60D8AB',
  '#3B5867',
  '#BDA29A',
  '#F8CD33',
  '#5FD8AB',
  '#8F56E4',
  '#C4CCD3',
  '#749F83',
  '#D48265',
  '#546570',

]
const option1 = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    right: 'right',
    itemWidth: 14,
    itemHeight: 10
  },
  // toolbox: {
  //   show: true,
  //   feature: {
  //     saveAsImage: {show: true, title: "下载"}
  //   }
  // },
  color: colorList,
  series: [
    {
      name: '案件类型',
      type: 'pie',
      radius: ['25%', '55%'],
      center: ['39%', '55%'],    // 默认全局居中
      // avoidLabelOverlap: false,
      label: {
        //echarts饼图内部显示百分比设置
        show: true,
        position: "outside", //outside 外部显示  inside 内部显示
        formatter: `{b} : {c}
 ({d}%)`,
        // color: "#ffffff", //颜色
        fontSize: 12 //字体大小
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 20,
          fontWeight: '10',
        }
      },
      labelLine: {
        show: true
      },
      data: []
    }
  ]
});
const option2 = ref({
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  color: ['#00B384'],
  series: [
    {
      data: [],
      type: 'line',
      smooth: true,
      
      markPoint: {
        data: [
          {type: 'max', name: 'Max'},
          {type: 'min', name: 'Min'}
        ]
      }
    }
  ]
});

const title = ref('zhou')
onMounted(async () => {
  await getDate()
  
  
})

function getDate() {
  getData1()
  getData2()
  getData3()
  getData4()
  getData5()
  
}

async function getData1() {
  const arr = []
  
  try {
    const {data: {data, code}} = await getE1(date.value)
    if (code == 200) {
      // console.log(data, code)
      data.forEach(item => {
        // console.log(item)
        arr.push({value: item.COUNT, name: item.LABEL})
      })
      
      option1.value.series[0].data = arr
      // console.log(option1.value,arr)
    } else {
      Message.error(data.message)
    }
  } catch (e) {
    Message.error(e.message)
  }
  E1.value.render(option1.value)
  
}

async function getData2() {
  try {
    const {data: {data, code}} = await getE2(date.value)
    if (code == 200) {
      option2.value.series[0].data = []
      option2.value.xAxis.data = []
      data.forEach(item => {
        option2.value.series[0].data.push(item.count)
        option2.value.xAxis.data.push(item.date.slice(5))
      })
      // console.log(option2.value)
    } else {
      Message.error(data.message)
    }
  } catch (e) {
    Message.error(e.message)
  }
  E2.value.render(option2.value)
}

const Data3 = ref()

async function getData3() {
  try {
    const {data: {data, code}} = await getE3(date.value)
    if (code == 200) {
      // console.log(data, code)
      Data3.value = data
    } else {
      Message.error(data.message)
    }
  } catch (e) {
    Message.error(e.message)
  }
}

const Data4 = ref([])
const claimData = ref()
async function getData4() {
  try {
    const {data: {data, code}} = await getE4(date.value)
    if (code == 200) {
      title1.value='ren'
  
      claimData.value = data
      
      Data4.value = cloneDeep(data)
      // console.log(Data4.value)
      columns.value = columns1
      
    } else {
      Message.error(data.message)
    }
  } catch (e) {
    Message.error(e.message)
  }
}
const enteringData = ref([])
async function getData5() {
  try {
    const {data: {data, code}} = await getE5(date.value)
    if (code == 200) {
      enteringData.value = data
    } else {
      Message.error(data.message)
    }
  } catch (e) {
    Message.error(e.message)
  }
}

const dateP = ref('')
const date = ref({
  startDate: $moment.formatTimestampToDate((Date.now() - 604800000)),
  endDate: $moment.formatTimestampToDate(Date.now())
  
  
})


function oneWeek() {
  dateP.value = ''
  
  title.value = 'zhou'
  date.value.endDate = $moment.formatTimestampToDate(Date.now())
  date.value.startDate = $moment.formatTimestampToDate((Date.now() - 604800000))
  getDate()
}

function oneMonth() {
  dateP.value = ''
  
  title.value = 'yue'
  date.value.endDate = $moment.formatTimestampToDate(Date.now())
  date.value.startDate = $moment.formatTimestampToDate((Date.now() - 2592000000))
  getDate()
  
}

function riQi(v) {
  title.value = 'qita'
  date.value.endDate = v[1]
  date.value.startDate = v[0]
  // console.log(v)
}

function query() {
  getDate()
}

function reset() {
  dateP.value = ''
  title.value = 'zhou'
  date.value.endDate = $moment.formatTimestampToDate((Date.now() + 604800000))
  date.value.startDate = $moment.formatTimestampToDate(Date.now())
  getDate()
  
}


function option3(peopleCount, objectCount) {
  return {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: '40%',
      right: 'right',
      itemWidth: 10,
      itemHeight: 10
    },
    color: ['#52e5d2', '#00b5f7'],
    series: [
      {
        name: '标定参数',
        type: 'pie',
        radius: '50%',
        avoidLabelOverlap: false,
        data: [
          {value: peopleCount, name: '人'},
          {value: objectCount, name: '物'},
        
        ],
        label: {
          //echarts饼图内部显示百分比设置
          show: true,
          position: "inside", //outside 外部显示  inside 内部显示
          formatter: `{d}%`,
          color: "#ffffff", //颜色
          fontSize: 12 //字体大小
        },
        
        labelLine: {
          show: false
        },
      }
    ]
  }
  
}
const columns = ref()
const columns1 = [
  {
    title: '排名',
    type: 'index',
  },
  {
    title: '警员',
    key: 'name'
  },
  {
    title: '认领',
    key: 'caseNum'
  }
]
const columns2 = [
  // {
  //   title: '排名',
  //   type: 'index',
  // },
  {
    title: '警员',
    key: 'username'
  },
  {
    title: '总数',
    key: 'total'
  },
  {
    title: '已完成',
    key: 'completedNum'
  },{
  title: '未完成',
    key: 'uncompletedNum'
  }
]
const title1 = ref('ren')
function claim(){
  title1.value='ren'
  Data4.value = cloneDeep(claimData.value)
  columns.value = columns1
  
}
function entering(){
  Data4.value = cloneDeep(enteringData.value)
  columns.value = columns2
  title1.value='lv'
}
//导出
const downloadUrl = ref()
async function derive(){
  try {
    const {data: {data, code}} = await getE6(date.value)
    if (code == 200) {
      
        downloadUrl.value=''
        let _o = data.replace(/\/mnt\/data\/upload/g,'')
        downloadUrl.value = global.env.fileUrl + _o
      
      // console.log( downloadUrl.value)
        fileUtil.save('统计', downloadUrl.value)
    } else {
      Message.error(data.message)
    }
  } catch (e) {
    Message.error(e.message)
  }
}
const columns3 = [
  {
    title: '四流',
    key: 'name',
    align:'center'
    
  },
  {
    title: '4大类',
    key: 'age',
    align:'center'
  
  },
  {
    title: '30小类',
    key: 'address',
    align:'center'
  
  }
]
const data3 =  [
  {
    name: '网络流',
    age: 4,
    address: '18',
  },
  {
    name: '资金流',
    age: 2,
    address: '4',
  },
  {
    name: '通讯流',
    age: 1,
    address: '3',

  },
  {
    name: '人员流',
    age: 2,
    address: '4',
  }
]
function rowClassName (row, index) {
  // console.log(row,index)
  if (index === 1) {
    return 'demo-table-info-row';
  } else if (index === 3) {
    return 'demo-table-info-row';
  }
  return '';
}
</script>
<template>
  <div class="top">
    <div style="display: flex;align-items: center">
      <div class="topButton" :class="title=='zhou'?'topActive':''" @click="oneWeek">本周趋势</div>
      <div class="topButton" :class="title=='yue'?'topActive':''" @click="oneMonth">最近一个月</div>
      <div style="font-size: 1.5vh">
        其他时间 &nbsp;&nbsp;
        <DatePicker type="daterange" split-panels placeholder="选择时间范围" @on-change="riQi"
                    style="width: 200px" v-model="dateP"></DatePicker>
      </div>
      <Button style="margin: 0 .2rem" type="primary" @click="query">查询</Button>
      <Button @click="reset">重置</Button>
    
    </div>
    <div>
      <Button type="primary" @click="derive">导出</Button>
    </div>
  </div>
  <div class="box">
    <div class="left">
      <Card class="t10">
        <div style="width: 100%;height: 100%; display: flex">
          <div style="width: 45%;height: 100%;border-right: 1px solid #ccc">
            <div><p class="title">新型案件分类趋势</p></div>
            <Echarts ref="E1"/>
          </div>
          <div style="width: 55%;height: 100%;">
            <div style="display: flex;justify-content: space-between">
              <p style="margin-left: .2rem;font-size: 1.8vh">案件总数</p>
<!--              <div style="padding: 0 1vh ;font-size: 1.2vh;background: #1875F0;color: #FFFFFF;line-height: 3vh">趋势统计</div>-->
            </div>
            <Echarts ref="E2"/>
          </div>
        </div>
      </Card>
      <div class="t11">
        <Card class="t110" v-for="(item,index) in Data3">
          <div class="row">
            <p style="font-size: 2vh;color: #000;font-weight: 700;margin-right: 1.5vh">{{ item.officeName }}</p>
            <p style="font-size: 1.8vh;">受理<span class="num1">{{ item.totalCount }}</span>件</p>
          </div>
          <div class="row">
            <div style="margin-right: 1vh">玄武<span class="num2">{{ item.internetTotalCount }}</span>/<span
              class="num3">{{ item.internetCompletedCount }}</span></div>
            <div>调证<span class="num2">{{ item.drawProofTotalCount }}</span>/<span
              class="num3">{{ item.drawProofCompletedCount }}</span></div>
          </div>
          <div class="row">
            <div class="bot">线索录入<span class="num2">{{ item.traceCount }}</span></div>
            <div class="bot">案内碰撞<span class="num2">{{ item.dataCollisionCount }}</span></div>
            <div class="bot">案间碰撞<span class="num2">{{ item.traceCollisionCount }}</span></div>
          </div>
          <div style="width: 17vh;height: 14vh;position: absolute;top: 0;right: 0">
            <echarts :option="option3(item.peopleCount,item.objectCount)"/>
          </div>
        </Card>
      </div>
      <Card class="t12">
          <p class="title">全能力展现</p>
        <div class="t121">
          <div class="img">
          </div>
          <div style="font-size: 1.8vh ;width: 18%; align-items: center;color: #999">
          可调证单位
            <p style="font-size: 3.8vh;font-weight: 700;color: #1D83FF">232  <span style="font-size: 1.8vh;color:#000;">家</span></p>
          </div>
          <div class="right">
            <Table :row-class-name="rowClassName" :columns="columns3" :data="data3"></Table>
          </div>
        </div>
      </Card>
    
    </div>
    <div class="right">
      <Card class="t20">
        <p class="top10">TOP <br> 10</p>
        <div style="border-left: 5px solid #1D83FF; padding-left: .1rem;display: flex;margin-bottom: .2rem" >
          <div class="topButton" :class="title1=='ren'?'topActive':''" @click="claim">案件认领</div>
          <div class="topButton" :class="title1=='lv'?'topActive':''" @click="entering">任务录入统计</div>
        </div>
        
        <Table stripe :columns="columns" :data="Data4"></Table>
      </Card>
    </div>
  </div>
</template>
<style scoped lang="less">
:deep(.ivu-table){
  font-size: 1.5vh;
  line-height: 3.5vh;
  td{
    height: 5vh;
    
  }
  .demo-table-info-row td{
    background-color: #f2f7fb;
   
  }
}

.box{
  font-size: 1.6vh;
}
.num1 {
  font-weight: 700;
  font-size: 2.6vh;
  color: #F2B23E;
  padding: 0 .8vh;

}

.num2 {
  font-weight: 700;
  color: #57a3f3;
  padding: 0 .8vh;
}

.num3 {
  font-weight: 700;
  color: #24B493;
  padding: 0 .8vh;
}

.top10 {
  font-size: 1.5vh;
  background-color: #1875F0;
  color: #FFFFFF;
  width: 5vh;
  height: 5vh;
  border-radius: 0 0 0 4vh;
  position: absolute;
  right: 0;
  top: 0;
  text-align: center;
  line-height: 1.5vh;
  padding-top: 1vh;
}

.top {
  background: #FFFFFF;
  width: 100%;
  height: 5vh;
  padding: 0 2vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .topButton {
    font-size: 1.8vh;
    margin-right: 3vh;
    color: #cccccc;
  }
  
  .topActive {
    color: #000;
    border-bottom: .4vh solid #1D83FF;
  }
}

.box {
  padding: .1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  
  height: 94vh;
  
  .left {
    width: 74%;
    height: 100%;
    
    .t10 {
      height: 45VH;
      margin-bottom: 1vh;
  
  
      :deep(.ivu-card-body) {
        width: 100%;
        height: 42VH;
    
      }
    }
    
    .t11 {
      width: 100%;
      height: 17%;
      display: flex;
      justify-content: space-between;
      margin-bottom: 1vh;
  
  
      .t110 {
        position: relative;
        width: 33%;
        
        .row {
          display: flex;
          align-items: end;
          flex-wrap: nowrap;
          color: #aaa;
          line-height: 4.35vh;
          font-size: 1.4vh;
        }
      }
    }
    
    .t12 {
      height: 32%;
      margin-bottom: 1vh;
      .t121{
        height: 25vh;
        width: 100%;
        //background: #F2B23E;
        display: flex;
        align-items: center;
        .img{
          height: 20vh;
          width: 25%;
          background: center / contain no-repeat url("@/assets/images/E6.png") ;
        }
        .right{
          width: 60%;
          height: 27vh;
          //background: #F2B23E;
        }
      }
    }
    
  }
  
  .right {
    width: 25%;
    height: 100%;
    
    .t20 {
      height: 100%;
      margin-bottom: .2rem;
      .topButton {
        font-size: 1.8vh;
        margin-right: 3vh;
        color: #cccccc;
        
      }
      .topActive {
        color: #000;
        border-bottom: .4vh solid #1D83FF;
      }
    }
    
    .t21 {
      height: 45%;
    }
  }
;
  
  .title {
    font-size: 1.8vh;
    font-weight: 700;
    border-left: 5px solid #1D83FF;
    padding-left: 1vh;
  }
}
.ivu-table .demo-table-info-row td{
  background-color: #2db7f5;
  color: #fff;
}
.ivu-table .demo-table-error-row td{
  background-color: #ff6600;
  color: #fff;
}
.ivu-table td.demo-table-info-column{
  background-color: #2db7f5;
  color: #fff;
}
.ivu-table .demo-table-info-cell-name {
  background-color: #2db7f5;
  color: #fff;
}
.ivu-table .demo-table-info-cell-age {
  background-color: #ff6600;
  color: #fff;
}
.ivu-table .demo-table-info-cell-address {
  background-color: #187;
  color: #fff;
}
</style>




<script setup>
import {ref, reactive, computed, watch, nextTick, getCurrentInstance} from "vue";
import {ajListStore} from "@/store/modules/ajList.js";
import {storeToRefs} from "pinia";
import {getReportSummary, getReportScore} from '@/api/report.js'
import appBasicInfo from '@/components/appInfo/index.vue'
import {exportPdf} from "@/utils/jspdf.js";
import wordUtil from "@/utils/word.js"
import {dictStore} from "@/store/modules/dictionary.js";
import AppInfo from "./appInfo.vue";
import UrlInfo from "./urlInfo.vue";
const dict = dictStore()
const ajStore = ajListStore()
let {caseInfo} = storeToRefs(ajStore)
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  info: {
    type: Object,
    default() {
      return {
        id: '',
        num: '',
        name:'',
        money: ''
      }
    }
  }
})
const {proxy} = getCurrentInstance()
const isRendered = ref(false)// 内容渲染完毕
const exporting = ref(false)
const appRef = ref(null)
const emit = defineEmits(['close'])
watch(() => props.visible, (n) => {
  if(n) {
    isRendered.value = false
    app.appParam.caseId = caseInfo.value.id || props.info.id
    // app.appParam.taskChannelId = ''
    if(props.info.id) {
      basic.caseId =  caseInfo.value.id || props.info.id
      basic.caseName = props.info.name
      basic.caseNo = props.info.num
      basic.caseMoney = props.info.money
    } else {
      basic.caseId = caseInfo.value.id || props.info.id
      basic.caseName = caseInfo.value.name
      basic.caseNo = caseInfo.value.num
      basic.caseMoney = caseInfo.value.money
    }
    getSummaryData()
    getScoreData()
    nextTick(() => {
      setTimeout(() => {
        isRendered.value = true
      }, 3000)
    })
    
  }
}, {immediate: false})

const basic = reactive({
  caseName: '',
  caseNo: '',
  caseMoney: 0,
  topic: computed(() => {
    return basic.caseName + '初侦报告'
  }),
  declare: '本服务平台对app应用进行独立、客观、公正分析并出具分析报告，不受任何个人或者组织的非法干预。本次分析结果只针对本次上传的app应用或网址有效，本服务平台拥有对本次分析报告的最终解释权。',
  
  
})
const Score = reactive({
  tableData: [],
  column: [
    {
      title: '等级',
      minWidth: 80,
      tooltip: true,
      key: 'level',
      align: 'center'
      /* render: (h, params) => {
        let level = params.row.level
        if (level == '00') {
          level = '高'
        } else if (level == '10') {
          level = '中'
        } else if (level == '20') {
          level = '低'
        }
        return h('span', level)
      } */
    },
    {
      title: '积分项',
      minWidth: 150,
      key: 'scoreCnname',
      align: 'center'
    },
    {
      title: '命中状态',
      minWidth: 80,
      key: 'hitDetail',
      align: 'center',
      render: (h, params) => {
        let score = params.row.hit
        let slabel = score == 1 ? params.row.hitDetail : '否'
        
        return h('span', {
          style: {
            color: score == 1 ? 'red' : '#000'
          }
          
        }, slabel)
      }
    }
  ],
  integralMethod: ({ row, column, rowIndex, columnIndex }) => {
    if (columnIndex == 0) {
      return {
        rowspan: row.rowspan,
        colspan: 1
      }
    }
  }
})
const Summary = reactive({
  typeCount: [],
  column: [
    {
      align: 'center',
      show: true,
      tooltip: false,
      title: '线索类型',
      key: 'trackType',
      minWidth: 150,
      // collisionType: 'file',
      // targetTable: 'ii_attachment',
      targetColumn: 'trackType',
      dataType: '',
      renderHeader: '',
      slot: '',
      render: (h, params) => {
        let k = params.row.trackType
        let label = ''
        if (k == 'virtualId') {
          label = '虚拟身份'
        } else if (k == 'apk') {
          label = 'APK'
        } else if (k == 'url') {
          label = 'URL'
        } else if (k == 'phone') {
          label = '手机号'
        } else if (k == 'mac') {
          label = 'MAC'
        } else if (k == 'ip') {
          label = 'IP'
        } else if (k == 'idcard') {
          label = '证件'
        } else if (k == 'bankCard') {
          label = '卡类'
        } else if (k == 'ewallet') {
          label = '电子钱包'
        } else {
          label = k
        }
        return h('div', label)
      }
    },
    {
      align: 'center',
      // show: true,
      tooltip: false,
      title: '线索名称',
      key: 'traceName',
      minWidth: 150,
      // collisionType: 'file',
      // targetTable: 'ii_attachment',
      targetColumn: 'traceName',
      dataType: '',
      renderHeader: '',
      slot: ''
    },
    {
      align: 'center',
      show: true,
      tooltip: true,
      title: '信息',
      key: 'info',
      minWidth: 150,
      // collisionType: 'file',
      // targetTable: 'ii_attachment',
      targetColumn: 'info',
      dataType: '',
      renderHeader: '',
      slot: ''
    },
    {
      align: 'center',
      show: true,
      tooltip: true,
      title: '结果统计',
      key: 'num',
      minWidth: 150,
      // collisionType: 'file',
      // targetTable: 'ii_attachment',
      targetColumn: 'num',
      dataType: '',
      renderHeader: '',
      slot: ''
    }
  ],
  tableData:[],
  integralMethod: ({ row, column, rowIndex, columnIndex }) => {
    if (columnIndex == 0) {
      return {
        rowspan: row.rowspan,
        colspan: 1
      }
    } else if (columnIndex == 1) {
      return {
        rowspan: row.nameRowspan,
        colspan: 1
      }
    }
  },
  
})

const app = reactive({
  appParam: {
    caseId: ''
  },
  /*appInfoCall: () => {

  },
  caseUrlColumn:[],
  caseUrlTable: []*/
})
// const detectCaseType = computed(() => dict.dict.detectCaseType.list)



const trackTypeList = computed(()=>dict.dict.trackType.list)
if(trackTypeList.value.length<0){
  dict.getDict('trackType')
}
const Guide = reactive({
  column: [
    {
      title: '线索类型',
      maxWidth: 120,
      tooltip: false,
      key: 'trackType',
      align: 'center',
      render:(h,params)=>{
        let res = ''
        trackTypeList.value.filter(item=>{
          if(item.value==params.row.trackType){
            res =  item.label
          }
        })
        return res
      }
      
    },
    {
      title: '线索名称',
      minWidth: 200,
      tooltip: false,
      key: 'traceName',
      align: 'center'
    },
    {
      title: '查询结果',
      minWidth: 100,
      tooltip: false,
      key: 'info',
      align: 'center'
    },
    {
      title: '能力名称',
      minWidth: 100,
      tooltip: false,
      key: 'solutionName',
      align: 'center'
    },
    {
      title: '能力指引',
      minWidth: 200,
      tooltip: false,
      key: 'guide',
      align: 'center'
    }
  ],
  tableData:[],
  integralMethod: ({ row, column, rowIndex, columnIndex }) => {
    if (columnIndex == 0) {
      return {
        rowspan: row.rowspan,
        colspan: 1
      }
    }
  }
})

function getSummaryData() {
  Summary.tableData = []
  getReportSummary({caseId: caseInfo.value.id}).then(res => {
    let { code, data } = res.data
    console.log(code ,res)
    if (code == 200) {
      
      
      let list = []
      for(let k in data.detectSummary) {
        let reg = /\((.+?)\)/gi
        let label = k.match(reg)[0].replace(/\(/, "").replace(/\)/, "")
        list.push({label:label, count: data.detectSummary[k]})
      }
      Summary.typeCount = list
      
      let result = data.statistics
      let arr = []
      for (let k in result) {
        result[k].forEach(r => {
          let info = r.info.split(',')
          let nums = r.nums.split(',')
          let list = []
          info.forEach((c, i) => {
            list.push({ trackType: k, traceName: r.traceName, info: c, num: nums[i] })
          })
          r.list = list
          arr = arr.concat(list)
        })
        // this.summaryDetail.set(k, result[k])
      }
      arr.forEach(a => {
        a.rowspan = 1
        a.nameRowspan = 1
      })
      
      
      for (let i = 0, len = arr.length; i < len; i++) {
        for (let j = i + 1, jLen = arr.length; j < jLen; j++) {
          if (arr[i].trackType == arr[j].trackType) {
            arr[i].rowspan++
            arr[j].rowspan--
          }
          if (arr[i].traceName == arr[j].traceName) {
            arr[i].nameRowspan++
            arr[j].nameRowspan--
          }
          
        }
        i = i + arr[i].rowspan - 1
      }
      Summary.tableData = arr
      
      let dicArr = []
      
      data.dicGuideList.forEach(d => {
        for (let dk in d) {
          dicArr = dicArr.concat(d[dk])
        }
      })
      dicArr.forEach(v => {
        v.rowspan = 1
      })
      // for (let i = 0, len = dicArr.length; i < len; i++) {
      //   for (let j = i + 1, jLen = dicArr.length; j < jLen; j++) {
      //     if (dicArr[i].trackType == dicArr[j].trackType) {
      //       dicArr[i].rowspan++
      //       dicArr[j].rowspan--
      //     }
      //   }
      //   i = i + dicArr[i].rowspan - 1
      // }
      let i = 0;
      while (i < dicArr.length) {
        let len = dicArr.length;
        let rowspan = dicArr[i].rowspan;
        for (let j = i + 1; j < len; j++) {
          if (dicArr[i].trackType == dicArr[j].trackType) {
            rowspan++;
            dicArr[j].rowspan--;
          } else {
            break;
          }
        }
        dicArr[i].rowspan = rowspan;
        i += rowspan;
      }
      
      
      
      Guide.tableData = dicArr
      
    }
  }).catch(err => {
    console.log(err);
  })
}

function getScoreData() {
  Score.tableData = []
  getReportScore({caseId: basic.caseId}).then(res => {
    let { code, data } = res.data
    if (code == 200) {
      let list = data
      // let list = data.high.concat(data.mid).concat(data.low)
      list.forEach(v => {
        v.rowspan = 1
        v.hitDetail = v.hit == 1 ? v.hitDetail : '否'
      })
      for (let i = 0, len = list.length; i < len; i++) {
        for (let j = i + 1, jLen = list.length; j < jLen; j++) {
          if (list[i].level === list[j].level) {
            list[i].rowspan++
            list[j].rowspan--
          }
        }
        i = i + list[i].rowspan - 1
      }
      Score.tableData = list
    }
  })
}

function submit () {
  exporting.value = true
  let title = basic.topic
  exportPdf('', document.getElementById('reportPdf'), title, () => {
    proxy.$Message.success('导出成功，正在下载')
    exporting.value = false
  })
}

function exportWord() {
  exporting.value = true
  let title = basic.topic
  let filePath = 'reportm.docx'
  let firstDetectResult = ''
  Summary.typeCount.forEach(item => {
    firstDetectResult += item.label + ':' +item.count + ' '
  })
  
  let App = JSON.parse(JSON.stringify(appRef.value.App))
  let docContent = {
    reportTitle: title,
    declare: basic.declare,
    caseName: basic.caseName,
    caseNo: basic.caseNo,
    caseMoney: basic.caseMoney,
    firstDetectResult: firstDetectResult,
    resultTable: Summary.tableData,
    scoreTable: Score.tableData,
    App: App,
    guideList: Guide.tableData
  }
  console.log(docContent);
  wordUtil.exportWord(filePath, docContent, title + '.docx', () => {
    proxy.$Message.success('导出文件成功')
    exporting.value = false
  }, () => {
    proxy.$Message.error('导出文件出现错误')
    exporting.value = false
  })
}

function close() {
  emit('close')
}


</script>
<template>
  <Layout class="layout-wrap">
    <div id="reportPdf">
      <div class="topic">{{ basic.topic }}</div>
      <div class="declare section">
        <div class="title">
          一、报告申明
        </div>
        <p class="indent">{{ basic.declare }}</p>
      </div>
      <div class=" section">
        <div class="title">
          二、案件信息
        </div>
        <div class="case">
          <p>案件名称：<span style="color: #515A6E">{{ basic.caseName }}</span></p>
          <p>案件编号：<span style="color: #515A6E">{{ basic.caseNo }}</span></p>
          <p>涉案金额：<span style="color: #515A6E">{{ basic.caseMoney }}</span></p>
        </div>
      </div>
      <div class="result section">
        <div class="title">
          三、初侦结果
        </div>
        <p style="padding-bottom: 20px"><span style="font-size: 20px;color: #515A6E;font-weight: 600">共查询:</span> <span
          style="margin-left: 25px;" v-for="(item, i) in Summary.typeCount"
          :key="i">{{ item.label }}:<b>{{ item.count }}</b></span></p>
        <div class="phone box">
          <div class="title1">
            <span style="font-size: 20px;color: #515A6E;font-weight: 600;">  手机号：</span><span
            style="font-size: 18px;margin: 0 10px 0 0">13874955562</span>
            <Tag size="large" color="blue">生活机</Tag>
          </div>
          <div class="num">
            <p>基本画像：<span>2条</span></p>
            <p>四吗信息：<span>2条</span></p>
            <p>对应APP安装列表：<span>2条</span></p>
            <p>轨迹信息：<span>2条</span></p>
            <p>常用WIFI：<span>2条</span></p>
            <p>常用IP：<span>2条</span></p>
          </div>
          <Row class-name="table1">
            <Col span="3" class-name="col1">基本画像</Col>
            <Col span="2" class-name="col3">20条</Col>
            <Col span="19" class-name="col2">
              <p><span class="bt">工作地：</span>col-6 | pull-18col-6 | pull-18col-6 | pull-18col-6 </p>
              <p><span class="bt">居住地：</span>col-6 | pull-18col-6 | pull-18col-6 | pull-18col-6 </p>
              <p><span class="bt">最新地：</span>col-6 | pull-18col-6 | pull-18col-6 | pull-18col-6 </p>
            </Col>
          </Row>
          <Row class-name="table1">
            <Col span="3" class-name="col1">四码信息</Col>
            <Col span="2" class-name="col3">20条</Col>
            <Col span="19" class-name="col2">
              <div style="width: 100%">
                <span style="width: 25%;display: inline-block"><span class="bt">IMSI:</span>351521004992889</span>
                <span style="width: 25%;display: inline-block"><span class="bt">IMEI:</span>351521004992889</span>
                <span style="width: 25%;display: inline-block"><span class="bt">MAC:</span>351521004992889</span>
                <span style="width: 25%;display: inline-block"><span class="bt">OAID:</span>351521004992889</span>
              </div>
            </Col>
          </Row>
          <Row class-name="table1">
            <Col span="3" class-name="col1">对应app安装列表</Col>
            <Col span="2" class-name="col3">20条</Col>
            <Col span="19" class-name="col2">
              <div>
                <Tag size="large" color="blue">QQ</Tag>
                <Tag size="large" color="blue">微信</Tag>
                <Tag size="large" color="blue">淘宝</Tag>
              </div>
            </Col>
          </Row>
          <Row class-name="table1">
            <Col span="3" class-name="col1">轨迹信息</Col>
            <Col span="2" class-name="col3">20条</Col>
            <Col span="19" class-name="col2">col-6 | pull-18col-6 | pull-18col-6 |</Col>
          </Row>
          <Row class-name="table1">
            <Col span="3" class-name="col1">常用WIFI</Col>
            <Col span="2" class-name="col3">20条</Col>
            <Col span="19" class-name="col2">col-6 | pull-18col-6 | pull-18col-6 |</Col>
          </Row>
          <Row class-name="table1">
            <Col span="3" class-name="col1">常用IP</Col>
            <Col span="2" class-name="col3">20条</Col>
            <Col span="19" class-name="col2">col-6 | pull-18col-6 | pull-18col-6 |</Col>
          </Row>
        </div>
        <div class="ip box">
          <div class="title1">
            <span style="font-size: 20px;color: #515A6E;font-weight: 600;">  IP分析</span><span
            style="font-size: 16px;padding: 0 0 0 20px   ;color: #FF0000">宽带（价值最高关联设备）</span>
          </div>
          <div class="family1">
            <div class="family-title">
              <span>196.128.1.1</span>
              <Tag color="red">家宽</Tag>
            </div>
            <Row class-name="table1">
              <Col span="3" class-name="col1">关联设备</Col>
              <Col span="2" class-name="col3">20条</Col>
              <Col span="19" class-name="col2">col-6 | pull-18col-6 | pull-18col-6 |</Col>
            </Row>
            <Row class-name="table1">
              <Col span="3" class-name="col1">关联WIFI</Col>
              <Col span="2" class-name="col3">20条</Col>
              <Col span="19" class-name="col2">col-6 | pull-18col-6 | pull-18col-6 |</Col>
            </Row>
          </div>
          <div class="family">
            <div class="family-title">
              <span>多关联IP分析</span>
            </div>
            <Row class-name="table1">
              <Col span="12" class-name="col1">同环境WIFI分析</Col>
              <Col span="12" class-name="col1">同环境设备分析</Col>
              <Col span="6" class-name="col1">同环境设备</Col>
              <Col span="6" class-name="col1">WIFI信息</Col>
              <Col span="6" class-name="col1">关联设备</Col>
              <Col span="6" class-name="col1">关联WiFi</Col>
              
              <Col span="6" class-name="col2">15340745622 15340745622 15340745622 15340745622 15340745622</Col>
              <Col span="6" class-name="col2">15340745622</Col>
              <Col span="6" class-name="col2">15340745622</Col>
              <Col span="6" class-name="col2">15340745622</Col>
            </Row>
          </div>
          
          <div class="data-center">
            <div class="family-title">
              <span>196.128.1.1</span>
              <Tag color="gold">数据中心</Tag>
            </div>
            <Row class-name="table1">
              <Col span="8" class-name="col1">是否存活</Col>
              <Col span="8" class-name="col1">是否境内</Col>
              <Col span="8" class-name="col1">二级代理商是否在境内</Col>
              
              <Col span="8" class-name="col2">否</Col>
              <Col span="8" class-name="col2">是</Col>
              <Col span="8" class-name="col2">是</Col>
            </Row>
          </div>
          <div class="move-data">
            <div class="family-title">
              <span>196.128.1.1</span>
              <Tag color="blue">移动数据</Tag>
            </div>
            <Row class-name="table1">
              <Col span="3" class-name="col1">关联WIFI</Col>
              <Col span="2" class-name="col3">20条</Col>
              <Col span="19" class-name="col2">col-6 | pull-18col-6 | pull-18col-6 |</Col>
            </Row>
          </div>
        </div>
      </div>
      <div class="apk box">
        <div class="title1">
          <span style="font-size: 20px;color: #515A6E;font-weight: 600;">  APK：</span>
        </div>
        <div class="center">
          <div class="logo"><img src="@/assets/vue.svg"><span>集采体育</span></div>
          <Row class-name="table1">
            <Col span="4" class-name="col1">可以域名</Col>
            <Col span="4" class-name="col1">安装分布情况</Col>
            <Col span="4" class-name="col1">主控域名</Col>
            <Col span="4" class-name="col1">IP</Col>
            <Col span="4" class-name="col1">第三方调证</Col>
            <Col span="4" class-name="col1">0号机发现</Col>
            <Col span="4" class-name="col2">1条</Col>
            <Col span="4" class-name="col2" style="display: flex;flex-direction: row">2条&nbsp;&nbsp;
              <Tag color="red">含高危地区</Tag>
            </Col>
            <Col span="4" class-name="col2">1条</Col>
            <Col span="4" class-name="col2">1条</Col>
            <Col span="4" class-name="col2" style="display: flex;flex-direction: row">6条&nbsp;&nbsp;
              <Tag color="blue">重点关注</Tag>
              <Tag color="green">绿色通道</Tag>
            </Col>
            <Col span="4" class-name="col2">1条</Col>
          </Row>
        </div>
        <div class="center">
          <div class="logo"><img src="@/assets/vue.svg"><span>集采体育</span></div>
          <Row class-name="table1">
            <Col span="4" class-name="col1">可以域名</Col>
            <Col span="4" class-name="col1">安装分布情况</Col>
            <Col span="4" class-name="col1">主控域名</Col>
            <Col span="4" class-name="col1">IP</Col>
            <Col span="4" class-name="col1">第三方调证</Col>
            <Col span="4" class-name="col1">0号机发现</Col>
            <Col span="4" class-name="col2">1条</Col>
            <Col span="4" class-name="col2" style="display: flex;flex-direction: row">2条&nbsp;&nbsp;
              <Tag color="red">含高危地区</Tag>
            </Col>
            <Col span="4" class-name="col2">1条</Col>
            <Col span="4" class-name="col2">1条</Col>
            <Col span="4" class-name="col2" style="display: flex;flex-direction: row">6条&nbsp;&nbsp;
              <Tag color="blue">重点关注</Tag>
              <Tag color="green">绿色通道</Tag>
            </Col>
            <Col span="4" class-name="col2">1条</Col>
          </Row>
        </div>
      </div>
      <div class="url box">
        <div class="title1">
          <span style="font-size: 20px;color: #515A6E;font-weight: 600;">  URL：</span>
        
        </div>
        <Row class-name="table1">
          <Col span="3" class-name="col1">URL解析基本信息</Col>
          <Col span="2" class-name="col3">20条</Col>
          <Col span="19" class-name="col2">www.downkuai.com,https://16803.icu/mobile/,http://ou78rt.com</Col>
        </Row>
      </div>
      <div class="app section">
        <div class="title">
          五、APK解析
        </div>
        <app-info></app-info>
      </div>
      <div class="url section">
        <div class="title">
          六、URL解析
        </div>
        <url-info></url-info>
      </div>
    </div>
    <Footer class="layout-footer" v-show="isRendered" style="text-align: left">
      <Button @click="close()">关闭</Button>
      <Button @click="submit()" type="success" :loading="exporting" style="margin: 0 8px;">导出报告pdf</Button>
      <Button @click="exportWord()" type="primary" :loading="exporting" style="">导出报告word</Button>
    </Footer>
  
  </Layout>
</template>
<style scoped lang="less">
#reportPdf {
  padding: 20px 30px;
}

.layout-wrap {
  position: relative;
  min-height: 100%;
  background-color: #fff;
  font-size: 15px;
  padding: 40px;
}

.layout-footer {
  position: fixed;
  bottom: 8px;
  left: 20px;
  background-color: transparent;
  height: 40px;
  padding: 0;
}

.title {
  padding: 20px 0;
  font-weight: 500;
  line-height: 40px;
  font-size: 24px;
  color: #2D8CF2;
}

.case {
  padding: 25px 50px;
  border-radius: 10px;
  background: #F8F8F8;
  display: flex;
  justify-content: space-around;
  color: rgba(0, 0, 0, 0.4);
  font-size: 18px;
  
  p {
    margin-right: 100px;
  }
}

.box {
  padding: 40px;
  background: #F8F8F8;
  margin-bottom: 36px;
  border-radius: 10px;
  
  
  .title1 {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 20px;
  }
  
  .table1 {
    display: flex;
    align-content: center;
    justify-items: center;
    font-size: 18px;
    
    .col1 {
      display: flex;
      align-items: center;
      background: #EEEEEE;
      padding: 15px;
      border: 1px solid #D3D3D3;
      vertical-align: middle;
      
    }
    
    .col2 {
      display: flex;
      flex-direction: column;
      padding: 15px;
      border: 1px solid #D3D3D3;
      vertical-align: middle;
      background: #FFFFFF;
      
      .bt {
        color: rgba(0, 0, 0, 0.4);
        font-weight: 400;
      }
    }
    
    .col3 {
      display: flex;
      align-items: center;
      background: #EEEEEE;
      padding: 15px;
      border: 1px solid #D3D3D3;
      vertical-align: middle;
      justify-content: center;
    }
  }
}

.phone {
  
  .num {
    display: flex;
    padding: 20px 0;
    font-size: 18px;
    
    p {
      padding: 0 25px;
      border-right: 1px solid rgba(0, 0, 0, 0.1);
      color: rgba(0, 0, 0, 0.4);
      
      span {
        font-weight: 400;
        color: #515A6E;
      }
      
      &:last-child {
        border-right: 0px solid rgba(0, 0, 0, 0.1);
        
      }
    }
  }
  
  
}

.ip {
  .family-title {
    padding: 20px 0;
    font-size: 18px;
    font-weight: 400;
    
    span {
      margin-right: 20px;
    }
  }
  
  .family, .data-center {
    .table1 {
      .col1 {
        justify-content: center;
      }
      
      .col2 {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  
}

.apk {
  .center {
    margin-top: 20px;
    
    .logo {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
      
      img {
        width: 38px;
        height: 38px;
        margin-right: 20px;
      }
      
      span {
        font-size: 20px;
        
        font-weight: 600;
        color: #515A6E;
        line-height: 23px;
      }
    }
    
    .table1 {
      .col1, .col2 {
        justify-content: center;
        align-items: center;
      }
    }
  }
}
.app{
  .app-head{
    display: flex;
    .box{
      width: 50%;
      &:nth-child(1){
        margin-right: 36px;
      }
      p{
        font-size: 20px;
        
        font-weight: 600;
        color: #515A6E;
        line-height: 23px;
      }
    }
    .app-text{
      .test-item{
        display: flex;
        font-size: 18px;
        align-items: center;
        justify-content: center;
        height: 70px;
        .left{
          text-align: right;
          font-weight: 400;
          color: rgba(0,0,0,0.4);
          line-height: 21px;
        }
        .right{
          display: flex;
          align-items: center;
          font-weight: 400;
          color: #515A6E;
          line-height: 21px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  .sdk{
    font-weight: 400;
    color: #515A6E;
    line-height: 21px;
  }
}

.section {
  margin-bottom: 25px;
}

.indent {
  text-indent: 30px;
  font-size: 20px;
}

.topic {
  text-align: center;
  font-size: 24px;
}

.btn-group {
  position: fixed;
  left: 4px;
  bottom: 4px;
}
</style>


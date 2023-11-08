<script setup>
import {ref, reactive, computed, watch, nextTick, getCurrentInstance} from "vue";
import {ajListStore} from "@/store/modules/ajList.js";
import {storeToRefs} from "pinia";
import {getReportScore} from '@/api/report.js'
import {exportPdf} from "@/utils/jspdf.js";
import wordUtil from "@/utils/word.js"
import {dictStore} from "@/store/modules/dictionary.js";
import AppInfo from "./appInfo.vue";
import UrlInfo from "./urlInfo.vue";
import $Message from "@/utils/message.js";

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
    default () {
      return {
        id: '',
        num: '',
        name: '',
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
  if (n) {
    isRendered.value = false
    if (props.info.id) {
      basic.caseId = caseInfo.value.id || props.info.id
      basic.caseName = props.info.name
      basic.caseNo = props.info.num
      basic.caseMoney = props.info.money
    } else {
      basic.caseId = caseInfo.value.id || props.info.id
      basic.caseName = caseInfo.value.name
      basic.caseNo = caseInfo.value.num
      basic.caseMoney = caseInfo.value.money
    }
    Data.value = {
      caseInfo: {
        caseName: '',
        caseNo: '',
        amountInvolved: ''
      },
      countStat: [],//共查询线索
      reportPhoneInfo: [], //手机号码信息
      reportUrlInfo: [], //URL信息
      reportApkInfo: [],//apk信息
      reportIpInfo: []
    }
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

function type1 (k) {
  let label
  if (k == 'virtualId') {
    label = '虚拟身份'
  } else if (k == 'apk') {
    label = 'APK'
  } else if (k == 'url') {
    label = 'URL'
  } else if (k == 'phone') {
    label = '手机号'
  } else if (k == 'wifi') {
    label = 'MAC'
  } else if (k == 'ip') {
    label = 'IP'
  } else if (k == 'idcard') {
    label = '证件'
  } else if (k == 'bankCard') {
    label = '卡类'
  } else if (k == 'ewallet') {
    label = '电子钱包'
  }
  return label
}

const Data = ref({
  caseInfo: {
    caseName: '',
    caseNo: '',
    amountInvolved: ''
  },
  countStat: [],//共查询线索
  reportPhoneInfo: [], //手机号码信息
  reportUrlInfo: [], //URL信息
  reportApkInfo: [],//apk信息
  reportIpInfo: []
})
const spinShow = ref(false)

function getScoreData () {
  spinShow.value = true
  getReportScore({caseId: basic.caseId}).then(res => {
    let {code, data,message} = res.data
    if (code == 200) {
      console.log(data)
      
      spinShow.value = false
      Data.value.caseInfo = data.caseInfo
      Data.value.reportPhoneInfo = data.reportDetail.reportPhoneInfo
      Data.value.reportUrlInfo = data.reportDetail.reportUrlInfo
      Data.value.countStat = data.reportDetail.countStat
      Data.value.reportApkInfo = data.reportDetail.reportApkInfo
      Data.value.reportIpInfo = data.reportDetail.reportIpInfo
      
      if(Data.value.reportApkInfo){
        Data.value.reportApkInfo.forEach((item,index)=>{
	        if(item.basicInfo){
		        if(item.basicInfo.iconUrl){
			        if(!item.basicInfo.iconUrl.startsWith('http')){
				        item.basicInfo.iconUrl = 'data:image/jpg;base64,' +  item.basicInfo.iconUrl
			        }
		        }
	        }
         
        })
      }
     

    } else {
      $Message.error(message)
      spinShow.value = false
    }
	  spinShow.value = false
  }).catch(err => {
    spinShow.value = false
    $Message.error(err)
    console.log(err)

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

// function exportWord () {
//   exporting.value = true
//   let title = basic.topic
//   let filePath = 'reportm.docx'
//   let firstDetectResult = ''
//
//   let App = JSON.parse(JSON.stringify(appRef.value.App))
//   let docContent = {
//     reportTitle: title,
//     declare: basic.declare,
//     caseName: basic.caseName,
//     caseNo: basic.caseNo,
//     caseMoney: basic.caseMoney,
//     firstDetectResult: firstDetectResult,
//     resultTable: Summary.tableData,
//     scoreTable: Score.tableData,
//     App: App,
//     guideList: Guide.tableData
//   }
//   console.log(docContent);
//   wordUtil.exportWord(filePath, docContent, title + '.docx', () => {
//     proxy.$Message.success('导出文件成功')
//     exporting.value = false
//   }, () => {
//     proxy.$Message.error('导出文件出现错误')
//     exporting.value = false
//   })
// }

function close () {
  emit('close')
}
</script>
<template>
  <Layout class="layout-wrap">
    <div id="reportPdf">
      <div class="topic">{{ }}</div>
      <div class="declare section">
        <div class="title">
          一、报告申明
        </div>
        <p class="indent">本服务平台对app应用进行独立、客观、公正分析并出具分析报告，不受任何个人或者组织的非法干预。本次分析结果只针对本次上传的app应用或网址有效，本服务平台拥有对本次分析报告的最终解释权。</p>
      </div>
      <div class=" section">
        <div class="title">
          二、案件信息
        </div>
        <div class="case">
          <p>案件名称：<span style="color: #515A6E">{{ Data.caseInfo.caseName }}</span></p>
          <p>案件编号：<span style="color: #515A6E">{{ Data.caseInfo.caseNo }}</span></p>
          <p>涉案金额：<span style="color: #515A6E">{{ Data.caseInfo.amountInvolved }}</span></p>
        </div>
      </div>
      <div class="result section">
        <div class="title">
          三、玄武能力结果
        </div>
        <p style="padding-bottom: 20px"><span style="font-size: 20px;color: #515A6E;font-weight: 600">共查询:</span> <span
          v-for="(item, i) in Data.countStat" :key="i"
          style="margin-left: 25px;">{{ type1(item.type) }}:<b>{{ item.count }}</b></span></p>
        <div v-for="phone in Data.reportPhoneInfo" :key="phone.traceName" class="phone box">
          <div class="title1">
            <span style="font-size: 20px;color: #515A6E;font-weight: 600;">  手机号：</span><span
            style="font-size: 18px;margin: 0 10px 0 0">{{ phone.traceName }}</span>
            <!--            <Tag color="blue" size="large">生活机</Tag>-->
          </div>
          
          <Row class-name="table1">
            <Col class-name="col1" span="3">基本画像</Col>
            <Col class-name="col3" span="2">{{ phone.userinfoCount }}条</Col>
            <Col class-name="col2" span="19">
              <p><span class="bt">工作地：</span>{{ phone.userinfoDetail[0] ? phone.userinfoDetail[0].workAddress : '' }} </p>
              <p><span class="bt">居住地：</span>{{ phone.userinfoDetail[0] ? phone.userinfoDetail[0].homeAddress : '' }}</p>
              <p><span class="bt">最新地：</span>{{ phone.userinfoDetail[0] ? phone.userinfoDetail[0].address : '' }}</p>
            </Col>
          </Row>
          <Row class-name="table1">
            <Col class-name="col1" span="3">四码信息</Col>
            <Col class-name="col3" span="2">{{ phone.fourCodeCount }}条</Col>
            <Col class-name="col2" span="19">
              <div style="width: 100%">
                
                <span style="min-width: 15%;display: inline-block;margin-right: 20px;overflow: hidden"><span class="bt" style="margin-right: 20px">最新:</span><span class="bt">IMSI:</span>{{ phone.fourCodeDetail[0] ? phone.fourCodeDetail[0].imsi : '' }}</span>
                <span style="min-width: 15%;display: inline-block;margin-right: 20px;overflow: hidden"><span class="bt">IMEI:</span>{{ phone.fourCodeDetail[0] ? phone.fourCodeDetail[0].imei : '' }}</span>
                <span style="min-width: 15%;display: inline-block;margin-right: 20px;overflow: hidden"><span class="bt">MAC:</span>{{ phone.fourCodeDetail[0] ? phone.fourCodeDetail[0].mac : '' }}</span>
                <span style="min-width: 15%;display: inline-block;margin-right: 20px;overflow: hidden"><span class="bt">OAID:</span>{{ phone.fourCodeDetail[0] ? phone.fourCodeDetail[0].oaid : '' }}</span>
              </div>
            </Col>
          </Row>
          <Row class-name="table1">
            <Col class-name="col1" span="3">对应app安装列表</Col>
            <Col class-name="col3" span="2">{{ phone.appCount }}条</Col>
            <Col class-name="col2" span="19">
              <div>
                <span class="bt" style="margin-right: 20px">敏感:</span>
                <span v-for="app in phone.appDetail" :key="app.id" style="margin-right: 20px">{{ app.name ? app.name : '未命名' }}   <Tag color="red" size="large">{{ app.appTagNameList }}</Tag></span>
              </div>
            </Col>
          </Row>
          <Row class-name="table1">
            <Col class-name="col1" span="3">轨迹信息</Col>
            <Col class-name="col3" span="2">{{ phone.trajectoryCount }}条</Col>
            <Col class-name="col2" span="19">
              <div><span class="bt" style="margin-right: 20px">最后出现:</span><span>{{ phone.trajectoryDetail ? phone.trajectoryDetail.address : '' }}</span></div>
            </Col>
          </Row>
          <Row class-name="table1">
            <Col class-name="col1" span="3">常用WIFI</Col>
            <Col class-name="col3" span="2">{{ phone.wifiCount }}条</Col>
            <Col class-name="col2" span="19">
              <div><span class="bt" style="margin-right: 20px">高频:</span><span>{{ phone.wifiDetail ? phone.wifiDetail.wifiMac : '' }}</span></div>
            </Col>
          </Row>
        
        </div>
        <div v-if="Data.reportIpInfo" class="ip box">
          <div class="title1">
            <span style="font-size: 20px;color: #515A6E;font-weight: 600;">  IP分析</span><span
            style="font-size: 16px;padding: 0 0 0 20px   ;color: #FF0000">宽带（价值最高关联设备）</span>
          </div>
          <div v-for="(ip,index) in Data.reportIpInfo" :key="index">
            <div v-if="ip.basicInfo.ipType =='家庭宽带'" class="family1">
              <div class="family-title">
                <span>{{ ip.traceName }}</span>
                <Tag color="red">家宽</Tag>
              </div>
              <Row class-name="table1">
                <Col class-name="col1" span="3">关联设备</Col>
                <Col class-name="col3" span="2">{{ ip.ipDeviceInfoCount }}条</Col>
                <Col class-name="col2" span="19">
                  <div><span v-for="item in ip.ipDeviceInfo" style="margin: 0 15px">{{ item.phone }} </span></div>
                </Col>
              </Row>
              <Row class-name="table1">
                <Col class-name="col1" span="3">关联WIFI</Col>
                <Col class-name="col3" span="2">{{ ip.ipTaskCount }}条</Col>
                <Col class-name="col2" span="19">
                  <div><span v-for="item in ip.ipTaskInfo" style="margin: 0 15px">{{ item.phone }} </span></div>
                </Col>
              </Row>
            </div>
            <!--          <div class="family">-->
            <!--            <div class="family-title">-->
            <!--              <span>多关联IP分析</span>-->
            <!--            </div>-->
            <!--            <Row class-name="table1">-->
            <!--              <Col class-name="col1" span="12">同环境WIFI分析</Col>-->
            <!--              <Col class-name="col1" span="12">同环境设备分析</Col>-->
            <!--              <Col class-name="col1" span="6">同环境设备</Col>-->
            <!--              <Col class-name="col1" span="6">WIFI信息</Col>-->
            <!--              <Col class-name="col1" span="6">关联设备</Col>-->
            <!--              <Col class-name="col1" span="6">关联WiFi</Col>-->
            <!--              -->
            <!--              <Col class-name="col2" span="6">15340745622 15340745622 15340745622 15340745622 15340745622</Col>-->
            <!--              <Col class-name="col2" span="6">15340745622</Col>-->
            <!--              <Col class-name="col2" span="6">15340745622</Col>-->
            <!--              <Col class-name="col2" span="6">15340745622</Col>-->
            <!--            </Row>-->
            <!--          </div>-->
            <div v-if="ip.basicInfo.ipType =='数据中心'" class="data-center">
              <div class="family-title">
                <span>{{ ip.traceName }}</span>
                <Tag color="gold">数据中心</Tag>
              </div>
              <Row class-name="table1">
                <Col class-name="col1" span="8">是否存活</Col>
                <Col class-name="col1" span="8">是否境内</Col>
                <Col class-name="col1" span="8">二级代理商是否在境内</Col>
                
                <Col class-name="col2" span="8">{{ ip.basicInfo.activeStatus == '0' ? '否' : '是' }}</Col>
                <Col class-name="col2" span="8">{{ ip.basicInfo.ipChinaFlag == '0' ? '否' : '是' }}</Col>
                <Col class-name="col2" span="8">{{ ip.basicInfo.orgChinaFlag == '0' ? '否' : '是' }}</Col>
              </Row>
            </div>
            <div v-if="ip.basicInfo.ipType =='移动网络'" class="move-data">
              <div class="family-title">
                <span>{{ ip.traceName }}</span>
                <Tag color="blue">移动数据</Tag>
              </div>
              <Row class-name="table1">
                <Col class-name="col1" span="3">关联WIFI</Col>
                <Col class-name="col3" span="2">{{ ip.ipDeviceInfoCount }}条</Col>
                <Col class-name="col2" span="19">
                  <div><span v-for="item in ip.ipDeviceInfo" style="margin: 0 15px">{{ item.phone }} </span></div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
      <div v-if="Data.reportApkInfo" class="apk box">
   
        <div v-for="apk in Data.reportApkInfo" :key="apk" class="center" >
          <div class="title1" v-if="apk.basicInfo" >
            <div class="logo" > <span style="font-size: 20px;color: #515A6E;font-weight: 600;">  APK：</span><img :src="apk.basicInfo.iconUrl"><span>{{ apk.basicInfo.appName }}</span></div>
          </div>
         
          <Row class-name="table1">
            <Col class-name="col1" span="4">可疑域名</Col>
            <Col class-name="col1" span="4">安装分布情况</Col>
            <Col class-name="col1" span="4">主控域名</Col>
            <Col class-name="col1" span="4">IP</Col>
            <Col class-name="col1" span="4">第三方调证</Col>
            <Col class-name="col1" span="4">0号机发现</Col>
            <Col class-name="col2" span="4">{{ apk.susSize }}条</Col>
            <Col class-name="col2" span="4" style="display: flex;flex-direction: row">{{ apk.provincesCount }}条&nbsp;&nbsp;
            
            </Col>
            <Col class-name="col2" span="4">{{ apk.urlMasterCount }}条</Col>
            <Col class-name="col2" span="4">{{ apk.ipCount }}条</Col>
            <Col class-name="col2" span="4" style="display: flex;flex-direction: row">{{ apk.companyCount }}家&nbsp;&nbsp;
            
            </Col>
            <Col class-name="col2" span="4">{{ apk.firstInstallCount }}条</Col>
          </Row>
        </div>
      
      </div>
      <div v-if="Data.reportUrlInfo" class="url box">
        <div v-for="url in Data.reportUrlInfo" :key="url" style="margin-bottom: 30px">
          <div class="title1">
            <span style="font-size: 20px;color: #515A6E;font-weight: 600;">  URL：</span><span
            style="font-size: 18px;margin: 0 10px 0 0">{{ url.traceName }}</span>
          </div>
          <Row class-name="table1">
            <Col class-name="col1" span="3">子域名扩展</Col>
            <Col class-name="col3" span="2">{{ url.urlCount }}条</Col>
            <Col class-name="col2" span="19">
              <div><span v-for="item in url.urlList" style="margin: 0 15px">{{ item.webUrl }} </span></div>
            </Col>
          </Row>
        </div>
      </div>
      <div class="app section">
        <div class="title">
          四、APK解析
        </div>
        <div v-for="apk in Data.reportApkInfo">
          <app-info :apk="apk"></app-info>
        
        </div>
      </div>
      <div class="url section">
        <div class="title">
          五、URL解析
        </div>
        <div v-for="url in Data.reportUrlInfo">
          <div v-for="a in url.urlList">
            <url-info :url="a"></url-info>
          </div>
        </div>
      </div>
    </div>
    <Spin :show="spinShow" fix size="large"></Spin>
    <Footer v-show="isRendered" class="layout-footer" style="text-align: left">
      <Button @click="close()">关闭</Button>
      <Button :loading="exporting" style="margin: 0 8px;" type="success" @click="submit()">导出报告pdf</Button>
      <!--      <Button :loading="exporting" style="" type="primary" @click="exportWord()">导出报告word</Button>-->
    </Footer>
  
  </Layout>
</template>
<style lang="less" scoped>
#reportPdf {
  padding: 20px 30px;
}

.layout-wrap {
  margin: 0 auto;
  width: 1920px;
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

.app {
  .app-head {
    display: flex;
    
    .box {
      width: 50%;
      
      &:nth-child(1) {
        margin-right: 36px;
      }
      
      p {
        font-size: 20px;
        
        font-weight: 600;
        color: #515A6E;
        line-height: 23px;
      }
    }
    
    .app-text {
      .test-item {
        display: flex;
        font-size: 18px;
        align-items: center;
        justify-content: center;
        height: 70px;
        
        .left {
          text-align: right;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.4);
          line-height: 21px;
        }
        
        .right {
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
  
  .sdk {
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


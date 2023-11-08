<script setup="">
import {computed, reactive, ref, watch} from "vue";
import wordUtils from '@/utils/word.js'
import {getDrawproofField, createDrawproof, saveDrawProof, searchCompany, companyGuide, getDrawproofDetail} from '@/api/details.js'
import {ajListStore} from "@/store/modules/ajList.js";
import $Message from "@/utils/message.js";
import {clientH} from "@/utils/vueuse.js";
const ajStore = ajListStore()
const emit = defineEmits(['cancel','create'])
const props = defineProps({
  param: {
    type: Object,
    default() {
      return {
        taskId: '',
        solutionId: '',
        traceId: '',
        taskChannelId: '',
        drawProofId: ''
      }
    }
  },
  visible: false
})
const submitLoading = ref(false)
const dataLoading = ref(false)
const Data = reactive({
  taskChannelId: '',
  solutionId: '',
  drawProofId: '',
  companyInfo: [],
  fieldData: {
    policeStationName: '',// 发件单位名称
    docNumberPrefix: '', // 年
    docNumberSuffix: '',
    recipient: '', // 收件单位名称
    caseName: '', //案件名称
    evidence: '',// 线索名称
    year: '',
    month: '',
    day: '',
    xing:'',
    address:''
  },
  fieldLabel: {

  },
  showBack: computed(() => {
    if(props.param.taskChannelId || Data.taskChannelId) {
      return true
    } else {
      return false
    }
  }),
  scrollH: computed(() => {
    if(clientH.value > 0) {
      return clientH.value - 150

    } else {
      return 500
    }
  }),
  searchKey: '',
  coSearch: () => {
    if(Data.searchKey!=null && Data.searchKey!= '') {
      Data.companyInfo = []
      companyGuide({companyName: Data.searchKey}).then(res => {
        // console.log(res);
        let {code, data} = res.data
        if(code == 200) {
          // console.log(data)
          if(data == null) {
            Data.coSearch2()
          } else {
            Data.companyInfo.push({
              measure: data.measure,
              legalPaper: data.legalPaper,
              fullName: data.fullName,
              key: data.key,
              address: data.address,
              linkInfo: data.linkInfo,
              other: data.other,
              paragraph:data.paragraph,
              isGreenChannel:data.isGreenChannel,
              isImportantFocus:data.isImportantFocus
            })

          }
        } else {

        }
      })
    }

  },
  coSearch2: () => {
    let param = {
      keyword: Data.searchKey
    }
    searchCompany(param).then(res => {
      let {code, data} = res.data;
      if(code == 200) {
        if(data!= null) {
          // console.log(data)
          Data.companyInfo = data
        } else {
          Data.coClear()
        }
      }
    })
  },
  coClear() {
    Data.companyInfo = []
  }
})
const numberOpt = reactive({
  yearStart: 2022,
  monthStart: 1,
  monthEnd: 12,
  dayStart: 1,
  dayEnd: 31
})
watch(() => props.visible, (n) => {
  if(n) {
    // console.log('visible',props.param.taskId);
    if(props.param.taskChannelId || Data.taskChannelId) {
      init()
      // if(props.param.drawProofId) {
        getFieldNew()
      // }
    } else {
      init()
    }
  }
}, {immediate: true})
// 初始化时间
function init() {
  let date = new Date()
  let year = parseInt(date.getFullYear())
  let month = parseInt(date.getMonth() + 1)
  let day = parseInt(date.getDate())
  Data.fieldData.recipient = ''
  Data.fieldData.caseName = ajStore.caseInfo.name
  Data.fieldData.evidence = ajStore.traceInfo.traceName
  Data.fieldData.docNumberPrefix = year
  Data.fieldData.year = year
  Data.fieldData.month = month
  Data.fieldData.day = day
  numberOpt.yearStart = year
  // getField()
}
function getFieldNew() {
  let param = {drawProofId: props.param.drawProofId, solutionId: props.param.solutionId || Data.solutionId,}
  dataLoading.value = true
  getDrawproofDetail(param).then(res => {
    // console.log(res);
    let {code, data} = res.data
    if(code == 200) {
      if(data != null) {
        let fieldList = data.fieldList
        if (fieldList && typeof fieldList === 'object') {
          for(let k in Object.keys(fieldList)) {
            let field = fieldList[k]
            let sourceCode = field['sourceCode']
            let fieldValue = field['fieldValue']
            let fieldName = field['fieldName']
            if (fieldValue === null || fieldValue == '') {
              let defaultValue = field['defaultValue']
              if (defaultValue != '' && defaultValue != null) {
                Data.fieldData[sourceCode] = defaultValue
              }
            } else {
              if (sourceCode === 'docNumberPrefix' || sourceCode === 'day' || sourceCode === 'year' || sourceCode === 'month') {
                Data.fieldData[sourceCode] = parseInt(fieldValue)
              } else {
                Data.fieldData[sourceCode] = fieldValue
              }
            }
            Data.fieldLabel[sourceCode] = fieldName
          }
          Data.searchKey = Data.fieldData.recipient
          Data.coSearch()
          if(!props.param.drawProofId) {
            init()
          }
        } else {
          console.log('fieldList', fieldList)
        }
      }
      dataLoading.value = false
    }else {
      dataLoading.value = false
    }
  })
}
function getField() {
  let param = {
    taskId: props.param.taskId || Data.taskChannelId,
    solutionId: props.param.solutionId || Data.solutionId,
    traceId: props.param.traceId,
    taskChannelId: props.param.taskChannelId || Data.taskChannelId
  }
  dataLoading.value = true
  getDrawproofField(param).then(res => {
    let {code, data} = res.data
    if(code == 200) {
      if(data != null) {
        let fieldList = data.fieldList
        if (fieldList && typeof fieldList === 'object') {
          for(let k in Object.keys(fieldList)) {
            let field = fieldList[k]
            let sourceCode = field['sourceCode']
            let fieldValue = field['fieldValue']
            let fieldName = field['fieldName']
            if (fieldValue === null || fieldValue == '') {
              let defaultValue = field['defaultValue']
              if (defaultValue != '' && defaultValue != null) {
                Data.fieldData[sourceCode] = defaultValue
              }
            } else {
              if (sourceCode === 'docNumberPrefix' || sourceCode === 'day' || sourceCode === 'year' || sourceCode === 'month') {
                Data.fieldData[sourceCode] = parseInt(fieldValue)
              } else {
                Data.fieldData[sourceCode] = fieldValue
              }
            }
            Data.fieldLabel[sourceCode] = fieldName
          }
            Data.searchKey = Data.fieldData.recipient
            Data.coSearch()
          if(!props.param.drawProofId) {
              init()
          }
        } else {
          console.log('fieldList', fieldList)
        }
      }
      dataLoading.value = false
    }else {
      dataLoading.value = false
    }
  }).catch(() => {
    dataLoading.value = false
  })
}
function save() {
  if(!Data.fieldData.recipient) {
    $Message.warning('请填写所属平台或公司名称!')
    return false
  }
  submitLoading.value = true
  Data.fieldData.year = Data.fieldData.docNumberPrefix
  let param = {
    taskChannelId: props.param.taskChannelId || Data.taskChannelId,
    fieldMap: Data.fieldData,
    fieldLabelMap: Data.fieldLabel,
    companyName: Data.fieldData.recipient,
    drawProofId: props.param.drawProofId || Data.drawProofId
  }

  saveDrawProof(param).then(res => {
    // console.log(res);
    let {code, data} = res.data;
    if(code == 200) {
      $Message.success('保存调证函成功!')
      Data.taskChannelId = data.taskChannelId
      Data.drawProofId = data.drawProofId
      emit('create', {taskChannelId: data.taskChannelId, solutionId: Data.solutionId, param: Data.fieldData})
      submitLoading.value = false
    }else {
      $Message.error('保存调证函失败!')
      submitLoading.value = false
    }
  }).catch(() => {
    $Message.error('出现未知错误!')
    submitLoading.value = false
  })
}
function submit() { // 保存调证函
  /*
  * 有调证任务，创建新调证函，调用saveDrawProofTask      新增companyName 必传
  * 如果传drawProofId不为空，代表修改调证函,为空新增
  * */

  if(props.param.taskChannelId || Data.taskChannelId) {
    /*if(props.param.drawProofId || Data.drawProofId) {
      save()
    } else {
      save()
    }*/
    save()
  } else {
    create()
  }

}
function create() {
  submitLoading.value = true

  let param = {}
  let arr = []
  for(let k in Data.fieldData) {
    arr.push({sourceCode: k, fieldValue: Data.fieldData[k]})
  }
  // param.fieldMap = Data.fieldData
  // param.fieldLabelMap = Data.fieldLabel
  param.fieldLabelMap = undefined
  param.channelFieldList = arr
  param.traceName = ajStore.traceInfo.traceName
  param.id = props.param.traceId
  param.channelType = 'drawProof'
  param.companyName = Data.fieldData.recipient
  param.drawProofId = ''
  createDrawproof(param).then(res => {
    // console.log('createDrawproof',res);
    let {code, data} = res.data
    if(code == 200) {
      $Message.success('保存成功！')
      submitLoading.value = false
      // 返回taskId
      /*
      * solutionId: "db5de1ea8d7546558c3c6f268b633806"
taskChannelId: "6546ca7de8c8426398d8b6757ecf19e0"
traceId: "966689466ca34b6296ac88323611ace2"*/
      Data.taskChannelId = data.taskChannelId
      Data.solutionId = data.solutionId
      Data.drawProofId = data.drawProofId
      getFieldNew()
      emit('create', {taskChannelId: data.taskChannelId, solutionId: data.solutionId, param: Data.fieldData})
    } else {
      $Message.error(res.data.message)
      submitLoading.value = false
    }
  }).catch(() => {
    submitLoading.value = false
  })
}
function toCnNum(num) {

  let cnNum = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 0: '十' }

  let integerArray = num.toString().split('')
  let numText = ''
  // 遍历进行汉字转换和添加计数单位
  integerArray.forEach(n => {
    numText += cnNum[n]
  })
  // this.cnNumStr = numText
  if (num > 10) {
    if(num % 10 == 0) { // 整十
      return numText.slice(0,1) + '十' //+ numText.slice(1)

    } else {
      return numText.slice(0,1) + '十' + numText.slice(1)

    }
  } else if(num == 10) {
    return '十'
  }else {

    return numText
  }


}
function toCnNumYear(num) {

  let cnNumYear = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 0: '〇' }

  let integerArray = num.toString().split('')
  let numText = ''
  // 遍历进行汉字转换和添加计数单位
  integerArray.forEach(n => {
    numText += cnNumYear[n]
  })

  return numText
}
// 下载doc文件
function download() {
  if(!Data.fieldData.recipient) {
    $Message.warning('请填写所属平台或公司名称!')
    return false
  }
  submitLoading.value = true
  let filePath = 'drawProof0.docx' // 位于public目录下
  let docContent = {
    unit: Data.fieldData.policeStationName,
    num1: Data.fieldData.docNumberPrefix,
    num2: Data.fieldData.docNumberSuffix,
    companyName: Data.fieldData.recipient,
    caseName: Data.fieldData.caseName,
    evidence: Data.fieldData.evidence,
    yearCN: toCnNumYear(Data.fieldData.year),
    monthCN: toCnNum(Data.fieldData.month),
    dayCN: toCnNum(Data.fieldData.day),
    num3:Data.fieldData.xing,
    address:Data.fieldData.address
  }
  let fileName = Data.fieldData.caseName + '_' + Data.fieldData.recipient + '_调证函'
  wordUtils.exportWord(filePath, docContent, fileName, () => {
    $Message.success('正在下载')
    submitLoading.value = false
  }, () => {
    submitLoading.value = false
  })
}
function textLength (value) {
  if (value == '' || value == 0) {
    return '100px'
  } else {
    return value.toString().length * 22 + 'px'
  }
}

function cancel() {
  emit('cancel')
}
function setCompany(val) {
  Data.fieldData.recipient = val
}
</script>
<template>
<Layout class="main">
  <Content class="layout-content">
    <Row :gutter="20">


      <Col :span="18" class="con-col">
        <div class="title">
          <Icon class="back-icon" type="md-arrow-back" size="22" title="返回" @click="cancel()"/>
          <span class="unit"><Input class="title-inp" v-model="Data.fieldData.address"></Input>公安局<Input class="title-inp" v-model="Data.fieldData.policeStationName"></Input></span>
          <p class="sub-title">调&emsp;取&emsp;证&emsp;据&emsp;通&emsp;知&emsp;书</p>
          <p class="no"><Input class="no-inp" width="200px" v-model="Data.fieldData.xing"></Input>调证字 <InputNumber
              :min="numberOpt.yearStart"
              class="year-inp"
              v-model="Data.fieldData.docNumberPrefix"
              style="width: 80px"
          />
            &nbsp;<Input class="no-inp" v-model="Data.fieldData.docNumberSuffix"></Input>号
          </p>
        </div>
        <div class="body">
          <p class="company">
            <Input
                class="input-common-style"
                v-model="Data.fieldData.recipient"
                placeholder="所属平台"
                :style="{width: textLength(Data.fieldData.recipient),minWidth: '100px'}"
            />:
          </p>
          <p class="con">
            &emsp;&emsp;根据《中华人民共和国刑事诉讼法》第五十四条之规定，我局侦办的
            <Input
                class="input-common-style"
                v-model="Data.fieldData.caseName"
                placeholder=""
                :style="{width: textLength(Data.fieldData.caseName)}"
            />
            案需调取你处下列有关证据：
            <Input
                class="ev-inp"
                v-model="Data.fieldData.evidence"
                placeholder=""
                :style="{width: '1000px'}"
            />

          </p>
          <p class="tip">
            伪造证据、隐匿证据或者毁灭证据的，将受法律追究。
          </p>
        </div>
        <div class="footer">
          <div class="footer-btn">
            <Button
                class="button"
                type="primary"
                style="margin: 0 6px;"
                @click="submit()" :loading="submitLoading">保存</Button>
            <Button
                @click="download()"
                class="button"
                type="success"
                :loading="submitLoading">
              下载
            </Button>
          </div>
          <div class="unit">
            {{Data.fieldData.address}}公安局{{Data.fieldData.policeStationName}}
            <p>
              {{toCnNumYear(Data.fieldData.docNumberPrefix)}}年
              <InputNumber :min="numberOpt.monthStart"
                           :max="numberOpt.monthEnd"
                           v-model="Data.fieldData.month"
                           style="font-size: 20px;text-align: center;"></InputNumber>
              月
              <InputNumber :min="numberOpt.dayStart"
                           :max="numberOpt.dayEnd"
                           v-model="Data.fieldData.day"
                           style="font-size: 20px;text-align: center;"></InputNumber>
              日
            </p>
          </div>
        </div>
<!--        <Affix :offset-bottom="20" style="text-align: left;">
          <span class="demo-affix"><Button
              class="button"
              type="primary"
              style="margin: 0 6px;"
              @click="save()" :loading="submitLoading">保存</Button>
          <Button
              @click="download()"
              class="button"
              type="success"
              :loading="submitLoading">
            下载
          </Button></span>
        </Affix>-->
<!--        <div class="btn-group">
          <Button class="button" @click="cancel()">
            返回
          </Button>
          <Button
              class="button"
              type="primary"
              style="margin: 0 6px;"
              @click="save()" :loading="submitLoading">保存</Button>
          <Button
              @click="download()"
              class="button"
              type="success"
              :loading="submitLoading">
            下载
          </Button>
        </div>-->
      </Col>
      <Col :span="6" class="guide-col">

        <div class="company-sear">
          <Input class="inp" v-model.trim="Data.searchKey" placeholder="请输入平台或公司名称查找" clearable @keydown.enter.native="Data.coSearch()" @on-clear="Data.coClear()">
            <template #append>
              <Button class="sear-btn" icon="ios-search" @click="Data.coSearch()"></Button>
            </template>
          </Input>
        </div>
        <div class="guide" v-show="Data.companyInfo.length">
          <Scroll :height="Data.scrollH || 500">
            <Card title="" style="text-align: left;margin: 4px 0;" v-for="(company, i) in Data.companyInfo" :key="i">
              <template #title>
                <p class="guide-card-title">{{company.key}} <span v-show="company.isGreenChannel == 1" style="background: #24B493;color: #FFFFFF;display: inline-block;padding: 0 10px;border-radius: 10px;margin-left: 20px">绿色通道</span> <span v-show="company.isImportantFocus == 1" style="background: #1D83FF;color: #FFFFFF;display: inline-block;padding: 0 10px;border-radius: 10px;margin-left: 20px">重点关注</span></p>
              </template>
              <p><span class="guide-card-label">公司名称：</span><span @click="setCompany(company.fullName)" class="co-name">{{company.fullName}}</span></p>
              <div v-html="company.paragraph" ></div>
            </Card>
          </Scroll>

        </div>
      </Col>
    </Row>
  </Content>
  <Spin fix :show="dataLoading"></Spin>
<!--  <Footer class="footer-btn">

  </Footer>-->
</Layout>
</template>
<style scoped lang="less">
.layout-content {
  //height: 100%;
}
.footer-btn {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 0;
  text-align: left;
  background-color: #fff;
  .button {
    margin: 0 4px;
  }
}
.main {
  height: 100%;
  //padding: 10px;
  text-align: center;
  font-size: 18px;
  position: relative;
  background-color: #fff;
}
:deep(.ivu-input)  {
  font-size: 18px;
  border: none;
  border-bottom: 1px solid #ccc;
  font-family: "PingFang SC";
  padding-top: 0;
  padding-bottom: 0;
}
.title {
  position: relative;
  .back-icon {
    position: absolute;
    left: 10px;
    top: 10px;
    &:hover {
      color: rgba(64, 158, 255, 1);
    }
  }
  .unit {
    font-size: 18px;
    .title-inp {
      width: 150px;
    }
  }
  .sub-title {
    font-size: 20px;
  }
  .no {
    text-align: right;
    .year-inp {
      font-size: 20px;
      width: 120px;
      text-align: center;
    }
    .no-inp{
      width: 100px;
    }
  }
}
.body {
  line-height: 40px;
  .company {
    text-align: left;
  }
  .con {
    text-align: left;
  }
  .tip {
    margin-top: 10px;
    text-align: center;
  }
}
.footer {
  position: relative;
  margin-top: 10px;
  text-align: right;
}
.btn {
  /*position: absolute;
  bottom: 20px;
  right: 20px;
  font-size: 14px;*/
  .save-button {
    width: 80px;

  }
  .download-button {
    margin-left: 14px;
  }
}
.guide {
  flex: 1;
}
.guide-col {
  border-left: 1px solid #d8d7d7;
  display: flex;
  flex-direction: column;
  paddingt: 0 10px;
  .guide-card-title {
    color: #777;
    font-size: 14px;
  }
  .company-sear {
    width: 80%;
    margin: 0 auto 10px;
    flex: 0 0 40px;
    :deep(.ivu-input){
      font-size: 15px;
    }
    :deep(.ivu-input-group-append) {
      background-color: transparent;
      border: none;
      border-bottom: 1px solid #dcdee2;
    }
    .sear-btn {

    }
  }
}
.guide-pre {
  font-size: 14px;
}
.co-name {
  text-decoration: underline;
  cursor: pointer;
  color: #1D83FF;
  &:hover {
    color: rgba(64, 158, 255, 0.95);
  }
}
.guide-card-label {
  font-weight: bold;
}
.ivu-row {
  height: 100%;
}
.ivu-col {
  height: 100%;
}
/*.ivu-scroll-wrapper {
  height: 100%;
}*/
.con-col {
  position: relative;
  .btn-group {
    position: absolute;
    left: 10px;
    bottom: 10px;
  }
}
/*.demo-affix {
  text-align: left;
}*/
.ivu-scroll-loader {
  display: none;
}
</style>

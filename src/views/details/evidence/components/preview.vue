<script setup>
import {computed, reactive, watch} from "vue";
import {getDrawproofField} from "@/api/details.js";
import {ajListStore} from "@/store/modules/ajList.js";
const ajStore = ajListStore()
  const props = defineProps({
    param: {
      docNumberPrefix: null,
      docNumberSuffix: null,
      policeStationName: '',
      month: '',
      day: '',
      recipient: '',
      evidence: ''
    },
    task: {
      taskId: '',
      solutionId: '',
      traceId: '',
    }
  })
  const Data = reactive({
    fieldData: {
      policeStationName: '',// 发件单位名称
      docNumberPrefix: '', // 年
      docNumberSuffix: '',
      recipient: '', // 收件单位名称
      caseName: '', //案件名称
      evidence: '',// 线索名称
      year: '',
      month: '',
      day: ''
    },
    fieldLabel: {

    },
    // cnNumStr: '',
    // cnNumYearStr: '',
    footerYear: computed(() => {
      return Data.fieldData.docNumberPrefix ? toCnNumYear(Data.fieldData.docNumberPrefix): ''
    }),
    footerMonth: computed(() => {
      return Data.fieldData.month ? toCnNum(Data.fieldData.month) : ''
    }),
    footerDay: computed(() => {
      return Data.fieldData.day ? toCnNum(Data.fieldData.day): ''
    })
  })
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

/*watch(() => props.task, (n) => {
  console.log(n);
  if(n) {
    getField()
  }
}, {immediate: true})*/
watch(() => props.param, (n) => {
  if(props.param.recipient) {
    for(let k in n) {
      Data.fieldData[k] = n[k]
    }

  }
}, {deep: true, immediate: true})
function getField() {
  let param = {
    taskId: props.task.taskId,
    solutionId: props.task.solutionId,
    traceId: props.task.traceId,
    taskChannelId: props.task.taskId
  }
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

        } else {
          console.log('fieldList', fieldList)
        }
      }
      Data.fieldData.caseName = ajStore.caseInfo.name
      Data.fieldData.evidence = ajStore.traceInfo.traceName
    }
  })
}
defineExpose({
  getField,
  Data
})
</script>
<template>
  <div class="main">
    <div class="title">
      <span class="unit">上海市公安局{{Data.fieldData.policeStationName}}</span>
      <p class="sub-title">调&nbsp;取&nbsp;证&nbsp;据&nbsp;通&nbsp;知&nbsp;书</p>
      <p class="no">
        沪公（长刑）调证字 <span>{{Data.fieldData.docNumberPrefix}}{{Data.fieldData.docNumberSuffix}}</span>号
      </p>
    </div>
    <div class="body">
      {{Data.fieldData.recipient}}
      <p>
        &emsp;根据《中华人民共和国刑事诉讼法》第五十四条之规定，我局侦办的 <span>{{Data.fieldData.caseName}}</span>案需调取你处下列有关证据：
        <span>{{Data.fieldData.evidence}}</span>
      </p>
      <p class="tip">
        伪造证据、隐匿证据或者毁灭证据的，将受法律追究。
      </p>
    </div>
    <div class="footer">
      <div class="unit">
        上海市公安局{{Data.fieldData.policeStationName}}
        <p>
          {{Data.footerYear}}年{{Data.footerMonth}}月{{Data.footerDay}}日
        </p>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.main {
  border: 1px solid rgba(211,211,211,0.5);
  padding: 20px;
  font-size: 13px;
}
.title {
  text-align: center;
}
.footer {
  margin-top: 10px;
  text-align: right;
}
</style>

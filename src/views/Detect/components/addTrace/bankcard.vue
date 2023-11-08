<script setup="">
import {ref, reactive, onMounted, watch} from "vue";
import OfflineTaskUpload from "../../../../components/fileUpload/offlineTaskUpload.vue";

import {dictStore} from "@/store/modules/dictionary.js";
import {insertBankcard} from "@/api/trace.js";
import {ajListStore} from "@/store/modules/ajList.js";
import $Message from "@/utils/message.js";
import _ from 'lodash'
import {getAllTraceByCaseId} from 'src/api/trace.js'
const dictS = dictStore()
const formRef = ref(null)
const submitLoading = ref(false)
const ajStore = ajListStore()
const caseId = ajStore.caseId
const emit = defineEmits(['callback'])


let form = reactive({
  name: '',
  type: '',
  caseId: caseId,
  wpbh: '',
  ksyrmc: '',
  fkdwGjdqdm: '',
  fkdwDwmc: '',
  hfrq: '',
  yxqksrq: '',
	parentId:'',
	
	yxqjzrq: '',
  firstDetect: '0',
  isFirst: '1',
  iiTrace: {},
  peopleType: '',
  remark: '',
  msg: ''
})
const rules = ref({
  name: [{ required: true, message: '卡号不能为空', trigger: 'blur' }]
})

const cardType = ref([])
const peopleType = ref([])
let Msg = reactive({
  type: { key: '对公对私', value: '' },
  peopleType: { key: '人员类型', value: '' },
  ksyrmc: { key: '开户人', value: '' },
  fkdwDwmc: { key: '开户行', value: '' },
})
function formatMsg(obj, form) {
  console.log(obj,form)
  let msg = []
  for(let k in obj) {
    if(obj[k].value == '') {
      obj[k].value = form[k]
    }
    msg.push(obj[k])
  }
  return JSON.stringify(msg)
}
const form1 = reactive( {attachmentInfos:[]})
const upload = reactive({
	param: {
		caseId: ajStore.caseId
	},
	finish: (res) => {
		console.log(res)
		form1.attachmentInfos.push({
			name:res.name,
			size:res.size,
			url:res.file
		})
		// form.file = res.file
		// form.size = res.size
		// form.name = res.name.substring(0, res.name.lastIndexOf('.'))
	},
	remove: (res) => {
		form1.attachmentInfos = form1.attachmentInfos.filter(item=>{
			if(item.name != res){
				return true
			}
		})
	}
})
function submit(formRef) {
  formRef.validate((valid) => {
    if (valid) {

      let param = form;
      submitLoading.value = true
      param['iiTrace.type'] = 'firstDetect'
      param['iiTrace.trackType'] = 'bankCard'
      param['iiTrace.trackTypeName'] = '卡类'
      param['iiTrace.traceId'] = ''
      param['iiTrace.name'] = param.name
      param['iiTrace.caseId'] = param.caseId
      param['iiTrace.parentId'] = ''
      param['iiTrace.groupId'] = ''
      param['iiTrace.firstDetect'] = '0'
      param['iiTrace.msg'] = formatMsg(Msg, form)
	    form1.attachmentInfos.forEach((item,index)=>{
		    param[`attachmentInfos[${index}].name`]=item.name
		    param[`attachmentInfos[${index}].url`]=item.url
		    param[`attachmentInfos[${index}].size`]=item.size
	    })
      insertBankcard(param).then(res => {
        let {code, data} = res.data
        if(code == 200) {
          $Message.success('添加成功')
          formRef.resetFields()
          Msg = reactive({
            type: { key: '对公对私', value: '' },
            peopleType: { key: '人员类型', value: '' },
            ksyrmc: { key: '开户人', value: '' },
            fkdwDwmc: { key: '开户行', value: '' },
          })
          submitLoading.value = false
          emit('callback', true)
        } else {
          submitLoading.value = false
          $Message.error(res.data.message)
        }
      }).catch((err) => {
        $Message.error(err.data.message ||'出现未知错误')
        submitLoading.value = false
      })
    }
  })

}
function cardTypeHandler(code) {
  let obj = cardType.value.find(o => {
    return o.value == code
  })
  Msg.type.value = obj ? obj.label: ''
}
function peopleTypeHandler(code) {
  let obj = _.find(peopleType.value, o => {
    return o.value == code
  })
  Msg.peopleType.value = obj ? obj.label: ''
}

function getHfrqKl (time) {
  form.hfrq = time
}
function getYxqksrqKl (time) {
  form.yxqksrq = time
}
function getYxqjzrqKl (time) {
  form.yxqjzrq = time
}

// onMounted(() => {
  dictS.getDict('KL_TYPE').then(res => {
    cardType.value = res
  })
  dictS.getDict('peopleType').then(res => {
    peopleType.value = res
  })

// })

function close() {
  emit('callback', true)
}
const traceList = ref([])
const getAllTrace = async ()=>{
	console.log(ajStore.caseId)
	const res = await getAllTraceByCaseId(ajStore.caseId)
	if(res.data.code ==200){
		traceList.value = res.data.data
	}
}
onMounted(()=>{
	getAllTrace()
})
</script>
<template>
<div>
  <Form :model="form" ref="formRef" :label-width="120" :rules="rules">
    <Row :gutter="40">
	    <Col span="24">
		    <FormItem label="父线索" prop="parentId">
			    <Select v-model="form.parentId">
				    <Option v-for="item in traceList"
				            :value="item.id"
				            :key="item.value">{{ item.trackTypeName }}:{{item.name}}</Option>
			    </Select>
		    </FormItem>
	    </Col>
      <Col span="12">
        <FormItem label="卡号" prop="name">
          <Input v-model.trim="form.name"></Input>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem label="对公/对私" prop="type">
          <Select v-model="form.type" @on-change="cardTypeHandler" clearable>
            <Option v-for="item in cardType"
                    :value="item.value"
                    :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem label="人员类型" prop="peopleType">
          <Select v-model="form.peopleType" @on-change="peopleTypeHandler" clearable>
            <Option v-for="item in peopleType"
                    :value="item.value"
                    :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem label="开户人" prop="ksyrmc">
          <Input v-model="form.ksyrmc"></Input>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem label="开户行" prop="fkdwDwmc">
          <Input v-model="form.fkdwDwmc"></Input>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem label="核发日期" prop="hfrq">
          <DatePicker
              type="datetime"
              :value="form.hfrq"
              format="yyyy-MM-dd"
              style="width: 100%"
              @on-change="getHfrqKl"
          ></DatePicker>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem label="有效期开始日期" prop="yxqksrq">
          <DatePicker
              type="datetime"
              :value="form.yxqksrq"
              format="yyyy-MM-dd"
              style="width: 100%"
              @on-change="getYxqksrqKl"
          ></DatePicker>
        </FormItem>
      </Col>
      <Col span="12">
        <FormItem label="有效期截止日期" prop="yxqjzrq">
          <DatePicker
              type="datetime"
              :value="form.yxqjzrq"
              format="yyyy-MM-dd"
              style="width: 100%"
              @on-change="getYxqjzrqKl"
          ></DatePicker>
        </FormItem>
      </Col>
	    <Col span="12">
		    <FormItem label="上传文件" prop="">
			    <offline-task-upload ref="uploadComp" :flag="submitLoading" :param="upload.param" @finish="upload.finish" @remove="upload.remove"/>
		    </FormItem>
	    </Col>
      <Col span="24">
        <FormItem label="备注说明" prop="remark">
          <Input type="textarea" :rows="8" v-model="form.remark"></Input>
        </FormItem>
      </Col>
    </Row>
  </Form>
  <div style="text-align:center">
    <Button @click="submit(formRef)" type="primary" :loading="submitLoading">提交</Button>
  </div>
</div>
</template>
<style scoped>
:deep(.ivu-input){
  height: 40px;
}
</style>

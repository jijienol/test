<script setup="">
import {ref, reactive, getCurrentInstance, defineEmits, onMounted} from "vue";
import {dictStore} from "@/store/modules/dictionary.js";
import {insertIdcard} from "@/api/trace.js";
import {ajListStore} from "@/store/modules/ajList.js";
// import {storeToRefs} from "pinia";
import $Message from "@/utils/message.js";
import _ from 'lodash'
import {getAllTraceByCaseId} from 'src/api/trace.js'
import OfflineTaskUpload from "../../../../components/fileUpload/offlineTaskUpload.vue";

const dictS = dictStore()

const formRef = ref(null)
const submitLoading = ref(false)
const ajStore = ajListStore()
const caseId = ajStore.caseId
const emit = defineEmits(['callback'])
const form = reactive({
  caseId: caseId,
  wpbh: '',
  zjsyrmc: '',
  zjlxDm: '',
  zjlxMs: '',
  name: '',
  fzdwGjdq: '',
  fzdwDwmc: '',
  hfrq: '',
  yxqksrq: '',
  yxqjzrq: '',
  // iiTrace: {},
	parentId:'',
  peopleType: '',
  remark: ''
})
const rules = ref({
  name: [{ required: true, message: '证件号码不能为空', trigger: 'blur' }]
})

// const {dict} = storeToRefs(dictS)
const peopleType = ref([]) // dict.value.peopleType.list
const IDType = ref([]) // dict.value.IDType.list

let Msg = reactive({
  zjlxDm: { key: '证件类型', value: '' },
  peopleType: { key: '人员类型', value: '' }
})
function formatMsg(obj, form) {
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
      param['iiTrace.trackType'] = 'idcard'
      param['iiTrace.trackTypeName'] = '证件'
      param['iiTrace.traceId'] = ''
      param['iiTrace.name'] = param.name
      param['iiTrace.caseId'] = param.caseId
      param['iiTrace.parentId'] = ''
      param['iiTrace.groupId'] = ''
      param['iiTrace.firstDetect'] = '0'
      param['iiTrace.msg'] = formatMsg(Msg, param)
	    form1.attachmentInfos.forEach((item,index)=>{
		    param[`attachmentInfos[${index}].name`]=item.name
		    param[`attachmentInfos[${index}].url`]=item.url
		    param[`attachmentInfos[${index}].size`]=item.size
	    })

      insertIdcard(param).then(res => {
        let {code, data} = res.data
        if(code == 200) {
          $Message.success('添加成功')
          Msg = reactive({
            zjlxDm: { key: '证件类型', value: '' },
            peopleType: { key: '人员类型', value: '' }
          })
          formRef.resetFields()
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
function peopleTypeHandler(code) {
  let obj = _.find(peopleType.value , o => {
    return o.value == code
  })
  Msg.peopleType.value = obj ? obj.label: ''
}

function changeZjlx(val) {
  console.log(val);
  form.zjlxMs = val ? val.label.trim() : ''
  Msg.zjlxDm.value = val ? val.label.trim() : ''
}
function getHfrq (time) {
  form.hfrq = time
}
function getYxqjzrq (time) {
  form.yxqjzrq = time
}
function getYxqksrq (time) {
  form.yxqksrq = time
}

/*if(IDType.length < 1) {

  dict.getDict('IDType')
}
if(peopleType.length < 1) {
  dict.getDict('peopleType')
}*/
// onMounted(() => {
  dictS.getDict('IDType').then(res => {
    IDType.value = res
  })
  dictS.getDict('peopleType').then(res => {
    peopleType.value = res
  })
// })
const traceList = ref([])
const getAllTrace = async () => {
	console.log(ajStore.caseId)
	const res = await getAllTraceByCaseId(ajStore.caseId)
	if (res.data.code == 200) {
		traceList.value = res.data.data
	}
}
onMounted(() => {
	getAllTrace()
})
</script>
<template>
  <div>
    <Form ref="formRef" :model="form" :label-width="120" :rules="rules">
      <Row :gutter="40">
	      <Col span="24">
		      <FormItem label="父线索" prop="parentId">
			      <Select v-model="form.parentId">
				      <Option v-for="item in traceList"
				              :key="item.value"
				              :value="item.id">{{item.trackTypeName}}:{{item.name}}
				      </Option>
			      </Select>
		      </FormItem>
	      </Col>
        <Col span="12">
          <FormItem  label="证件类型" prop="zjlxDm">
            <Select
                v-model="form.zjlxDm"
                :label-in-value="true"
                @on-change="changeZjlx"
                clearable
            >
              <Option
                  v-for="item in IDType"
                  :value="item.label"
                  :key="item.value"
              >
                {{ item.label }}
              </Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="证件号码" prop="name">
            <Input v-model="form.name"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="证件所有人名称" prop="zjsyrmc">
            <Input v-model="form.zjsyrmc"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="发证单位" prop="fzdwDwmc">
            <Input v-model="form.fzdwDwmc"></Input>
          </FormItem>
        </Col>
        <Col :span="12">
          <FormItem label="核发日期" prop="hfrq">
            <DatePicker
                type="datetime"
                :value="form.hfrq"
                format="yyyy-MM-dd"
                style="width: 100%"
                @on-change="getHfrq"
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
                @on-change="getYxqksrq"
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
                @on-change="getYxqjzrq"
            ></DatePicker>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="人员类别" prop="peopleType" >
            <Select v-model.trim="form.peopleType" @on-change="peopleTypeHandler" clearable>
              <Option v-for="item in peopleType" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
	      <Col span="12">
		      <FormItem label="上传附件" prop="">
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

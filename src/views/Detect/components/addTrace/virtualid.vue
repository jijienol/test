<script setup>
import {ref, reactive, getCurrentInstance, onMounted} from "vue";
import OfflineTaskUpload from "../../../../components/fileUpload/offlineTaskUpload.vue";
import {dictStore} from "@/store/modules/dictionary.js";
import {insertVirtualId} from "@/api/trace.js";
import {ajListStore} from "@/store/modules/ajList.js";
import {storeToRefs} from "pinia";
import {getAllTraceByCaseId} from 'src/api/trace.js'
const {proxy} = getCurrentInstance()

const dictS = dictStore()
const formRef = ref(null)
const submitLoading = ref(false)
const ajStore = ajListStore()
const caseId = ajStore.caseId
const emit = defineEmits(['callback'])
const form = reactive({
  caseId: caseId,
  name: '',
  subType: '',
  peopleType: '',
  remark: '',
	parentId:'',
  iiTrace: {}
})
const rules = ref({
  name: [{ required: true, message: '帐号不能为空', trigger: 'blur' }],
  subType: [{ required: true, message: '所属平台不能为空', trigger: 'blur'}]
})
const peopleType = ref([])
const virtualTypes = ref([])

// 人员类型选择
function peopleTypeHandler(code) {
  let obj = proxy.$lodash.find(peopleType.value , o => {
    return o.value == code
  })
  Msg.peopleType.value = obj ? obj.label: ''
}
function selVirtualType(val) {
  if (val.label.slice(-4) === '绿色通道') {
    Msg.subType.value  = val.label.slice(0, -4); // 删除最后四个字符
    console.log(Msg.subType.value)
    return
  }
  Msg.subType.value = val ? val.label : ''
  // Msg.subType.value = val ? val.label.replace(/\\\\n/g, '').trim() : ''
}
let Msg = reactive({
  peopleType: { key: '人员类型', value: '' },
  subType: { key: '所属平台', value: '' },
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
function submit (formRef) {
  formRef.validate((valid) => {
    if (valid) {

      let param = form;
      submitLoading.value = true
      param['iiTrace.type'] = 'firstDetect'
      param['iiTrace.trackType'] = 'virtualId'
      param['iiTrace.trackTypeName'] = '虚拟身份'
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
      // console.log(param);
      insertVirtualId(param).then(res => {
        let {code, data} = res.data
        if(code == 200) {
          proxy.$Message.success('添加成功！')
          Msg = reactive({
            peopleType: { key: '人员类型', value: '' },
            subType: { key: '所属平台', value: '' },
          })
          formRef.resetFields()
          submitLoading.value = false
          emit('callback', true)
        } else {
          proxy.$Message.error('添加失败')
          submitLoading.value = false
        }
      }).catch(err => {
        proxy.$Message.error(err.data.message ||'出现未知错误')
        submitLoading.value = false
      })
    }
  })
}
const virtualTypeLoading = ref(false)
/*if(peopleType.length < 1) {
  dict.getDict('peopleType')
}*/

function getVirtualSubType() {
  
  console.log(form.subType)
  virtualTypeLoading.value = true
  dictS.getVirtualType().then(res => {

    let r = proxy.$lodash.cloneDeep(res)
    r.forEach(item => {
      item.id = item.id + '_' + new Date().getTime()
    })
    virtualTypes.value = r
    virtualTypeLoading.value = false
  })
}

  getVirtualSubType()
  dictS.getDict('peopleType').then(res => {
    peopleType.value = res
  })
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
		      <FormItem label="父线索"  prop="parentId">
			      <Select v-model="form.parentId">
				      <Option v-for="item in traceList"
				              :key="item.value"
				              :value="item.id">{{item.trackTypeName}}:{{item.name}}
				      </Option>
			      </Select>
		      </FormItem>
	      </Col>
        <Col span="12">
          <FormItem label="所属平台" prop="subType">
            <Select
                v-model="form.subType"
                style="width: 100%"
                :label-in-value="false"
                :filterable="true" :loading="virtualTypeLoading" @on-select="selVirtualType"
                @on-open-change="getVirtualSubType"
            >
              <Option
                  v-for="item in virtualTypes"
                  :value="item.shortName"
                  :key="item.id"
                  :label="item.label"
              >
                <span> {{ item.label }}</span>
                <span v-if="item.isGreenChannel == 1 " style="float:right;color:#FFF;background: #24B493;padding: 0 .1rem;border-radius: .1rem">绿色通道</span>
                <span v-if="item.isImportantFocus == 1 " style="float:right;color:#FFF;background: #1D83FF;;padding: 0 .1rem;border-radius: .1rem">重点关注</span>
              </Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="账号" prop="name">
            <Input v-model="form.name"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="人员类别" prop="peopleType">
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

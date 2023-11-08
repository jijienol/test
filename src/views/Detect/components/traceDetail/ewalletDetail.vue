<script setup="">
import {reactive, watch, computed, ref} from "vue";
import {getEwalletDetail} from "@/api/trace.js";
import {dictStore} from "@/store/modules/dictionary.js";
import {storeToRefs} from "pinia";
import _ from 'lodash'
import {globalStore} from "@/store/modules/global.js";
const global = globalStore()
const dictS = dictStore()
// const {dict} = storeToRefs(dictS)
const props = defineProps({
  visible: false,
  param: {
    traceId: ''
  }
})
const peopleType = ref([])

import fileUtil from "@/utils/fileSaver.js";
const downloadUrl = ref('')
const attachments = ref([])
function download(row) {
	downloadUrl.value=''
	let _o = row.url.replace(/\/mnt\/data\/upload/g,'')
	let s = global.env.fileUrl + _o
	downloadUrl.value = s
	fileUtil.save(row.name, downloadUrl.value)
}
const Data = reactive({
  form: {
    name: '',
    remark: '',
    caseId: '',
    subType: '',
    peopleType: ''
  },
  peopleType: computed(() => {
    let r = _.find(peopleType.value, o => {
      return o.value == Data.form.peopleType
    })
    return r ? r.label : ''
  }),
  getData() {
    getEwalletDetail({id: props.param.traceId}).then(res => {
      let {code, data} = res.data
      if(code == 200) {
        data.peopleType = data.peopleType.trim()
        Data.form = data
	      attachments.value = res.data.data.attachmentInfos
	
      }
    })
  },
  empty() {
    for(let k in Data.form) {
      Data.form[k] = ''
    }
  }
})
watch(() => props.visible, (n) => {
  if(n && props.param.traceId) {
    Data.getData()
  } else {
    Data.empty()
    // formRef.value.resetFields()
  }
}, {immediate: true})
dictS.getDict('peopleType').then(res => {
  peopleType.value = res
})
</script>
<template>
  <DescriptionList title="" col="2">
    <Description term="名称：">
      {{Data.form.name}}
    </Description>
    <Description term="类别：">
      {{Data.form.subType}}
    </Description>
    <Description term="人员类别：">
      {{Data.peopleType}}
    </Description>
    <Description term="备注说明：">
      {{Data.form.remark}}
    </Description>
  </DescriptionList>
	<div v-for="item in attachments" :key="item.id">
		文件名：{{item.name}} <Button type="primary" style="margin-left: .2rem" @click="download(item)">下载</Button>
	</div>
<!--  <div class="main">
    <p><span class="label">账号</span>{{Data.form.name}}</p>
    <p><span class="label">类型</span>{{Data.form.subType}}</p>
    <p><span class="label">备注</span>{{Data.form.remark}}</p>
  </div>-->
</template>
<style scoped>
</style>

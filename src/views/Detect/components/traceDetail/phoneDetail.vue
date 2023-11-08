<script setup>
import {reactive, watch, ref, computed} from "vue";
import {getPhoneDetail} from '@/api/trace.js'
import {dictStore} from "@/store/modules/dictionary.js";
// import {storeToRefs} from "pinia";
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
    caseId: '',
    name: '',
    subType: '',
    peopleType: '',
    remark: ''
  },
  peopleType: computed(() => {
    let r = _.find(peopleType.value, o => {
      return o.value == Data.form.peopleType
    })
    return r ? r.label : ''
  }),
  getData() {
    getPhoneDetail({id: props.param.traceId}).then(res => {
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
    <Description term="手机号：">
      {{Data.form.name}}
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
</template>
<style scoped>
</style>

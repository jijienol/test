<script setup>
import {reactive, watch, ref} from "vue";
import {getOtherDetail} from "@/api/trace.js";
import fileUtil from "@/utils/fileSaver.js";
import {globalStore} from "@/store/modules/global.js";
const global = globalStore()

const props = defineProps({
  visible: false,
  param: {
    traceId: ''
  }
})
const attachments = ref([])
const Data = reactive({
  form: {
    caseId: '',
    name: '',
    remark: ''
  },
  getData() {
    console.log(props.param.traceId)
    getOtherDetail(props.param.traceId).then(res => {
      Data.form = res.data.data.otherClue
      attachments.value = res.data.data.attachments
    })
  },
  empty() {
    for(let k in Data.form) {
      Data.form[k] = ''
    }
  }

})
const downloadUrl = ref('')
function download(row) {
  downloadUrl.value=''
  let _o = row.url.replace(/\/mnt\/data\/upload/g,'')
  let s = global.env.fileUrl + _o
  downloadUrl.value = s
  fileUtil.save(row.name, downloadUrl.value)
}
watch(() => props.visible, (n) => {
  if(n && props.param.traceId) {
    Data.getData()
  } else {
    Data.empty()
    // formRef.value.resetFields()
  }
}, {immediate: true})
</script>
<template>
  <DescriptionList title="" col="2">
    <Description term="线索名称：">
      {{Data.form.name}}
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

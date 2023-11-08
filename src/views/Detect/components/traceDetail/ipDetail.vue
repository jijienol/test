<script setup>
  import {reactive, watch,ref} from "vue";
  import {getIpDetail} from '@/api/trace.js'
  import {globalStore} from "@/store/modules/global.js";
  const global = globalStore()
  const props = defineProps({
    visible: false,
    param: {
      traceId: ''
    }
  })
  // const emit = defineEmits(['callback'])
  // const formRef = ref(null)
  /*const Msg = reactive({
    remark: { key: '备注', value: '' },
    formatMsg(obj, form) {
    let msg = []
    for(let k in obj) {
      if(obj[k].value == '') {
        obj[k].value = form[k]
      }
      msg.push(obj[k])
    }
    return JSON.stringify(msg)
  }
  })*/
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
      remark: ''
    },
    submit() {

    },
    getData() {
      getIpDetail({id: props.param.traceId}).then(res => {
        Data.form = res.data.data
	      attachments.value = res.data.data.attachmentInfos
	
      }).catch(err => {
        console.log(err)
      })
    },
    empty() {
      for(let k in Data.form) {
        Data.form[k] = ''
      }
    },
    close() {
      // emit('callback', false)
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

</script>
<template>
  <DescriptionList title="" col="2">
    <Description term="ip地址：">
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

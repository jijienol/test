<script setup>
import {reactive, watch, ref} from "vue";
import {getApkDetail} from '@/api/trace.js'
import {Button} from 'view-ui-plus'
import fileUtil from 'src/utils/fileSaver.js'
import {globalStore} from 'src/store/modules/global.js'

const global = globalStore()
const props = defineProps({
  visible: false,
  param: {
    traceId: ''
  }
})
const attachments = ref([])
const downloadUrl = ref('')
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
  getData() {
    getApkDetail({id: props.param.traceId}).then(res => {
      Data.form = res.data.data
	    attachments.value = res.data.data.attachmentInfos
    })
  },
  empty() {
    for(let k in Data.form) {
      Data.form[k] = ''
    }
  }

})
function xz() {

	let _o = Data.form.file.replace(/\/mnt\/data\/upload/g, '');
	let s = global.env.fileUrl + _o;
	// 创建一个虚拟的 <a> 标签并模拟点击进行下载
	console.log(s)
	const a = document.createElement("a");
	a.style.display = "none";
	a.href = s;
	a.download = Data.form.name + ".apk"; // 替换为你想要的文件名
	// 等待链接准备好后再进行点击
	a.onload = function() {
		document.body.appendChild(a);
		a.click();
		// 清理资源
		document.body.removeChild(a);
	};
	// 触发链接加载
	a.click();
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
    <Description term="应用名称：">
      {{Data.form.name}}
    </Description>
    <Description term="包名：">
      {{Data.form.pkg}}
    </Description>
    <Description term="互联网下载地址：">
      {{Data.form.downloadUrl}}
    </Description>
    <Description term="备注说明：">
      {{Data.form.remark}}
    </Description>
	  <Description term="APK包：">
		 <Button type="primary" @click="xz()">下载APK包</Button>
	  </Description>
  </DescriptionList>
	<div v-for="item in attachments" :key="item.id">
		文件名：{{item.name}} <Button type="primary" style="margin-left: .2rem" @click="download(item)">下载</Button>
	</div>
<!--  <div class="main">
    <p><span class="label">应用名称</span>{{Data.form.name}}</p>
    <p><span class="label">包名</span>{{Data.form.pkg}}</p>
    <p><span class="label">互联网下载地址</span>{{Data.form.downloadUrl}}</p>
  </div>-->
</template>
<style scoped>
</style>

<script setup="">
import {reactive, watch, ref} from 'vue';
import {getUrlDetail} from '@/api/trace.js'
import {globalStore} from "@/store/modules/global.js";
const global = globalStore()
const props = defineProps({
	visible: false,
	param: {
		traceId: ''
	}
})
import fileUtil from '@/utils/fileSaver.js';

const downloadUrl = ref('')
const attachments = ref([])

function download (row) {
	downloadUrl.value = ''
	let _o = row.url.replace(/\/mnt\/data\/upload/g, '')
	let s = global.env.fileUrl + _o
	downloadUrl.value = s
	fileUtil.save(row.name, downloadUrl.value)
}

const Data = reactive({
	form: {
		name: '',
		remark: ''
	},
	getData () {
		getUrlDetail({id: props.param.traceId}).then(res => {
			Data.form = res.data.data
			attachments.value = res.data.data.attachmentInfos
			
		})
	},
	empty () {
		for (let k in Data.form) {
			Data.form[k] = ''
		}
	},
})
watch(() => props.visible, (n) => {
	if (n && props.param.traceId) {
		Data.getData()
	} else {
		Data.empty()
	}
}, {immediate: true})
</script>
<template>
	<DescriptionList col="2" title="">
		<Description term="url地址：">
			{{Data.form.name}}
		</Description>
		<Description term="备注：">
			{{Data.form.remark}}
		</Description>
	</DescriptionList>
	<div v-for="item in attachments" :key="item.id">
		文件名：{{item.name}}
		<Button style="margin-left: .2rem" type="primary" @click="download(item)">下载</Button>
	</div>
</template>
<style scoped>
</style>

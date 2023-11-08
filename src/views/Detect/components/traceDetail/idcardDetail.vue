<script setup>
import {reactive, watch, ref, computed} from 'vue';
import {getZjDetail} from '@/api/trace.js'
import {globalStore} from '@/store/modules/global.js';
import fileUtil from '@/utils/fileSaver.js';
import {dictStore} from 'src/store/modules/dictionary.js'
import _ from 'lodash'

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

const attachments = ref([])
const downloadUrl = ref('')

function download (row) {
	downloadUrl.value = ''
	let _o = row.url.replace(/\/mnt\/data\/upload/g, '')
	let s = global.env.fileUrl + _o
	downloadUrl.value = s
	fileUtil.save(row.name, downloadUrl.value)
}

const Data = reactive({
	form: {
		caseId: '',
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
		iiTrace: {},
		peopleType: '',
		remark: ''
	},
	peopleType: computed(() => {
		let r = _.find(peopleType.value, o => {
			return o.value == Data.form.peopleType
		})
		return r ? r.label : ''
	}),
	getData () {
		getZjDetail({id: props.param.traceId}).then(res => {
			let {code, data} = res.data
			if (code == 200) {
				data.peopleType = data.peopleType.trim()
				Data.form = data
				attachments.value = res.data.data.attachmentInfos
				
			}
			
		})
	},
	empty () {
		for (let k in Data.form) {
			Data.form[k] = ''
		}
	}
})
watch(() => props.visible, (n) => {
	if (n && props.param.traceId) {
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
	<DescriptionList col="2" title="">
		<Description term="证件号码：">
			{{Data.form.name}}
		</Description>
		<Description term="证件类型：">
			{{Data.form.zjlxDm}}
		</Description>
		<Description term="证件所有人名称：">
			{{Data.form.zjsyrmc}}
		</Description>
		<Description term="发证单位：">
			{{Data.form.fzdwDwmc}}
		</Description>
		<Description term="核发日期：">
			{{Data.form.hfrq}}
		</Description>
		<Description term="有效期开始日期：">
			{{Data.form.yxqksrq}}
		</Description>
		<Description term="有效期截止日期：">
			{{Data.form.yxqjzrq}}
		</Description>
		<Description term="人员类别：">
			{{Data.peopleType}}
		</Description>
		<Description term="备注说明：">
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

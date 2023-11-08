<script setup="">
import {getQrcodeData} from '@/api/trace.js'

// import myQrcode from '@/components/qrcode.vue'
import {globalStore} from '@/store/modules/global.js';
import $Message from '@/utils/message.js'

import {computed, reactive, ref, watch} from 'vue';
import {swdtStore} from '@/store/modules/swdt.js'

const swdt = swdtStore()
const global = globalStore()
const radio = ref('')
const qrData = reactive({
	id: '',
	str: ''
})
const props = defineProps({
	id: '',
	list: {
		type: Array,
		default: []
	},
	visible: false,
	default: ''
})
let traceId = ''
const list = computed(() => {
	
	let arr = []
	if (props.default == 'offlineBk') {
		return [{taskId: 'offlineBk', channelType: 'offlineBk', channelTypeName: 'offlineBk'}]
	} else if (props.default == 'url') {
		return [{taskId: 'url', channelType: 'url', channelTypeName: 'url'}]
	} else {
		let rpa = null
		let offline = {taskId: '0', channelType: 'offlineDetect', channelTypeName: ''}
		let internet = props.list.find(o => {
			return o.channelType == 'internet'
		})
		props.list.forEach(item => {
			if (item.channelTypeName == '线') {
				rpa = {channelTypeName: 'rpa', taskId: 'rpa'}
			}
		})
		if (internet) {
			arr = [offline, internet]
		} else {
			arr = [offline]
		}
		
		if (rpa) {
			arr.push(rpa)
		}
		return arr
	}
	
	
})
const loading = ref(false)

function getData () {
	
	
	if (radio.value == 'rpa') {
		
		
		const taskChannelId = () => {
			let type
			swdt.task.taskList.forEach(item => {
				console.log(item)
				if (item.channelType == 'offlineDetect') {
					type = item.taskId
				}
			})
			return type
		}
		let data = {
			channelType: 'rpa',
			traceType: swdt.task.trackType,
			taskChannelId: taskChannelId(),
			name: swdt.task.name,
		}
		getQrcodeData(data).then(res => {
			let {code, data} = res.data;
			
			if (code == 200) {
				qrData.str = global.env.fileUrl + data
			} else {
				qrData.str = ''
				$Message.info(data.message)
			}
			loading.value = false
		}).catch((err) => {
			// console.log(err);
			qrData.str = ''
			$Message.info(err.data.message || '出现未知错误')
			loading.value = false
		})
		return
	}
	
	if (swdt.qrcode.bkBatchNo) {
		getQrcodeData({channelType: 'offlineBk', bkBatchNo: swdt.qrcode.bkBatchNo}).then(res => {
			let {code, data} = res.data;
			
			if (code == 200) {
				qrData.str = global.env.fileUrl + data
			} else {
				qrData.str = ''
				$Message.info(data.message)
			}
			loading.value = false
		}).catch((err) => {
			// console.log(err);
			qrData.str = ''
			$Message.info(err.data.message || '出现未知错误')
			loading.value = false
		})
		return
	}
	
	
	if (props.default == 'offlineBk') {
		const {name, objectSourceId, phone, idCard} = props.list[0]
		getQrcodeData({channelType: 'offlineBk', name, objectSourceId, phone, idCard, traceId: props.id}).then(res => {
			let {code, data} = res.data;
			
			if (code == 200) {
				qrData.str = global.env.fileUrl + data
			} else {
				qrData.str = ''
				$Message.info(data.message)
			}
			loading.value = false
		}).catch((err) => {
			// console.log(err);
			qrData.str = ''
			$Message.info(err.data.message || '出现未知错误')
			loading.value = false
		})
	} else if (props.default == 'url') {
		getQrcodeData({taskChannelId: swdt.qrcode.url.taskChannelId, channelType: 'url', urlId: swdt.qrcode.url.urlId, urlName: swdt.qrcode.url.urlName}).then(res => {
			let {code, data} = res.data;
			if (code == 200) {
				qrData.str = global.env.fileUrl + data
			} else {
				qrData.str = ''
				$Message.info(data.message)
			}
			loading.value = false
		}).catch((err) => {
			qrData.str = ''
			$Message.info(err.data.message || '出现未知错误')
			loading.value = false
		})
	} else {
		let ability = list.value.find(o => {
			return o.taskId == radio.value
		})
		loading.value = true
		let taskChannelId = radio.value == 0 ? '' : radio.value;
		getQrcodeData({taskChannelId: taskChannelId, channelType: ability.channelType, traceId: props.id}).then(res => {
			let {code, data} = res.data;
			if (code == 200) {
				qrData.str = global.env.fileUrl + data
			} else {
				qrData.str = ''
				$Message.info(data.message)
			}
			loading.value = false
		}).catch((err) => {
			qrData.str = ''
			$Message.info(err.data.message || '出现未知错误')
			loading.value = false
		})
	}
}

function radioChange (r) {
	qrData.str = ''
	getData()
}

function setName (name) {
	if (name == '玄') {
		return '玄武互联网能力'
	} else if (name == 'offlineBk') {
		return '人员布控'
	} else if (name == 'rpa') {
		return 'RPA'
	} else if (name == 'url') {
		return 'URL'
	}
	{
		return '复制线索名称'
	}
	
}

watch(() => props.visible, (n) => {
	if (!n) {
		radio.value = ''
		qrData.str = ''
		
	} else {
		if (props.default) {
			radio.value = props.default
			getData()
		}
	}
})

</script>
<template>
	<div>
		<RadioGroup v-model="radio" @on-change="radioChange">
			<Radio v-for="q in list" :key="q.taskId" :label="q.taskId">
				<span>{{setName(q.channelTypeName)}}</span>
			</Radio>
		</RadioGroup>
		<div style="position: relative;text-align:center;">
			<img v-show="qrData.str" :src="qrData.str" alt="" class="qr">
			<!--      <my-qrcode v-if="qrData.str" :id="qrData.id" :str="qrData.str"></my-qrcode>-->
			<Spin :show="loading" fix>
				<Icon class="demo-spin-icon-load" size=18 type="ios-loading"></Icon>
			</Spin>
		</div>
	
	</div>
</template>
<style scoped>
.qr {
	width: 256px;
	height: 256px;
}
</style>

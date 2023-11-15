<script setup="">
import {ref, reactive, defineProps, getCurrentInstance, computed, markRaw, watch, nextTick} from 'vue';
import {getTraceList, deleteTrace} from '@/api/trace.js'
import {ajListStore} from '@/store/modules/ajList.js';
import bankCard from '../components/traceDetail/klDetail.vue'
import urlDetail from '../components/traceDetail/urlDetail.vue'
import ipDetail from '../components/traceDetail/ipDetail.vue'
import macDetail from '../components/traceDetail/macDetail.vue'
import walletDetail from '../components/traceDetail/ewalletDetail.vue'
import idcardDetail from '../components/traceDetail/idcardDetail.vue'
import virtualDetail from '../components/traceDetail/virtualDetail.vue'
import phoneDetail from '../components/traceDetail/phoneDetail.vue'
import apkDetail from '../components/traceDetail/apkDetail.vue'
import offlineTaskDetail from '../components/traceDetail/offlineTaskDetail.vue'
import {globalStore} from '../../../store/modules/global.js';
import bus from 'vue3-eventbus'

const global = globalStore()
const compList = reactive([
	{traceType: 'ip', component: markRaw(ipDetail)},
	{traceType: 'url', component: markRaw(urlDetail)},
	{traceType: 'wifi', component: markRaw(macDetail)},
	{traceType: 'ewallet', component: markRaw(walletDetail)},
	{traceType: 'bankCard', component: markRaw(bankCard)},
	{traceType: 'apk', component: markRaw(apkDetail)},
	{traceType: 'idcard', component: markRaw(idcardDetail)},
	{traceType: 'phone', component: markRaw(phoneDetail)},
	{traceType: 'virtualId', component: markRaw(virtualDetail)},
	{traceType: 'offlineTask', component: markRaw(offlineTaskDetail)},

])
const {proxy} = getCurrentInstance()
const props = defineProps({
	trackType: {
		type: String,
		default: 'all',
		required: true
	},
	flag: {
		type: Boolean,
		default: false
	}
	
})
const spinLoading = ref(false)
const ajStore = ajListStore()
const caseId = ajStore.caseId
const type = ref('')
const editModalOpt = reactive({
	visible: false,
	msg: null,
	param: {
		traceId: '',
		editable: false
	},
	close: () => {
	
	}
})
const modalOpt = reactive({
	param: {},
	visible: false,
	title: '提示',
	content: '',
	loading: true,
	ok: () => {
		deleteTrace(modalOpt.param).then(res => {
			// console.log(res);
			let {code, data} = res.data;
			if (code == 200) {
				// getData()
				// 从列表移除
				let ind = proxy.$lodash.findIndex(Data.list, function (o) {
					return o.id == modalOpt.param.id
				});
				Data.list.splice(ind, 1)
				modalOpt.visible = false
				proxy.$Message.success('删除成功！')
				
				ajStore.getCaseInfo()
			} else {
				proxy.$Message.error(res.data.message)
				modalOpt.visible = false
			}
			
		}).catch((err) => {
			proxy.$Message.error(err.data.message || '出现未知错误')
			modalOpt.visible = false
		})
	},
	cancel: () => {
	
	}
})
const Data = reactive({
	traceType: '',
	list: [],
	yjcz: computed(() => {
		return proxy.$lodash.filter(Data.list, o => {
			return !o._disabled
		})
	}),
	comp: computed(() => {
		let c = compList.find(o => {
			return o.traceType === Data.traceType
		})
		if (c) {
			return c.component
		} else {
			return ''
		}
	})
})
watch(() => props.trackType, (n) => {
	
	/*if(n == 'all') {
	 type.value = ''
	 // props.trackType === 'all' ? '' : props.trackType
	 }else {
	 type.value = n
	 }*/
	nextTick(() => {
		getData()
	})
}, {immediate: true})
//关闭笔录刷新
watch(() => global.bl, (v, n) => {
	console.log(v, n)
	nextTick(() => {
		getData()
	})
}, {
	deep: true
})
const count = ref(0)

function getData () {
	Data.list = []
	let params = {
		caseId: caseId,
		trackType: props.trackType == 'all' ? '' : props.trackType,
		pageNo: 1,
		pageSize: 100
	}
	spinLoading.value = true
	getTraceList(params).then(res => {
		let {code, data} = res.data;
		if (code == 200) {
			data.list.forEach(item => {
				item._disabled = item.firstDetect == '1'
				
			})
			let list = proxy.$lodash.sortBy(data.list, ['_disabled']);
			// console.log(list);
			Data.list = list
			count.value = list.length
			spinLoading.value = false
			// ajStore.getCaseInfo()
		} else {
			proxy.$Message.error(res.data.message)
			spinLoading.value = false
		}
	}).catch(err => {
		console.log(err);
		proxy.$Message.error('请求失败')
		spinLoading.value = false
	})
}


bus.on('qwe', (qwe) => {
	console.log(qwe)
	getData()
})

function delTrace (item) {
	// console.log(item);
	modalOpt.param = {id: item.id, trackType: item.trackType}
	modalOpt.content = '确定要删除线索：' + item.trackTypeName + ' ' + item.name + '?'
	modalOpt.visible = true
	
}

function detail (obj) {
	// console.log(obj);
	Data.traceType = obj.trackType
	editModalOpt.msg = obj.msg
	// console.log(editModalOpt.msg);
	editModalOpt.param = obj
	editModalOpt.visible = true
}

function setTags (msgStr) {
	try {
		let list = msgStr ? JSON.parse(msgStr) : []
		let arr = []
		if (list.length > 0) {
			list.forEach((l => {
				if (l.value != '') {
					arr.push(l)
				}
			}))
		}
		// console.log(arr);
		return arr
	}
	catch {
		return []
	}
	
	
}

function setVirtualIdLabel (msg) {
	try {
		let _arr = msg ? JSON.parse(msg) : []
		// console.log(_arr);
		let obj = _arr.find(o => {
			return o.key == '所属平台'
		})
		// console.log(obj);
		return obj ? ('(' + obj.value + ')') : ''
	}
	catch {
		return ''
	}
}

// 向父组件暴露数据
defineExpose({
	getData,
	count,
	Data
})
</script>
<template>
	<ul :class="props.flag?'con':'con1'">
		<li v-for="(item, i) in Data.list" :key="i" class="trace-item">
			<div class="date lh">
				<div class="name"><span class="name-type">{{item.trackTypeName}}{{setVirtualIdLabel(item.msg)}}</span>：{{item.name}}</div>
				<span v-if="item._disabled" class="done">已侦查</span>
			</div>
			<div class="lh">
				<Tag v-for="tag in setTags(item.msg)" :title="tag.key">{{tag.value}}</Tag>
			</div>
			<div class="remark lh" style="color: rgba(24,31,67,0.75);">备注：{{item.remark}}</div>
			<div class="lh" style="color: rgba(24,31,67,0.5);">{{item.createdTime}}</div>
			<div class="operate">
				<Icon class="del-icon" color="#888" size="18" type="md-paper" @click="detail(item)"/>
				<Icon class="del-icon" color="#888" size="18" type="md-trash" @click="delTrace(item)"/>
			</div>
		</li>
	</ul>
	<Spin :show="spinLoading" fix></Spin>
	<Modal v-model="modalOpt.visible" :loading="modalOpt.loading" :title="modalOpt.title"
	       @on-ok="modalOpt.ok" @on-cancel="modalOpt.cancel">
		<p>{{modalOpt.content}}</p>
	</Modal>
	<Modal v-model="editModalOpt.visible" :footer-hide="false" title="线索详情" width="50%">
		<p>
			<component :is="Data.comp" :msg="editModalOpt.msg" :param="editModalOpt.param" :visible="editModalOpt.visible"></component>
		</p>
		<template #footer>
			<Button @click="editModalOpt.visible = false">关闭</Button>
		</template>
	</Modal>
</template>
<style lang="less" scoped>
ul li {
	list-style: none;
}

.con1 {
	min-height: 80%;
	padding-right: 10px;
	
	.trace-item {
		position: relative;
		background: #FFFFFF;
		border-radius: 8px;
		padding: 10px 10px 0;
		margin-bottom: 10px;
		line-height: .24rem;
		min-height: 1.25rem;
		
		.name {
			font-size: 15px;
			white-space: pre-wrap;
			word-break: break-all;
			
			.name-type {
				color: #888;
			}
		}
		
		.date {
			display: flex;
			justify-content: space-between;
			
			.done {
				flex: 0 0 60px;
				text-align: right;
				color: rgba(36, 180, 147, 1);
			}
		}
		
		.del-icon {
			padding: 0 5px;
			
			&:hover {
				color: rgba(64, 158, 255, 0.95) !important;
			}
		}
		
		.operate {
			display: none;
			position: absolute;
			top: .1rem;
			right: .1rem;
			background: #FFFFFF;
			cursor: pointer;
		}
		
		&:hover {
			.operate {
				display: block;
			}
		}
		
		.lh {
			line-height: .28rem;
			font-size: 14px;
			font-weight: normal;
			color: rgba(24, 31, 67, 0.75);
		}
	}
}

.con {
	//min-height: 80%;
	padding-right: 10px;
	display: flex;
	flex-wrap: wrap;
	
	.trace-item {
		position: relative;
		width: 32%;
		margin: .5%;
		background: #FFFFFF;
		border-radius: 8px;
		padding: 10px 10px 0;
		min-height: 1.25rem;
		
		.name {
			font-size: 15px;
			white-space: pre-wrap;
			word-break: break-all;
			
			.name-type {
				color: #888;
			}
		}
		
		.date {
			display: flex;
			justify-content: space-between;
			
			.done {
				color: rgba(36, 180, 147, 1);
			}
		}
		
		.del-icon {
			padding: 0 5px;
			
			&:hover {
				color: rgba(64, 158, 255, 0.95) !important;
			}
		}
		
		.operate {
			display: none;
			position: absolute;
			top: .1rem;
			right: .1rem;
			background: #FFFFFF;
			cursor: pointer;
		}
		
		&:hover {
			.operate {
				display: block;
			}
		}
		
		.lh {
			line-height: .28rem;
			font-size: 14px;
			font-weight: normal;
			color: rgba(24, 31, 67, 0.75);
		}
	}
}

</style>

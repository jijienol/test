<script setup>
import {computed, getCurrentInstance, inject, reactive, ref} from 'vue';
import {swdtStore} from '@/store/modules/swdt.js';
import {updateSwdtList} from '@/api/swdt.js';
import {noteStore} from '@/store/modules/note.js';
import {getListData} from '@/utils/tree.js';
import {cloneDeep, debounce} from 'lodash';
import {globalStore} from '@/store/modules/global.js';
import {storeToRefs} from 'pinia';
import bus from 'vue3-eventbus';
import {permissionStore} from '@/store/modules/permission.js';
import {getCluePeopleInfo} from '@/api/swdt.js';
import {getCollisionMindLineList, getSameTrace, markPeople, unMarkPeople} from '../../../../api/swdt.js';
import {Message, Button, Icon, Tag} from 'view-ui-plus'
import $Message from 'view-ui-plus/dist/viewuiplus.min.esm.js'

const {proxy} = getCurrentInstance()
const note = noteStore()
const getGraph1 = inject('getGraph')
const getNode1 = inject('getNode')
const getGraph = ref(getGraph1)
const getNode = ref(getNode1)

const global = globalStore()
const permission = permissionStore()
const swdt = swdtStore()
const props = defineProps(['task'])
const {task} = props
const {popupVisible} = storeToRefs(global)
const {noteVisible} = storeToRefs(note)
const {network} = storeToRefs(permission)
const follow = ref()
const flag = ref()
follow.value = computed(() => task.traceSource).value
flag.value = computed(() => task.collapseSub).value

const isQr = computed(() => {
	/* 1 内网才有码
	 * 2 */
	if (network.value == 0) {// 0
		if (task.taskList) {
			
			let internet = task.taskList.find(o => {
				return o.channelType == 'internet'
			})
			return internet ? internet : false;
			
		} else {
			return false
		}
	} else {
		return false
	}
})

function time (str) {
	return str.slice(0, 16)
}

const labels = reactive({
	'internet': '玄',
	'offlineDetect': '线',
	'drawProof': '调',
	'inner': '公'
})
//移入移出 工具栏显示
const tool = ref(false)


function enter () {
	tool.value = true
}

function shiftOut () {
	tool.value = false
}

//添加蒙层打开
// const mask = task.hasChildren
// function enter() {
//   if (!mask){
//     tool.value = true
//   }
// }
//
// function shiftOut() {
//   if (!mask){
//     tool.value = false
//   }
// }

//玄武能力参数
const statisticList = computed(() => {
	let list = task.taskList || []
	list.forEach((item) => {
		item.title = cloneDeep(item.channelTypeName)
		item.channelTypeName = labels[item.channelType]
	})
	
	return list
})
//玄武能力参数
const internet = computed(() => {
	let list = task.taskList || []
	list = list.filter(i => i.channelType == 'internet')
	list.forEach((item) => {
		item.title = cloneDeep(item.channelTypeName)
		item.channelTypeName = labels[item.channelType]
	})
	return list
})


//碰撞
function collisionNum () {
	if (task.sum) {
		return task.sum.differentCollision + task.sum.sameCollision
	}
	return 0
}

function outCollision () {
	if (task.sum) {
		return task.sum.outCollision
	}
	return 0
}

function sameCollision () {
	if (task.sum) {
		return task.sum.sameCollision
	} else {
		return 0
	}
}

function differentCollision () {
	if (task.count) {
		return task.count
	} else {
		return 0
	}
}


async function isTop (type) {
	const node = getNode.value() // 获取节点
	const graph = getGraph.value()
	try {
		if (type === 'single') {
			// 收藏当前节点
			//改标定
			// console.log(follow.value, follow.value == 0 ? 1 : 0)
			
			// const {data} = await updateSwdtList({follow: follow.value, traceIdList: [node.id]})
			// if (data.code != 200) {
			//   Message.error(data.message)
			// }
			if (follow.value == 3) {
				const {data} = await unMarkPeople(node.id)
				console.log(data)
				if (data.code != 200) {
					console.log(123)
					alert(data.message)
					Message.error(data.message)
				} else if (data.code == 200) {
					follow.value = follow.value == 3 ? 0 : 3
					swdt.getData(task.caseId)
					swdt.getTabNums(task.caseId)
					
				}
			} else {
				const {data} = await markPeople(node.id)
				if (data.code != 200) {
					Message.error(data.message)
					
				} else if (data.code == 200) {
					follow.value = follow.value == 3 ? 0 : 3
					swdt.getData(task.caseId)
					swdt.getTabNums(task.caseId)
					
				}
			}
			
			
		} else if (type === 'up') {
			// // 置顶
			// const idList = graph.getSuccessors(graph.getPredecessors(node, {distance: 1})[0], {distance: 1}).map(item => item.id)
			// const num = swdt.treeData.children.filter(item => {
			//   return idList.includes(item.id)
			// }).sort((a, b) => {
			//   return -(a.zindex - b.zindex)
			// })[0].zindex
			//
			// const {data} = await updateSwdtList({zindex: num + 3, traceIdList: [node.id]})
			if (data.code != 200) {
				Message.error(data.message)
			} else {
				swdt.treeData1 = swdt.treeData1.map(item => {
					if (item.id == node.id) {
						item.zindex = num + 3
					}
					return item
				})
				swdt.treeData = cloneDeep(getListData(swdt.treeData1))
				
			}
		} else if ('tags') {
			//标签
			await swdt.getTagArr(task)
		} else {
			// 收藏前序节点
			const fronts = graph.getPredecessors(node)
			const traceIdList = fronts.map(item => item.id)
			traceIdList.push(node.id)
			const {data} = await updateSwdtList({follow: task.follow == '0' ? '1' : '0', traceIdList: traceIdList})
			if (data.code != 200) {
				Message.error(data.message)
			}
		}
	}
	catch (e) {
		Message.error(e.data.message)
	}
	
}

//删除节点
function delNode () {
	if (popupVisible.value) { // 打开状态判断是否需要关闭
		// if(task.id == swdt.history.new.node.id) { // 删除了当前激活状态的节点
		popupVisible.value = false
		// }
	}
	if (noteVisible.value) { // 关闭笔记或标定
		noteVisible.value = false
	}
	swdt.delNode(task)
}

//折叠
async function fold () {
	const node = getNode.value() // 获取节点
	flag.value = flag.value == 0 ? 1 : 0
	const {data} = await updateSwdtList({collapseSub: flag.value, traceIdList: [node.id]})
	if (data.code != 200) {
		Message.error(data.message)
	} else {
		swdt.treeData1 = swdt.treeData1.map(item => {
			if (item.id == node.id) {
				item.collapseSub = flag.value
			}
			return item
		})
		swdt.treeData = cloneDeep(getListData(swdt.treeData1))
	}
}

const realTime = computed(() => {
	return task.taskList.some(item => item.realTime == '1')
})
const taskContinueStatus = computed(() => {
	return task.taskList.some(item => item.taskContinueStatus == '1')
})
const asd = computed(() => {
	return task.childs
})

//深入侦查
function deep () {
	swdt.openDeep(task, 'wai')
}

function png (v) {
	return 'icon-' + v
}

function setVirtualIdLabel (msg) {
	if (!msg) return
	try {
		let _arr = msg ? JSON.parse(msg) : []
		// console.log(_arr);
		let obj = _arr.find(o => {
			return o.key == '所属平台'
		})
		return obj ? ('(' + obj.value + ')') : ''
	}
	catch {
		return ''
	}
}

function setTag (msg) {
	// console.log(msg)
	if (!msg) return
	try {
		let _arr = msg ? JSON.parse(msg) : []
		if (_arr.length > 0) {
			let arr = []
			_arr.forEach(item => {
				if (item.value) {
					arr.push(item.value)
				}
			})
			return arr
		}
	}
	catch {
		return ''
	}
}

function biao () {
	const val = task.traceSource.trim()
	return val == '3'
}

function traceSource () {
	return task.trackType == 'idcard' || task.trackType == 'phone';
}

async function traceSourceData () {
	swdt.people.visible = true
	const res = await getCluePeopleInfo({traceId: task.id})
	if (res.data.code == 200) {
		if (res.data.data) {
			swdt.people.peopleForm = res.data.data
			
			
		} else {
			swdt.people.peopleForm = {
				traceId: task.id,
				name: '',
				type: '',
				gender: '1',
				idCard: '',
				phone: '',
				age: '',
			}
			
		}
		console.log(swdt.people)
	} else {
		Message.error(res.data.message)
		
	}
	console.log(res)
	
}

function openQrcode () {
	// console.log(isQr.value.taskId);
	swdt.task = task
	swdt.openQrcode(task.id, statisticList.value)
}

function openRemarkEdit (id, remark) {
	task.remark = remark
	bus.emit('remark', {id: id, remark: remark})
}

//标定
function signNum () {
	if (task.sum) {
		return task.sum.markNum
	}
	return 0
}

//笔记
function noteNum () {
	if (task.sum) {
		return task.sum.noteNum
	}
	return 0
}

const loading1 = ref(false)

// const loading2 = ref(false)
async function openCollision (val) {
	loading1.value = true
	
	const {data} = await getCollisionMindLineList({traceId: task.id, type: val})
	if (data.code == 200) {
		
		const traceKeyMap = {
			apk: 'APK',
			ewallet: '电子钱包',
			url: 'URL',
			phone: '手机号',
			virtualId: '虚拟身份',
			bankCard: '卡类',
			ip: 'IP',
			idcard: '证件号码',
			wifi: 'MAC',
			offlineTask: '其他线索'
		};
		
		const info = data.data.map(e => {
			const {typeCountDetails} = {...e};
			const statDesc = typeCountDetails
				.map(({dataType, count}) => `${traceKeyMap[dataType]}:${count}`)
				.reduce((t1, t2) => (t1 + ',' + t2))
			return {...e, statDesc};
		})
		console.log({info})
		if (info.length < 1) {
			Message.error('查询为空')
			loading1.value = false
			
			return
		}
		swdt.openCollision(info, val)
		loading1.value = false
	} else {
		loading1.value = false
		
	}
	// console.log(data)
}

//多次线索
async function duo () {
	
	try {
		const res = await getSameTrace({traceId: task.id})
		console.log(res)
		if (res.data.code == 200) {
			swdt.openCollision(res.data.data)
		} else {
			Message.error(res.data.message)
		}
	}
	catch (e) {
		Message.error(e.data.message)
	}
}


</script>

<template>
	<div style="min-height: 1.6rem;padding-top: .2rem;position: relative" @mouseenter="enter" @mouseleave="shiftOut">
		<div :class="task.id==swdt.border? 'active':'',biao()?'bd':''" class="demo-wrapper">
			<div v-for="(item,index) in task.zdxs" :style="index==1?'right:1.4rem':''" class="zdxs">
				<Icon size="20" type="ios-information-circle-outline"/>
				{{item.title}}
				<div v-if="task.zdxs" class="zdxs1">
					<p class="title">{{item.name}}
						<Tag color="#f56c6c">扩线</Tag>
					</p>
					<p style="color: #222222">{{item.text}}</p>
					<div class="icon">
						<Icon size="28" type="ios-information-circle-outline"/>
					</div>
				</div>
			</div>
			<div :class="asd?'masks':''">
				<div :class="tool ? 'top-tool':''" class="tool">
					<div class="left">
						<div class="left-item" @click.stop="isTop('tags')">
							<i class="iconfont icon-biaoqian"></i>
							<span>标签</span>
						</div>
						<div v-if="task.trackType=='idcard'" :style="{color:follow==3?'#1D83FF':''}" :title="follow == 3 ? '取消标定': '标定线索'" class="left-item"
						     @click.prevent.stop="isTop('single')">
							<i class="iconfont icon-shoucang1"></i>
							<span>标定</span>
						</div>
						<!--          <div v-if="task.type == 'firstDetect'" @click.prevent.stop="isTop('up')" class="left-item">-->
						<!--            <i class="iconfont icon-zhiding"></i>-->
						<!--            <span>置顶</span>-->
						<!--          </div>-->
						<div class="left-item" @click.stop="delNode">
							<i class="iconfont icon-shanchu"></i>
							<span>删除</span>
						</div>
						<div class="left-item">
							<i class="iconfont icon-erweima1" @click.stop="openQrcode()"></i>
							<span>扫码</span>
						</div>
						<div v-if="traceSource()" class="left-item">
							<i class="iconfont icon-idcard" @click.stop="traceSourceData()"></i>
							<span>详情</span>
						</div>
						<div :title="task.createName" class="left-item" style="width: .42rem;text-align: center" >
							<Icon size="24" type="ios-person "/>
							<div style="width: .42rem;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;font-size: 12px">{{task.createName}}</div>
						</div>
					</div>
					<div class="right">
						<div v-if="realTime" :style="{color: taskContinueStatus?'#1D83FF':''}" class="right-item"
						     @click="swdt.openDate(task)">
							<div class="icon-box"><i class="iconfont icon-xunhuan"></i></div>
							<span>循环查找</span>
						</div>
						<div class="right-item" @click="deep()">
							<div class="icon-box"><i class="iconfont icon-jia"></i></div>
							<span>深入侦查</span>
						</div>
					</div>
				</div>
				<div v-if="task.hasChildren" class="fold" @click.once="fold">
					<i v-if="flag==0" class="iconfont icon-caidanzhedie "></i>
					<i v-else class="iconfont icon-caidanzhankai"></i>
				</div>
				<div class="content">
					<div v-if="follow == '1'" class="collect">
						<i class="iconfont icon-shoucang1" style="color: #1D83FF"></i>
					</div>
					<div :title="task.label" class="title">
						
						<i :class="png(task.trackType)" class="iconfont" style="font-size: .20rem;margin-right: .05rem"></i>
						<span v-if="task.trackType!='virtualId'">{{task.trackTypeName}}</span>
						<span v-else>{{task.trackTypeName}}</span>
						<span>{{task.name}}</span>
					
					</div>
					<p v-if="task.trackType=='virtualId'">{{setVirtualIdLabel(task.msg)}}</p>
					<div class="time">
						<div class="createdTime">{{time(task.createdTime)}}</div>
						<div v-if="taskContinueStatus" :title="循环查找中" style="margin-left: .1rem;color: #24B493"><i
							class="iconfont icon-xunhuan"></i>
						</div>
						<div v-for="(item, i) in statisticList" :key="i" :class="{'green': item.status == 1 ,'red': item.status == 2}" :title="item.title"
						     class="channelTypeName">
							<div>{{item.channelTypeName}}</div>
							<!--            互联网任务查询中-->
							<div v-if="item.status == 0 && item.channelType == 'internet'" class="loading">
								<svg height="27" width="27">
									<circle
										:cx="9"
										:cy="9"
										:r="8"
										:stroke-width="3"
										class="loading-circle"
										fill="transparent"
										stroke="rgb(29, 131, 255 )"
									/>
								</svg>
							</div>
						</div>
					</div>
					<div class="tags">
						<div v-for="(tag, ti) in setTag(task.msg)" :key="'tag-' + ti" :title="tag" class="primary1">{{tag}}</div>
						<div v-for="(tag, ti) in task.tagList" :key="'tag-' + ti" :title="tag.tagName" class="primary">{{tag.tagName}}</div>
					</div>
					<div class="remark-wrap">
						<i class="iconfont icon-xiugai"></i>
						<span :title="task.remark" class="txt" @click="openRemarkEdit(task.id, task.remark)">
            {{task.remark || '填写备注'}}
          </span>
					</div>
				</div>
				
				<div v-if="outCollision() || task.count" :class="biao()?'bd1':''" class="bottom">
					<!--        <div class="collision">-->
					<!--          <div v-if="outCollision()" @click="note.getTraceCollisionDetail(task.id)">案间碰撞{{ outCollision() }}</div>-->
					<!--          <div  @click="swdt.openCollision(task)">案内同链 {{ sameCollision() }}</div>-->
					<!--          <div  @click="swdt.openCollision(task)">案内交链 {{ differentCollision() }}</div>-->
					<!--        </div>-->
					<div class="collision">
						<Button v-if="outCollision()" style="background: #ECF5FF;color: #006DDD;border-color: #006DDD" @click="note.getTraceCollisionDetail(task.id)">案间碰撞 ({{outCollision()}})</Button>
						<div v-if="task.count" class="pzbtn">
							<Button :loading="loading1" style="background: #F0F9EB;color: #42A114;border-color: #42A114" @click="openCollision()">案内碰撞 ({{differentCollision()}})</Button>
							<div class="pzxlk" style="display: none; ">
								<div @click="openCollision('ip')">IP</div>
								<div @click="openCollision('other')">其他</div>
							</div>
						</div>
					
					</div>
				</div>
			</div>
			
			<div v-if="task.num>1" class="num" @click.stop="duo">
				<div><span style="font-size: 24px;font-weight: 500;line-height:0">首次</span></div>
				/<span>{{task.num}}次</span></div>
		</div>
	</div>

</template>
<style lang="less" scoped>
.pzbtn {
	z-index: 9999999999 !important;
	position: relative;
	margin-right: 1px;
	
	&:hover {
		.pzxlk {
			position: absolute;
			width: 1.1rem;
			top: 0;
			left: 1.1rem;
			display: block !important;
			text-align: center;
			background: #FFFFFF;
			border: 1px solid #ccc;
			border-radius: 5px;
			
			div {
				height: 30px;
				padding: 5px;
				
				&:hover {
					background: #f2f9ec;
					color: #42A114;
				}
			}
		}
	}
}

.zdxs {
	color: #FFFFFF;
	border-radius: 5px;
	padding: 2px 10px;
	position: absolute;
	top: -10px;
	right: 20px;
	background: #f67d7d;
	display: flex;
	justify-content: center;
	align-items: center;
	
	&:hover {
		background: #bd2035;
		
		.zdxs1 {
			display: block;
			
			
		}
	}
}

.zdxs1 {
	display: none;
	position: absolute;
	top: -2.1rem;
	right: -1.8rem;
	width: 2.68rem;
	height: 1.4rem;
	border: 1px dotted #f67d7d;
	background: #fef0f0;
	border-radius: 10px;
	padding: 20px;
	
	.title {
		padding-bottom: 10px;
		border-bottom: 1px dotted #f67d7d;
		margin-bottom: 10px;
		color: #f67d7d;
	}
	
	.icon {
		width: 38px;
		height: 38px;
		background: #f67d7d;
		line-height: 45px;
		text-align: center;
		color: #FFFFFF;
		border-radius: 76px;
		position: absolute;
		bottom: -18px;
		left: -18px;
	}
}

.num {
	position: absolute;
	top: 30px;
	right: 10px;
	width: 60px;
	height: 60px;
	background: #da5d51;
	border-radius: 50%;
	text-align: center;
	color: #FFFFFF;
	padding-top: 20px;
}

.masks {
	
	background: #ECF5FF;
	box-shadow: 0px 4px 12px 0px #CDE3FB;
	border-radius: 6px 6px 6px 6px;
	opacity: 1;
	border: 2px solid #006DDD;
}

.loading {
	position: absolute;
	top: 0;
}

@keyframes loadingAnim {
	0% {
		stroke-dasharray: 20 160;
		stroke-dashoffset: 0;
	}
	100% {
		stroke-dasharray: 120 60;
		stroke-dashoffset: -160;
	}
}

.loading-circle {
	animation: loadingAnim;
	animation-duration: 3s;
	animation-iteration-count: infinite;
}

.bd {
	border-radius: 8px 8px 8px 8px;
	box-shadow: 0px 2px 8px 1px rgba(253, 0, 0, 0.8) !important;
}

//.bd1{
//  border-radius: 0 0 8px 8px;
//  box-shadow: 0px 4px 8px 0px rgba(253, 0, 0, 0.8);
//}
.active {
	border: 2px solid rgba(29, 131, 255, 0.4);
}

.mask {
	box-sizing: content-box;
	position: absolute;
	bottom: 0;
	z-index: 99;
	min-width: 2.64rem;
	max-width: 2.94rem;
	height: calc(100% - 8);
	background: #e4e4e4;
	border-radius: 8px 8px 8px 8px;
	opacity: .5;
	
	.top {
		position: absolute;
		top: -.3rem;
		width: 2.95rem;
		height: calc(100% + 50px);
	}
	
	.fold {
		width: .26rem;
		height: .26rem;
		position: absolute;
		right: -.26rem;
		top: .32rem;
		border-radius: 50%;
		background: #e4e4e4;
		border: 1px solid #ccc;
	}
}

.demo-wrapper {
	cursor: pointer;
	position: relative;
	min-width: 2.64rem;
	max-width: 2.94rem;
	min-height: 1rem;
	background: #FFF;
	border-radius: 8px 8px 8px 8px;
	opacity: 1;
	box-shadow: 0px 2px 8px 1px rgba(24, 31, 67, 0.32);
	
	.tool {
		display: none;
		z-index: 999999 !important;
	}
	
	.fold {
		width: .25rem;
		height: .25rem;
		position: absolute;
		right: -.25rem;
		top: .28rem;
		border-radius: 50%;
		background: #FFF;
		border: 1px solid #ccc;
		
		i {
			font-size: .25rem;
			line-height: .22rem;
			text-align: center;
		}
	}
	
	.top-tool {
		display: flex;
		align-items: center;
		position: absolute;
		justify-content: space-between;
		min-width: 2.64rem;
		height: .58rem;
		border-radius: 8px 8px 8px 8px;
		box-shadow: 0px 2px 8px 1px rgba(24, 31, 67, 0.32);
		background: #FFF;
		top: -.68rem;
		z-index: 999999 !important;
		
		.left {
			display: flex;
			align-items: center;
			height: .58rem;
			margin-right: .2rem;
			
			.left-item {
				width: .32rem;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				
				span {
					font-size: .12rem;
				}
			}
		}
		
		.right {
			display: flex;
			
			.right-item {
				display: flex;
				width: .5rem;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				margin-right: .1rem;
				
				.icon-box {
					width: .28rem;
					height: .28rem;
					border-radius: 8px 8px 8px 8px;
					opacity: 1;
					border: 1px solid rgba(24, 31, 67, 0.12);
					text-align: center;
					line-height: .28rem;
				}
				
				span {
					font-size: .12rem;
				}
			}
		}
	}
	
	.content {
		min-width: 2.64rem;
		max-width: 2.94rem;
		padding-top: .1rem;
		padding-left: .18rem;
		min-height: 1rem;
		
		.collect {
			position: absolute;
			top: 0;
			left: 0;
			width: .16rem;
			height: .16rem;
			line-height: .16rem;
			border-radius: 0px 0px 8px 0px;
			background: #F1F2F4;
		}
		
		.title {
			width: 2.54rem;
			display: flex;
			
			span {
				font-size: 16px;
				
				&:nth-child(2) {
					color: rgba(24, 31, 67, 0.5);
					margin-right: .1rem;
					line-height: 28px;
				}
				
				&:nth-child(3) {
					width: 1.3rem;
					color: rgba(0, 0, 0, 0.85);
					line-height: 28px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}
		
		.time {
			display: flex;
			align-items: center;
			height: .2rem;
			
			.createdTime {
				font-size: .12rem;
			}
			
			.channelTypeName {
				position: relative;
				width: .18rem;
				height: .18rem;
				border-radius: 50%;
				line-height: .16rem;
				text-align: center;
				margin-left: .1rem;
				background: #cccccc;
				color: #3E5164;
				
				&.green {
					color: #039F7B;
					background: rgba(36, 180, 147, 0.12);
				}
				
				&.red {
					background: rgba(233, 80, 49, .8);
				}
			}
		}
		
		.solution {
			display: flex;
			flex-wrap: wrap;
			margin-bottom: .1rem;
			
			.solution-item {
				margin-right: .2rem;
				margin-top: .1rem;
				
				&.green {
					color: rgba(36, 180, 147, 0.52);
				}
				
				&.red {
					color: rgba(233, 80, 49, .8);
				}
			}
		}
		
		.tags {
			display: flex;
			flex-wrap: wrap;
			margin-bottom: .1rem;
			max-width: 2.84rem;
			
			.primary {
				max-width: .75rem;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				margin-right: .03rem;
				color: #094EA1;
				border: 1px solid rgba(24, 31, 67, 0.12);
				border-radius: .03rem;
			}
			
			.primary1 {
				max-width: .75rem;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				margin-right: .03rem;
				color: #a14b09;
				border: 1px solid rgba(95, 52, 37, 0.12);
				border-radius: .03rem;
			}
		}
	}
	
	.bottom {
		width: 100%;
		//border-top: 1px solid #cccccc;
		
		.one {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: .4rem;
			
			div {
				width: 33%;
				height: 100%;
				line-height: .4rem;
				text-align: center;
				border-right: 1px solid #CCC;
				
				&:last-child {
					border: 0;
				}
			}
		}
		
		.tow {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: .4rem;
			
			div {
				width: 49%;
				height: 100%;
				line-height: .4rem;
				text-align: center;
				border-right: 1px solid #CCC;
				
				&:last-child {
					border: 0;
				}
			}
		}
		
		.collision {
			display: flex;
			justify-content: space-between;
			align-items: center;
			height: .36rem;
			padding-left: .18rem;
			padding-right: .18rem;
			
			button {
				//margin-left: .1rem;
				//padding: 0 .2rem;
			}
			
			//div{
			//  text-align: center;
			//  width: 49%;
			//  margin: 0 .1rem;
			//  border: 1px solid #107C41;
			//  padding: .04rem;
			//  border-radius: .05rem;
			//}
		}
	}
}

.remark-wrap {
	display: flex;
	color: #888;
	align-items: center;
	
	.iconfont {
		flex: 0 0 20px;
	}
	
	.txt {
		flex: 0 1 auto;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		
		&:hover {
			color: #2d8cf0;
			text-decoration: underline;
		}
	}
}
</style>

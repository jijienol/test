<script setup>
import {computed, getCurrentInstance, nextTick, onMounted, ref, watch} from 'vue';
import {noteStore} from '@/store/modules/note.js';
import $Message from '@/utils/message.js';
import {swdtStore} from '../../store/modules/swdt.js';
import {Button, Modal} from 'view-ui-plus';
import {exitCase} from '../../api/ajJs.js';
import {deleteObject, deletePeople} from 'src/api/ControlBK.js'
import {ajListStore} from 'src/store/modules/ajList.js'

const ajList = ajListStore()

const caseId = computed(() => ajList.caseInfo.id)
const swdt = swdtStore()
const note = noteStore()
const {proxy} = getCurrentInstance()

watch(() => note.signType, (New) => {
	console.log(New)
	note.getSignInfo(New)
}, {
	immediate: true
})

onMounted(() => {
	nextTick(() => {
		note.getSignInfo('people')
	})
})

function update (val) {
	console.log(val)
	const item = val
	note.updateSign(item)
}

function openQrcode (val) {
	// console.log(isQr.value.taskId);
	const data = {
		'channelType': 'offlineBk',
		'name': val.name,
		'phone': val.phone,
		'idCard': val.idcard,
		'objectSourceId': val.objectSourceId
	}
	swdt.openQrcode(val.caseId, [data], 'offlineBk')
}

function confirmOpenQrcode (val) {
	
	Modal.confirm({
		title: '人员布控',
		content: `请确认、补齐布控信息`,
		okText: '下一步',
		cancelText: '取消',
		onOk: () => {
			const item = val
			note.updateSign(item, true)
			// openQrcode(val);
			// nextTick(()=>{
			//   note.getSignInfo('people')
			// })
			
		},
		onCancel: () => {
			$Message.info(`已取消对"${val.name}"进行人员布控`);
		}
	});
}

function del (val,flag) {
	if(flag){
		Modal.confirm({
			title: '标定物',
			content: `请确认是否删除`,
			okText: '确认',
			cancelText: '取消',
			onOk: async () => {
				try {
					const res = await deleteObject({id: val.id})
					const {code, data, message} = res.data
					console.log(code, data, message)
					if (code == 200) {
						proxy.$Message.success('删除成功')
						await note.getSignInfo('people')
						swdt.getTabNums(caseId.value)
						note.signNums.objectCount -= 1
					} else {
						console.log(123)
						proxy.$Message.error(message)
					}
				}
				catch (e) {
					console.log(e)
				}
				
			},
			onCancel: () => {
				$Message.info(`已取消`);
			}
		});
		return
	}
	
	Modal.confirm({
		title: '人员布控删除',
		content: `请确认是否删除`,
		okText: '确认',
		cancelText: '取消',
		onOk: async () => {
			try {
				const res = await deletePeople({id: val.id})
				const {code, data, message} = res.data
				console.log(code, data, message)
				if (code == 200) {
					proxy.$Message.success('删除成功')
					await note.getSignInfo('people')
					swdt.getTabNums(caseId.value)
					note.signNums.peopleCount -= 1
				} else {
					console.log(123)
					proxy.$Message.error(message)
				}
			}
			catch (e) {
				console.log(e)
			}
			
		},
		onCancel: () => {
			$Message.info(`已取消`);
		}
	});
	
}


const peopleNum = computed(() => note.signNums.peopleCount)

const objectNum = computed(() =>  note.signNums.objectCount)

</script>
<script>
export default {
	name: 'sign'
}

</script>
<template>
	<Tabs v-model="note.signType">
		<TabPane :label="'人'+peopleNum" name="people"/>
		<TabPane :label="'物' +objectNum" name="object"/>
	</Tabs>
	<Card class="card-div">
		<div v-show="note.signDataList.length > 0" class="card-list">
			<div v-for="item in note.signDataList" :key="item.id" class="sign-item">
				<div v-if="item.signtype == 'object'" class="object">
					<div class="one">
						<div><span class="name">{{item.name}}</span> <span v-if="item.typeLabel" class="type">{{item.typeLabel}}</span></div>
					</div>
					<div style="display: flex;justify-content: space-between">
						<div>备注：{{item.remark}}</div>
						<div><a @click="update(item)">编辑
						</a>
							<a  style="margin-left: 15px" @click="del(item,true)">删除</a></div>
					</div>
				</div>
				<div v-if="item.signtype == 'people'" class="people">
					<div class="one">
						<div><span class="name">{{item.name}}</span> <span v-if="item.typeLabel" class="type">{{item.typeLabel}}</span></div>
						<div v-if="item.isDeployed"><i class="dian"></i>已布控</div>
						<div v-else><i class="dian1"></i>未布控</div>
					</div>
					<div><span class="title">身份证号：</span>{{item.idcard}}</div>
					<div><span class="title">手机号：</span>{{item.phone}}</div>
					<div style="display: flex;justify-content: space-between">
						<div><span class="title">备注：</span>{{item.remark}}</div>
						<div>
							<a @click="update(item)">编辑</a>
							<a v-if="!item.isDeployed" style="margin-left: 15px" @click="del(item)">删除</a>
						</div>
					</div>
				</div>
			
			
			</div>
		</div>
		<div v-if="note.signDataList.length == 0" style="text-align: center">暂无数据</div>
	</Card>
</template>
<style lang="less" scoped>
.card-div {
	overflow: hidden;
	
	.card-list {
		.sign-item {
			padding: .25rem;
			margin-bottom: .1rem;
			line-height: .32rem;
			background: rgba(24, 31, 67, 0.04);
			color: #181F43;
			font-size: .16rem;
			border-radius: 10px;
			
			.people {
			
			}
			
			.title {
				
				color: rgba(0, 0, 0, 0.3);
			}
			
			.one {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding-bottom: .15rem;
				margin-bottom: .15rem;
				border-bottom: 1px solid #ccc;
			}
			
			.name {
				font-size: 16px;
				font-weight: 600;
				color: rgba(0, 0, 0, 0.8);
				line-height: 22px;
			}
			
			.type {
				padding: 5px 10px;
				background: #D8D8D8;
				border-radius: 4px 4px 4px 4px;
			}
			
			.dian1 {
				display: inline-block;
				width: 8px;
				height: 8px;
				background: #CCC;
				border-radius: 29px 29px 29px 29px;
				opacity: 1;
			}
			
			.dian {
				display: inline-block;
				width: 8px;
				height: 8px;
				background: #2D8CF0;
				border-radius: 29px 29px 29px 29px;
				opacity: 1;
			}
		}
	}
}
</style>

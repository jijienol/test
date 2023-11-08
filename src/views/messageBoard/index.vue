<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {nextTick, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch} from 'vue'

import {create, createContent, del, listContent, listUser, page, pageMyPart} from 'src/api/messageBoard.js'
import {ImagePreview, Message} from 'view-ui-plus'
import {permissionStore} from 'src/store/modules/permission.js'
import {storeToRefs} from 'pinia'
import {globalStore} from 'src/store/modules/global.js'

const permission = permissionStore()
const {token} = storeToRefs(permission)
const global = globalStore()

async function getPage () {
	try {
		const {data} = await page(queryInfo.value)
		if (data.code == 200) {
			dataInfo.value.total = data.data.total
			dataInfo.value.list = data.data.list
			return dataInfo.value.list
		} else {
			Message.error(data.message)
		}
	}
	catch (e) {
		console.log(e)
	}
	
}

async function getpageMyPart () {
	try {
		const {data} = await pageMyPart(queryInfo.value)
		if (data.code == 200) {
			dataInfo.value.total = data.data.total
			dataInfo.value.list = data.data.list
		} else {
			Message.error(data.message)
		}
	}
	catch (e) {
		console.log(e)
	}
	
}


const type = ref(1)
const queryInfo = ref({
	pageNo: 1,
	pageSize: 10,
	keyword: ''
})
const dataInfo = ref({
	total: 0,
	list: []
})

function qh (val) {
	queryInfo.value.pageNo = 1
	if (val == 1) {
		type.value = val
	} else {
		type.value = val
	}
}


const editableDiv = ref()
const usernameVisible = ref(false)
const lyBox = ref(null)

async function f () {
	const imgList = []
	var items = document.querySelectorAll('.img');
	items.forEach(function (item) {
		var src = item.getAttribute('data-src');
		imgList.push(src)
		item.addEventListener('click', function () {
			ImagePreview.show({
				previewList: [src]
			});
		})
	});
	const atlist = []
	var ats = document.querySelectorAll('.at');
	ats.forEach(function (item) {
		var name = item.getAttribute('data-atUsername');
		var id = item.getAttribute('data-atUserId');
		atlist.push({
			atUsername: name,
			atUserId: id
		})
		item.remove(); // 从 DOM 中删除该元素
	});
	const data1 = {
		atList: atlist,
		imgList: imgList,
		content: editableDiv.value.innerText
	}
	
	if (details.value.id) {
		try {
			const {data} = await createContent({leaveWordId: details.value.id, content: JSON.stringify(data1)})
			if (data.code == 200) {
				details.value.list = data.data
				editableDiv.value.innerHTML = ''
				const res = await listContent({id: details.value.id})
				if (res.data.code == 200) {
					details.value.list = res.data.data.map(item => {
						item.content = JSON.parse(item.content)
						return item
					})
				} else {
					Message.error(res.data.message)
				}
			} else {
				Message.error(data.message)
			}
			console.log(details.value.list)
		}
		catch (e) {
			console.log(e)
		}
	} else {
		try {
			const {data} = await create({title: editableDiv.value.innerText})
			if (data.code == 200) {
				userList.value = data.data
				const res = await getPage()
				await goDetails(res[0])
				editableDiv.value.innerText = ''
			} else {
				Message.error(data.message)
			}
		}
		catch (e) {
			console.log(e)
		}
	}
	await nextTick(() => {
		lyBox.value.scrollTop = lyBox.value.scrollHeight;
	})
}


const userList = ref([])

async function getListUser () {
	try {
		const {data} = await listUser()
		if (data.code == 200) {
			userList.value = data.data
		} else {
			Message.error(data.message)
		}
	}
	catch (e) {
		console.log(e)
	}
	
}

watch(() => type.value, (val) => {
	if (val == 1) {
		getPage()
	} else {
		getpageMyPart()
	}
})

onMounted(() => {
	getListUser()
	getPage(queryInfo.value)
})

const mode = ref('default')
const model = ref()
const uploadRef = ref()

function at (val) {
	var editableDiv = document.getElementById('editableDiv');
	editableDiv.innerHTML = editableDiv.innerHTML + `<p style="display: inline-block; color: #1d83ff" class="at" data-atUsername="${val.label}" data-atUserId="${val.value}"> @${val.label}:</p><span>&nbsp</span>`
	model.value = ''
	usernameVisible.value = false
}


const imageUpload = reactive({
	headers: {
		Authorization: token
	},
	action: 'api/leaveWord/upload',
	beforeUpload: (file) => {
	
	},
	uploadSuccess: (response) => {
		console.log(response)
		
		var editableDiv = document.getElementById('editableDiv');
		console.log(global.env.fileUrl + response.data.filePath)
		editableDiv.innerHTML = editableDiv.innerHTML + ` <Image class="img"   data-src="${global.env.fileUrl + response.data.filePath}" src="${global.env.fileUrl + response.data.filePath}" :fit="contain" width="50px" height="50px" :alt="contain" />`
		
		uploadRef.value.clearFiles()
	},
	fileExceededSize: () => {
		Message.warning('文件大小超出限制！')
	},
	removeFile: () => {
	},
	formatError: () => {
		Message.warning('格式不正确，请上传图片格式文件！')
	},
	uploadError: (response) => {
		// console.log(response);
		Message.error('出现错误')
	}
})

const details = ref({
	id: null,
	list: [],
	title: '',
	username: ''
})

function add () {
	details.value.id = null
	details.value.title = ''
	details.value.username = ''
	details.value.list = []
}

async function goDetails (val) {
	console.log(val)
	details.value.id = val.id
	details.value.title = val.title
	details.value.username = val.username
	details.value.list = []
	try {
		const {data} = await listContent({id: val.id})
		if (data.code == 200) {
			details.value.list = data.data.map(item => {
				item.content = JSON.parse(item.content)
				return item
			})
		} else {
			Message.error(data.message)
		}
	}
	catch (e) {
		console.log(e)
		Message.error(e.data.message)
	}
	await nextTick(() => {
		lyBox.value.scrollTop = lyBox.value.scrollHeight;
	})
}


function query () {
	if (type.value == 1) {
		getPage()
	} else {
		getpageMyPart()
	}
}

async function dele (id) {
	try {
		const {data} = await del({id: id})
		if (data.code == 200) {
			Message.success('删除成功')
			query()
		} else {
			Message.error(data.message)
		}
	}
	catch (e) {
		console.log(e)
		Message.error(e.data.message)
	}
}
</script>

<template>
	<div class="boardBox">
		<Card class="left">
			<div class="top">
				<div class="header">
					<h2>问题留言</h2>
					<div class="add" @click="add">
						<Icon size="24" type="md-add"/>
					</div>
				</div>
				<div style="margin-top: .2rem">
					<Input v-model="queryInfo.keyword" class="inp" placeholder="请输入搜索内容" prefix="ios-search" @keyup.enter="query"/>
				</div>
				<div class="tap">
					<div :class="type==1?'active':''" class="li " @click="qh(1)">全部</div>
					<div :class="type==2?'active':''" class="li" @click="qh(2)">我参与的</div>
				</div>
				<div class="content">
					<div v-for="item in dataInfo.list" class="item" @click="goDetails(item)">
						<div class="itemTop" @click.stop>
							<div style="font-size: 16px"><span v-if="type==2 && !item.isRead" style="display: inline-block;width: 10px;height: 10px;border-radius: 5px;background: red"></span> {{item.username}}</div>
							<div>{{item.createTime}}
								<Poptip
									confirm
									title="此操作将删除选中项，是否继续?"
									@on-ok="dele(item.id)">
									<Icon v-if="item.username === permission.userInfo.username" size="20" type="md-trash"/>
								</Poptip>
							
							</div>
						</div>
						<div class="title"> {{item.title}}</div>
					</div>
				</div>
			</div>
			<div class="bottom">
				<Page v-model.pageNo="queryInfo.pageNo" :total="dataInfo.total" @on-change="query"/>
			</div>
		</Card>
		<Card class="right">
			<div class="rightBox">
				<div v-if="details.id" class="top">
					<div style="height: .75rem;border-bottom: 1px solid rgba(0,0,0,0.1);display: flex;justify-content: space-between;align-items: center;padding: 0 .4rem">
						<div style="font-size: .28rem;font-weight:500;color: rgba(0,0,0,0.8);">{{details.title}}</div>
						<div style="color: #c3c6ca">提问人：<span style="color: #222222">{{details.username}}</span></div>
					</div>
					
					<div ref="lyBox" class="lyBox">
						<div v-for="item in details.list" :class="item.username === permission.userInfo.username?'right-aligned':'left-aligned'" class="lyItem">
							<div>
								<span style="font-weight: 400;color: rgba(0,0,0,0.8);font-size: 16px;margin-right:  .15rem">{{item.username}}</span>
								<span style="font-size:14px;color: rgba(0,0,0,0.4);">{{item.createTime}}</span>
							</div>
							<div class="contentBox">
								<p style="text-align: left"><span v-for="at in item.content.atList " style="color: #57a3f3">@{{at.atUsername}}</span> {{item.content.content}}</p>
								<p>
									<template v-for="(url, index) in item.content.imgList" :key="url">
										<Image :initial-index="index" :preview-list="item.content.imgList" :src="url" fit="contain" height="80px" preview width="120px"/>
									</template>
								</p>
							</div>
						</div>
					
					</div>
				</div>
				<div v-else class="top">
					<div ref="lyBox" style="font-size: .8rem;text-align: center;margin-top: 35vh;color: #E2E2EA;font-weight: 700;">
						请输入你的问题
					</div>
				</div>
				<div class="bottom">
					<div v-if="details.id" style="padding:.2rem .1rem;height: .85rem; font-size: 28px; display: flex;align-items: center">
						<Upload ref="uploadRef"
						        :action="imageUpload.action"
						        :before-upload="imageUpload.beforeUpload"
						        :format="['jpg','jpeg','png']"
						        :headers="imageUpload.headers"
						        :max-size="50000"
						        :on-error="imageUpload.uploadError"
						        :on-exceeded-size="imageUpload.fileExceededSize"
						        :on-format-error="imageUpload.formatError"
						        :on-remove="imageUpload.removeFile"
						        :on-success="imageUpload.uploadSuccess"
						        multiple
						        style="margin-right: .2rem"
						>
							<Icon type="md-images"/>
						</Upload>
						<Icon type="md-at" @click="usernameVisible = true"/>
					</div>
					<div v-else style=" width:1rem;padding:.2rem .1rem;height: .85rem; font-size: 28px; display: flex;align-items: center">
					
					</div>
					<div id="editableDiv" ref="editableDiv" contenteditable="true" style="width: 80%;overflow: auto; background: #F6F6F8;border-radius: 8px 8px 8px 8px;">
					</div>
					<div style="width: 8%">
						<Button style=" position: absolute;  bottom: .4rem;right: .25rem" type="primary" @click="f">发送</Button>
					</div>
				</div>
			</div>
		
		</Card>
	</div>
	<Modal
		v-model="usernameVisible"
		footer-hide
		title="请选择@的对象"
	>
		<Select v-model="model" clearable filterable @on-select="at">
			<Option v-for="item in userList" :key="item.id" :value="item.id">{{item.username}}</Option>
		</Select>
	</Modal>
</template>
<style lang='less' scoped>
.left-aligned {
	text-align: left;
}

.right-aligned {
	text-align: right;
	
}

.lyBox {
	padding: .5rem;
	height: 73vh;
	overflow: hidden;
	
	&:hover {
		overflow: auto;
	}
}

.lyItem {
	padding: .1rem;
	margin: .1rem;
	
}

.contentBox {
	display: inline-block;
	padding: .2rem;
	background: #F6F6F8;
	border-radius: 10px 10px 10px 10px;
	max-width: 85%;
	overflow: hidden;
}

.contentBox:hover {
	overflow: auto;
}

:deep(.ivu-input ) {
	width: 100%;
	height: .5rem;
	border: 0;
	background: #F6F6F8;
	border-radius: 6px 6px 6px 6px;
	opacity: 1;
	font-size: .2rem;
	padding-left: .52rem;
	
	&:focus {
		border: none; /* 清除边框样式 */
		outline: none; /* 清除轮廓样式 */
	}
}

:deep(.ivu-input-prefix i, .ivu-input-suffix i) {
	font-size: 32px;
	line-height: .5rem;
	color: #808695;
	margin-left: .2rem;
}

.boardBox {
	padding: .2rem;
	height: 100vh;
	
	display: flex;
	justify-content: space-between;
	
	.left {
		width: 25vw;
		margin-right: .2rem;
		height: 100%;
		
		:deep(.ivu-card-body) {
			display: flex;
			height: 100%;
			flex-direction: column;
			justify-content: space-between;
			
			padding: 0;
			
			.top {
				padding: .2rem;
				overflow: hidden;
				
				&:hover {
					overflow: auto;
				}
				
				.content {
					
					.item {
						padding: .2rem;
						background: #F6F6F8;
						border-radius: 10px 10px 10px 10px;
						margin-bottom: .21rem;
						font-size: 14px;
						
						.title {
							font-weight: 400;
							color: rgba(0, 0, 0, 0.8);
							line-height: 16px;
						}
						
						.itemTop {
							display: flex;
							justify-content: space-between;
							color: rgba(0, 0, 0, 0.4);
							margin-bottom: .2rem;
						}
					}
				}
				
				.tap {
					display: flex;
					margin: .2rem 0;
					
					.li {
						padding: .1rem .1rem .1rem .1rem;
						font-size: 16px;
						line-height: 19px;
						color: rgba(0, 0, 0, 0.4);
						font-weight: 400;
						margin-right: .1rem;
					}
					
					.active {
						border-bottom: 3px solid #57a3f3;
						color: #222222;
						
					}
				}
				
				.header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					
					.add {
						width: .3rem;
						height: .3rem;
						background: #F6F6F8;
						text-align: center;
						line-height: .35rem;
						cursor: pointer;
					}
				}
				
				
			}
			
			.bottom {
				display: flex;
				align-items: center;
				justify-content: center;
				height: .8rem;
				border-radius: 0px 0px 10px 10px;
				opacity: 1;
				border-top: 1px solid rgba(0, 0, 0, 0.1);
				
			}
		}
		
		
	}
	
	.right {
		box-sizing: border-box;
		width: 68vw;
		
		:deep(.ivu-card-body) {
			padding: 0;
		}
		
		.rightBox {
			display: flex;
			justify-content: space-between;
			flex-direction: column;
			height: 95vh;
			width: 100%;
			
			.top {
				width: 100%;
				min-height: 60vh;
			}
			
			.bottom {
				display: flex;
				justify-content: space-between;
				width: 100%;
				height: 15vh;
				background: #FFFFFF;
				box-shadow: 0px -6px 20px 0px rgba(0, 0, 0, 0.08);
				opacity: 1;
				border-top: 1px solid rgba(0, 0, 0, 0.1);
				box-sizing: border-box;
				padding: .15rem;
			}
		}
	}
}
</style>

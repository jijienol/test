<script>
export default {
	name: 'Layout1'
}
</script>
<script setup>
import {ref, computed, onMounted, getCurrentInstance, reactive} from 'vue';
import {permissionStore} from '@/store/modules/permission.js';
import routes from '@/router/routes.js';
import axios from 'axios';
import {getMenuByRouter} from '../../utils/menu.js';
import {useRouter} from 'vue-router';
import {globalStore} from '@/store/modules/global.js';

const global = globalStore()
import appDownload from '@/components/app_download.vue'
import {findNewMessage, saveReadVersionLog} from '../../api/ajJs.js';
import {messageList} from '@/api/login.js'
import aes from '@/libs/aes.js'
// import {changeIconTitle} from "../../main.js";
const router = useRouter()
const {proxy} = getCurrentInstance()
const permission = permissionStore()
// 菜单展开状态
const isCollapsed = ref(false)
const side1 = ref()
const collapsedSider = () => {
	side1.value.toggleCollapse()
}
const menudata = ref([])
const menuitemClasses = computed(() => {
	return [
		'menu-item',
		isCollapsed.value ? 'collapsed-menu' : ''
	]
})
const suer = permission.userInfo

function logout () {
	permission.logout()
}

const routerName = ref('ajList')

//更新日志
const NewLog = ref(false)

function read () {
	saveReadVersionLog(permission.NewMessage.id)
	permission.NewMessage = null
	NewLog.value = false
}

onMounted(async () => {
	const res = await findNewMessage()
	if (res.data.code == 200) {
		permission.NewMessage = res.data.data
	}
	if (permission.NewMessage) {
		NewLog.value = true
	}
	axios
		.request({
			url: 'a/sys/menu/getgroupbyuser',
			method: 'post'
		})
		.then((res) => {
			
			if (res.data.code === 999) {
				proxy.$Message.info('token过期，请重新登录')
				logout()
			} else {
				res.data.data.some(item => {
					if (item.hidden == '0') {
						// console.log(item)
						go({name: item.code})
						return true
					}
				})
				
				menudata.value = []
				var data2 = []
				data2 = res.data.data
				// console.log(res.data.data)
				for (var i = 0; i < data2.length; i++) {
					var me = {
						icon: '',
						title: ''
					}
					me.icon = data2[i].icon
					me.title = data2[i].name
					data2[i].meta = me
					data2[i].name = data2[i].code
					data2[i].path = data2[i].url
					for (var j = 0; j < data2[i].children.length; j++) {
						var met = {
							icon: '',
							title: '',
							buttenCodeList: []
						}
						met.icon = data2[i].children[j].icon
						met.title = data2[i].children[j].name
						met.buttenCodeList = data2[i].children[j].buttonCodeList
						data2[i].children[j].meta = met
						data2[i].children[j].name = data2[i].children[j].code
						data2[i].children[j].path = data2[i].children[j].url
					}
				}
				menudata.value = data2
				
				for (var x = menudata.value.length - 1; x >= 0; x--) {
					var have = false
					for (var z = 0; z < routers.length; z++) {
						if (routers[z].name === menudata.value[x].name) {
							let node = routers[z]
							// console.log(node);
							let menu = menudata.value[x]
							// console.log(menu.children);
							for (var a = menu.children.length - 1; a >= 0; a--) {
								var have1 = false
								for (var b = 0; b < node.children.length; b++) {
									if (menu.children[a].name === node.children[b].name) {
										if (menu.children[a].buttonCodeList) {
											// console.info('button:' + JSON.stringify(menu.children[a].buttonCodeList));
											node.children[b].meta.buttonCodeList = menu.children[a].buttonCodeList
											// console.info('node:' + JSON.stringify(node.children[b].meta));
										}
										have1 = true
										break
									}
								}
								if (!have1) {
									menudata.value[x].children.splice(a, 1)
								}
							}
							have = true
							break
						}
					}
					if (!have) {
						menudata.value.splice(x, 1)
					}
				}
				for (var c = menudata.value.length - 1; c >= 0; c--) {
					if (menudata.value[c].children.length === 0) {
						menudata.value.splice(c, 1)
					}
				}
				console.log(menudata.value, 123)
			}
			
			
		})
		.catch((res) => {
		})
	//浏览器logo
	// console.log(suer.logo)
	// changeIconTitle(suer.logo)
	const message = await messageList({page: 1, pageSize: 100, status: 0})
	if (message.data.code == 200) {
		permission.messageList = message.data.data.list
		permission.messageListTotal = message.data.data.total
	}
})

routerName.value = 'ajList'
const menuList = computed(() => {
	const access = ['admin']
	const res = getMenuByRouter(menudata.value, access)
	return res.filter(item => {
		return routes.some(i => i.name == item.name)
	})
})

const flag = ref(false)

function go (v) {
	if (v.name == 'setting') {
		flag.value = !flag.value
	} else {
		routerName.value = v.name
		router.push('/' + v.name)
	}
}

function showChildren (item) {
	if (item.name == 'setting') {
		return item.children && (item.children.length >= 1 || (item.meta && item.meta.showAlways))
	} else {
		return item.children && (item.children.length > 1 || (item.meta && item.meta.showAlways))
	}
}

const appRef = ref(null);
const appModule = reactive({
	largeQr () {
		appModule.visible = true
	},
	src: '',
	visible: false,
	
})

function toSwdt (info) {
	
	
	let origin = window.location.origin
	let param = aes.encrypt(JSON.stringify({caseId: info.caseId}))
	
	window.open(origin + '/detect?param=' + param, '_blank')
	
}

</script>
<template>
	<div class="layout">
		<Layout style="height: 100vh;overflow: auto">
			<Sider ref="side1" v-model="isCollapsed" :collapsed-width="78" collapsible hide-trigger width="268">
				<div :class="isCollapsed?'layout-sider-title1':'layout-sider-title'" class="flex-top">
					<div v-if="suer.logo" style="height: 60px">
						<!--            <img :src="suer.logo" alt="" width="32" height="32">-->
					</div>
					<div v-else>
						<img alt="" height="32" src='@/assets/images/jh.png' width="32">
						<span>玄武二号</span>
						<div v-if="!isCollapsed">
							<appDownload v-if="!permission.networkType" ref="appRef" style="position: absolute;right: 20px;top: 20px;" @click="appModule.largeQr"></appDownload>
						</div>
					</div>
				
				
				</div>
				<div v-for="(item,index) in menuList" :key="'p-'+ index">
					<div :class="menuitemClasses" :style="{background:routerName==item.name?'#1D83FF':''}" @click="go(item)">
						<Icon :type="item.icon"></Icon>
						<span>{{item.meta.title}}</span>
						<Icon v-if="showChildren(item) & !isCollapsed" :type="flag? 'ios-arrow-down':'ios-arrow-up'" class="right"/>
					</div>
					<div v-if="flag">
						<div v-if="showChildren(item)">
							<div v-for="(i,index) in item.children" :key="'c-'+index">
								<div :class="menuitemClasses" :style="{background:routerName==i.name?'#1D83FF':''}" class="item"
								     @click="go(i)">
									<Icon :type="i.icon"></Icon>
									<span>{{i.meta.title}}</span>
								</div>
							
							</div>
							<div style="height: 300px;width: 20px"></div>
						</div>
					</div>
				</div>
				<div :class="isCollapsed?'layout-sider-bottom1':'layout-sider-bottom'" class="sider-bottom">
					<div class="admin">
						<Poptip placement="top-start" word-wrap>
							<Badge v-if="permission.messageList.length > 0" :count="permission.messageListTotal">
								<img src="@/assets/images/jh.png"/>
							</Badge>
							<img v-else src="@/assets/images/jh.png"/>
							<template #content>
								<div class="api">
									<div v-for="item in permission.messageList" :title="item.name" class="item" @click="toSwdt(item)">
										<div style="border-bottom: 1px solid #ccc;display: flex;justify-content: space-between">
											<p>
												<span style="display: inline-block;width: 10px;height: 10px;border-radius: 5px;background: red"></span>{{item.title}}
											</p>
											<p>{{item.createdTime}}</p>
										</div>
										<div>{{item.name}}</div>
									</div>
								</div>
							</template>
						</Poptip>
						
						<Dropdown>
							<span>{{suer.username}}</span>
							<Icon type="md-arrow-dropup"/>
							<template #list>
								<DropdownMenu>
									<DropdownItem @click="logout()">退出登录</DropdownItem>
								</DropdownMenu>
							</template>
						</Dropdown>
					</div>
					<div class="flag" @click="collapsedSider">
						<Icon type="ios-apps"/>
					</div>
				</div>
			</Sider>
			<Layout>
				<Content>
					<router-view/>
				</Content>
			</Layout>
		</Layout>
	</div>
	<Modal v-model="appModule.visible">
		<template #header>
			<p style="text-align:center">
				请用手机浏览器扫码下载APK
			</p>
		</template>
		<!-- 判断是否是长宁用户   -->
		<!--    <appDownload ref="appRef" v-if="permission.isCnfj && !permission.networkType" :width="400" height="400"></appDownload>-->
		<appDownload v-if="!permission.networkType" ref="appRef" :width="400" height="400"></appDownload>
		<template #footer>
			<Button size="large" @click="appModule.visible = false">关闭</Button>
		</template>
	</Modal>
	<Modal v-model="NewLog" :closable="false" :mask-closable="false" footer-hide title="更新日志" width="80">
		<div v-if="permission.NewMessage" style="overflow-y: scroll">
			<div style="width: 4rem">发布时间：{{permission.NewMessage.updatedTime}}</div>
			<div style="font-size: 30px">版本号：{{permission.NewMessage.version}}</div>
			<div class="log-con" v-html="permission.NewMessage.description"></div>
		</div>
		<div style="text-align: right;margin: .1rem">
			<Button type="primary" @click="read">确定</Button>
		</div>
	</Modal>
</template>

<style lang="less" scoped>
.api {
	background: #fff;
	border-radius: 10px;
	width: 400px;
	height: 600px;
	padding: 10px;
	
	.item {
		color: #222222;
		padding: 10px;
		margin-bottom: 10px;
		width: 380px;
		height: 100px !important;
		border-radius: 10px;
		background: #f6f6f8;
		overflow: hidden;
		display: -webkit-box;
		//white-space: nowrap;
		-webkit-line-clamp: 2;
		/* 设置或检索伸缩盒对象的子元素的排列方式 */
		-webkit-box-orient: vertical;
		text-overflow: ellipsis;
	}
}

.layout-con {
	height: 100%;
	width: 100%;
}

.menu-item {
	background: #0d263f;
	font-size: .14rem;
	height: .48rem;
	line-height: .48rem;
	border-radius: .05rem;
	padding-left: .05rem;
	margin-bottom: .1rem;
	display: flex;
	align-items: center;
	
	&:hover {
		background: #5e6576;
	}
	
	span {
		color: #FFFFFF;
		//display: inline-block;
		//overflow: hidden;
		flex: 1;
		//width: 89px;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition: width .2s ease .2s;
	}
	
	i {
		
		flex: 0 0 20px;
		color: #FFFFFF;
		transform: translateX(0px);
		transition: font-size .2s ease, transform .2s ease;
		font-size: 16px;
		margin-right: .2rem;
	}
}

.item {
	height: .38rem !important;
	line-height: .28rem !important;
}

.collapsed-menu {
	margin-top: .5rem;
	position: relative;
	left: -10px;
	
	span {
		display: none;
	}
	
	i {
		font-size: .32rem;
	}
}

.dev-run-preview .dev-run-preview-edit {
	display: none
}

.ivu-layout-sider {
	background: #0d263f;
	padding: .1rem .52rem 0 .24rem;
	overflow: hidden;
	
	&:hover {
		overflow: auto;
	}
	
	.layout-sider-title {
		display: flex;
		font-size: .22rem;
		color: #FFFFFF;
		padding: .2rem 0 .25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.17);
		margin-bottom: .05rem;
		
		img {
			margin-right: .16rem;
		}
	}
	
	.layout-sider-title1 {
		img {
			margin-right: .16rem;
		}
		
		span {
			display: none;
		}
	}
	
	.sider-bottom {
		height: .75rem;
		z-index: 10;
		background-color: #0D263F;
	}
	
	.layout-sider-bottom {
		display: flex;
		justify-content: space-between;
		//height: .75rem;
		width: 2.68rem;
		position: fixed;
		bottom: 0;
		left: 0;
		border-top: 1px solid rgba(255, 255, 255, 0.17);
		
		
		.admin {
			position: relative;
			display: flex;
			align-items: center;
			color: #ccc;
			padding-left: .24rem;
			
			img {
				border-radius: 50%;
				width: .32rem;
				height: .32rem;
				margin-right: .1rem;
			}
		}
		
		
		.flag {
			width: .47rem;
			height: .75rem;
			border-left: 1px solid rgba(255, 255, 255, 0.17);
			color: #FFFFFF;
			font-size: .32rem;
			text-align: center;
			line-height: .75rem;
		}
		
		:deep(.ivu-layout-sider-children) {
			height: 78vh;
			display: flex;
			flex-direction: column;
			overflow-y: auto;
			
			&::-webkit-scrollbar {
				display: none;
			}
			
			.flex-top {
				flex: 0 0 80px;
			}
		}
	}
	
	.layout-sider-bottom1 {
		display: flex;
		justify-content: space-between;
		//height: .75rem;
		//width: 2.68rem;
		position: fixed;
		bottom: 0;
		left: 0;
		border-top: 1px solid rgba(255, 255, 255, 0.17);
		
		.admin {
			display: none;
		}
		
		.flag {
			height: .75rem;
			width: .78rem;
			color: #FFFFFF;
			font-size: .4rem;
			text-align: center;
			line-height: .75rem;
		}
	}
}

</style>

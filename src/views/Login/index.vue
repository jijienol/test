<script setup>
import {getCurrentInstance, onMounted, reactive, ref} from 'vue';
import aes from '@/libs/aes.js';
import {accessByToken, login, loginByToken, networkEnv} from '@/api/login.js';
import {permissionStore} from '@/store/modules/permission.js';
import {useRouter} from 'vue-router';
import {getUrlData} from '@/utils/parseUrl.js'
import {login4a} from 'src/api/login.js'
import {JSEncrypt} from 'jsencrypt'

const {proxy} = getCurrentInstance()
const submitLoading = ref(false)
const formRef = ref(null)
const form = reactive({
	userName: '',
	password: ''
})
const rules = ref({
	userName: [{required: true, message: '账号不能为空', trigger: 'blur'}],
	password: [{required: true, message: '密码不能为空', trigger: 'blur'}]
})
const permission = permissionStore()
// console.log(permission);
const router = useRouter()
const isVisible = ref(false)
// 登录提交帐号密码
const handleSubmit = (formRef) => {
	formRef.validate((valid) => {
		if (valid) {
			submitLoading.value = true
			function getRSApass (password) {
				let jse = new JSEncrypt()
				//公钥
				var publicString = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhSX5Y0GTc6OvTpOQ/Km4Lpx/CsgIGb+bTxpKUxz0d90xO5DkqfWLQhVZPMt26opTyUr0Q9SA1S9mUuTZnE7g/Re0CKC6Mwjk7Okldx08Glwjx21HKtTkXRB+V1b486sxAgY0Rs8O5rYVc5bhbANJk0JVLpwb4H/V/zTM/XVK3c6HbotwNci2VrUviR2DZEdJTpGutmbLpn57w5yNHaHqvj4pI+pj38wtJyulsFPnUjYxGRuSaVBT2M3W9KE9WcQWhk5lqck1dVg5KLeFRJkDOd/MdCYBIJboGT8bJdW+GPRvk67be1LHmIHJojgLPnFpAVw0qZYLUx1P3Su/kh+erQIDAQAB'
				jse.setPublicKey(publicString)
				// 加密内容
				let encrypted = jse.encrypt(password)
				return encrypted
			}
			
			let pw = getRSApass(form.password)
			let userName = getRSApass(form.userName)
			const data = {
				username: userName,
				password: pw,
				appFlag: ''
			}
			login(data).then(res => {
				let {code, data} = res.data;
				if (code == 200) {
					permission.setUserPermission(data)
					judgeNetwork()
					proxy.$Message.success('登录成功')
					router.push('/aj');
				} else {
					submitLoading.value = false
					proxy.$Message.error(data.message)
				}
			}).catch(err => {
				submitLoading.value = false
				proxy.$Message.error(err.data.message)
			})
		}
	})
}

const loginNoPwd = () => {
	let str = window.location.search // 跳转方式一
	console.log(str)
	if (str != null && str.length > 1) { // 其它页面跳转过来自动登录
		let _urlData = getUrlData(str)
		if (_urlData.data != null && _urlData.data.length > 1) {
			console.log('_urlData.data');
			let pathData = aes.decryptBase64(_urlData.data)
			let pathObject = eval('(' + JSON.parse(pathData) + ')')
			
			if (pathObject.token) {
				loginByToken({token: pathObject.token, type: pathObject.type}).then(res => {
					if (res.data.code === 200) {
						console.log(res.data);
						judgeNetwork()
						permission.setUserPermission(res.data.data)
						proxy.$Message.success('登录成功')
						router.push('/aj');
					} else {
						proxy.$Message.error(res.data.message)
					}
				}).catch(err => {
					console.log(err);
					proxy.$Message.error(err.data.message)
					isVisible.value = true
				})
			}
		} else if (_urlData.token != null && _urlData.token.length > 1) {
			accessByToken({token: _urlData.token}).then(res => {
				if (res.data.code === 200) {
					judgeNetwork()
					permission.setUserPermission(res.data.data)
					proxy.$Message.success('登录成功')
					router.push('/aj');
				} else {
					proxy.$Message.error(res.data.message)
				}
			}).catch(err => {
				console.log(err);
				proxy.$Message.error(err.data.message)
				isVisible.value = true
			})
		}
	} else {
		return true
	}
}

function judgeNetwork () {
	networkEnv().then(res => {
		let flag
		if (res.data.data === '1') {
			flag = 1
		} else {
			flag = 0
		}
		permission.setNetwork(flag)
	})
}
// 长宁4A
function AAAA () {
	window.location.replace('http://38.59.176.74:27080/sso/login?service=http%3A%2F%2F38.96.58.51%3A6888%2Flogin');
}

let hostname = ref('')

onMounted(() => {
	hostname.value = window.location.hostname
	permission.removeToken()
	localStorage.clear()
	// true时为正常登录
	const queryString = window.location.search ? getUrlData(window.location.search) : null
	console.log(hostname.value, queryString)
	
	if (hostname.value == '38.96.58.51' && queryString) {
		const params = {ticket: queryString.ticket}
		login4a(params).then(res => {
			let {code, data} = res.data;
			if (code == 200) {
				permission.setUserPermission(data)
				judgeNetwork()
				proxy.$Message.success('登录成功')
				router.push('/aj');
			} else {
				submitLoading.value = false
				proxy.$Message.error(data.message)
			}
		}).catch(err => {
			submitLoading.value = false
			proxy.$Message.error(err.data.message)
		})
	}
	isVisible.value = loginNoPwd()
})
</script>
<template>
	<Layout v-if="isVisible" class="layout">
		<div class="form-container">
			<div class="title">
				<img alt="" src="@/assets/images/login-logo.png">
				<br>
				<p class="txt">智能侦查系统</p>
			</div>
			<Form ref="formRef" :model="form" :rules="rules" @keydown.enter.native="handleSubmit(formRef)">
				<FormItem prop="userName">
					<Input v-model.trim="form.userName" placeholder="请输入用户名">
						<template #prepend>
							<Icon :size="24" color="#588df6" type="ios-person"/>
						</template>
					</Input>
				</FormItem>
				<FormItem prop="password">
					<Input v-model.trim="form.password" password placeholder="请输入密码" type="password">
						<template #prepend>
							<Icon :size="22" color="#588df6" type="md-lock"/>
						</template>
					</Input>
				</FormItem>
				<FormItem>
					<Button :loading="submitLoading" class="btn" type="primary" @click="handleSubmit(formRef)">登录</Button>
					<Button v-if="hostname.value == '38.96.58.51'" :loading="submitLoading" class="btn" type="primary" @click="AAAA()">4A登录</Button>
				</FormItem>
			</Form>
		</div>
	</Layout>
	<div v-else class="demo-spin-container">
		<Spin :show="!isVisible" fix></Spin>
	</div>
</template>
<style lang="less" scoped>
.demo-spin-container {
	height: 100%;
	
}

.ivu-spin-fix {
	background-color: rgba(211, 211, 211, 0.35);
}

.layout {
	position: relative;
	height: 100%;
	background-image: url('@/assets/images/loginbg.jpg');
	background-size: cover;
	display: flex;
	align-items: center;
	justify-content: center;
}

.form-container {
	flex: 0 0 25%;
	margin-left: 40%;
	min-width: 200px;
	width: 25%;
	padding: 30px 30px 20px;
	background-color: #fff;
	border-radius: 10px;
	box-shadow: 1px 1px 10px 1px rgba(0, 0, 0, 0.25),-1px -1px 10px 1px rgba(0, 0, 0, 0.25);
	
	.title {
		text-align: center;
		margin-bottom: 10px;
		
		.txt {
			color: #588df6;
			font-size: 30px;
			font-weight: 700;
			letter-spacing: 5px;
		}
	}
	
	.btn {
		height: 46px;
		width: 100%;
		margin-bottom: 20px;
	}
}

:deep(.ivu-input-group .ivu-input) {
	height: 46px;
}

.ivu-form-item-content {
	margin-bottom: 10px;
}
</style>

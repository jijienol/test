<script setup="">
import {ref, reactive, computed, watch} from 'vue';
import {permissionStore} from '@/store/modules/permission.js';
import $Message from '@/utils/message.js';
import {insertplAttachment} from '@/api/details.js'

const emit = defineEmits(['finish', 'remove', 'close'])
const permission = permissionStore()
const props = defineProps({
	param: {
		taskChannelId: '',
		caseId: '',
		channelSolutionExtendId: '',
		traceId: '',
		detectType: '',
		drawProofId: ''
	},
	visible: false
})
watch(() => props.visible, (n) => {
	taskChannelId.value = ''
})
const percent = ref(0)
const fileUploading = ref(false)
const fileInfo = reactive({
	uid: '',
	name: '',
	url: '',
	// type:'letterReturnFile',
	size: '',
	subType: '1',
	ext: ''
})
const taskChannelId = ref('')
const uploadRef = ref(null)
const uploadModule = reactive({
	content: computed(() => {
		return uploadModule.format.join(',')
	}),
	param: {
		file: '',
		
		type: 'letterReturnFile',
		caseId: '',
		taskChannelId: '',
		detectType: '',//'offlineDetect',
		channelSolutionExtendId: '',
		traceId: '',
		drawProofId: ''
	},
	fileList: [],
	headers: {
		Authorization: permission.token
	},
	action: '/api/iiTask/batchUploadFile',
	format: ['xls', 'xlsx'],
	beforeUpload: (file) => {
		console.log(file);
		// file.status = 0;
		uploadModule.fileList.push(file)
		// 读取文件名
		// fileUploading.value = true
		// 格式化参数
		uploadModule.param.caseId = props.param.caseId
		uploadModule.param.taskChannelId = taskChannelId.value || props.param.taskChannelId
		// uploadModule.param.file = file
		uploadModule.param.traceId = props.param.traceId
		uploadModule.param.channelSolutionExtendId = props.param.channelSolutionExtendId || ''
		uploadModule.param.detectType = props.param.detectType
		uploadModule.param.drawProofId = props.param.drawProofId || ''
		return false
	},
	uploadSuccess: (response, file, fileList) => {
		
		if (response.code == '200') {
			
			if (!taskChannelId.value) {
				taskChannelId.value = response.data
			}
			/*fileInfo.uid = file.uid
			 fileInfo.name = response.data.fileName
			 fileInfo.size = file.size
			 fileInfo.ext = response.data.ext
			 fileInfo.url = response.data.filePath
			 fileInfo.subType = '1'*/
			// $Message.success(file.name+'已上传，请标记要参与碰撞的数据！')
			fileUploading.value = false
			emit('finish', response.data)
			// uploadRef.value.clearFiles()
		} else {
			$Message.error(response.message)
			fileUploading.value = false
		}
	},
	fileExceededSize: (file, fileList) => {
		$Message.warning('文件大小超出限制')
		fileUploading.value = false
	},
	formatError: () => {
		let f = uploadModule.content
		$Message.warning('格式不正确，请上传' + f + '文件！')
	},
	removeFile: (file) => {
		$Message.info('已移除文件' + file.name)
		for (let k in fileInfo) {
			fileInfo[k] = ''
		}
		emit('remove', fileInfo)
	},
	uploadError: (response) => {
		console.log(response);
		$Message.error('出现错误')
		fileUploading.value = false
	},
	uploadProgress: (event, file, fileList) => {
		percent.value = Math.floor(file.percentage);
		if (file.percentage == 100) {
			fileUploading.value = false;
			$Message.success(file.percentage)
		}
	}
	
})

defineExpose({})

function remove (i) {
	uploadModule.fileList.splice(i, 1)
}

function close () {
	uploadModule.fileList = []
	emit('close', '')
}

function upload () {
	if (uploadModule.fileList.length == 0) {
		$Message.info('未选择任何文件')
		return false
	}
	uploadModule.param.channelSolutionExtendId = props.param.channelSolutionExtendId
	
	fileUploading.value = true
	// console.log(uploadModule.param);
	const formData = new FormData();
	for (let k in uploadModule.param) {
		formData.append(k, uploadModule.param[k]);
	}
	uploadModule.fileList.forEach((f, index) => {
		// formData.append('file', f)
		formData.append('fileList', f);
	})
	// formData.append('fileList', uploadModule.fileList)
	// console.log(formData);
	insertplAttachment(formData).then(res => {
		// console.log(res);
		let {code, data} = res.data;
		if (code == 200) {
			
			if (!taskChannelId.value) {
				taskChannelId.value = data.taskChannelId
				emit('finish', data.taskChannelId)
			} else {
				emit('finish', '')
			}
			if (data.errorList.length) {
				let str = data.errorList[0]
				
				$Message.warning('文件' + str.message + '上传失败')
				uploadModule.fileList.map((f, i, arr) => {
					if (data.errorList.includes(f.name)) {
						f.status = 2
					} else {
						arr.splice(i, 1)
					}
				})
				
			} else {
				$Message.success('上传成功！')
				uploadModule.fileList = []
			}
			
			fileUploading.value = false
		} else {
			$Message.error('出现错误')
			fileUploading.value = false
		}
	}).catch(err => {
		console.log(err);
		$Message.error('上传出现错误，请检查网络后重试或联系管理员')
		fileUploading.value = false
	})
}
</script>
<template>
	<Upload ref="uploadRef"
	        :action="uploadModule.action"
	        :before-upload="uploadModule.beforeUpload"
	        :data="uploadModule.param"
	        :format="uploadModule.format"
	        :headers="uploadModule.headers"
	        :max-size="2000000"
	        :multiple="true"
	        :on-error="uploadModule.uploadError"
	        :on-exceeded-size="uploadModule.fileExceededSize"
	        :on-format-error="uploadModule.formatError"
	        :on-progress="uploadModule.uploadProgress"
	        :on-remove="uploadModule.removeFile"
	        :on-success="uploadModule.uploadSuccess"
	        :show-upload-list="false"
	        type="drag"
	>
		<div style="padding: 20px 0;font-size: 16px;">
			<i class="iconfont icon-excel"></i>
			<p>点击或拖拽上传{{uploadModule.content}}文件</p>
			<Spin :show="fileUploading" fix>正在上传...</Spin>
		</div>
	</Upload>
	<ul class="file-ul">
		<li v-for="(f, i) in uploadModule.fileList" :key="i" :class="[f.status == 1 ? 'success':'',f.status == 2 ?'error':'']"><span class="file-name">{{f.name}}</span>
			<Icon v-show="f.status!=1" class="del-icon" size="24" type="ios-close" @click="remove(i)"/>
		</li>
	</ul>
	
	<div class="btn-group">
		<Button :loading="fileUploading" type="primary" @click="upload">上传</Button>&nbsp;&nbsp;
		<Button :loading="fileUploading" @click="close">关闭</Button>
	</div>
</template>
<style lang="less" scoped>
.iconfont {
	font-size: 30px;
	color: #107C41;
}

.file-ul {
	li {
		display: flex;
		justify-content: space-between;
		height: 32px;
		line-height: 32px;
		padding: 0 10px;
		list-style: none;
		background-color: rgba(232, 234, 236, 0.65);
		border: 1px solid #e8eaec;
		margin: 2px 0;
		-webkit-border-radius: 2px;
		-moz-border-radius: 2px;
		border-radius: 2px;
		align-items: center;
		
		&.success {
			background-color: rgba(25, 190, 107, 0.5);
			border-color: rgba(25, 190, 107, 0.65);
			display: none;
		}
		
		&.error {
			background-color: rgba(237, 64, 20, 0.5);
			border-color: rgba(237, 64, 20, 0.65);
		}
		
		.del-icon {
			padding: 10px 10px;
			
			&:hover {
				color: #2d8cf0;
			}
		}
	}
}

.btn-group {
	margin-top: 5px;
	text-align: right;
}

/*:deep(.ivu-upload-list-file .ivu-progress) {
  display: none!important;
}*/
</style>

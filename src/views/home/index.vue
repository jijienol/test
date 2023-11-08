<script setup="">
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {dictStore} from "../../store/modules/dictionary.js";
import {getUser, officeList, saveUser} from "../../api/user.js";
import {selectOfficeList} from "../../api/dict.js";
import {permissionStore} from "../../store/modules/permission.js";
import {storeToRefs} from "pinia";
import {globalStore} from "../../store/modules/global.js";
const global = globalStore()
const permission = permissionStore()
const {token} = storeToRefs(permission)
const dict = dictStore()
const {proxy} =getCurrentInstance()
const form = ref({
  id: '',
  no: '',
  loginName: '',
  username: '',
  password: '',
  passwordCheck: '',
  mobile: '',
  email: '',
  remark: '',
  sexual: '',
  dob: '',
  officeId: '',
  job: '',
  jobDate: '',
  education: '',
  college: '',
  subject: '',
  address: '',
  userNumberFrontUrl:'',
  userNumberBackUrl:''
})

const validateMobileUp = (rule, value, callback) => {
  const reg = /^\d{11}$/
  if (value === '' || value === undefined || value === null) {
    callback(new Error('手机号不能为空'))
  } else {
    if ((!reg.test(value)) && value !== '') {
      callback(new Error('请输入正确的手机号码'))
    } else {
      callback()
    }
  }
}
const validatePassUp = (rule, value, callback) => {
  if (value === '') {
    callback()
  } else {
    var reg = /^\d{6,}$/
    var regEn = /[`~&()<>"{}\/;'[\]]/im
    var regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im
    if (regEn.test(value) || regCn.test(value)) {
      callback(new Error('不能包含特殊字符!'))
    }
    // 可用 test 方法验证
    if (!reg.test(value)) {
      callback(new Error('密码为至少6位的数字'))
    }
    // 对第二个密码框单独验证
    formRef.value.validateField('passwordCheck')
    callback()
  }
}
const validatePassCheckUp = (rule, value, callback) => {
  if (value === '' || value === undefined) {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}
const ruleInline2 = {
  loginName: [
    { required: true, message: '登录名不能为空', trigger: 'blur' }
  ],
  mobile: [
    { required: true, validator: validateMobileUp, trigger: 'blur' }
  ],
  username: [
    { required: true, message: '姓名不能为空', trigger: 'blur' }
  ],
  no: [
    { required: true, message: '工号不能为空', trigger: 'blur' }
  ],
  officeId: [
    { required: true, message: '部门不能为空', trigger: 'blur' }
  ],
  passwordCheck: [
    { validator: validatePassCheckUp, trigger: 'blur' }
  ],
  password: [
    { validator: validatePassUp, trigger: 'change' }
  ]
}
// 加载列表

function getTableData () {
  getUser().then((res) => {
    if (res.data.code === 200) {
      const v = res.data.data
      
      form.value = {
        id: v.id,
        no: v.no,
        loginName: v.loginName,
        username: v.username,
        // password: v.password,
        // passwordCheck: '',
        mobile: v.mobile,
        email: v.email,
        remark: v.remark,
        sexual: v.sexual,
        dob: v.dob,
        officeId: v.officeId,
	      officeSn:v.officeSn,
        job: v.job,
        jobDate: v.jobDate,
        education: v.education,
        college: v.college,
        subject: v.subject,
        address: v.address,
        usernumber:v.usernumber,
        userNumberFrontUrl:v.userNumberFrontUrl,
        userNumberBackUrl:v.userNumberBackUrl
      }
      form.value.oldLoginName = form.value.loginName
      form.value.password = ''
    } else {
      proxy.$Message.info(res.data.message)
    }
  }).catch((err) => {
    console.log(err)
  })
}
function getDobUp (time) {
  form.dob = time
}
function getJobDateUp (time) {
  form.jobDate = time
}
const sysDictList = reactive(dict.dict.sexual.list)
const sysOfficeList = ref([])
function getOfficeList () {
	selectOfficeList()
		.then((res) => {
			if (res.data.code === 200) {
				res.data.data.forEach(node=>{
					let arr = []
					
					if(node.children){
						node.children.forEach(item=>{
							sysOfficeList.value.push({
								value: item.sn,
								title: item.label
							})
						})
					}
					sysOfficeList.value.push({
						value: node.sn,
						title: node.label,
						// children:arr
					})
				})
			}
		})
}

// 保存
const formRef = ref()
const loadingSave =ref(false)
function updateSave () {
  formRef.value.validate((valid) => {
    if (valid) {
      loadingSave.value = true
      saveUser(form.value).then((res) => {
        if (res.data.code === 200) {
          proxy.$Message.info('修改成功')
          loadingSave.value = false
         getTableData()
        } else {
              loadingSave.value = false
              proxy.$Message.info(res.data.message)
        }
      })
    }
  })
}
const fileUploading = ref(false)
const fileUploading1 = ref(false)
const uploadRef = ref(null)
const upload1Ref = ref(null)
const imageUpload = reactive({
  url: '',
  param: {
    type: 'policeOfficerCertificate',
    userNumberType: 1, //新增参数  正面1   背面0
    userId: '',
    usernumber: ''
  },
  headers: {
    Authorization: token
  },
  action: '/api/file/uploadFile',
  beforeUpload: (file) => {
    fileUploading.value = true
    imageUpload.param.userId = '' || form.value.id
    imageUpload.param.usernumber = form.value.usernumber
  },
  uploadSuccess: (response) => {
    fileUploading.value = false
    // console.log(response.data.filePath);
    form.value.userNumberFrontUrl = response.data.filePath;
    uploadRef.value.clearFiles()
    // imageUpload.url =  response.data.filePath;
    // imageUpload.url = response
    /*ext:"png"
fileName:"20230420194319.png"
filePath:"/policeOfficerCertificate/2023-04-20/null_1.png"
reportName:"20230420194319"*/
  
  },
  fileExceededSize: () => {
    proxy.$Message.warning('文件大小超出限制！')
    fileUploading.value = false
  },
  removeFile: () => {
    imageUpload.param.name = ''
    imageUpload.param.file = ''
    imageUpload.param.size = ''
  },
  formatError: () => {
    fileUploading.value = false
    proxy.$Message.warning('格式不正确，请上传图片格式文件！')
  },
  uploadError: (response) => {
    // console.log(response);
    proxy.$Message.error('出现错误')
    fileUploading.value = false
  }
})

const imageUpload1 = reactive({
  url: '',
  param: {
    type: 'policeOfficerCertificate',
    userNumberType: 0, //新增参数  正面1   背面0
    userId: '',
    usernumber: ''
  },
  headers: {
    Authorization: token
  },
  action: '/api/file/uploadFile',
  beforeUpload: (file) => {
    fileUploading1.value = true
    imageUpload1.param.userId = '' || form.value.id
    imageUpload1.param.usernumber = form.value.usernumber
    
  },
  uploadSuccess: (response) => {
    fileUploading1.value = false
    // console.log(response.data.filePath);
    // imageUpload1.url = response
    // console.log(response.filePath);
    // imageUpload1.url = response.data.filePath
    form.value.userNumberBackUrl = response.data.filePath
    upload1Ref.value.clearFiles()
  },
  fileExceededSize: () => {
    proxy.$Message.warning('文件大小超出限制！')
    fileUploading1.value = false
  },
  removeFile: () => {
    imageUpload1.param.name = ''
    imageUpload1.param.file = ''
    imageUpload1.param.size = ''
  },
  formatError: () => {
    fileUploading1.value = false
    proxy.$Message.warning('格式不正确，请上传图片格式文件！')
  },
  uploadError: (response) => {
    // console.log(response);
    proxy.$Message.error('出现错误')
    fileUploading1.value = false
  }
})

onMounted(()=>{
  getTableData()
  getOfficeList()
})
</script>
<script>
export default {
  name:"home"
}

</script>
<template>
  <Card  style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center">
        <h2 style="margin-right: .2rem">个人中心</h2>
      </div>
    </template>
    <Form :model="form" :label-width="120" ref="formRef" style="width:90%" :rules="ruleInline2">
      <Row>
        <Col span="12">
          <FormItem label="姓名" prop="username">
            <Input v-model="form.username"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="登录名" prop="loginName">
            <Input v-model="form.loginName"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="密码">
            <Input type="password" v-model="form.password" placeholder="若不修改密码，请留空。"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <div v-show="form.password">
            <FormItem label="确认密码" prop="">
              <Input type="password" v-model="form.passwordCheck"></Input>
            </FormItem>
          </div>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="手机" prop="mobile">
            <Input v-model="form.mobile"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="工号" prop="no">
            <Input v-model="form.no"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="性别" prop="sexual">
            <Select v-model="form.sexual" style="width:100%" >
              <Option v-for="item in sysDictList" :value="item.value" :key="item.label">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="出生日期" prop="dob">
            <DatePicker type="date" :value="form.dob" placeholder="请选择出生日期" format="yyyy-MM-dd" style="width: 100%" @on-change="getDobUp"></DatePicker>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="部门名称" prop="officeSn">
            <Select v-model="form.officeSn" style="width:100%" >
              <Option v-for="item in sysOfficeList" :value="item.value" :key="item.value">{{ item.title }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="职务职称" prop="job">
            <Input v-model="form.job"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="从事本岗位日期" prop="jobDate">
            <DatePicker type="date" :value="form.jobDate" placeholder="请选择从事本岗位日期" format="yyyy-MM-dd" style="width: 100%" @on-change="getJobDateUp"></DatePicker>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="文化程度" prop="education">
            <Input v-model="form.education"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="毕业院校" prop="college">
            <Input v-model="form.college"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="专业" prop="subject">
            <Input v-model="form.subject"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="家庭住址" prop="address">
            <Input v-model="form.address"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="邮箱" prop="email">
            <Input v-model="form.email"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="24">
          <FormItem label="备注" prop="remark">
            <Input v-model="form.remark" type="textarea"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col :span="8">
          <!--          <Image  :src="item.url" fit="cover" width="100%" height="100%" />-->
          <Upload type="drag"
                  :multiple="false"
                  ref="uploadRef"
                  :format="['jpg','jpeg','png']"
                  :max-size="50000"
                  :show-upload-list="true"
                  :disabled="fileUploading"
                  :headers="imageUpload.headers"
                  :before-upload="imageUpload.beforeUpload"
                  :on-success="imageUpload.uploadSuccess"
                  :on-error="imageUpload.uploadError"
                  :on-exceeded-size="imageUpload.fileExceededSize"
                  :on-format-error="imageUpload.formatError"
                  :on-remove="imageUpload.removeFile"
                  :action="imageUpload.action"
                  :data="imageUpload.param"
          >
            <div style="padding: 20px;height:80px">
              <!--      <div class="iconfont icon-WORD"></div>-->
          
              <p><span >点击或拖拽上传调证警官证照片1</span>
              
              </p>
              <Spin fix :show="fileUploading"></Spin>
            </div>
          </Upload>
          <div style="width: 100%;height: 300px;background: #cccccc">
            <Image  :src=" global.env.fileUrl + form.userNumberFrontUrl" width="100%" height="100%" />
          </div>
        </Col>
        <Col :span="8">
          <Upload type="drag"
                  :multiple="false"
                  ref="upload1Ref"
                  :format="['jpg','jpeg','png']"
                  :max-size="50000"
                  :show-upload-list="true"
                  :disabled="fileUploading1"
                  :headers="imageUpload1.headers"
                  :before-upload="imageUpload1.beforeUpload"
                  :on-success="imageUpload1.uploadSuccess"
                  :on-error="imageUpload1.uploadError"
                  :on-exceeded-size="imageUpload1.fileExceededSize"
                  :on-format-error="imageUpload1.formatError"
                  :on-remove="imageUpload1.removeFile"
                  :action="imageUpload1.action"
                  :data="imageUpload1.param"
          >
            <div style="padding: 20px;height: 80px;">
              <!--      <div class="iconfont icon-WORD"></div>-->
              <p><span >点击或拖拽上传调证警官证照片2</span>
              </p>
              <Spin fix :show="fileUploading1"></Spin>
            </div>
          </Upload>
          <div style="width: 100%;height: 300px;background: #cccccc">
            <Image  :src=" global.env.fileUrl + form.userNumberBackUrl" width="100%" height="100%" />
          </div>
         
        </Col>
      </Row>
    </Form>
    <div style="text-align: center">
      <Button :loading="loadingSave" style="margin-left: 500px" type="primary" @click="updateSave">保存</Button>
    </div>
  </Card>
 
</template>
<style scoped>

</style>

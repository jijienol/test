<script setup>
import {onMounted, reactive, ref, watch,getCurrentInstance} from "vue";
import {selectOfficeList} from "../../api/dict.js";
import {permissionStore} from "../../store/modules/permission.js";
import {
  deleteUser,
  officeList,
  saveUser,
  selectListByOfficeSn,
  getUserRoleList,
  getRoleList,
  userRoleUpdate, resetPassword, getFzPollice
} from "../../api/user.js";
import {columns1,columnsRecord,columnsRole,ruleInLineRecord} from "./data.js";
import Pagination from "@/components/viewui/pagination.vue";
import {dictStore} from "../../store/modules/dictionary.js";
import {cloneDeep} from "lodash";
import {storeToRefs} from "pinia";
import {globalStore} from "@/store/modules/global.js";
import {syncOffice, syncUser} from 'src/api/office.js'

const dict = dictStore()
const {proxy} = getCurrentInstance()
const permission = permissionStore()
const {token} = storeToRefs(permission)
const global = globalStore()
const queryFromRef = ref()
const validatePassCheck = (rule, value, callback) => {
  if (value === '' || value === undefined) {
    callback(new Error('请再次输入密码'))
  } else if (value !== addForm.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    var reg = /^.{6,}$/
    // 可用 test 方法验证
    if (!reg.test(value)) {
      callback(new Error('密码为至少6个字符'))
    }
    // 对第二个密码框单独验证
    addFormRef.value.validateField('passwordCheck')
    callback()
  }
}
const validateMobile = (rule, value, callback) => {
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
    // this.flag = true
    callback()
  }
}
const validatePassCheckUp = (rule, value, callback) => {
  if (value === '') {
    callback()
  }
  // else if (value !== this.updateForm.password) {
  //   callback(new Error('两次输入密码不一致!'))
  // } else {
  callback()
  // }
}
const ruleInline = {
  loginName: [
    {required: true, message: '登录名不能为空', trigger: 'blur'}
  ],
  username: [
    {required: true, message: '姓名不能为空', trigger: 'blur'}
  ],
  usernumber: [
    {required: true, message: '身份证不能为空', trigger: 'blur'}
  ],
  // no: [
  //   {required: true, message: '工号不能为空', trigger: 'blur'}
  // ],
  officeSn: [
    {required: true, message: '部门不能为空', trigger: 'blur'}
  ],
  password: [
    {required: true, validator: validatePass, trigger: 'change'}
  ],
  passwordCheck: [
    {validator: validatePassCheck, trigger: 'blur'}
  ],
  mobile: [
    {required: true, validator: validateMobile, trigger: 'blur'}
  ]
}
const ruleInline2 = {
  loginName: [
    {required: true, message: '登录名不能为空', trigger: 'blur'}
  ],
  mobile: [
    {required: true, validator: validateMobileUp, trigger: 'blur'}
  ],
  username: [
    {required: true, message: '姓名不能为空', trigger: 'blur'}
  ],
  usernumber: [
    {required: true, message: '身份证不能为空', trigger: 'blur'}
  ],
  /*no: [
    {required: true, message: '工号不能为空', trigger: 'blur'}
  ],*/
  officeSn: [
    {required: true, message: '部门不能为空', trigger: 'blur'}
  ],
  password: [
    {validator: validatePassUp, trigger: 'change'}
  ],
  passwordCheck: [
    {validator: validatePassCheckUp, trigger: 'blur'}
  ]
}
const queryFrom = reactive( {
  officeSn: null,
  loginName: '',
  // no: '',
  username: '',
  mobile: ''
})
let officeArr = ref([])


function getOfficeList () {
  selectOfficeList()
    .then((res) => {
      if (res.data.code === 200) {
        res.data.data.forEach(node=>{
          let arr = []
          
          if(node.children){
            node.children.forEach(item=>{
              officeArr.value.push({
                value: item.sn,
                title: item.label
              })
            })
          }
          officeArr.value.push({
            value: node.sn,
            title: node.label,
            // children:arr
          })
        })
      }
    })
}
const pageOpt = reactive({
  pageNo:1,
  pageSize:10,
  total:0
})
const tableData = ref([])
// 加载列表
function getTableData () {
  let data = {
    officeSn: queryFrom.officeSn,
    // no: queryFrom.no,
    loginName: queryFrom.loginName,
    username: queryFrom.username,
    mobile: queryFrom.mobile,
    pageNo: pageOpt.pageNo,
    pageSize: pageOpt.pageSize,
    Authorization:permission.token
  }
  selectListByOfficeSn(data).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info('token过期，请重新登录')
    } else {
      tableData.value = res.data.data.list
      pageOpt.total = res.data.data.total
    }
  })
}
// 条件搜索
function handleSearch () {
  pageOpt.pageNo = 1
  getTableData()
}
// 重置搜索条件
function resetForm () {
  queryFrom.officeSn = null
  queryFromRef.value.resetFields()
  pageOpt.pageNo = 1
  getTableData()
}

const addTitle = ref('')//添加
const modal1 = ref(false)
const loading1 = ref(true)
const loadingSave = ref(false)
const addFormRef = ref()
function add(){
  modal1.value = true
  addForm.value = defaultform.value
  addTitle.value = '用户添加'
  
}
let addForm = ref({
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
  officeSn: null,
  job: '',
  jobDate: '',
  education: '',
  college: '',
  subject: '',
  address: '',
  usernumber: '',
  Authorization: '',
  userNumberFrontUrl: '',
  userNumberBackUrl: '',
  auxiliaryUserId: ''
})
const defaultform = ref( {
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
  officeSn: '',
  job: '',
  jobDate: '',
  education: '',
  college: '',
  subject: '',
  address: '',
  usernumber: ''
})
function cancel(){
  addFormRef.value.resetFields()
  modal1.value = false
}
function getDob (time) {
  addForm.value.dob = time
}
function getJobDate (time) {
  addForm.value.jobDate = time
}
// 新增用户
function save(){
  addFormRef.value.validate((valid) => {
    if (valid) {
      loadingSave.value = true
      if(addTitle.value == '用户添加') {
    
      }else {
        addForm.value.password = ''
      }
      const params = Object.assign({}, addForm.value)
      params.userNumberFrontUrl = imageUpload.url || params.userNumberFrontUrl
      params.userNumberBackUrl = imageUpload1.url ||params.userNumberBackUrl
      // params.auxiliaryUserId = fzPoliceSelect.value
      // console.log(params);
      // return false
      saveUser(params).then((res) => {
          if (res.data.code === 200) {
            addForm.value = Object.assign({}, defaultform.value)
            addFormRef.value.resetFields()
            modal1.value = false
            loadingSave.value = false
            proxy.$Message.success(addTitle.value == '用户添加'?'添加成功':'修改成功')
            getTableData()
          } else {
            proxy.$Message.error(res.data.message)
            loadingSave.value = false
          }
        }).catch(e=>{
          proxy.$Message.error(e.data.message)
          loadingSave.value = false
  
        })
      
        
    }
  })
}
onMounted(()=>{
  if(sysDictList.length <1){
    dict.getDict('sexual')
  }
})
const sysDictList = reactive(dict.dict.sexual.list)

// 修改
function update(index){
  // const uploadRef = ref(null)
  // const upload1Ref = ref(null)
  // uploadRef.value.resetFiles()
  addForm.value = Object.assign({}, {
    id: tableData.value[index].id,
    oldLoginName: tableData.value[index].loginName,
    loginName: tableData.value[index].loginName,
    // password: tableData.value[index].password,
    mobile: tableData.value[index].mobile,
    username: tableData.value[index].username,
    email: tableData.value[index].email,
    sexual: tableData.value[index].sexual,
    dob: tableData.value[index].dob,
    job: tableData.value[index].job,
    jobDate: tableData.value[index].jobDate,
    education: tableData.value[index].education,
    college: tableData.value[index].college,
    subject: tableData.value[index].subject,
    officeSn: tableData.value[index].officeSn,
    address: tableData.value[index].address,
    usernumber: tableData.value[index].usernumber,
    remark: tableData.value[index].remark,
    no: tableData.value[index].no,
    userNumberFrontUrl: tableData.value[index].userNumberFrontUrl,
    userNumberBackUrl: tableData.value[index].userNumberBackUrl,
    auxiliaryUserId: tableData.value[index].auxiliaryUserId
  })
  modal1.value = true
  addTitle.value = '用户修改'
}
// 部门表联查部门字段
let sysOfficeList = reactive([])
function findSysOfficeList () {
  let params = {
    Authorization: token
  }
  officeList(params).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info('token过期，请重新登陆')
      permission.logout(res.data)
    } else {
      sysOfficeList = res.data.data.list
    }
  })
}
//删除
function remove (index) {
  let params = {
    id: tableData.value[index].id,
    Authorization: token
  }
  deleteUser(params).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info('token过期，请重新登录')
      permission.logout(res.data)
    } else {
      proxy.$Message.success('删除成功')
      getTableData()
    }
  })
}
//分配角色
const userRoleList = ref([])
const saveGroupList =ref([])
const userId = ref()
const roleUp = ref(false)
const formItemRoleRef =ref()
function roleassign (id) {
  loadUserRoleList(id)
  userId.value = id
  pageRole.pageNo = 1
  roleUp.value = true
}
const formItemRole =reactive({
    name: ''}
)
const pageRole = reactive({
  pageNo:1,
  pageSize:10,
  total:0
})
watch(()=>pageRole.pageNo,()=>{
  console.log(pageRole.pageNo)
})
const loadingRole =ref(false)
const roleList = ref([])
function  loadroleList () {
  let para = {
    name: formItemRole.name,
    Authorization: token,
    pageNo: pageRole.pageNo,
    pageSize: pageRole.pageSize
  }
  loadingRole.value = true
  getRoleList(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info('token过期，请重新登录')
      permission.logout(res.data)
    } else {
      roleList.value = res.data.data.list
      pageRole.total = res.data.data.total
      for (var i in roleList.value) {
        if (roleList.value.hasOwnProperty(i)) {
          var element = roleList.value[i]
          if (saveGroupList.value.indexOf(element.id) > -1) {
            element._checked = true
          }
        }
      }
      loadingRole.value = false
    }
  }).catch((err) => {
    proxy.$Message.error(err)
    loadingRole.value = false
  })
}
function loadUserRoleList (id) {
  let para = {
    userId: id
  }
  getUserRoleList(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info('token过期，请重新登录')
      permission.logout(res.data)
    } else {
      saveGroupList.value =  userRoleList.value = res.data.data
      loadroleList()
    }
  }).catch((err) => {
    console.log(err)
  })
}

function  cancelrole () {
  pageRole.pageNo = 1
  saveGroupList.value = []
  userRoleList.value = []
  roleUp.value = false

}
// 条件搜索
function handleSearchRole () {
  pageRole.pageNo = 1
  loadroleList()
}
function resetFormRole(){
  formItemRoleRef.value.resetFields()
  pageRole.pageNo = 1
  loadroleList()
}
function  changeSaveGroupList (selection) {
  for (var i = 0; i < roleList.value.length; i++) {
    let flag = false
    for (var j = 0; j < selection.length; j++) {
      if (roleList.value[i].id === selection[j].id) {
        flag = true
        if (saveGroupList.value.indexOf(selection[j].id) === -1) {
          saveGroupList.value.push(selection[j].id)
        }
      }
    }
    if (!flag) {
      if (saveGroupList.value.indexOf(roleList.value[i].id) > -1) {
        saveGroupList.value.splice(saveGroupList.value.indexOf(roleList.value[i].id), 1)
      }
    }
  }
}
const loadingSaveAdd = ref(false)
function  Submitrole () {
  deleteUserRoles(userId.value)
  loadingSaveAdd.value = true
}
function deleteUserRoles(id){
  let roleids = cloneDeep(JSON.stringify(saveGroupList.value))
  let para = {
    userId: id,
    roleids
  }
  userRoleUpdate(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info('token过期，请重新登录')
      permission.logout(res.data)
    } else if (res.data.code === 206) {
      proxy.$Message.info( res.data.message)
      loadingSaveAdd.value = false
    } else {
      // this.updateRole()
      proxy.$Message.success('保存成功')
      roleUp.value = false
      cancelrole()
      getTableData()
      loadingSaveAdd.value = false
    }
  }).catch((err) => {
    console.log(err)
  })
}
//重置密码
function resetPsd (id) {
  let params = {
    id:id
  }
  resetPassword(params).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info('token过期，请重新登录')
      permission.logout(res.data)
    } else {
      proxy.$Message.info('重置成功')
      getTableData()
    }
  }).catch((err) => {
    proxy.$Message.error(err)
  })
}
onMounted(()=>{
  getTableData()
  getOfficeList()
  findSysOfficeList()
})
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
    imageUpload.param.userId = '' || addForm.value.id
    imageUpload.param.usernumber = addForm.value.usernumber
  },
  uploadSuccess: (response) => {
    fileUploading.value = false
    // console.log(response.data.filePath);
    addForm.value.userNumberFrontUrl = response.data.filePath;
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
    imageUpload1.param.userId = '' || addForm.value.id
    imageUpload1.param.usernumber = addForm.value.usernumber

  },
  uploadSuccess: (response) => {
    fileUploading1.value = false
    // console.log(response.data.filePath);
    // imageUpload1.url = response
    // console.log(response.filePath);
    // imageUpload1.url = response.data.filePath
    addForm.value.userNumberBackUrl = response.data.filePath
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

const fzPolliceList = ref([])
const fzPoliceSelect = ref('')
if(fzPolliceList.value.length < 1) {
  getFzPollice().then(res => {
    let {code, data} = res.data;
    if(code == 200) {
      fzPolliceList.value = data
    }

  })
}

async function tb (row) {
	const {data} = await syncUser({userId: row})
	if (data.code == 200) {
		proxy.$Message.success('同步成功')
	}else {
		proxy.$Message.error(data.message)
	}
}
</script>

<template>
  <Card style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center;justify-content: space-between">
        <h2 style="margin-right: .2rem">用户管理
        </h2>
      </div>
    </template>
<!--    查询-->
    <Form :model="queryFrom" ref="queryFromRef">
      <Row :gutter="30">
        <Col span="4">
          <FormItem prop="username">
            <Input v-model="queryFrom.username" placeholder="请输入姓名"></Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem prop="loginName">
            <Input v-model="queryFrom.loginName" placeholder="请输入登录名"></Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem prop="mobile">
            <Input v-model="queryFrom.mobile" placeholder="请输入手机号"></Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem prop="officeSn">
<!--            <TreeSelect v-model="queryFrom.officeSn" :data="officeArr" placeholder="请选择部门" />-->
            <Select v-model="queryFrom.officeSn" filterable clearable>
              <Option v-for="item in officeArr" :value="item.value" :key="item.value" :label="item.title">{{ item.title }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="8">
          <Button type="primary" style="margin-left: 8px" icon="ios-search" @click="handleSearch">查询</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="resetForm">重置</Button>
          <Button style="margin-left: 10px" type="primary" icon="md-add" @click="add">添加用户</Button>
        </Col>
      </Row>
    </Form>
    <!-- 列表信息 -->
    <div style="border: 1px solid #cccccc">
      <Table  :columns="columns1" :data="tableData">
        <template #操作="{ row, index }" >
          <Button type="primary" size="small" style="margin-right: 5px" @click="update(index)">修改</Button>
          <Poptip
            confirm
            title="此操作将删除选中项，是否继续?"
            @on-ok="remove(index)">
            <Button type="error" size="small" style="margin-right: 5px">删除</Button>
          </Poptip>
          
<!--          <Button type="success" size="small" style="margin-right: 5px" @click="openRecord(index)">档案</Button>-->
          <Button type="warning" size="small" style="margin-right: 5px" @click="roleassign(row.id)">角色分配</Button>
          <Poptip
            confirm
            title="确定重置密码?"
            @on-ok="resetPsd(row.id)">
            <Button type="primary" size="small" ghost>重置密码</Button>
          </Poptip>
	        <Button type="primary" size="small" style="margin-left: 5px" @click="tb(row.id)">同步</Button>
        </template>
      </Table>
     
    </div>
  </Card>
  <Footer style="position: absolute;bottom: .2rem">
    <pagination v-model:pageSize="pageOpt.pageSize" :total="pageOpt.total" v-model:pageNo="pageOpt.pageNo" :render="getTableData" show-elevator show-total />
  </Footer>
  <!-- 添加 -->
  <Modal footer-hide v-model="modal1" :title="addTitle" :loading="loading1" @on-cancel="cancel" width="1000px">
    <Form :model="addForm" :label-width="100" ref="addFormRef" :rules="addTitle==='用户添加'?ruleInline:ruleInline2">
      <Row>
        <Col span="12">
          <FormItem label="登录名" prop="loginName">
            <Input v-model="addForm.loginName"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="姓名" prop="username">
            <Input v-model="addForm.username"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row v-if="addTitle==='用户添加'">
        <Col span="12">
          <FormItem label="密码" prop="password">
            <Input type="password" v-model="addForm.password"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="确认密码" prop="passwordCheck">
            <Input type="password" v-model="addForm.passwordCheck"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="身份证号" prop="usernumber">
            <Input v-model="addForm.usernumber"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="手机" prop="mobile">
            <Input v-model="addForm.mobile"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="工号" prop="no">
            <Input v-model="addForm.no"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="性别" prop="sexual">
            <Select v-model="addForm.sexual" style="width: 100%">
              <Option v-for="item in sysDictList" :value="item.value" :key="item.label">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="出生日期" prop="dob">
            <DatePicker
              type="date"
              v-model="addForm.dob"
              placeholder="请选择出生日期"
              format="yyyy-MM-dd"
              style="width: 100%"
              @on-change="getDob"
            ></DatePicker>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="部门名称" prop="officeSn">
            <Select v-model="addForm.officeSn" filterable clearable>
              <Option v-for="item in officeArr" :value="item.value" :key="item.value" :label="item.title">{{ item.title }}</Option>
            </Select>
<!--            <TreeSelect v-model="addForm.officeSn" :data="officeArr" placeholder="请选择部门" />-->
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="职务职称" prop="job">
            <Input v-model="addForm.job"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="从事本岗位日期" prop="jobDate">
            <DatePicker
              type="date"
              v-model="addForm.jobDate"
              placeholder="请选择从事本岗位日期"
              format="yyyy-MM-dd"
              style="width: 100%"
              @on-change="getJobDate"
            ></DatePicker>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="文化程度" prop="education">
            <Input v-model="addForm.education"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="毕业院校" prop="college">
            <Input v-model="addForm.college"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="专业" prop="subject">
            <Input v-model="addForm.subject"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="家庭住址" prop="address">
            <Input v-model="addForm.address"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="邮箱" prop="email">
            <Input v-model="addForm.email"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="备注" prop="remark">
            <Input v-model="addForm.remark" type="textarea"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <FormItem label="辅助民警" prop="auxiliaryUserId">
          <Select v-model="addForm.auxiliaryUserId" style="width: 200px;">
            <Option v-for="(user) in fzPolliceList" :value="user.usernumber" :key="user.id">{{user.username}}</Option>
          </Select>
        </FormItem>


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
            <div style="padding: 20px;height: 200px">
              <!--      <div class="iconfont icon-WORD"></div>-->

              <p><span v-if="!addForm.userNumberFrontUrl">点击或拖拽上传调证警官证照片1</span>
                <Image v-else :src="global.env.fileUrl + addForm.userNumberFrontUrl" fit="cover" width="100%" height="100%" />
              </p>
              <Spin fix :show="fileUploading"></Spin>
            </div>
          </Upload>
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
            <div style="padding: 20px;height: 200px;">
              <!--      <div class="iconfont icon-WORD"></div>-->
              <p><span v-if="!addForm.userNumberBackUrl">点击或拖拽上传调证警官证照片2</span>
                <Image v-else :src=" global.env.fileUrl + addForm.userNumberBackUrl" fit="cover" width="100%" height="100%" />
              </p>
              <Spin fix :show="fileUploading1"></Spin>
            </div>
          </Upload>
        </Col>
      </Row>
    </Form>
    <div style="text-align: right" >
      <Button :loading="loadingSave" type="primary" @click="save">保存</Button>
      <Button style="margin-left: 8px" @click="cancel">取消</Button>
    </div>
  </Modal>
  <Modal v-model="roleUp" title="角色分配" width="800" @on-cancel="cancelrole()" footer-hide>
    <Form :model="formItemRole" ref="formItemRoleRef">
      <Row :gutter="30">
        <Col span="12">
          <FormItem prop="name">
            <Input v-model="formItemRole.name" placeholder="请填写名称"></Input>
          </FormItem>
        </Col>
        <Col span="10">
          <Button type="primary" style="margin-left: 8px" icon="ios-search" @click="handleSearchRole">查询</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="resetFormRole('formItemRole')">重置</Button>
        </Col>
      </Row>
    </Form>
    <Table :loading="loadingRole" :columns="columnsRole" :data="roleList" @on-selection-change="changeSaveGroupList"> </Table>
    <div style="margin-top: 5px">
      <Page :total="pageRole.total" :page-size="pageRole.pageSize"  v-model="pageRole.pageNo" @on-change="loadroleList " show-elevator show-total  />
<!--      <pagination v-model:pageSize="pageRole.pageSize" :total="pageRole.total" v-model:pageNo="pageRole.pageNo" :render="loadroleList" show-elevator show-total />-->
    </div>
    <div style="text-align: right" >
      <Button :loading="loadingSaveAdd" type="primary" @click="Submitrole(saveGroupList)" class="submit">提交</Button>
      <Button style="margin-left: 8px" @click="cancelrole()" class="cancelrole">取消</Button>
    </div>
  </Modal>
</template>
<style scoped lang="less">
.ivu-table-wrapper {
  overflow: visible;
  
  .ivu-table {
    overflow: visible;
  }
}
</style>

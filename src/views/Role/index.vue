<script setup>
import {reactive, ref, getCurrentInstance, onMounted} from "vue";
import {permissionStore} from "@/store/modules/permission.js";
import Pagination from "@/components/viewui/pagination.vue";
import {
  addRoleMenuAndOffice,
  deleteRole,
  insertRole,
  menuList,
  roleList,
  roleMenuList,
  roleOfficeList
} from "@/api/role.js";
import {dictList, selectOfficeList} from "@/api/dict.js";
import {cloneDeep} from "lodash";

const {proxy} = getCurrentInstance()
const permission = permissionStore()
const columns = reactive([
    {
      title: '序号',
      type: 'index',
      minWidth: 150
    },
    {
      title: '名称',
      key: 'name',
      minWidth: 150
    },
    {
      title: '编码',
      key: 'tips',
      minWidth: 150
    },
    {
      title: '操作',
      minWidth: 150,
      slot: '操作'
    }
  ])
const formName = reactive({
  name:""
})

const pageOpt = reactive({
  pageNo:1,
  pageSize:10,
  total:0
})
const tableData = ref([])

function loadrole () {
  let para = {
    name: formName.name,
    pageNo: pageOpt.pageNo,
    pageSize: pageOpt.pageSize
  }
  roleList(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info({ content: 'token过期，请重新登录', duration: 5 })
      permission.logout()
    } else {
      tableData.value = res.data.data.list
      pageOpt.total = res.data.data.total
    }
  }).catch((err) => {
    proxy.$Message.error(err.data.message)
  })
}
// 条件搜索
function handleSearch () {
  pageOpt.pageNo = 1
  loadrole()
}
function resetForm(){
  pageOpt.pageNo = 1
  formName.name = ''
  loadrole()
}
//添加
const addForm = reactive({
  id: '',
  tips: '',
  name: '',
  permission: ''
})
const modal1 = reactive(
  {
    title:'添加角色',
    visible:false,
    loadingup:false
  }
)
function add () {
  addForm.id = ''
  addForm.name = ''
  addForm.tips = ''
  addForm.permission = ''
  
  modal1.title = '添加角色'
  modal1.visible = true
}
const addFormRef = ref()
function Cancel(){
  addFormRef.value.resetFields()
  modal1.visible = false
}

//保存
const loadingSave =ref(false)
function Submit(){
  if (addForm.name === '') {
    proxy.$Message.info({ content: '名称不能为空，请输入', duration: 5 })
    return
  }
  if (addForm.tips === '') {
    proxy.$Message.info({ content: '编码不能为空，请输入', duration: 5 })
    return
  }
  if (addForm.permission === '') {
    proxy.$Message.info({ content: '操作授权不能为空，请输入', duration: 5 })
    return
  }
  loadingSave.value = true
  if (modal1.title === '添加角色') {
    delete addForm.id
  }
  insertRole(addForm).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info({ content: 'token过期，请重新登录', duration: 5 })
      permission.logout()
    } else if (res.data.code === 207) {
      proxy.$Message.info({ content: '名称或编码重复，请修改', duration: 5 })
      loadingSave.value = false
    } else if (res.data.code === 200) {
      proxy.$Message['success']({
        background: true,
        content: '保存成功',
        duration: 5
      })
      addForm.name = ''
      addForm.tips = ''
      addForm.id = ''
      addForm.permission = ''
      modal1.visible = false
      loadingSave.value = false
      loadrole()
    } else {
      proxy.$Message.error(res.data.message)
    }
  }).catch((err) => {
    loadingSave.value = false
    proxy.$Message.error(err.data.message)
  })
}
//修改
function modifyrole (row) {
  modal1.title = '编辑角色'
  modal1.visible = true
  
 addForm.id = row.id
 addForm.name = row.name
 addForm.tips = row.tips
 addForm.permission = row.permission
}
// 字典
const permissionList = ref()
function loadRoleLimitList () {
  let para = {
    type: 'roleLimit'
  }
  dictList(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info('token过期，请重新登录')
      permission.logout()
    } else {
      permissionList.value = res.data.data.list
    }
  }).catch((err) => {
    proxy.$Message.error(err.data.message)
  })
}

//权限管理
const modaljur = ref(false)
const loadingup = ref(false)

let datarela = reactive([])
const appList = ref([])
const dataRoleOffice = ref([])
const datamenu = ref([])
function setChecked (menu) {
  if (menu.children === undefined || menu.children.length === 0) {
    for (var a = 0; a < datarela.length; a++) {
      if (menu.id === datarela[a].menuId) {
        menu.checked = true
        break
      }
    }
  } else if (menu.children.length > 0) {
    for (var i = 0; i < menu.children.length; i++) {
      setChecked(menu.children[i])
    }
  }
}
function loadmenu () {
  let para = {
    Authorization: permission.token
  }
  menuList(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info( 'token过期，请重新登录')
      permission.logout()
    } else {
      datamenu.value = res.data.data
      for (var i = 0; i < datamenu.value.length; i++) {
        setChecked(datamenu.value[i])
      }
      var listapp = cloneDeep(appList.value)
      
      for (var y = 0; y < listapp.length; y++) {
        listapp[y].title = listapp[y].label
        listapp[y].children = []
        for (var z = 0; z < datamenu.value.length; z++) {
          if (listapp[y].label === datamenu.value[z].appFlag) {
            listapp[y].children.push(datamenu.value[z])
          }
        }
      }
      for (var a = 0; a < datamenu.value.length; a++) {
        if (datamenu.value[a].name === '系统管理') {
          listapp.push(datamenu.value[a])
        } else if (datamenu.value[a].name === '首页管理') {
          listapp.push(datamenu.value[a])
        }else {
          listapp.push(datamenu.value[a])
        }
      }
      datamenu.value = listapp
    }
  }).catch((err) => {
    proxy.$Message.error(err.data.message)
  })
  
}
const dataOffice =ref([])
function  setCheckedOffice (office) {
  if (office.children === undefined || office.children.length === 0) {
    for (var a = 0; a < dataRoleOffice.value.length; a++) {
      if (office.id === dataRoleOffice.value[a].officeId) {
        office.checked = true
        break
      }
    }
  } else if (office.children.length > 0) {
    for (var i = 0; i < office.children.length; i++) {
      setCheckedOffice(office.children[i])
    }
  }
}
function  loadOffice () {
  let para = {
    hidden: '0',
    Authorization: permission.token
  }
  selectOfficeList(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info( 'token过期，请重新登录')
      permission.logout()
    } else {
      let dataOffic = res.data.data
      for (var i = 0; i < dataOffic.length; i++) {
        setCheckedOffice(dataOffic[i])
      }
      dataOffice.value = dataOffic
    }
  }).catch((err) => {
    proxy.$Message.error(err.data.message)
  })
}
function loadAppList () {
  let para = {
    type: 'appType'
  }
  dictList(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info( 'token过期，请重新登录')
  
      permission.logout()
    } else {
      appList.value = res.data.data.list
    }
  }).catch((err) => {
    proxy.$Message.error(err.data.message)
  })
}
const roleId = ref('')
const selectedOffice = ref([])
function   jurisdiction (id) {
  console.log(id)
  modaljur.value = true
  roleId.value = id
  loadroleMenu(id)
  loadRoleOffice(id)
}
const selected = ref([])
function  loadroleMenu (roleId) {
  let para = {
    roleId: roleId,
    Authorization: permission.token
  }
  roleMenuList(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info( 'token过期，请重新登录')
  
      permission.logout()
    } else if (res.data.code === 200) {
      datarela = res.data.data
      selected.value = datarela
      loadmenu()
    }
  }).catch((err) => {
    proxy.$Message.error(err.data.message)
  })
}
function  loadRoleOffice (roleId) {
  let para = {
    roleId: roleId
  }
  roleOfficeList(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info( 'token过期，请重新登录')
      permission.logout()
    } else if (res.data.code === 200) {
      selectedOffice.value =dataRoleOffice.value = res.data.data
      loadOffice()
    }
  }).catch((err) => {
    proxy.$Message.error(err.data.message)
  })
}
function deleterole (roleId) {
  let para = {
    id: roleId,
  }
  deleteRole(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info( 'token过期，请重新登录')
      permission.logout()
    } else if (res.data.code === 200) {
      proxy.$Message['success']({
        background: true,
        content: '删除成功',
        duration: 5
      })
    loadrole()
    }
  }).catch((err) => {
    // console.log(err.data.message)
    proxy.$Message.error(err.data.message)
  })
}
function cancelRoleMenuAndOffice () {
  datarela = []
  dataRoleOffice.value = []
  datamenu.value = []
  dataOffice.value = []
  modaljur.value = false
}
const officeTree = ref()
const menuTree = ref()
const loadingRoleMenu =ref(false)
function saveRoleMenuAndOffice(){
  let officeList = officeTree.value.getCheckedAndIndeterminateNodes()
  let officeIdList = []
  for (var i in officeList) {
    if (officeList.hasOwnProperty(i)) {
      officeIdList.push(officeList[i].id)
    }
  }
  let menuList = menuTree.value.getCheckedAndIndeterminateNodes()
  let menuIdList = []
  for (var j in menuList) {
    if (menuList.hasOwnProperty(j)) {
      menuIdList.push(menuList[j].id)
    }
  }
  menuIdList = [...new Set(menuIdList)]
  let para = {
    officeIdList: officeIdList,
    menuIdList: menuIdList,
    roleId: roleId.value
  }
  addRoleMenuAndOffice(para).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info('token过期，请重新登录')
      permission.logout()
    } else if (res.data.code === 200) {
      datarela = []
      dataRoleOffice.value = []
      datamenu.value = []
      dataOffice.value = []
      loadingRoleMenu.value = false
      modaljur.value = false
      proxy.$Message.success('授权成功')
    } else {
      proxy.$Message.error(res.data.message)
      loadingRoleMenu.value = false
    }
  }).catch((err) => {
    proxy.$Message.error(err)
    loadingRoleMenu.value = false
  })
}
onMounted(()=>{
  loadrole()
  loadRoleLimitList()
  loadAppList()
})
</script>
<script>
export default {
  name:"Role"
}

</script>
<template>
  <!-- 查询条件 -->
  <Card  style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center">
        <h2 style="margin-right: .2rem">角色信息管理</h2>
      </div>
    </template>
    <Form :model="formName" ref="formItem">
      <Row :gutter="30">
        <Col span="3">
          <FormItem prop="name">
            <Input v-model="formName.name" placeholder="请填写名称"></Input>
          </FormItem>
        </Col>
        <Col span="10">
          <Button type="primary" style="margin-left: 8px" icon="ios-search" @click="handleSearch">查询</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="resetForm('formItem')">重置</Button>
          <Button   type="primary" style="margin-left: 8px" @click="add" icon="ios-add" >添加</Button>
        </Col>
      </Row>
    </Form>
    <div>
      <Table border :columns="columns" :data="tableData">
        <template #操作="{ row, index }" >
          <Button type="primary" icon="ios-create-outline" size="small" @click="modifyrole(row)" >修改</Button>
          <Poptip
            confirm
            title="此操作将删除选中项，是否继续?"
            @on-ok="deleterole(row.id)">
            <Button type="error" icon="ios-trash" size="small" style="margin-left: 5px" >删除</Button>
          </Poptip>
          <Button type="success" icon="ios-trash" size="small" style="margin-left: 5px" @click="jurisdiction(row.id)" >权限管理</Button>
        </template>
      </Table>
    </div>
  </Card>
  <Footer style="position: absolute;bottom: .2rem">
    <pagination v-model:pageSize="pageOpt.pageSize" :total="pageOpt.total" v-model:pageNo="pageOpt.pageNo" :render="loadrole" show-elevator show-total />
  </Footer>
  <!-- 添加框 -->
  <Modal
    v-model="modal1.visible"
    :title="modal1.title"
    :loading="modal1.loadingup"
    footer-hide
    @on-cancel="Cancel()"
    width="900px"
    class="role"
  >
    <Row :gutter="30">
      <Form
        :model="addForm"
        ref="addFormRef"
        :label-width="80"
        style="margin-top: 10px"
      >
        <Row>
          <Col :span="10">
            <Form-item label="名称" prop="name" style="font-weight: bold">
              <Input v-model="addForm.name" style="width: 100%" size="large"></Input>
            </Form-item>
          </Col>
          <Col :span="10">
            <Form-item label="编码" prop="code" style="font-weight: bold">
              <Input v-model="addForm.tips" style="width: 100%" size="large"></Input>
            </Form-item>
          </Col>
        </Row>
        <Row>
          <Col :span="10">
            <Form-item label="操作授权" prop="permission" style="font-weight: bold">
              <Select v-model="addForm.permission" style="width:100%">
                <Option v-for="item in permissionList" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </Select>
            </Form-item>
          </Col>
        </Row>
      </Form>
    </Row>
    <Row>
      <Button style="margin-right: .1rem" :loading="loadingSave" type="primary" @click="Submit('addform')" class="submit_role">提交</Button>
      <Button @click="Cancel()">取消</Button>
    </Row>
  </Modal>
  <Modal
    v-model="modaljur"
    title="权限管理"
    :loading="loadingup"
    @on-cancel="cancelRoleMenuAndOffice()"
    width="900"
    class="role"
    footer-hide
  >
    <Row>
      <Col span='12'>
        <Tree
          ref="menuTree"
          style="margin-top: 10px"
          :data="datamenu"
          show-checkbox
        ></Tree>
      </Col>
      <Col span='12'>
        <Tree
          ref="officeTree"
          style="margin-top: 10px"
          :data="dataOffice"
          show-checkbox
        ></Tree>
      </Col>
    </Row>
    <div style="text-align: right" >
      <Button :loading="loadingRoleMenu" type="primary" @click="saveRoleMenuAndOffice()">确定</Button>
      <Button style="margin-left: 8px" @click="cancelRoleMenuAndOffice()">取消</Button>
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

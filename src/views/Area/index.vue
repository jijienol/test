x`
<script setup>
import {onMounted, reactive, ref, getCurrentInstance, watchEffect, computed} from "vue";
import {dictStore} from "@/store/modules/dictionary.js";
import {delArea, getAreaList, getAreaTree, saveArea} from "../../api/Area.js";
import Pagination from "../../components/viewui/pagination.vue";
import {selectOfficeList} from "@/api/dict.js";
const { proxy } = getCurrentInstance()
const dict = dictStore()
const  columns1 = [
  {
    title: '区域',
    key: 'name'
  },
  {
    title: '区域类型',
    key: 'typeName'
  },
  {
    title: "创建时间",
    key:'createdTime'
  },
  {
    title: '操作',
    minWidth: 85,
    slot: '操作'
  }
]
const ruleInline = {
  name: [
    { required: true, message: '区域名称不能为空', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '区域编码不能为空', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '区域类型不能为空', trigger: 'blur' }
  ]

}
const  defaultform = {
  id: '',
  name: '',
  type: '',
  sort: '',
  code: '',
  remark: '',
  parentId:''
}
const pageOpt = reactive({
  pageNo:1,
  pageSize:10,
  total:0
})
const queryForm = reactive({
  name:'',
  type:''
})
const queryFormRef = ref()

const tableData = ref([])
// 加载列表
function getTableData () {
  let data = {
    pageNo: pageOpt.pageNo,
    pageSize: pageOpt.pageSize,
    name:queryForm.name,
    type:queryForm.type
  }
  getAreaList(data).then((res) => {
    if (res.data.code === 200) {
      tableData.value = res.data.data.list
      pageOpt.total = res.data.data.total
    } else {
      proxy.$Message.info(res.data.message)
    }
  })
}
// 重置搜索条件
function resetForm (name) {
  queryFormRef.value.resetFields()
  pageOpt.pageNo = 1
  getTableData()
}
function   // 条件搜索
handleSearch () {
  pageOpt.pageNo = 1
  getTableData()
}

//弹框
const modal1 = reactive({
  visible:false,
  title:'',
  loading:false
})
let addform = ref({
  id: '',
  name: '',
  type: '',
  code: '',
  remark: '',
  parentId:''
})
const addFormRef = ref()
function cancel(){
  addFormRef.value.resetFields()
  modal1.visible = false
}
function add(){
  modal1.title = '添加区域'
  modal1.visible = true
}
const loadingSave = ref(false)

function save () {
  addFormRef.value.validate(  async (valid) => {
    if (valid) {
      modal1.loadingSave = true
   try{
     const res = await saveArea(addform.value)
     if (res.data.code === 200) {
       proxy.$Message.success('保存成功')
       addform.value = Object.assign({}, defaultform)
       addFormRef.value.resetFields()
       modal1.visible= false
       loadingSave.value = false
       getTableData()
     } else {
       loadingSave.value = false
       proxy.$Message.info(res.data.message)
     }
   }catch (e){
     proxy.$Message.error(e.data.message)
   }
    
    }
  })
}
function update(row){
  addform.value = {
    sort: row.sort,
    id: row.id,
    name: row.name,
    type: row.type,
    code: row.code,
    parentId: row.parentId,
    remark: row.remark
  }
  modal1.visible = true
  modal1.title = '修改区域'
}
function remove (id) {
  delArea(id).then((res) => {
    if (res.data.code === 999) {
      proxy.$Message.info('token过期，请重新登录')
    } else {
      proxy.$Message.info('删除成功')
      getTableData()
    }
  }).catch((err) => {
    console.log(err)
  })
}
const TreeData =ref([])
async function getTree(){
  try{
    const res = await getAreaTree()
    if (res.data.code === 200) {
      if (res.data) {
        TreeData.value = []
        res.data.data.forEach(node=>{
          let arr = []
          if(node.children){
            node.children.forEach(item=>{
	            TreeData.value.push({
                value: item.id,
                title: item.name
              })
            })
          }
          TreeData.value.push({
            value: node.id,
            title: node.name,
          })
        })
      }}
  }catch (e){
    proxy.$Message.error(e.data)
  }
}
onMounted(()=>{
  dict.getDict('officeType')
  getTableData()
  getTree()
  
})

const cityList = [
  { value:'1',label:'省'},
  {value: '2',label: '市'},
  {value: '3',label: '区（县）'}
]

function treeChangeHandler(val) {

}
</script>
<script>
export default {
  name:"Area"
}

</script>
<template>
  <!-- 查询条件 -->
  <Card  style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center">
        <h2 style="margin-right: .2rem">区域管理</h2>
      </div>
    </template>
    <Form :model="queryForm" ref="queryFormRef">
      <Row :gutter="30">
        <Col span="3">
          <FormItem prop="name">
            <Input v-model="queryForm.name" placeholder="请填写区域名称"></Input>
          </FormItem>
        </Col>
        <Col span="3">
          <FormItem prop="type">
            <Select v-model="queryForm.type" filterable clearable placeholder="请选择区域类型">
              <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="6">
          <Button type="primary" icon="ios-search" @click="handleSearch">查询</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="resetForm()">重置</Button>
          <Button  style="margin-left:10px" type="primary" icon="md-add" @click="add()" >添加区域</Button>
        </Col>
      </Row>
    </Form>
    <!-- 列表信息 -->
    <div style="border: 1px solid #CCC">
      <Table :columns="columns1" :data="tableData">
        <template #操作="{ row, index }">
          <Button type="primary" size="small" style="margin-right: 5px" @click="update(row)" >修改</Button>
          <Poptip
            confirm
            title="此操作将删除选中项，是否继续?"
            @on-ok="remove(row.id)">
            <Button type="error" icon="ios-trash" size="small" style="margin-left: 5px" >删除</Button>
          </Poptip>
        </template>
      </Table>
    </div>
  </Card>
  <Footer style="position: absolute;bottom: .2rem">
    <pagination v-model:pageSize="pageOpt.pageSize" :total="pageOpt.total" v-model:pageNo="pageOpt.pageNo" :render="getTableData" show-elevator show-total />
  </Footer>
  <!-- 部门添加 -->
  <Modal  footer-hide v-model="modal1.visible" :title="modal1.title" :loading="modal1.loading" @on-cancel="cancel()" width="1000">
    <Form :model="addform" :label-width="80" ref="addFormRef" :rules="ruleInline">
      <Row>
        <Col span="24">
          <FormItem label="区域名称" prop="name">
            <Input v-model="addform.name" ></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="24">
          <FormItem label="区域编码" prop="code">
            <Input v-model="addform.code" ></Input>
          </FormItem>
        </Col>
        <Col span="24">
          <FormItem label="区域类型"  prop="type">
            <Select v-model="addform.type" filterable clearable placeholder="请选择区域类型">
              <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="24">
	
	 
          <FormItem label="父区域区域编码" prop="parentId">
	          <Select v-model="addform.parentId" filterable clearable placeholder="请选择区域类型">
		          <Option v-for="item in TreeData" :value="item.value" :key="item.value">{{ item.title }}</Option>
	          </Select>
          </FormItem>
        </Col>
        <Col span="24">
          <FormItem label="备注" prop="remark">
            <Input v-model="addform.remark" type="textarea"></Input>
          </FormItem>
        </Col>
      </Row>
    </Form>
    <div style="text-align: right" >
      <Button :loading="loadingSave" type="primary" @click="save">保存</Button>
      <Button style="margin-left: 8px" @click="cancel">取消</Button>
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

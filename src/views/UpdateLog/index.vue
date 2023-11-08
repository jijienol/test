<script setup="">
import {getVersionList,saveVersion,delVersion} from "@/api/updateLog.js";
import {onMounted, reactive, ref, getCurrentInstance, computed} from "vue";
import {Button, Drawer, Modal} from "view-ui-plus";
import Pagination from "@/components/viewui/pagination.vue";
import WangEditor from "@/components/WangEditor/index.vue";
import {saveReadVersionLog} from '@/api/ajJs.js'
import {permissionStore} from "@/store/modules/permission.js";
const permission = permissionStore()
const {proxy}  = getCurrentInstance()
const isAdmin = computed(() => {
  return permission.userInfo.roleList.includes('admin') ? true : false
})
const columns= [
  {
    title: '标题',
    key: 'title'
  },
  {
    title: '版本号',
    key: 'version'
  },
  {
    title: '创建时间',
    key: 'createdTime'
  },
  {
    title: '状态',
    key: 'readStatus',
    slot: 'status'
  },
  {
    title: '操作',
    slot: 'caozuo'
  }
]
//分页
const pageOpt = reactive({
  total: 0,
  pageNo: 1,
  pageSize: 10
})

// 列表数据
const DataList = ref([])
async function getDataList(){
  let param = {
    version:queryFrom.version,
    title:queryFrom.title,
    pageNo: pageOpt.pageNo,
    pageSize: pageOpt.pageSize,
 
  }
  const res = await getVersionList(param)
  if (res.data.code==200){
    pageOpt.total = res.data.data.total
    DataList.value = res.data.data.list
  }
}

//预览
const previewInfo = reactive(
  {
    visible:false,
    description:''
  })

function preview(row){
  previewInfo.visible = true
  previewInfo.description = row.description
  if(row.readStatus == 0) { // 未读状态调接口
    saveReadVersionLog(row.id).then(res => {
      // console.log(res);
      let {code, data} = res.data;
      row.readStatus = 1
    })
  }

}

const queryFrom = reactive( {
  version: '',
  title: ''
})
// 条件搜索
function handleSearch () {
  pageOpt.pageNo = 1
  getDataList()
}
// 重置搜索条件
function resetForm () {
  queryFrom.version = ''
  queryFrom.title = ''
  pageOpt.pageNo = 1
  getDataList()
}
const addForm = ref({
  title:'',
  version:'',
  description:'<p></p>'
})

const modalOpt = reactive({
  visible:false,
  title:''
})
function update(row){
  // console.log(row)
  modalOpt.visible = true
  modalOpt.title = '修改更新日志'
  addForm.value= {
    title:row.title,
    version:row.version,
    description:row.description,
    id:row.id
  }
}
function add(){
  modalOpt.visible = true
  modalOpt.title = '添加更新日志'
  addForm.value= {
    title:'',
    version:'',
    description:'<p></p>'
  }
}

async function save(){
  if (addForm.value.title.length==0 ||addForm.value.version.length ==0 || addForm.value.description.length==0){
    proxy.$Message.error('必须填写标题、版本号、描述')
    return
  }
  
  
  const res =await saveVersion(addForm.value)
  if(res.data.code == 200){
    modalOpt.visible = false
    proxy.$Message.success('保存成功')
  }
  getDataList()
}
async function remove(row){
  // console.log(row)
  const res = await delVersion(row.id)
  if(res.data.code == 200){
    modalOpt.visible = false
    proxy.$Message.success('删除成功')
  }else {
    proxy.$Message.error(res.data.message)
  }
  getDataList()
}
function changeParagraph(v){
  addForm.value.description = v
}
onMounted(()=>{
  getDataList()
})


</script>
<script>
export default {
  name:"UpdateLog"
}

</script>
<template>
  <Card style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center">
        <h2 style="margin-right: .2rem">更新日志管理</h2>
      </div>
    </template>
    <!--    查询-->
    <Form :model="queryFrom" ref="queryFromRef">
      <Row :gutter="30">
        <Col span="4">
          <FormItem prop="username">
            <Input v-model="queryFrom.title" placeholder="标题"></Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem prop="no">
            <Input v-model="queryFrom.version" placeholder="版本号"></Input>
          </FormItem>
        </Col>
        <Col span="8">
          <Button type="primary" style="margin-left: 8px" icon="ios-search" @click="handleSearch">查询</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="resetForm">重置</Button>
          <Button v-if="isAdmin" style="margin-left: 10px" type="primary" icon="md-add" @click="add">添加</Button>
        </Col>
      </Row>
    </Form>
    <div style="padding: .2rem 0">
      <Table border :columns="columns" :data="DataList">
        <template #status="{row, index}">
          <span class="read-status" :class="{'active': row.readStatus == 1}">{{row.readStatus == 1 ? '已读' : '未读'}}</span>
        </template>
        <template #caozuo="{ row, index }">
          <Button style="margin-right: 5px" @click="preview(row)" >预览</Button>
          <Button v-if="isAdmin" type="primary" style="margin-right: 5px" @click="update(row)">修改</Button>
          <Poptip
            confirm
            title="此操作将删除选中项，是否继续?"
            @on-ok="remove(row)">
            <Button type="error" v-if="isAdmin">删除</Button>
          </Poptip>
        </template>
      </Table>
    </div>
  </Card>
  <Modal v-model="previewInfo.visible"  width="80%"   footer-hide>
    <div class="con" v-html="previewInfo.description">

    </div>
    <div style="text-align: right" >
      <Button @click="previewInfo.visible = false" style="margin-right: .1rem">关闭</Button>
    </div>
  </Modal>
  <Modal v-model="modalOpt.visible" :title="modalOpt.title" width="60%"  footer-hide>
    <Form :model="addForm" :label-width="100">
      <FormItem label="标题 ">
        <Input v-model="addForm.title" ></Input>
      </FormItem>
      <FormItem label="版本号">
        <Input v-model="addForm.version" ></Input>
      </FormItem>
      <FormItem label="描述">
        <WangEditor @changeValue="changeParagraph" :value="addForm.description" :images="true" :type="0"></WangEditor>
      </FormItem>
    </Form>
    <div style="text-align: right" >
      <Button type="primary"  style="margin-right: .1rem" @click="save">保存</Button>
      <Button @click="modalOpt.visible = false" style="margin-right: .1rem">关闭</Button>
    </div>
  </Modal>
  <Footer style="position: absolute;bottom: .2rem">
    <pagination v-model:pageSize="pageOpt.pageSize" :total="pageOpt.total" v-model:pageNo="pageOpt.pageNo" :render="getDataList" show-elevator show-total />
  </Footer>
</template>
<style scoped lang="less">
.ivu-table-wrapper{
  overflow: visible;
  
  .ivu-table{
    overflow: visible;
    
  }
}
.read-status {
  &.active {
    color: #52c41a;
  }
}
  .con {
    :deep(img) {
      width: 100%;
    }
  }


</style>

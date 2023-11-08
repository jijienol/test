<script setup="">
import {deleteCompanyDrawproof, getCompanyDrawproofList, saveCompanyDrawproof} from "@/api/guide.js";
import {onMounted, reactive, ref,getCurrentInstance} from "vue";
import {Button, Drawer, Modal} from "view-ui-plus";
import Pagination from "@/components/viewui/pagination.vue";
import WangEditor from "@/components/WangEditor/index.vue";

const {proxy}  = getCurrentInstance()


const columns= [
  {
    title: '调证公司',
    key: 'fullName'
  },
  {
    title: '关键字',
    key: 'key'
  },
  {
    title: '公司地址',
    key: 'address'
  },
  {
    title: '其他',
    key: 'other'
  },
  {
    title: '修改人员',
    key: 'updateName',

  
  },
  {
    title: '修改时间',
    key: 'updatedTime',
    
  },
  {
    title: '是否绿色通道',
    key: 'isGreenChannel',
    align: 'center',
    width: 'auto',
    render: (h, params) => {
      let txt = params.row.isGreenChannel == 1 ? '是' : '否'
      return h('span', {
      
      }, txt)
    }
  },
  {
    title: '是否重点关注',
    key: 'isImportantFocus',
    align: 'center',

    render: (h, params) => {
      let txt = params.row.isImportantFocus == 1 ? '是' : '否'
      return h('span', {
      
      }, txt)
    }
  },
  {
    title: '操作',
    slot: 'caozuo',
    width: '250',
  
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
    pageNo: pageOpt.pageNo,
    pageSize: pageOpt.pageSize,
    fullName:queryFrom.fullName,
    key:queryFrom.key
  }
  const res = await getCompanyDrawproofList(param)
  if (res.data.code){
    pageOpt.total = res.data.data.total
    DataList.value = res.data.data.list
  }
}

//预览
const previewInfo = reactive(
  {
    visible:false,
    paragraph:''
  })
function preview(row){
    previewInfo.visible = true
    previewInfo.paragraph = row.paragraph
}

const queryFrom = reactive( {
  fullName: '',
  key: ''
})
const queryFromRef = ref()
// 条件搜索
function handleSearch () {
  pageOpt.pageNo = 1
  getDataList()
}
// 重置搜索条件
function resetForm () {
  queryFrom.fullName = ''
  queryFrom.key = ''
  pageOpt.pageNo = 1
  getDataList()
}
const addForm = ref({
  fullName:'',
  key:'',
  address:'',
  other:'',
  isImportantFocus:"0",
  isGreenChannel:"0",
  paragraph:'<p></p>'
})

const modalOpt = reactive({
  visible:false,
  title:''
})
function update(row){
  console.log(row)
  modalOpt.visible = true
  modalOpt.title = '修改调证函信息'
  addForm.value= {
    fullName:row.fullName,
    key:row.key,
    address:row.address,
    other:row.other,
    paragraph:row.paragraph,
    id:row.id,
    isImportantFocus:String(row.isImportantFocus),
    isGreenChannel:String(row.isGreenChannel),
  }
}
function add(){
  modalOpt.visible = true
  modalOpt.title = '添加调证函信息'
  addForm.value= {
    fullName:'',
    key:'',
    address:'',
    other:'',
    isImportantFocus:"0",
    isGreenChannel:"0",
    paragraph:'<p></p>'
  }
}

async function save(){
  if (addForm.value.key.length==0 ||addForm.value.fullName.length ==0 || addForm.value.paragraph.length==0){
    proxy.$Message.error('必须填写调证公司、关键词、调证函内容')
    return
  }
  
  
  const res =await saveCompanyDrawproof(addForm.value)
  if(res.data.code == 200){
    modalOpt.visible = false
    proxy.$Message.success('保存成功')
  }
  getDataList()
}
async function remove(id){
const res = await deleteCompanyDrawproof({id:id})
  if(res.data.code == 200){
    modalOpt.visible = false
    proxy.$Message.success('删除成功')
  }else {
    proxy.$Message.error(res.data.message)
  }
  getDataList()
}
function changeParagraph(v){
  addForm.value.paragraph = v
}
onMounted(()=>{
  getDataList()
})


</script>
<script>
export default {
  name:"Guide"
}

</script>
<template>
  <Card style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center">
        <h2 style="margin-right: .2rem">调证函指引管理</h2>
      </div>
    </template>
    <!--    查询-->
    <Form :model="queryFrom" ref="queryFromRef">
      <Row :gutter="30">
        <Col span="4">
          <FormItem prop="username">
            <Input v-model="queryFrom.fullName" placeholder="请输入调证公司"></Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem prop="no">
            <Input v-model="queryFrom.key" placeholder="请输入关键字"></Input>
          </FormItem>
        </Col>
        <Col span="8">
          <Button type="primary" style="margin-left: 8px" icon="ios-search" @click="handleSearch">查询</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="resetForm">重置</Button>
          <Button style="margin-left: 10px" type="primary" icon="md-add" @click="add">添加</Button>
        </Col>
      </Row>
    </Form>
   <div style="padding: .2rem 0">
     <Table border :columns="columns" :data="DataList">
       <template #caozuo="{ row, index }">
         <Button style="margin-right: 5px" @click="preview(row)" >预览</Button>
         <Button type="primary" style="margin-right: 5px" @click="update(row)">修改</Button>
         <Poptip
           confirm
           title="此操作将删除选中项，是否继续?"
           @on-ok="remove(row.id)">
           <Button type="error">删除</Button>
         </Poptip>
       </template>
     </Table>
   </div>
  </Card>
  <Modal v-model="previewInfo.visible"    footer-hide>
    <div v-html="previewInfo.paragraph">
    </div>
    <div style="text-align: right" >
      <Button @click="previewInfo.visible = false" style="margin-right: .1rem">关闭</Button>
    </div>
  </Modal>
  <Modal v-model="modalOpt.visible" :title="modalOpt.title" width="40%"  footer-hide>
    <Form :model="addForm" :label-width="100">
      <FormItem label="调证公司名称">
        <Input v-model="addForm.fullName" ></Input>
      </FormItem>
      <FormItem label="关键字">
        <Input v-model="addForm.key" ></Input>
      </FormItem>
      <FormItem label="调证公司地址">
        <Input v-model="addForm.address" ></Input>
      </FormItem>
      <FormItem label="其他">
        <Input v-model="addForm.other" ></Input>
      </FormItem>
      <FormItem label="是否绿色通道" >
        <RadioGroup v-model="addForm.isGreenChannel">
          <Radio label="0">否</Radio>
          <Radio label="1">是</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="是否关注重点">
      <RadioGroup v-model="addForm.isImportantFocus">
        <Radio label="0">否</Radio>
        <Radio label="1">是</Radio>
      </RadioGroup>
    </FormItem>
      <FormItem >
         <WangEditor @changeValue="changeParagraph" :value="addForm.paragraph"></WangEditor>
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
</style>

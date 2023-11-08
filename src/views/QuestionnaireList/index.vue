<script setup="">
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {delReturnVisit, getReturnVisitList} from "../../api/QuestionnaireList.js";
import Pagination from "../../components/viewui/pagination.vue";
// import Questionnaire from "../../components/questionnaire/index.vue";
import Questionnaire from "../../components/questionnaire/indexNew.vue";
const {proxy} = getCurrentInstance()

const column = [
  {
    title: '姓名',
    key: 'xm'
  }, {
    title: '电话',
    key: 'mobile'
  }, {
    title: '警情编号',
    key: 'bh'
  }, {
    title: '损失金额',
    key: 'ssje'
  }, {
    title: '填写时间',
    key: 'createdTime'
  }, {
    title: '操作',
    key: 'operation',
    align: 'center',
    slot: 'operation'
  }
]
let queryFrom = reactive({
  xm: '',
  bh: '',
  mobile: '',
})
const tableLoading = ref(false)
const table = ref([])
const pageOpt = ref({
  total: 0,
  pageNo: 1,
  pageSize: 10
})

const modalOpt = ref({
  visible:false,
  title:'',
  rowInfo:{}
})

function add(){
  modalOpt.value.title = '添加回访表单'
  modalOpt.value.visible = true
  modalOpt.value.rowInfo = {}
  
}
function edit(row){
  modalOpt.value.title = '修改回访表单'
  modalOpt.value.rowInfo = row
  modalOpt.value.visible = true

}
function closeBD(val){
  modalOpt.value.visible = false
  // console.log(val)
  if(val=='sx'){
    getList()
  }
}
function getList() {
  tableLoading.value = true
  let param = {
    pageNo: pageOpt.value.pageNo,
    pageSize: pageOpt.value.pageSize,
    ...queryFrom
  }
  getReturnVisitList(param).then(res => {
    let {code, data} = res.data
    if (code == 200) {
      table.value = data.list
      pageOpt.value.total = data.total
      tableLoading.value = false
    } else {
      tableLoading.value = false
    }
  }).catch(() => {
    tableLoading.value = false
  })
}

function handleSearch() {
  pageOpt.value.pageNo = 1
  getList()
}

function resetForm() {
  pageOpt.value.pageNo = 1
  queryFrom.bh=''
  queryFrom.xm=''
  queryFrom.mobile=''
  getList()
}
async function dele(id){
  try{
    console.log(id)
    const res =await delReturnVisit(id)
    if(res.data.code == 200){
      proxy.$Message.success('删除成功')
      getList()
    }
  }catch (e) {
    console.log(e)
  }
}
onMounted(() => {
  getList()
})
</script>
<script>
export default {
  name: "QuestionnaireList"
}

</script>
<template>
  <Card style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center">
        <h2 style="margin-right: .2rem">回访表管理</h2>
      </div>
    </template>
    <!--    查询-->
    <Form :model="queryFrom" ref="queryFromRef">
      <Row :gutter="30">
        <Col span="4">
          <FormItem prop="name">
            <Input v-model="queryFrom.xm" placeholder="姓名"></Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem prop="mobile">
            <Input v-model="queryFrom.mobile" placeholder="手机号"></Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem prop="bh">
            <Input v-model="queryFrom.bh" placeholder="警情编号"></Input>
          </FormItem>
        </Col>
        <Col span="8">
          <Button type="primary" style="margin-left: 8px" icon="ios-search" @click="handleSearch">查询</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="resetForm">重置</Button>
          <Button style="margin-left: 10px" type="primary" icon="md-add" @click="add">添加</Button>
        </Col>
      </Row>
    </Form>
    <div style="border: 1px solid #cccccc">
      <Table :columns="column" :data="table" :loading="tableLoading">
        <template v-slot:operation="{ row, index }">
          <!--            <Button @click="detail(row)" type="primary">详情</Button>-->
          <Button @click="edit(row)" type="primary" style="margin-right: 6px">修改</Button>
          <Poptip
            confirm
            title="此操作将删除选中项，是否继续?"
            @on-ok="dele(row.id)">
            <Button type="error">删除</Button>
          </Poptip>
        </template>
      </Table>
    </div>
  </Card>
  <Footer style="position: absolute;bottom: .2rem">
    <pagination v-model:pageSize="pageOpt.pageSize" :total="pageOpt.total" v-model:pageNo="pageOpt.pageNo"
                :render="getList" show-elevator show-total/>
  </Footer>
  <Modal v-model="modalOpt.visible" :title="modalOpt.title" width="80%" :mask-closable="false"  footer-hide>
    <questionnaire :rowInfo="modalOpt.rowInfo" :visible="modalOpt.visible" @closeBD="closeBD"></questionnaire>
  </Modal>
</template>
<style lang="less">
.ivu-table-wrapper {
  overflow: visible;

.ivu-table {
  overflow: visible;
}
}
</style>

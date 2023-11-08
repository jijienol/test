<script setup="">
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {getList} from "@/api/virtualid.js";
import {find} from "lodash";
import {dictStore} from "@/store/modules/dictionary.js";
import {del, getDetail, save} from "../../api/virtualid.js";
import Pagination from "../../components/viewui/pagination.vue";
import {officeList} from "../../api/user.js";
const {proxy} = getCurrentInstance()
const dict = dictStore()
const column= [
  {
    title: '虚拟身份名称',
    key: 'label',
    align: 'center',
    width: 'auto'
  },
  {
    title: '公司名称',
    key: 'fullName',
    align: 'center',
    width: 'auto'
  },
  {
    title: '是否自动调证',
    key: 'autoDrawproof',
    align: 'center',
    width: 'auto',
    render: (h, params) => {
      let txt = params.row.autoDrawproof == 1 ? '是' : '否'
      return h('span', {
      
      }, txt)
    }
  },
  {
    title: '是否自动线下',
    key: 'autoOffline',
    align: 'center',
    width: 'auto',
    render: (h, params) => {
      let txt = params.row.autoOffline == 1 ? '是' : '否'
      return h('span', {
      
      }, txt)
    }
  },
  {
    title: '操作',
    key: 'operation',
    align: 'center',
    width: 180,
    slot: 'operation'
  }
]
const tableLoading = ref(false)
const table = ref([])
const pageOpt = ref({
  total: 0,
  pageNo: 1,
  pageSize: 10
})
// 获取表数据
function getListData () {
  tableLoading.value = true
  let param = {
    pageNo: pageOpt.value.pageNo,
    pageSize: pageOpt.value.pageSize,
    ...queryFrom
  }
  getList(param).then(res => {
    // console.log(res);
    let { code, data } = res.data
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
// 添加
const modalOpt = ref({
  visible: false,
  title: ''
})
const vinfo = ref()
const formValidate = ref( {
  id: '',
  label: '',
  shortName: '',
  fullName: '',
  autoDrawproof: '0',
  autoOffline: '0',
  offLineValue: '',
  offLineLabel: '',
  drawproofKey:''
})
const ruleValidate = ref( {
  label: [{ required: true, message: '虚拟身份名称不能为空' }],
  fullName: [{ required: true, message: '公司名称不能为空', trigger: 'blur' }]
})
function add () {
  vinfoRef.value.resetFields()
  formValidate.value.id = ''
  modalOpt.value.title = '新增虚拟身份'
  modalOpt.value.visible = true
  formValidate.value.label = ''
  formValidate.value.fullName = ''
  formValidate.value.drawproofKey = ''
}

const offlist = reactive(dict.dict.xxzc_dbsx.list)

if(offlist.length <1){
  dict.getDict('xxzc_dbsx')
}

function selTask (v) {
  // console.log(v);
  let obj = find(offlist, o => {
    return o.value == v.value
  })
  formValidate.value.offLineLabel = obj.label
  formValidate.value.offLineValue = v.value
}


const vinfoRef = ref()
const submitLoading = ref(false)

function submit () {
  vinfoRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      if (formValidate.value.autoOffline == 0) { // 0时清空offline
        formValidate.value.offLineValue = ''
        formValidate.value.offLineLabel = ''
      }
      save(formValidate.value).then(res => {
        let { code, data } = res.data
        if (code == 200) {
          proxy.$Message.success('操作成功！')
          submitLoading.value = false
          getListData()
          vinfoRef.value.resetFields()
          modalOpt.value.visible = false
        } else {
          proxy.$Message.error(res.data.message)
          submitLoading.value = false
        }
      })
    }
  })
}
// 修改
function edit (row) {
  // console.log(row);
  modalOpt.value.title = '修改虚拟身份'
  getDetail({ id: row.id }).then(res => {
    // console.log(res);
    let { code, data } = res.data
    if (code == 200) {
      formValidate.value.id = data.id
      formValidate.value.label = data.label
      formValidate.value.fullName = data.fullName
      formValidate.value.autoDrawproof = data.autoDrawproof
      formValidate.value.autoOffline = data.autoOffline
      formValidate.value.drawproofKey = data.drawproofKey
      
      if(data.autoDrawproof =='1' && data.autoOffline == '1'){
        data.companySolutionList.forEach(item=>{
          if(item.channelType== 'offlineDetect'){
            formValidate.value.offLineValue = item.value
            if(item.key){
              formValidate.value.drawproofKey = item.key
            }
          }else {
            if(item.key){
              formValidate.value.drawproofKey = item.key
            }
          }
        })
      }else if(data.autoDrawproof =='1'){
        data.companySolutionList.forEach(item=>{
          if(item.channelType== 'drawProof'){
            console.log(item,1)
            formValidate.value.drawproofKey = item.key
          }
        })
      }else {
        data.companySolutionList.forEach(item=>{
          console.log(item,2)
  
          if(item.channelType== 'offlineDetect') {
            formValidate.value.offLineValue = item.value
          }
        })
      }
      modalOpt.value.visible = true
    }
  })
}
function dele(row){
  del({ id: row.id }).then(res => {
    if (res.data.code == 200) {
      proxy.$Message.success('删除成功！')
      getListData()
    } else {
      proxy.$Message.error('删除失败！')
    }
  })
}
let queryFrom = reactive( {
  fullName : '',
  label: '',
  autoDrawproof : '',
  autoOffline: ''
})

function handleSearch(){
  pageOpt.value.pageNo = 1
  getListData()
}
function resetForm(){
  pageOpt.value.pageNo = 1
  queryFrom.fullName=''
  queryFrom.label=''
  queryFrom.autoDrawproof=''
  queryFrom.autoOffline=''
  getListData()
}
onMounted(()=>{
  getListData()
  dict.getDictList('xxzc_dbsx')
  
})
</script>
<script>
export default {
  name:"virtualid"
}

</script>
<template>
  <Card style="width:99%;margin: .1rem">
    <template #title>
    <div style="display: flex;align-items: center">
      <h2 style="margin-right: .2rem">虚拟身份管理</h2>
    </div>
    </template>
    <!--    查询-->
    <Form :model="queryFrom" ref="queryFromRef">
      <Row :gutter="30">
        <Col span="4">
          <FormItem prop="username">
            <Input v-model="queryFrom.label" placeholder="虚拟身份名称"></Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem prop="no">
            <Input v-model="queryFrom.fullName" placeholder="公司名称"></Input>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem prop="mobile">
            <Select v-model="queryFrom.autoDrawproof" placeholder="请选择是否自动调证" >
              <Option value="1">是</Option>
              <Option value="0">否</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="4">
          <FormItem prop="officeSn">
            <Select v-model="queryFrom.autoOffline" placeholder="请选择是否自动线下">
              <Option value="1">是</Option>
              <Option value="0">否</Option>
            </Select>
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
            @on-ok="dele(row)">
            <Button type="error">删除</Button>
          </Poptip>
        </template>
      </Table>
    </div>
  </Card>
  <Modal v-model="modalOpt.visible" :title="modalOpt.title" width="50%"  footer-hide>
    <div style="height: 400px;">
      <Form ref="vinfoRef" :model="formValidate" :rules="ruleValidate" :label-width="150">
        <FormItem label="虚拟身份名称" prop="label" class="form-item">
          <Input v-model="formValidate.label" placeholder=""></Input>
        </FormItem>
        <!--          <FormItem label="shortName" prop="shortName">
                    <Input v-model="formValidate.shortName" readonly></Input>
                  </FormItem>-->
        <FormItem label="公司名称" prop="fullName" class="form-item">
          <Input v-model="formValidate.fullName" placeholder=""></Input>
        </FormItem>
        <FormItem label="是否自动调证" prop="autoDrawproof">
          <RadioGroup v-model="formValidate.autoDrawproof">
            <Radio label="0">否</Radio>
            <Radio label="1">是</Radio>
          </RadioGroup>
        </FormItem>
        <Row v-if="formValidate.autoDrawproof == 1">
          <FormItem label=" 秘钥" class="form-item">
            <Input  v-model="formValidate.drawproofKey" placeholder=""></Input>
          </FormItem>
<!--          <FormItem label="备注" class="form-item">-->
<!--            <Input  v-model="formValidate.drawproofKey" placeholder=""></Input>-->
<!--          </FormItem>-->
        </Row>
        <FormItem label="是否自动线下" prop="autoOffline">
          <RadioGroup v-model="formValidate.autoOffline">
            <Radio label="0">否</Radio>
            <Radio label="1">是</Radio>
          </RadioGroup>
        </FormItem>
        <Row v-if="formValidate.autoOffline == 1">
          <FormItem label="任务名称" class="form-item">
            <Select v-model="formValidate.offLineValue" @on-select="selTask">
              <Option v-for="item in offlist" :value="item.value" :key="item.id">{{item.label}}</Option>
            </Select>
          </FormItem>
<!--          <FormItem label="备注" class="form-item">-->
<!--            <Input  v-model="formValidate.drawproofKey" placeholder=""></Input>-->
<!--          </FormItem>-->
        </Row>
      </Form>
    </div>
    <div style="text-align: right" >
      <Button @click="modalOpt.visible = false" style="margin-right: .1rem">关闭</Button>
      <Button  type="success" @click="submit()" :loading="submitLoading">提交</Button>
    </div>
  </Modal>
  <Footer style="position: absolute;bottom: .2rem">
    <pagination v-model:pageSize="pageOpt.pageSize" :total="pageOpt.total" v-model:pageNo="pageOpt.pageNo" :render="getListData" show-elevator show-total />
  </Footer>

</template>
<style scoped lang="less">
.layout {
  height: 100%;
}
.layout-header {
  padding: 0;
  background-color: #fff;
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  color: #17233d;
  font-weight: bold;
  text-indent: 14px;
  border-bottom: 1px solid #eee;
}
.layout-content {
  height: 100%;
  background-color: #fff;
  padding: 14px;
}
.layout-footer {
  padding: 10px 14px 0;
  height: 60px;
  text-align: left;
  background-color: #fff;
  border-top: 1px solid #eee;
}
.form-item {
  width: 400px;
}
.ivu-table-wrapper {
  overflow: visible;
  
  .ivu-table {
    overflow: visible;
  }
}
</style>

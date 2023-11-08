<script setup="">
import {deleteMenu, menuList, saveMenu} from "../../api/Menu.js";
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {dictList} from "../../api/dict.js";
const {proxy} = getCurrentInstance()
const columns =  [
  {
    title: '名称',
    key: 'name',
    tree: true
  },
  {
    title: '编码',
    key: 'code'
  },
  {
    title: '图标',
    key: 'icon',
    type: 'icon',
    slot:'icon'
  },
  {
    title: 'URL',
    key: 'url'
  },
  {
    title: '是否隐藏',
    key: 'hiddenname'
  },
  {
    title: '顺序',
    key: 'sort'
  },
  {
    title: '应用类型',
    key: 'appFlag'
  },
  {
    title: '操作',
    type: 'action',
    align: 'center',
    slot:'operation'
  }
]
const data = ref([])
const menuData = ref([])
function getMenuList () {
  menuList().then((res) => {
    if (res.data.code === 200) {
      if (res.data.data) {
        data.value = []
        menuData.value = []
        data.value = res.data.data
        res.data.data.forEach(node=>{
          let arr = []
          if(node.children){
            node.children.forEach(item=>{
              arr.push({
                value: item.code,
                title: item.label
              })
            })
          }
          menuData.value.push({
            value: node.code,
            title: node.title,
            children:arr
          })
        })
      }
    } else {
      proxy.$Message.error(res.data.message)
    }
  })
}
const modal1 = reactive({
  visible:false,
  title:''
})
const addform = ref( {
  name: '',
  url: '',
  code: '',
  sort: '',
  appFlag: '',
  pcode: null,
  hidden: '0',
  icon: '',
  isButton: '0'
})
const ruleInline = {
  name: [{ required: true, message: '名称不能为空' }],
  code: [{ required: true, message: '编码不能为空' }],
  sort: [{ required: true, message: '顺序不能为空' }],
  isButton: [{ required: true, message: '是否按钮节点不能为空' }]
}
function add(){
  modal1.visible = true
  modal1.title = '添加菜单'
}
const appList = ref([])
function loadAppList () {
  let para = {
    type: 'appType',
  }
  dictList(para).then((res) => {
    if (res.data.code === 200) {
      appList.value = res.data.data.list
    } else {
      proxy.$Message.error(res.data.message)
    }
  })
}
function remove(id){
  let para = {
    id: id
  }
  deleteMenu(para).then((res) => {
    if (res.data.code === 200) {
      getMenuList()
      proxy.$Message.success('删除成功')
    } else {
      proxy.$Message.error(res.data.message)
    }
  })
}
function update(row){
  modal1.visible = true
  modal1.title = '修改菜单'
  addform.value.name = row.name
  addform.value.url = row.url
  addform.value.code = row.code
  addform.value.sort = row.sort
  addform.value.appFlag = row.appFlag
  addform.value.pcode = row.pcode
  addform.value.hidden = row.hidden
  addform.value.icon = row.icon
  addform.value.isButton = row.isButton
  addform.value.id = row.id
}
const addformRef = ref()
function Cancel(){
  addformRef.value.resetFields()
  modal1.visible = false
}
const loadingSave = ref(false)
function Submit () {
  addformRef.value.validate(valid => {
    if (valid) {
      loadingSave.value = true
      if (addform.value.pcode === '' || addform.value.pcode === null || addform.value.pcode === undefined) {
        addform.value.pcode = '0'
      }
      console.log(addform.value)
      saveMenu(addform.value).then((res) => {
        if (res.data.code === 200) {
          addform.value.name = ''
          addform.value.url = ''
          addform.value.code = ''
          addform.value.sort = ''
          addform.value.appFlag = ''
          addform.value.pcode = ''
          addform.value.hidden = ''
          addform.value.icon = ''
          addform.value.isButton = '0'
          addform.value.id = ''
          loadingSave.value = false
          modal1.visible = false
          proxy.$Message.success( '保存成功')
          getMenuList()
        } else if (res.data.code === 207) {
          proxy.$Message.success( '菜单已存在，请重新输入')
          loadingSave.value = false
        }
      }).catch((err) => {
        loadingSave.value = false
        console.log(err)
      })
    }
  })
}
onMounted(()=>{
  getMenuList()
  loadAppList()
})
</script>
<script>
export default {
  name:"Menu"
}

</script>
<template>
  <Card style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center">
        <h2 style="margin-right: .2rem">菜单管理</h2>
        <div>
          <Button
            icon="md-add"
            type="primary"
            @click="add"
            style="margin: 10px">添加</Button>
        </div>
      </div>
    </template>
    
    <!--表格-->
    <Table row-key="id"  :columns="columns" :data="data" border>
      <template  v-slot:icon="{ row, index }">
        <Icon :type="row.icon" />
      </template>
      <template  v-slot:operation="{ row, index }">
        <Button type="primary" style="margin-right: .1rem" @click="update(row)">修改</Button>
        <Poptip
          confirm
          title="此操作将删除选中项，是否继续?"
          @on-ok="remove(row.id)">
          <Button type="error" style="margin-right: .1rem">删除</Button>
        </Poptip>
      </template>
    </Table>
  </Card>
  <!-- 添加 -->
  <Modal
    v-model="modal1.visible"
    :title="modal1.title"
    footer-hide
    width="1000"
    @on-cancel="Cancel()"
  >
    <Row :gutter="24">
      <Form
        :model="addform"
        ref="addformRef"
        :rules="ruleInline"
        :label-width="100"
        class="addform_ruleInline"
      >
        <Col :span="12">
          <Form-item label="名称" prop="name" class="name_addon">
            <Input v-model="addform.name" size="large"></Input>
          </Form-item>
        </Col>
        <Col :span="12">
          <Form-item label="资源地址" prop="url" class="url_addon">
            <Input v-model="addform.url" size="large"></Input>
          </Form-item>
        </Col>
        <Col :span="12">
          <Form-item label="菜单编号" prop="code" class="code_addon">
            <Input v-model="addform.code" size="large"></Input>
          </Form-item>
        </Col>
        <Col :span="12">
          <Form-item label="排序" prop="sort" class="num_addon">
            <Input v-model="addform.sort" size="large"></Input>
          </Form-item>
        </Col>
        <Col :span="12">
          <Form-item
            label="父菜单"
            prop="pcode"
            class="pcode_addon"
            size="large"
          >
            <TreeSelect v-model="addform.pcode" :data="menuData" placeholder="请选择" />
          </Form-item>
        </Col>
        <Col :span="12">
          <Form-item
            label="应用类型"
            prop="appFlag"
            class="pcode_addon"
            size="large"
          >
            <Select
              v-model="addform.appFlag"
              filterable
              :loading="loading1"
              placeholder="请选择应用类型"
              style="width: 100%"
              size="large"
            >
              <Option v-for="item in appList" :value="item.value" :key="item.value">{{
                  item.label
                }}</Option>
            </Select>
          </Form-item>
        </Col>
        <Col :span="12">
          <Form-item label="是否按钮节点" prop="isButton" class="hidden_addon">
            <RadioGroup v-model="addform.isButton" size="large">
              <Radio label="1">
                <Icon type="button-yes"></Icon>
                <span>是</span>
              </Radio>
              <Radio label="0">
                <Icon type="button-no"></Icon>
                <span>否</span>
              </Radio>
            </RadioGroup>
          </Form-item>
        </Col>
        <Col :span="12">
          <Form-item label="是否隐藏" prop="hidden" class="hidden_addon">
            <RadioGroup v-model="addform.hidden" size="large">
              <Radio label="1">
                <Icon type="button-yes"></Icon>
                <span>是</span>
              </Radio>
              <Radio label="0">
                <Icon type="button-no"></Icon>
                <span>否</span>
              </Radio>
            </RadioGroup>
          </Form-item>
        </Col>
        <Col :span="12">
          <Form-item label="图标" prop="icon" class="icon_addon">
            <Input v-model="addform.icon" size="large" style="width: 2rem" ></Input>
            <span v-if="addform.icon"
            >&nbsp;<i :class="'ivu-icon ivu-icon- ' + addform.icon" />&nbsp;{{
                addform.icon
              }}</span
            >
          </Form-item>
        </Col>
      </Form>
    </Row>
    <div style="text-align: right" >
      <Button :loading="loadingSave" type="primary" @click="Submit">提交</Button>
      <Button @click="Cancel" style="margin-left: 15px">取消</Button>
    </div>
  </Modal>
</template>
<style scoped lang="less">
.addform_ruleInline{
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}
.ivu-table-wrapper {
  overflow: visible;
  
  .ivu-table {
    overflow: visible;
  }
}
</style>

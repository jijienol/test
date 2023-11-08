<script setup="">

import {Button, Card} from "view-ui-plus";
import {getAllTrackType} from "@/api/ajJs.js";
import {listDetectChannelSolution} from "@/api/trackType.js";
import {computed, getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import {columns1,columnsOutField,columnsDataType,columnsInField,ruleInlineDataType,ruleInline,ruleInlineField} from "./trackType.js";
import {trackTypeStore} from "@/store/modules/trackType.js";
import channelSolution from "./components/channelSolution.vue";
import {
  deleteChannelSolution,
  deleteChannelSolutionField, deleteData, getDataTypeList,
  getInFields,
  getOutFields,
  saveChannelSolutionField, saveDataType
} from "../../api/trackType.js";
import {dictStore} from "@/store/modules/dictionary.js";
const dict = dictStore()
const trackType = trackTypeStore()
const {proxy} = getCurrentInstance()

const capacityTypeList = ref([])
const collapseValue = ref('')

const label = ref('')
const vertical = ref('')
const fieldType = ref('')

const pageNo = ref(1)
const pageSize = ref(20)
const totalNum = ref(0)

const tableData = ref([])
// 加载列表
async function getListDetectChannelSolution () {
  
  let data = {
    targetType: vertical.value,
    pageNo: pageNo.value,
    pageSize: pageSize.value
  }

  const res = await listDetectChannelSolution(data)
  if(res.data.code == 200){
    tableData.value = res.data.data.list
    totalNum.value = res.data.data.total
  }else {
    proxy.$Message.error(res.data.message)
  }
}
function changeTrackType (item) {
  fieldType.value = item.label
  vertical.value = item.value
  getListDetectChannelSolution()
}

async function findClueTypeList () {
 const res = await getAllTrackType({type: 'trackType'})
  if(res.data.code == 200){
    capacityTypeList.value = res.data.data
    collapseValue.value = capacityTypeList.value[0].value
    vertical.value = capacityTypeList.value[0].children[0].value
    fieldType.value = capacityTypeList.value[0].children[0].label
    await getListDetectChannelSolution()
  }else {
    proxy.$Message.error(res.data.message)
  }
}
watch(()=>vertical.value,(n)=>{
  if(n){
    trackType.targetType = n
  }
})



onMounted(()=>{
  findClueTypeList()
})

function update(row){
  trackType.channelSolution = true
  trackType.channelSolutionType = 'update'
  trackType.row = row
}
function add(){
  trackType.channelSolution = true
  trackType.channelSolutionType = 'add'
}

// 删除
async function remove (item) {
  let params = {
    id: item.id
  }
 const res = await deleteChannelSolution(params)
  if (res.data.code === 200) {
    proxy.$Message.success('删除成功')
    await getListDetectChannelSolution()
  } else {
    proxy.$Message.error(res.data.message)
  }
}
function cancel () {
  proxy.$Message.info('取消删除');
}

const inFieldList = ref([])
const outFieldList = ref([])
// 打开配置入参
function inFieldsView (row) {
  trackType.row = row
  trackType.fieldType = '1'
  trackType.showOut = false
  trackType.showIn = true
  getIn()
}
function getIn () {
  let params = {
    solutionId: trackType.row.id
  }
  getInFields(params)
    .then((res) => {
      if (res.data.code === 200) {
        trackType.loadingFields = false
        inFieldList.value = res.data.data
      } else {
        proxy.$Message.error(res.data.message)
      }
    })
    .catch((err) => {
      proxy.$Message.error(err)
    })
}

const addformField = ref({
  solutionId: '',
  type: '',
  sourceCode: '',
  targetCode: '',
  fieldName: '',
  sort: '',
  filter: '',
  queryAble: '',
  fromMain: '',
  show: '',
  defaultValue: ''
})
const updateFormField = ref({
  solutionId: '',
  type: '',
  sourceCode: '',
  targetCode: '',
  fieldName: '',
  sort: '',
  filter: '',
  queryAble: '',
  fromMain: '',
  show: '',
  defaultValue: ''
})
const addField = ref(false)
function addInField () {
  addformField.value = {
    solutionId: trackType.row.id,
    type: '1',
    sourceCode: '',
    targetCode: '',
    fieldName: '',
    sort: '',
    filter: '',
    queryAble: '1',
    fromMain: '1',
    show: '1',
    defaultValue: ''
  }
  addField.value = true
}
// 打开配置出参
function outFieldsView (row) {
  console.log(row)
  // if (row.isMultipart === '1') {
    dataTypeView(row)
    trackType.fieldType = '1'
  //
  // }else {
  //   trackType.row = row
  //   trackType.fieldType = '0'
  //   trackType.showIn = false
  //   trackType.showOut = true
  //   getOut()
  // }

}
function getOut () {
  let params = {
    solutionId: trackType.row.id
  }
  getOutFields(params)
    .then((res) => {
      if (res.data.code === 200) {
      outFieldList.value = res.data.data
      } else {
        proxy.$Message.error(res.data.message)
      }
    })
    .catch((err) => {
      proxy.$Message.error(err)
    })
}
function addOutField () {
  addformField.value = {
    solutionId: trackType.row.id,
    type: '0',
    sourceCode: '',
    targetCode: '',
    fieldName: '',
    sort: '',
    filter: '',
    queryAble: '1',
    fromMain: '1',
    show: '1',
  }
  addField.value = true
  fieldType.value ="1"
}
const updateField = ref(false)
function updateInOutField (row) {
updateFormField.value = {
    id: row.id,
    solutionId: row.solutionId,
    type: row.type,
    sourceCode: row.sourceCode,
    targetCode: row.targetCode,
    fieldName: row.fieldName,
    sort: row.sort,
    filter: row.filter,
    queryAble: '',
    fromMain: row.fromMain,
    show: row.show.toString(),
    defaultValue: row.defaultValue
  }
  if (trackType.fieldType === '1') {
    updateFormField.fromMain = row.fromMain.toString()
  } else if (trackType.fieldType === '0') {
    updateFormField.queryAble = row.queryAble.toString()
  }
  updateField.value = true
}

function removeField (row) {
  let params = {
    id: row.id
  }
  deleteChannelSolutionField(params)
    .then((res) => {
      if (res.data.code === 200) {
        proxy.$Message.success('删除成功')
        if (trackType.fieldType === '0') {
          getOut()
        } else {
          getIn()
        }
      } else {
        proxy.$Message.error(res.data.message)
      }
    })
    .catch((err) => {
      proxy.$Message.error(err)
    })
}
const loadingAddField = ref(false)

function insertField (name) {
  addRef.value.validate((valid) => {
    if (valid) {
      loadingAddField.value = true
      const params = Object.assign({}, addformField.value)
      saveChannelSolutionField(params)
        .then((res) => {
          if (res.data.code == '200') {
            if (trackType.fieldType === '0') {
              getOut()
              addRef.value.resetFields()
            } else {
             getIn()
              addRef.value.resetFields()
            }
            addField.value = false
            loadingAddField.value= false
            proxy.$Message.success('添加成功')
          } else {
           loadingAddField.value = false
            proxy.$Message.error(res.data.message)
          }
        })
        .catch((err) => {
          loadingAddField.value = false
          proxy.$Message.error(err)
        })
    }
  })
}
const updateForm = ref()
function cancelChannelSolutionFieldUpdate (name) {
  updateForm.value.resetFields()
  updateField.value = false
}

function updateSaveField (name) {
  updateForm.value.validate((valid) => {
    if (valid) {
      const params = Object.assign({}, updateFormField.value)
      saveChannelSolutionField(params)
        .then((res) => {
          if (res.data.code == '200') {
            if (trackType.fieldType === '0') {
              getOut()
              updateForm.value.resetFields()
            } else {
              getIn()
              updateForm.value.resetFields()
            }
           updateField.value = false
          
           proxy.$Message.success('修改成功')
          } else {
           
            proxy.$Message.error(res.data.message)
          }
        })
        .catch((err) => {
       
          
          proxy.$Message.error(err)
        })
    }
  })
}
const yesNoList = computed(()=>dict.dict.yes_no.list)
const addRef = ref()
function  cancelChannelSolutionField (name) {
  if(name == 'addRef')
  addRef.value.resetFields()
  addField.value = false
}
const dataTypeList = ref([])
const showDataType = ref(false)
function dataTypeView (row) {
  trackType.row = row
  showDataType.value = true
  getDataType()
}
function   getDataType () {
  let params = {
    solutionId: trackType.row.id
  }
  getDataTypeList(params)
    .then((res) => {
      if (res.data.code === 200) {
        dataTypeList.value = res.data.data.list
      } else {
        proxy.$Message.error(res.data.message)
      }
    })
    .catch((err) => {
      proxy.$Message.error(err)
    })
}
const addformDataType = ref({
  solutionId: '',
  returnType: '',
  sheetName: '',
  targetTable: '',
  columnMap: '',
  sort: '',
  info: ''
})
const updateformDataType = ref({
  solutionId: '',
  returnType: '',
  sheetName: '',
  targetTable: '',
  columnMap: '',
  sort: '',
  info: ''
})
const isAddDataType = ref(false)
function addDataType () {
  addformDataType.value = {
    solutionId: trackType.row.id,
    returnType: '',
    sheetName: '',
    targetTable: '',
    columnMap: '',
    sort: ''
  }
  isAddDataType.value = true
}
const loadingAddDataType = ref(false)
const addformDataTypeRef =ref()
function  insertDataType (name) {
  addformDataTypeRef.value.validate((valid) => {
    if (valid) {
      loadingAddDataType.value = true
      const params = Object.assign({}, addformDataType.value)
      saveDataType(params)
        .then((res) => {
          if (res.data.code == '200') {
            addformDataTypeRef.value.resetFields()
           isAddDataType.value = false
           loadingAddDataType.value = false
           proxy.$Message.success('添加成功')
           getDataType()
          } else {
           loadingAddDataType.value = false
           proxy.$Message.error(res.data.message)
          }
        })
        .catch((err) => {
          loadingAddDataType.value = false
          proxy.$Message.error(err)
        })
    }
  })
}
const isUpdateDataType = ref(false)
function  updateDataType (row) {
  updateformDataType.value = {
    id: row.id,
    solutionId: row.solutionId,
    returnType: row.returnType,
    sheetName: row.sheetName,
    targetTable: row.targetTable,
    columnMap: row.columnMap,
    sort: row.sort,
    info: row.info
  }
  isUpdateDataType.value = true
}
const updateformDataTypeRef = ref()
const loadingUpdateDataType =ref(false)
function updateSaveDataType (name) {
  updateformDataTypeRef.value.validate((valid) => {
    if (valid) {
      loadingUpdateDataType.value = true
      const params = Object.assign({}, updateformDataType.value)
      saveDataType(params)
        .then((res) => {
          if (res.data.code == '200') {
            getDataType()
            updateformDataTypeRef.value.resetFields()
            isUpdateDataType.value = false
            loadingUpdateDataType.value = false
            proxy.$Message.success('修改成功')
          } else {
            loadingUpdateDataType.value = false
            proxy.$Message.error(res.data.message)
          }
        })
        .catch((err) => {
          loadingUpdateDataType.value = false
          proxy.$Message.error(err)
        })
    }
  })
}
function  deleteDataType (row) {
  let params = {
    id: row.id
  }
  deleteData(params)
    .then((res) => {
      if (res.data.code === 200) {
        proxy.$Message.success('删除成功')
        getDataType()
      } else {
        proxy.$Message.error(res.data.message)
      }
    })
    .catch((err) => {
      proxy.$Message.error(err)
    })
}
function cancelUpdateDataType (name) {
  updateformDataTypeRef.value.resetFields()
  isUpdateDataType.value = false
}
function cancelAddDataType (name) {
  addformDataTypeRef.value.resetFields()
  isAddDataType.value = false
}
onMounted(()=>{
  dict.getDictList('ability')
  dict.getDictList('detectType')
  dict.getDictList('channel')
  dict.getDictList('yes_no')
  dict.getDictList('on_off')
  dict.getDictList('method')
})
</script>
<script>
export default {
  name:"trackType"
}

</script>
<template>
<div class="box">
  <Card class="left">
    <template #title> <div class="title"><Icon type="ios-document" />&nbsp; 能力类型</div></template>
      <Collapse accordion simple v-model="collapseValue">
        <Panel :name="item.value" v-for="item in capacityTypeList" :key="item.value">
          {{ item.label }}
          <template  #content>
            <div v-for="item1 in item.children" :key="item1.value" class="leftTab" @click="changeTrackType(item1)">
              {{ item1.label }}
            </div>
          </template>
        </Panel>
      </Collapse>
  </Card>
  <Card class="right">
    <template #title> <div class="title">{{ fieldType }}类型侦察方案</div></template>
<!--    //添加-->
    <Button  type="primary" @click="add()" style="margin-bottom: .1rem">添加<Icon type="md-add" /></Button>
    <Table border :columns="columns1" :data="tableData" >
      <template #操作="{ row, index }" >
        <Button type="primary" size="small" @click="update(row)">修改</Button>
        <Poptip
          confirm
          title="此操作将删除选中项，是否继续?"
          @on-ok="remove(row)"
          @on-cancel="cancel">
          <Button type="error" style="margin-left: 5px" size="small">删除</Button>
        </Poptip>
        
        <Button type="success" style="margin-left: 5px" size="small" @click="inFieldsView(row)">配置入参</Button>
        <Button type="warning" style="margin-left: 5px" size="small" @click="outFieldsView(row)">配置出参</Button>
      </template>
    </Table>
  </Card>
</div>
  <channel-solution @getListDetectChannelSolution="getListDetectChannelSolution"></channel-solution>
  <!-- 入参列表 -->
  <Drawer v-model="trackType.showIn "  :closable="false" :scrollable="true" class="DrawerRc" title="入参列表" width="30%">
    <div>
      <Button icon="md-add" style="margin-bottom: 10px" type="primary" @click="addInField">添加</Button>
      <Table border :columns="columnsInField" :data="inFieldList" >
        <template #操作="{ row, index }">
          <Button size="small" type="primary" @click="updateInOutField(row)">修改</Button>
          <Poptip
            confirm
            title="此操作将删除选中项，是否继续?"
            @on-ok="removeField(row)">
            <Button size="small" style="margin-left: 5px" type="error" >删除</Button>
          </Poptip>
        </template>
      </Table>
    </div>
  </Drawer>
  <!-- 出参列表 -->
  <Drawer v-model="trackType.showOut" border :closable="false" :scrollable="true" class="DrawerRc" title="出参列表" width="30%">
    <div>
      <Button icon="md-add" style="margin-bottom: 10px" type="primary" @click="addOutField">添加</Button>
      <Table :columns="columnsOutField" :data="outFieldList" border  >
        <template #操作="{ row, index }">
          <Button size="small" type="primary" @click="updateInOutField(row)">修改</Button>
          <Poptip
            confirm
            title="此操作将删除选中项，是否继续?"
            @on-ok="removeField(row)">
            <Button size="small" style="margin-left: 5px" type="error" >删除</Button>
          </Poptip>
         
        </template>
      </Table>
    </div>
  </Drawer>
  <!-- 出/入参添加 -->
  <Modal
    v-model="addField"
    :scrollable="false"
    :title="fieldType === '0' ? '出参添加' : '入参添加'"
    width="1000"
    footer-hide
    @on-cancel="cancelChannelSolutionField('addRef')"
  >
    <Form ref="addRef" :label-width="160" :model="addformField" :rules="ruleInlineField">
      <Row>
        <Col span="12">
          <FormItem label="源字段编码" prop="sourceCode">
            <Input v-model="addformField.sourceCode"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="目标字段编码" prop="targetCode">
            <Input v-model="addformField.targetCode"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="涉及字段名称" prop="fieldName">
            <Input v-model="addformField.fieldName"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="排序" prop="sort">
            <Input v-model="addformField.sort" type="number"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="字段拦截" prop="filter">
            <Input v-model="addformField.filter" type="textarea"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem v-if="trackType.fieldType === '1'" label="默认值" prop="defaultValue">
            <Input v-model="addformField.defaultValue"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="是否显示" prop="show">
            <RadioGroup v-model="addformField.show">
              <Radio v-for="item in yesNoList" :key="item.value" :label="item.value">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col>
          <FormItem v-if="trackType.fieldType === '0'" label="是否可查询" prop="queryAble">
            <RadioGroup v-model="addformField.queryAble">
              <Radio v-for="item in yesNoList" :key="item.value" :label="item.value">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem v-if="trackType.fieldType === '1'" label="是否主表字段" prop="fromMain">
            <RadioGroup v-model="addformField.fromMain">
              <Radio v-for="item in yesNoList" :key="item.value" :label="item.value">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
        </Col>
      </Row>
    </Form>
    <div style="text-align: right">
      <Button type="primary" @click="insertField('addRef')">保存</Button>
      <Button style="margin-left: 8px" @click="cancelChannelSolutionField('addRef')">取消</Button>
    </div>
  </Modal>
  <!-- 出/入参修改 -->
  <Modal
    v-model="updateField"
    :scrollable="false"
    :title="fieldType === '0' ? '出参修改' : '入参修改'"
    width="1000"
    footer-hide
    @on-cancel="cancelChannelSolutionFieldUpdate('updateFormField')"
  >
    <Form ref="updateForm" :label-width="160" :model="updateFormField" :rules="ruleInlineField">
      <Row>
        <Col span="12">
          <FormItem label="源字段编码" prop="sourceCode">
            <Input v-model="updateFormField.sourceCode"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="目标字段编码" prop="targetCode">
            <Input v-model="updateFormField.targetCode"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="涉及字段名称" prop="fieldName">
            <Input v-model="updateFormField.fieldName"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="排序" prop="sort">
            <Input v-model="updateFormField.sort" type="number"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="字段拦截" prop="filter">
            <Input v-model="updateFormField.filter" type="textarea"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem v-if="trackType.fieldType === '1'" label="默认值" prop="defaultValue">
            <Input v-model="updateFormField.defaultValue"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="是否显示" prop="show">
            <RadioGroup v-model="updateFormField.show">
              <Radio v-for="item in yesNoList" :key="item.value" :label="item.value">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col>
          <FormItem v-if="trackType.fieldType === '0'" label="是否可查询" prop="queryAble">
            <RadioGroup v-model="updateFormField.queryAble">
              <Radio v-for="item in yesNoList" :key="item.value" :label="item.value">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem v-if="trackType.fieldType === '1'" label="是否主表字段" prop="fromMain">
            <RadioGroup v-model="updateFormField.fromMain">
              <Radio v-for="item in yesNoList" :key="item.value" :label="item.value">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
        </Col>
      </Row>
    </Form>
    <div style="text-align: right">
      <Button  type="primary" @click="updateSaveField('updateFormField')">保存</Button>
      <Button style="margin-left: 8px" @click="cancelChannelSolutionFieldUpdate('updateFormField')">取消</Button>
    </div>
  </Modal>
  <!-- 数据类型列表 -->
  <Drawer v-model="showDataType" :closable="false" :scrollable="true" class="DrawerRc" title="数据类型列表" width="30%">
    <div>
      <Button icon="md-add" style="margin-bottom: 10px" type="primary" @click="addDataType">添加</Button>
      <Table :columns="columnsDataType" border  :data="dataTypeList" :loading="loadingDataType">
        <template  #操作="{ row, index }">
          <Button size="small" type="primary" @click="updateDataType(row)">修改</Button>
          <Poptip
            confirm
            title="此操作将删除选中项，是否继续?"
            @on-ok="deleteDataType(row)">
            <Button size="small" style="margin-left: 5px" type="error" >删除</Button>
          </Poptip>
          
        </template>
      </Table>
    </div>
  </Drawer>
  <!-- 数据类型添加 -->
  <Modal
    v-model="isAddDataType"
    :scrollable="false"
    title="数据类型添加"
    width="1000"
    footer-hide
    @on-cancel="cancelAddDataType('addformDataType')"
  >
    <Form ref="addformDataTypeRef" :label-width="160" :model="addformDataType" :rules="ruleInlineDataType">
      <Row>
        <Col span="12">
          <FormItem label="方案返回对象类型" prop="returnType">
            <Input v-model="addformDataType.returnType"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="表格sheet名称" prop="sheetName">
            <Input v-model="addformDataType.sheetName"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="数据存储目标库" prop="targetTable">
            <Input v-model="addformDataType.targetTable"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="排序" prop="sort">
            <Input v-model="addformDataType.sort" type="number"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="数据信息说明" prop="info">
            <Input v-model="addformDataType.info"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="24">
          <FormItem label="字段映射json" prop="columnMap">
            <Input v-model="addformDataType.columnMap" class="json-text" type="textarea"></Input>
          </FormItem>
        </Col>
      </Row>
    </Form>
    <div style="text-align: right">
      <Button :loading="loadingAddDataType" type="primary" @click="insertDataType('addformDataType')">保存</Button>
      <Button style="margin-left: 8px" @click="cancelAddDataType('addformDataType')">取消</Button>
    </div>
  </Modal>
  <!-- 数据类型修改 -->
  <Modal
    v-model="isUpdateDataType"
    :scrollable="false"
    title="数据类型修改"
    width="1000"
    footer-hide
    @on-cancel="cancelUpdateDataType('updateformDataType')"
  >
    <Form ref="updateformDataTypeRef" :label-width="160" :model="updateformDataType" :rules="ruleInlineDataType">
      <Row>
        <Col span="12">
          <FormItem label="方案返回对象类型" prop="returnType">
            <Input v-model="updateformDataType.returnType"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="表格sheet名称" prop="sheetName">
            <Input v-model="updateformDataType.sheetName"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="数据存储目标库" prop="targetTable">
            <Input v-model="updateformDataType.targetTable"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="排序" prop="sort">
            <Input v-model="updateformDataType.sort" type="number"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="数据信息说明" prop="info">
            <Input v-model="updateformDataType.info"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="24">
          <FormItem label="字段映射json" prop="columnMap">
            <Input v-model="updateformDataType.columnMap" class="json-text" type="textarea" rows="50"></Input>
          </FormItem>
        </Col>
      </Row>
    </Form>
    <div style="text-align: right">
      <Button :loading="loadingUpdateDataType" type="primary" @click="updateSaveDataType('updateformDataType')">
        保存
      </Button>
      <Button style="margin-left: 8px" @click="cancelUpdateDataType('updateformDataType')">取消</Button>
    </div>
  </Modal>
</template>
<style scoped lang="less">
.ivu-table-wrapper{
  overflow: visible;

.ivu-table{
  overflow: visible;
}
}
.box{
  display: flex;
  .left{
    width: 20%;
    height: 100vh;
    margin-right: 1%;
    .title{
      font-size: .18rem;
      font-weight: 900;
      line-height: .4rem;
      padding-left: .2rem;
    }
    .ivu-collapse-item{
      padding-top: .1rem;
      padding-bottom: .1rem;
      font-size: .16rem;
      .leftTab{
        margin-left: .25rem;
        padding: .05rem;
        cursor: pointer;
        color: #000;
      }
    }
  }
  .right{
    width: 79%;
    height: 100vh;
    font-size: .14rem;
    .title{
      font-size: .18rem;
      font-weight: 900;
      line-height: .4rem;
      padding-left: .2rem;
    }
  }
}

</style>

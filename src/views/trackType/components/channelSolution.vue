<script setup="">
import {computed, defineEmits, getCurrentInstance, onMounted, ref, watch} from "vue";
import {trackTypeStore} from "@/store/modules/trackType.js";
import {ruleInline} from "../trackType.js";

import {insertChannelSolution, updateChannelSolution} from "../../../api/trackType.js";
import {dictStore} from "@/store/modules/dictionary.js";
import {globalStore} from "../../../store/modules/global.js";
import {permissionStore} from "../../../store/modules/permission.js";

const permission = permissionStore()
const globalPinia = globalStore()
const {proxy} = getCurrentInstance()
const dict = dictStore()
const emits = defineEmits(['getListDetectChannelSolution'])
const loadingAdd = ref(false)
const trackType = trackTypeStore()

const showUploadInsert = ref(false)
const addForm = ref({
  type: '',
  channelCode: '',
  name: '',
  detectType: '',
  description: '',
  solutionCode: '',
  transferCode: '',
  targetType: trackType.targetType,
  beforeFilter: '',
  returnType: '',
  level: '',
  status: '0',
  realtime: '0',
  isCommon: '0',
  url: '',
  method: '',
  isMultipart: '0',
  other: '',
  'iiAttachmentDTO.url': '',
  'iiAttachmentDTO.name': '',
  'iiAttachmentDTO.size': '',
})
const uploadAction = ref('')
const uploadFileList = ref([{name: '', url: ''}])
const moveIn = ref(false)  // 控制上传文件鼠标悬停样式
const hasModel = ref(false) // 控制文件信息是否显示
// 字典类别
const abilityList = computed(() => dict.dict.ability.list)
const detectTypeList = computed(() => dict.dict.detectType.list)
const channelList = computed(() => dict.dict.channel.list)
const methodList = computed(() => dict.dict.method.list)
const onOffList = computed(() => dict.dict.on_off.list)
const yesNoList = computed(() => dict.dict.yes_no.list)

//表单
const FF = ref()

watch(() => trackType.channelSolution, (value, oldValue, onCleanup) => {
  console.log(value)
  if (trackType.channelSolutionType == 'add') {
    addForm.value = {
      type: '',
      channelCode: '',
      name: '',
      detectType: '',
      description: '',
      solutionCode: '',
      transferCode: '',
      targetType: trackType.targetType,
      beforeFilter: '',
      returnType: '',
      level: '',
      status: '0',
      realtime: '0',
      isCommon: '0',
      url: '',
      method: '',
      isMultipart: '0',
      other: ''
    }
  } else if (trackType.channelSolutionType == 'update') {
    addForm.value = {
      id: trackType.row.id,
      type: trackType.row.type,
      channelCode: trackType.row.channelCode,
      name: trackType.row.name,
      detectType: trackType.row.detectType,
      description: trackType.row.description,
      solutionCode: trackType.row.solutionCode,
      transferCode: trackType.row.transferCode,
      targetType: trackType.row.targetType,
      beforeFilter: trackType.row.beforeFilter,
      returnType: trackType.row.returnType,
      level: trackType.row.level,
      status: trackType.row.status.toString(),
      realtime: trackType.row.realtime.toString(),
      isCommon: trackType.row.isCommon,
      url: trackType.row.url,
      method: trackType.row.method,
      'iiAttachmentDTO.url': trackType.row.filePath,
      'iiAttachmentDTO.name': trackType.row.fileName,
      'iiAttachmentDTO.size': trackType.row.fileSize,
      isMultipart: trackType.row.isMultipart,
      other: trackType.row.other
    }
    // TODO 文件列表
    var fileInfo = {
      name: trackType.row.fileName,
      url: trackType.row.fileUrl
    }
    uploadFileList.value = []
    uploadFileList.value.push(fileInfo)
    hasModel.value = false
    if (trackType.row.fileName != '' && trackType.row.fileName != undefined && trackType.row.fileName != null) {
      hasModel.value = true
    }
    if (trackType.row.type === 'drawProof') {
      showUploadInsert.value = true
    } else {
      showUploadInsert.value = false
    }
  }
})

//
function insertSelectAbilityChange(data) {
  if (data === 'drawProof') {
    showUploadInsert.value = true
  } else {
    showUploadInsert.value = false
    addForm['iiAttachmentDTO.url'] = ''
    addForm['iiAttachmentDTO.size'] = ''
    addForm['iiAttachmentDTO.name'] = ''
  }
}

//取消
function cancel() {
  FF.value.resetFields()
  trackType.channelSolution = false
}

// 保存
function insert() {
  
  FF.value.validate(async (valid) => {
    if (valid) {
      loadingAdd.value = true
      const params = Object.assign({}, addForm.value)
      let res = {}
      if (trackType.channelSolutionType == 'add') {
        res = await insertChannelSolution(params)
      } else if (trackType.channelSolutionType == 'update') {
        res = await updateChannelSolution(params)
      }
      if (res.data.code == '200') {
        FF.value.resetFields()
        trackType.channelSolution = false
        loadingAdd.value = false
        proxy.$Message.success(trackType.channelSolutionType == 'add' ? '添加成功' : '修改成功')
        emits('getListDetectChannelSolution')
      } else {
        loadingAdd.value = false
        proxy.$Message.error(res.data.message)
      }
      
    }
  })
}

// 上传成功时调用的方法-添加
function insertSuccess(response, file, fileList) {
  if (response.code == '200') {
    var fileInfo = {
      name: response.data.filedName,
      url: globalPinia.env.api + response.data.filePath
    }
    uploadFileList.value = []
    uploadFileList.value.push(fileInfo)
    addForm.value['iiAttachmentDTO.url'] = response.data.filePath
    addForm.value['iiAttachmentDTO.size'] = file.size
    addForm.value['iiAttachmentDTO.name'] = response.data.fileName
    proxy.$Message.info('已上传')
    hasModel.value = true // 显示上传文件信息
  } else {
    proxy.$Message.info(response.message)
  }
}

// 文件超出大小限制
function fileExceededSize(file, fileList) {
  proxy.$Message.info('文件大小超出限制')
}

function clearFileInfo() {
  addForm.value['iiAttachmentDTO.url'] = ''
  addForm.value['iiAttachmentDTO.size'] = ''
  addForm.value['iiAttachmentDTO.name'] = ''
  hasModel.value = false
  moveIn.value = false
}

onMounted(() => {
  uploadAction.value = globalPinia.env.api + '/file/uploadFile?type=letterModel'
  
})
</script>
<script>
export default {
  name: "ChannelSolution"
}

</script>
<template>
  <!-- 添加 -->
  <Modal
    v-model="trackType.channelSolution"
    :title="trackType.channelSolutionType=='add'?'添加渠道解决方案':'修改渠道解决方案'"
    width="1200"
    :scrollable="false"
    footer-hide
    @on-cancel="cancel()"
  >
    <Form :model="addForm" :label-width="160" ref="FF" :rules="ruleInline">
      <Row>
        <Col span="12">
          <FormItem label="方案名称" prop="name">
            <Input v-model="addForm.name"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="方案类别" prop="type">
            <Select clearable filterable v-model="addForm.type" style="width: 100%" @on-change="insertSelectAbilityChange">
              <Option v-for="item in abilityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="侦查类别" prop="detectType">
            <Select clearable filterable v-model="addForm.detectType" style="width: 100%">
              <Option v-for="item in detectTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="渠道" prop="channelCode">
            <Select clearable filterable v-model="addForm.channelCode" style="width: 100%">
              <Option v-for="item in channelList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="URL" prop="url">
            <Input v-model="addForm.url"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="请求方式" prop="method">
            <Select clearable filterable v-model="addForm.method" style="width: 100%">
              <Option v-for="item in methodList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="方案编码" prop="solutionCode">
            <Input v-model="addForm.solutionCode"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="方案说明" prop="description">
            <Input v-model="addForm.description"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="方案返回对象类型" prop="returnType">
            <Input v-model="addForm.returnType"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="数据转换方案编码" prop="transferCode">
            <Input v-model="addForm.transferCode"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="优先级" prop="level">
            <Input v-model="addForm.level" type="number"></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="状态" prop="status">
            <RadioGroup v-model="addForm.status">
              <Radio v-for="item in onOffList" :key="item.value" :label="item.value">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <Row>
            <Col span="12">
              <FormItem label="是否实时更新" prop="realtime">
                <RadioGroup v-model="addForm.realtime">
                  <Radio v-for="item in yesNoList" :key="item.value" :label="item.value">
                    {{ item.label }}
                  </Radio>
                </RadioGroup>
              </FormItem>
            </Col>
            <Col span="12">
              <FormItem label="是否通用" prop="isCommon">
                <RadioGroup v-model="addForm.isCommon">
                  <Radio v-for="item in yesNoList" :key="item.value" :label="item.value">
                    {{ item.label }}
                  </Radio>
                </RadioGroup>
              </FormItem>
            </Col>
          </Row>
        </Col>
        <Col span="12">
          <FormItem label="前置拦截器" prop="beforeFilter">
            <Input v-model="addForm.beforeFilter" type="textarea"></Input>
          </FormItem>
        </Col>
        <Col span="12" v-if="showUploadInsert">
          <FormItem label="上传模板" prop="uploadModel">
            <Upload
              ref="upload"
              :max-size="30720"
              :headers="{
                      //请求头
                      Authorization: permission.token,
                    }"
              :show-upload-list="false"
              :on-success="insertSuccess"
              :on-exceeded-size="fileExceededSize"
              :action="uploadAction"
            >
              <Button icon="ios-cloud-upload-outline">选择上传文件</Button>
            </Upload>
            <div
              v-if="hasModel"
              class="model-info"
              v-bind:class="{ 'model-info-in': moveIn }"
              @mouseover="moveIn = true"
              @mouseleave="moveIn = false"
            >
              <Icon size="15" type="ios-document"/>
              <span>{{ addForm['iiAttachmentDTO.name'] }}</span>
              <Icon v-if="moveIn" color="#a6a6a6" size="20" class="close-icon" type="ios-close"
                    @click="clearFileInfo()"/>
            </div>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="12">
          <FormItem label="是否多种数据类型" prop="isMultipart">
            <RadioGroup v-model="addForm.isMultipart">
              <Radio v-for="item in yesNoList" :key="item.value" :label="item.value">
                {{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="其他(json)" prop="oteher">
            <Input v-model="addForm.other"></Input>
          </FormItem>
        </Col>
      </Row>
    </Form>
    <div style="text-align: right">
      <Button :loading="loadingAdd" type="primary" @click="insert('addForm')">保存</Button>
      <Button style="margin-left: 8px" @click="cancel('addForm')">取消</Button>
    </div>
  </Modal>
</template>
<style scoped lang="less">
.clueTab {
  width: 100%;
  height: 86vh;
  float: left;
}

.showTab {
  width: 98%;
  padding-bottom: 10px;
  float: left;
  margin-left: 17px;
  
  ul.ivu-page {
    text-align: center;
    margin-top: 20px;
  }
}

.leftTab {
  padding-left: 30px;
  cursor: pointer;
}

.model-info {
  margin-top: 10px;
  border-radius: 5px 5px 5px 5px;
}

.model-info-in {
  color: #007fff;
  background-color: #f2f2f2;
}

.model-info .ivu-icon {
  size: 30px;
}

.model-info span {
  margin-left: 5px;
}

.close-icon {
  float: right;
  margin-right: 10px;
  margin-top: 2px;
  cursor: pointer;
}

.json-text {
  textarea.ivu-input {
    height: 300px;
  }
}

</style>

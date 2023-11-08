<!-- 线下能力 -->
<script setup>
import {ref, reactive, getCurrentInstance, watch, computed, onMounted, nextTick} from "vue";
import {storeToRefs} from "pinia";
import {ajListStore} from "@/store/modules/ajList.js";
import {swdtStore} from "@/store/modules/swdt.js";
import {globalStore} from "@/store/modules/global.js";
import {getOfflineAbility, getAttachmentJson, insertAttachment, delAttachment, insertAttachmentBd, getDrawProofTypes} from "@/api/details.js";
import fileUtil from '@/utils/fileSaver.js'
import attathUpload from '@/components/fileUpload/attachUpload.vue'
import bdTable from '../components/exceljson.vue'
import Pagination from '@/components/viewui/pagination.vue'
import dropComp from '../components/detailContextMenu.vue'
import {noteStore} from "@/store/modules/note.js";
import vTableDrag from "@/directives/tableDrag.js";
import clip from '@/components/clipboard.vue'
const clipRef = ref(null)
const note = noteStore()
import eviComp from './components/preview.vue'
import Drawproof from './components/drawproof.vue'
import {noteTableInfo} from "@/utils/note.js";
import bus from "vue3-eventbus";
const ajStore = ajListStore()
const swdt = swdtStore()
const global = globalStore()
const {proxy} = getCurrentInstance()
let {traceTypeOptions, traceInfo} = storeToRefs(ajStore)
const bdTableRef = ref(null)
const eviRef = ref(null)
const props = defineProps({
  id: {
    type:String,
    default: ''
  },
  traceId: {
    type:String,
    default: ''
  },
  taskId: {
    type:String,
    default: ''
  },
  taskChannelList: {
    type: Array,
    default: []
  },
  task: {
    type: Object,
    default: {}
  },
  type: {
    type:String,
    default: ''
  },
  solutionId: {
    type: String,
    default: ''
  }
})
const modalOpt = reactive({
  upload: {
    visible: false,
    title: '',
    param: {
      taskChannelId: '',
      caseId: ''
    },
    finish: (res) => {
      Data.insertParam = res
      modalOpt.upload.visible = false
      // 打开数据碰撞标记
      modalOpt.bd.param.id = res.url
      modalOpt.bd.param.type = '1'
      modalOpt.bd.visible = true
      // insert()
    }
  },
  bd: {
    visible: false,
    param: {
      id:'',
      type: '1'
    },
    inertLoading: false,
    callback: (res) => {
      console.log('bdcallback',res);
    }
  }

})
const Data = reactive({
  curStep: computed(() => {
    if(props.taskId || traceInfo.value.traceTaskChannelId) {
      if(Data.fileTypelList.length > 0) {
        return 1
      } else {
        return 0
      }
    } else {
      return null
    }
  }),
  fileTypelList: [],
  insertParam: {
    type: '', // 方案类别
    name: '',
    url: '', // 文件地址
    subType: '', // 0调证函 1 调证返回文件
    data: [],
    fieldList: [],
    // content: '',
    caseId: '',
    ext: '', // 文件后缀
    // keyName: '', // 主键列名,
    taskSubType: '', // 0 单个任务 1 批量任务
    taskChannelId: '', // 单个任务的taskChannelId
    // multiId: '' // 批量任务的multiId
  },
  solution: '',
  taskChannelId: '',
  resetActive: () => { // 清空样式
    Data.fileTypelList.forEach(d => {
      if(d.fileList && d.fileList.length) {
        d.fileList.forEach(f => {
          f.active = false
        })
      }
    })
  },
  detail:(file) => {
    // console.log(file);
    File.fileSelected = file
    Data.resetActive()
    File.url = file.url
    File.id = file.id
    File.subType = file.subType
    File.name = file.name
    File.solutionLabel = file.solutionLabel
    File.pageOpt.pageNo = 1
    File.getFileData()
    file.active = true
  },
})
const fileLoading = ref(false)
const fileTableRef = ref(null)
const File = reactive({
  fileSelected: null,
  id:'',
  url:'',
  subType: '',
  pageOpt: {
    pageNo: 1,
    pageSize: 10,
    total: 0,
  },
  query: {// 请求参数
    attachmentId: '',
    pageNo: 0,
    pageSize: 0
  },
  name:'',
  solutionLabel: '',
  table:[],
  columns: [],
  loading: false,
  colIndex: 0,
  colSelected: '',
  row: '',
  getFileData: () => {
    File.table = []
    File.columns = []
    let param = File.query
    param.attachmentId = File.id
    param.pageNo = File.pageOpt.pageNo
    param.pageSize = File.pageOpt.pageSize

    fileLoading.value = true
    getAttachmentJson(param).then(res => {
      let {code, data} = res.data;
      File.pageOpt.total = data.pageInfo.total
      if(code == 200) {

        let _fields = data.fieldList
        let _column = []
        let filter = ['extend', 'note', 'mark', 'case_id', 'task_channel_id', 'id']
        _fields.forEach(item => {
          if (!filter.includes(item.targetCode)) {
            let field = {
              align: 'center',
              tooltip: false,
              title: item.fieldName,
              key: item.targetCode,
              width: 'auto',
              minWidth: 240,
              collisionType: 'file',
              // targetTable: 'ii_attachment', // ii_attachment
              targetColumn: item.targetCode,
              dataType: '',
              renderHeader: ''
            }
            if(item.collision == 1) {
              let label = ajStore.getTraceType(item.dataType)
              let signedLabel = '(' + label + ')'
              field.renderHeader = (h, column) => {
                return h('span', {
                      style: {
                        marginRight: '5px',
                        color: '#19BE6B',
                        backgroundColor: '#EFF9FF'
                      }
                    },
                    item.fieldName + signedLabel)
              }
            }
            _column.push(field)
          }
        })

        _column.push({
          align: 'center',
          tooltip: false,
          title: '标识',
          key: 'EXTEND',
          width: 240,
          minWidth: 180,
          collisionType: 'file',
          dataType: '',
          renderHeader: '',
          fixed: 'right',
          slot: 'EXTEND'
        })
        _column = proxy.$lodash.sortBy(_column, col => {
          return col.collision == 1
        })
        File.columns = _column
        File.table = data.pageInfo.list
        // console.log(data.pageInfo.list);
        // console.log(File.columns);
        fileLoading.value = false

      } else {
        proxy.$Message.error(data.message)
        fileLoading.value = false
      }


    }).catch(err => {
      fileLoading.value = false
    })
  },
  cellContextHandler: (row, event) => { // 单元格右击事件
    let pageX = event.pageX
    let except = ['noteNum', 'extend', 'virtualId', 'signNum', 'tableName']
    let colIndex = 0
    if(fileTableRef.value) {
      colIndex = File.getIndex(fileTableRef.value, pageX)
    }
    let col = File.columns[colIndex]
    File.colIndex = colIndex
    File.colSelected = col
    File.row = row
    swdt.deepParams.traceName = row[col.key].trim()
    note.virtualId = row.id
    note.rowInfo =  JSON.stringify(noteTableInfo(File.row, File.columns, File.name))
  },

  cellClick: (row, column, v, event) => { // 单元格左击事件
    if(column.key != 'EXTEND') {
      clipRef.value.copy(v)
    }
  },
  getIndex: (tableObj, pageX) => {

    let arr = []
    let leftPx = ''
    for (let i in tableObj.columnsWidth) {
      let msg = {}
      if (i == 0) {
        msg = {
          index: i,
          startWidth: 0,
          endWidth: tableObj.columnsWidth[i].width
        }
      } else {
        msg = {
          index: i,
          startWidth: arr[i - 1].endWidth,
          endWidth: tableObj.columnsWidth[i].width + arr[i - 1].endWidth
        }
      }
      arr.push(msg)
    }
    leftPx = pageX - tableObj.$el.getBoundingClientRect().left
    let scrollLeft = tableObj.$refs.body.scrollLeft
    for (let i in arr) {
      if (leftPx < arr[i].endWidth - scrollLeft) {
        return i
      }
    }
  },
})
/*watch(() => [...props.taskChannelList], (n) => {
  console.log(n);
  Data.taskChannelList = n
})*/
watch(() => props.traceId, (n, o) => {
  empty()
  if(n && n != o && props.type == 'drawProof') getFileList()
}, {immediate:true})

const uploadType = computed(() => {
  if(Data.curStep == null) {
    return false
  }else {
    return 'primary'
  }
})
// 上传文件弹窗
function uploadFile (id, label) {
  // console.log(Data.curStep);
  // console.log('uploadFile', id);
  if(Data.curStep == null) {
    proxy.$Message.warning('请先完成调证函的编辑并保存！')
    return false
  }
  if(id) {
    Data.solution = id// drawProofId
  }

  modalOpt.upload.title = '上传' + (label || '') + '文件'
  modalOpt.upload.param = {
    taskChannelId: props.taskId,
    caseId: ajStore.caseId
  }
  modalOpt.upload.visible = true
}

function insert() {
  if(modalOpt.bd.param.type == '1') {
    insertFirst()
  }else if(modalOpt.bd.param.type == 2){
    insertTwice()
  }
}
// 上传文件
function insertFirst() {
  let fields = bdTableRef.value.Data.originColumns
  let bdColumns = bdTableRef.value.Data.bdColumns
  /*if(bdColumns.length == 0) { // 没有标记任何列
    modalOpt.bd.visible = false
    return false
  }*/
  if(bdColumns.length) {
    fields.forEach(item => {
      bdColumns.forEach(b => {
        if(item.targetCode == b.key) {
          item.collision = 1
          item.dataType = b.bdData
        }
      })
    })
  }

  let param = Object.assign({}, Data.insertParam)
  param.channelSolutionExtendId = props.solutionId || traceInfo.value.solutionId
  param.taskChannelId = props.taskId || traceInfo.value.traceTaskChannelId
  param.traceId = props.traceId
  param.caseId =  ajStore.caseId
  param.fieldList = fields
  param.data = null
  param.type = props.type
  param.drawProofId = Data.solution
  // console.log(bdTableRef.value.Data);
  modalOpt.bd.inertLoading = true
  insertAttachment(param).then(res => {
    // console.log(res);
    let {code, data} = res.data
    if(code == 200) {
      if(data) {

        Data.taskChannelId = data
        ajStore.setDeepDetectParam({traceTaskChannelId: data})
        ajStore.modifyAbilityTabList(props.id, 'taskId', data)

        proxy.$Message.success('保存成功！')
        modalOpt.bd.visible = false
        modalOpt.bd.inertLoading = false
        getFileList()
        swdt.getData(ajStore.caseId)
      } else {
        proxy.$Message.error('出现未知错误！')
        modalOpt.bd.inertLoading = false
      }
    } else {
      modalOpt.bd.inertLoading = false
    }

    // 如果没有taskChannelId,
  }).catch(err => {
    console.log(err);
    modalOpt.bd.inertLoading = false
    proxy.$Message.error('出现未知错误')
  })
}
function insertTwice() {
  modalOpt.bd.inertLoading = true
  let fields = bdTableRef.value.Data.originColumns
  let bdColumns = bdTableRef.value.Data.bdColumns
  if(bdColumns.length) {
    fields.forEach(item => {
      bdColumns.forEach(b => {
        if(item.targetCode == b.key) {
          item.collision = 1
          item.dataType = b.bdData
        }
      })
    })
  } else {
    modalOpt.bd.visible = false
    modalOpt.bd.inertLoading = false
  }

  let param = Object.assign({}, Data.insertParam)
  param.channelSolutionExtendId = props.solutionId || traceInfo.value.solutionId
  param.taskChannelId = props.taskId || traceInfo.value.traceTaskChannelId
  param.traceId = props.traceId
  param.caseId =  ajStore.caseId
  param.fieldList = fields
  param.data = undefined
  param.type = props.type
  param.name = File.name
  param.subType = File.subType
  param.url = File.url

  insertAttachmentBd(param).then(res => {
    let {code, data} = res.data
    if(code == 200) {
      modalOpt.bd.visible = false
      modalOpt.bd.inertLoading = false
      Data.detail(File.fileSelected)
    } else {
      proxy.$Message.error(res.data.message)
      modalOpt.bd.visible = false
      modalOpt.bd.inertLoading = false
    }
  }).catch(err => {
    console.log(err);
    proxy.$Message.error('出现未知错误')
    modalOpt.bd.inertLoading = false
  })
}
function getFileList() { // 获取文件列表， 默认打开第一个
  Data.fileTypelList = []
  // traceId     taskChannelId
  let traceId = props.traceId
  let taskId =  props.taskId || traceInfo.value.traceTaskChannelId
  let channelType = props.type
  getDrawProofTypes({taskChannelId: taskId}).then(res => {
    // console.log(res);
    let {code, data} = res.data
    if(code == 200) {
      let _list = []
      data.forEach(d => {
        if(d.fileList && d.fileList.length) {
          d.fileList.forEach(f => {
            f.active = false
            f.solutionLabel = d.companyName
          })
        } else {
          d.fileList = []
        }
        _list.push({description:d.description, id:d.drawProofId,label: d.companyName, value: '', fileList:d.fileList})
      })
      Data.fileTypelList = _list

      nextTick(() => {
        if(Data.fileTypelList.length) {// 默认打开第一类的第一个文件
          if(Data.fileTypelList[0].fileList.length) {
            Data.detail(Data.fileTypelList[0].fileList[0])
          }
        }
      })
      /*companyName: "sh"
description: "通过调证[SH]获取虚拟身份注册信息"
drawProofId: "a0664925e49443a093cfcaaaba64f005"
fileList: []*/

    }
  })
  /*getOfflineAbility({traceId:traceId, taskChannelId: taskId, channelType: channelType}).then(res => {
    let {code, data} = res.data;
    let _list = []
    if(code == 200) {
      data.forEach(d => {
        if(d.fileList && d.fileList.length) {
          d.fileList.forEach(f => {
            f.active = false
            f.solutionLabel = d.offLineTaskLabel
          })
        } else {
          d.fileList = []
        }
        _list.push({id:d.channelSolutionExtendId,label: d.offLineTaskLabel, value: d.offLineTaskValue, fileList:d.fileList})
      })
      Data.fileTypelList = _list
      nextTick(() => {
        if(Data.fileTypelList.length) {// 默认打开第一类的第一个文件
          if(Data.fileTypelList[0].fileList.length) {
            Data.detail(Data.fileTypelList[0].fileList[0])
          }
        }
      })
    }
  })*/
}
// Extend slot 操作
const task = note.dblData
const Ext = reactive({
  collision: (row) => {
    swdt.openCollisionList(File,row)
  },
  sign: (row) => {
    task.virtualId = row.id
    note.openSign('xianxia',task.caseId,task.id,task.virtualId)
  },
  note: (row) => {
    task.virtualId = row.id
    note.openList(task,'biao')
  }
})

function contextMenuCallback(res) {
  const task = note.dblData
  task.taskChannelId = File.row.task_channel_id
  task.sourceType = File.row.tableName
  task.virtualId = File.row.id
  task.rowInfo =  JSON.stringify(noteTableInfo(File.row, File.columns, File.name))
  if(res == 'note'){
    note.openList(task)
  }else if(res == 'deep'){
    task.deepTrackType = File.colSelected.dataType
    swdt.openDeep(task)
  }else if(res.indexOf('collision')!= -1) {
    // console.log(File.colIndex);
    // console.log(File.colSelected);
    let k = File.colSelected.targetColumn
    let t  = res.split('_')[1]
    // console.log(File.row[k]);
    ajStore.setTraceItem({
      "traceName": File.row[k],
      "traceId": props.traceId,
      "caseId": ajStore.caseId,
      "taskChannelId": File.row.task_channel_id,
      "traceType": t
    })
    ajStore.setTraceListVisible(true)
  } else {
    note.addOpenSign(res,task,File)
  }
}
const Operate = reactive({
  btnActive: '',
  btnList: [
    {label: '全部', value: '', active: true},
    {label: '碰撞', value: '',  active: false},
    {label: '笔记', value: '',  active: false},
    {label: '标定', value: '',  active: false},
  ],
  btnLoading: false,
  btnHandler: (btn, i) => {
    if(i === Operate.btnActive) {
      return
    } else {
      Operate.btnActive = i

      // btn.active = true
      Operate.filterQuery()
    }
  },
  filterQuery: () => { // 按条件过滤

  },
  edit: () => { // 二次标记
    modalOpt.bd.param.id = File.id
    modalOpt.bd.param.type = '2'
    modalOpt.bd.visible = true
  },
  download: () => {
    let url = global.env.fileUrl + File.url
    fileUtil.save(File.name, url)
  },
  del: () => { // 删除
    // 删除后清空File.id，并刷新文件列表
    Operate.btnLoading = true
    delAttachment({id: File.id}).then(res => {
      let {code, data} = res.data
      if(code == 200) {
        proxy.$Message.success('删除成功')
        Operate.btnLoading = false
        File.id = ''
        getFileList()
      } else {
        Operate.btnLoading = false
      }
    })
  },
  delCancel() {

  }
})

const evidenceData = reactive({
  visible: false,
  param: {
    docNumberPrefix: null,
    docNumberSuffix: null,
    policeStationName: '',
    month: '',
    day: '',
    recipient: '',
    evidence: ''
  },
  task: {
    taskId: '',
    solutionId: '',
    traceId: '',
    // taskChannelId: '',

  },
  cancel: (res) => {
    evidenceData.visible = false
    // evidenceData.param = res.param
    /*nextTick(() => {
      eviRef.value.getField()
    })*/
  },
  create: (res) => {
    // Data.taskChannelId = res.taskChannelId

    if(res.taskChannelId) {
      // Data.taskChannelId = res.taskChannelId
      ajStore.setDeepDetectParam({traceTaskChannelId: res.taskChannelId})
      ajStore.modifyAbilityTabList(props.id, 'taskId', res.taskChannelId)
    }
    if(res.solutionId) {
      // Data.solution = res.solutionId
      ajStore.setDeepDetectParam({solutionId: res.solutionId})
      ajStore.modifyAbilityTabList(props.id, 'solutionId', res.solutionId)
    }
    evidenceData.param = res.param
    getFileList()
    swdt.getData(ajStore.caseId)
  },
  /*editDrawproof:(flag) => { // 编辑调证函
    // console.log(props);
    evidenceData.task.taskChannelId = props.taskId || traceInfo.value.traceTaskChannelId
    evidenceData.task.traceId = props.traceId
    evidenceData.task.solutionId = props.solutionId || traceInfo.value.solutionId
    evidenceData.task.taskId = props.taskId || traceInfo.value.traceTaskChannelId
    evidenceData.task.drawProofId = Data.solution
    eviRef.value.getField() // 预览调证函
    if(flag) evidenceData.visible = true
  }*/
  editDrawproof:(id) => { // 编辑调证函
    // console.log(props);
    evidenceData.task.taskChannelId = props.taskId || traceInfo.value.traceTaskChannelId
    evidenceData.task.traceId = props.traceId
    evidenceData.task.solutionId = props.solutionId || traceInfo.value.solutionId
    evidenceData.task.taskId = props.taskId || traceInfo.value.traceTaskChannelId
    evidenceData.task.drawProofId = id || ''
    // eviRef.value.getField() // 预览调证函
    evidenceData.visible = true
  }
})
function addDrawProof() {
  /* 1打开调证函编辑页
  2 传入taskChannelId drawProofId
  * */

}
function empty() {
  Data.fileTypelList = []
  Data.solution = ''
  Data.taskChannelId = ''
  File.table = []
  File.columns = []
  File.fileSelected = null
  File.url = ''
  File.id = ''
  File.subType = ''
  File.name = ''
  File.solutionLabel = ''
  File.pageOpt.pageNo = 1
}
onMounted(() => {
  empty()
  // evidenceData.editDrawproof(false)
})

// 刷新列表
bus.on('table', (param) => {
  let arr = []
  if(param == 'note') {
    if(note.addNoteParams.rowInfo){
      arr = JSON.parse(note.addNoteParams.rowInfo)
      let idObj = arr.find(o => {
        return o.id
      })
      File.table.forEach(d => {
        // noteNum
        if(d.ID == idObj.id || d.id == idObj.id || d.virtualId == idObj.id) {
          d.noteNum = d.noteNum + 1
        }
      })
    }

  } else if(param == 'sign') {
    if(note.addSign.rowInfo){
      arr = JSON.parse(note.addSign.rowInfo)
      // markNum
      let idObj = arr.find(o => {
        return o.id
      })
      File.table.forEach(d => {
        // noteNum
        if(d.ID == idObj.id || d.id == idObj.id || d.virtualId == idObj.id) {
          d.markNum = d.markNum + 1
        }
      })
    }

  }
})
</script>
<template>
  <Layout class="layout" v-if="evidenceData.visible">
    <Drawproof :param="evidenceData.task" :visible="evidenceData.visible" @cancel="evidenceData.cancel" @create="evidenceData.create"></Drawproof>
  </Layout>

  <Layout class="layout" v-else>
<!--    <span class="evi-wrap">

        <div class="evi-title"><span>调证函</span> <span class="edit" @click="evidenceData.editDrawproof(true)"><Icon type="ios-create-outline" size="18"/>编辑</span></div>
        <eviComp ref="eviRef" :param="evidenceData.param" :task="evidenceData.task"></eviComp>
    </span>-->
    <Sider width="280" class="layout-sider">
      <div class="step-wrap" style="display: none">
        <Steps :current="Data.curStep">
          <Step title="编辑调证函">
            <template #title><div class="step-title edit">编辑调证函</div></template>
          </Step>
          <Step title="上传调证返回数据">
            <template #title>
              <div class="step-title">上传调证返回文件</div>
            </template>
          </Step>
        </Steps>
      </div>
      <Row :gutter="10" style="padding: 0 10px;">
        <Col :span="0">
<!--          <span class="evi-wrap">
              <eviComp class="evi-preview" ref="eviRef" :param="evidenceData.param" :task="evidenceData.task" @click="evidenceData.editDrawproof(true)"></eviComp>
          </span>-->
        </Col>
        <Col :span="24">
          <ul class="file-ul">
            <li class="type-item" v-for="(item) in Data.fileTypelList">
              <p class="type-item-p">
                <span class="company-name" @click="evidenceData.editDrawproof(item.id)">{{item.label}}</span>
                <span class="operate">

                <Tooltip max-width="300" :content="item.description" transfer theme="light" placement="right">
<!--                  <Icon type="md-help-circle" color="#1d83ff" size="22"/>-->
                  <span class="guide">[查看指引]</span>
                </Tooltip>
                  <Icon type="md-add-circle" color="#1d83ff" size="22" @click="uploadFile(item.id,item.label)"/>

                </span>

              </p>
              <div>
                <List class="file-list" header="" footer="" border size="small">
                  <ListItem class="file-list-item" v-for="(file, fIndex) in item.fileList" :key="'file-' + fIndex" :class="{'active': file.active}" @click="Data.detail(file)">
                    <div class="item-name">{{file.name}}</div>
                  </ListItem>

                </List>
              </div>
            </li>
<!--            <li class="upload-common" @click="uploadFile()">上传调证任务返回文件</li>-->
            <li class="upload-common" @click="evidenceData.editDrawproof()">添加新的调证函</li>
          </ul>
<!--          <Button v-if="uploadType" class="upload" @click="uploadFile()" type="primary" ghost long>上传调证返回文件</Button>
          <Button v-else class="upload" @click="uploadFile()" long>上传调证返回文件</Button>-->
        </Col>

      </Row>
    </Sider>
    <Layout style="height: 100%;padding: 10px;background-color: #fff;" v-show="File.id">
      <Header class="layout-header">
        <div class="header-wrap">
          <div class="file-info">{{File.name}}&nbsp;&nbsp;<Tag type="border" color="primary" v-if="File.solutionLabel">{{File.solutionLabel}}</Tag></div>
          <div class="file-operate">
<!--            <ButtonGroup>
              <Button v-for="(btn, i) in Operate.btnList" :type=" i === Operate.btnActive ? 'primary' : ''" :key="i" @click="Operate.btnHandler(btn, i)">{{btn.label}}</Button>
            </ButtonGroup>-->
            &nbsp;
            &nbsp;
            &nbsp;
            &nbsp;
            <ButtonGroup>
              <Button icon="ios-create" @click="Operate.edit()">编辑</Button>
              <Button icon="md-download" @click="Operate.download()">下载</Button>
              <Poptip
                  confirm
                  transfer
                  title="确定要删除该文件?"
                  @on-ok="Operate.del()"
                  @on-cancel="Operate.delCancel()">
                <Button icon="md-trash" :loading="Operate.btnLoading">删除</Button>
              </Poptip>
            </ButtonGroup>
          </div>
        </div>
      </Header>
      <Content class="layout-content">
        <Table style="flex: 1" ref="fileTableRef"
               :data="File.table"
               :columns="File.columns"
               v-table-drag
               context-menu
               show-context-menu
               :fixed-shadow="'hide'"
               stripe
               :loading="fileLoading"
               @on-contextmenu="File.cellContextHandler"
               @on-cell-click="File.cellClick">
          <template #contextMenu>
            <drop-comp @callback="contextMenuCallback"></drop-comp>
          </template>
          <template #EXTEND="{row, index}">
            <b v-if="row.extendNum > 0" class="row-state collision" @click="Ext.collision(row, index)">碰撞<span class="num">{{row.extendNum}}</span></b>
            <b v-if="row.noteNum > 0" class="row-state note" @click="Ext.note(row, index)">笔记 <span class="num">{{row.noteNum}}</span></b>
            <b v-if="row.markNum > 0" class="row-state mark" @click="Ext.sign(row, index)">标定<span class="num">{{row.markNum}}</span></b>
          </template>
        </Table>
      </Content>
      <Footer class="layout-footer">
        <Pagination v-model:pageNo="File.pageOpt.pageNo" v-model:pageSize="File.pageOpt.pageSize" :render="File.getFileData" :total="File.pageOpt.total"></Pagination>
      </Footer>
    </Layout>
  </Layout>
  <Modal :title="modalOpt.upload.title" v-model="modalOpt.upload.visible" :mask-closable="false" closable :footer-hide="true">
    <p>
      <attath-upload :param="modalOpt.upload.param" @finish="modalOpt.upload.finish"></attath-upload>
    </p>
  </Modal>
  <Modal title="" v-model="modalOpt.bd.visible" :mask-closable="false" width="80%">
    <template #header>
      <p style="color: red;">请标记需要碰撞的数据列</p>
    </template>
    <div class="bd-content">
      <bdTable ref="bdTableRef" :id="modalOpt.bd.param.id" :type="modalOpt.bd.param.type" :visible="modalOpt.bd.visible"></bdTable>
    </div>
    <template #footer>
      <Button @click="insert()" type="primary" :loading="modalOpt.bd.inertLoading">保存</Button>
      <Button @click="modalOpt.bd.visible = false">关闭</Button>
    </template>
  </Modal>
  <clip ref="clipRef"></clip>
</template>

<style scoped lang="less">
.layout {
  height: 100%;
  background-color: #fff;
}
.layout-sider {
  height: 100%;
  background-color: #fff;

}
.layout-header {
  padding: 0;
  background-color: #fff;
  height: 40px;
  line-height: 1;
}
.layout-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #eeeeee;
}
.layout-footer {
  background-color: #fff;
  padding: 0;
  height: 40px;
}
ul li {
  list-style: none;
}
.header-wrap {
  display: flex;
  justify-content: space-between;
  .file-info {
    flex: 0 1 auto;
  }
  .file-operate {
    flex: 0 1 auto;
  }
}
.bd-content {
  height: 650px;
}
.file-ul {
  .type-item {
    margin-bottom: 10px;
    .type-item-p {
      display: flex;
      justify-content: space-between;
      position: relative;
      height: 30px;
      line-height: 30px;
      &::before {
        content: '-';// ♥
        position: absolute;
        top: 5px;
        width: 20px;
        height: 20px;
        line-height: 15px;
        background-color: rgba(248, 248, 249, 1);
        color: rgba(102, 102, 102, 1);
        border: 1px solid rgba(112,112,112,0.19);
        text-align: center;
        z-index: 2;
      }
      .company-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-left: 30px;
        /*&:hover {
          text-decoration: underline;
          color: rgba(64, 158, 255, 0.95);
        }*/
      }
      .operate {
        flex:  0 0 auto;
        height: 30px;
        font-size: 0;
        .guide {
          font-size: 14px;
          color:#F19260;
          margin-right: 8px;
          user-select: none;
        }
        .ivu-icon {
          vertical-align:middle;
          margin-bottom: 8px;
        }
      }
    }
  }
  .ivu-list-bordered{
    border: none;
  }
  .file-list {
    //padding-left: 50px;
    .file-list-item {
      position: relative;
      height: 32px;
      line-height: 32px;
      background-color: transparent;
      //margin-bottom: 5px;
      border-bottom: none;
      //word-break: break-all;
      //border-radius: 2px;
      padding-left: 50px;
      padding-right: 0;
      &::before {
        content: '';
        position: absolute;
        left: 10px;
        top: -16px;
        width: 40px;
        height: 100%;
        -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
        border-radius: 4px;
        border-left: 1px dashed #c8c8c8;
        border-right: 1px dashed transparent;
        border-top: 1px dashed transparent;
        border-bottom: 1px dashed #c8c8c8;
      }
      .item-name {
        width: 100%;
        padding: 0 10px;
        border-radius: 2px;
        background-color: #F6F6F7;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      &.active {
        .item-name {
          color: #fff;
          background-color: #3F86FF;
        }
      }

    }

  }
  .upload-common {
    border: 1px solid #eee;
    height: 40px;
    line-height: 40px;
    font-size: 13px;
    text-indent: 10px;
  }
}
/*:deep(.ivu-select-dropdown) {
  height: auto!important;
}*/
.row-state {
  margin: 0 4px;
  padding: .05rem;
  &:hover {
    color: #1D83FF;
    text-decoration: underline;
  }
  .num{
    margin-left: .05rem;
    color: #1D83FF;
  }
}

.evi-wrap {
  background-color: #fff;
  padding-right: 10px;
  height: 100%;
  .evi-title {
    display: flex;
    justify-content: space-between;
    height: 40px;
  }
  .edit {
    color: #327dd9;
  }
}
.step-wrap {
  margin-bottom: 10px;
  .step-title {
    line-height: 28px;


  }
}
.evi-preview {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 2px;
    width: 18px;
    height: 18px;
    background:url("@/assets/icons/edit-alt.png");
    background-size: contain;
  }
  /*&:hover::before{
    display: block;
  }*/
}
</style>

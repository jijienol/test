<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, reactive, ref } from "vue";
import Pagination from "../../components/viewui/pagination.vue";
// import Questionnaire from "../../components/questionnaire/index.vue";
import { mobileTaskLogList, mobileTaskNum, mobileTaskReturnUploadLogList, mobileTaskLogInfo } from "../../api/internetDeep.js";
import fileUtil from '@/utils/fileSaver.js';
import { globalStore } from "@/store/modules/global.js";
import { exportDeepZip } from '@/api/file.js'
import zipUpload from '@/components/fileUpload/deepzip_upload.vue'
import { permissionStore } from "@/store/modules/permission.js";
const permission = permissionStore()
// console.log(permission.isAdmin);
const { proxy } = getCurrentInstance()
const global = globalStore()

const column1 = [{
  title: "文件名称",
  key: "fileName"
}, {
  title: "导入时间",
  key: "createdTime"
}, {
  title: '状态',
  key: 'status',
  render: (h, params) => {
    // let txt = params.row.batchDownloadStatus == 1 ? '已下载' : '未下载'
    let txt = ''
    let color = '#999'
    if (params.row.status == 1) {
      txt = '导入成功'
      color = '#2cbc78'
    } else {
      txt = '导入失败'
    }
    return h('span', {
      style: {
        color: color
      }
    }, txt)
  }
}]
const column = [{
  title: '任务类别',
  key: 'channelTypeName'
},
{
  title: '关键字',
  key: 'traceName'
}, {
  title: '侦查时间',
  key: 'createdTime'
},
{
  title: '创建人',
  key: 'createdName'
},
{
  title: '状态',
  key: 'batchDownloadStatus',
  render: (h, params) => {
    // let txt = params.row.batchDownloadStatus == 1 ? '已下载' : '未下载'
    let txt = ''
    let color = '#999'
    if (params.row.batchDownloadStatus == 1) {
      txt = '已下载'
      color = '#2cbc78'
    } else if (params.row.batchDownloadStatus == 0) {
      if (params.row.url) {
        txt = '可下载'
        color = 'rgba(64,158,255,0.95)'
      } else {
        txt = '未完成'
      }
    }
    // params.row.batchDownloadStatus == 1 ?'#2cbc78' :  '#999'
    return h('span', {
      style: {
        color: color

      }
    }, txt)
  }
},
{
  title: '操作',
  key: 'operate',
  slot: 'operate',
  width: ''
}
]
let queryFrom = reactive({
  date: '',
})

function resetForm() {
  pageOpt.value.pageNo = 1
  queryFrom.date = ''
  getList()
  getNum()
}

function handleSearch() {
  pageOpt.value.pageNo = 1
  getList()
  getNum()
}

const tableLoading = ref(false)
const table = ref([]);
const pageOpt = ref({
  total: 0,
  pageNo: 1,
  pageSize: 10
})

const total = ref(0)
function getNum() {
  mobileTaskNum().then(res => {
    // console.log(res.data);
    if (res.data.data != null) {
      total.value = res.data.data
    }
  })
}
function getList() {
  tableLoading.value = true
  // console.log(queryFrom.date)
  let param = {
    pageNo: pageOpt.value.pageNo,
    pageSize: pageOpt.value.pageSize,
    ...queryFrom
  }
  if (!permission.networkType) {
    mobileTaskLogList(param).then(res => {
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
  } else {
    mobileTaskReturnUploadLogList(param).then(res => {
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

}

function mcczrqPick(v) {
  queryFrom.date = v
}
function download(row) {
  // console.log(url);
  let _o = row.url.replace(/\/upload/g, '')
  // console.log(global.env.zipUrl + _o);
  fileUtil.save(row.caseNo + '_到内网上传', global.env.fileUrl + _o)
  proxy.$Message.success("正在下载")
  row.batchDownloadStatus = 1
  // /mnt/data/upload/unfinishedBak/

}

//查看模态信息
const viewInfoData = ref(null)
const viewInfoModal = ref(false)
const range=ref();
const type=ref();
function viewInfo(row) {
  console.log(row)
  let param = {
    id: row.id,
  }
  mobileTaskLogInfo(param).then(res => {
    const { code, data } = res.data;
    console.log(code, data)
    if(code == 200){
      viewInfoData.value=data;
      console.log("获取到的数据======",viewInfoData.value)
      if (data.historyList.some(item => item.taskType == 3)) {
						range.value = [{
							"value": 1,
							"text": "再查一次"
						}, {
							"value": 2,
							"text": "长期查询"
						}]
						type.value = 1
					} else {
						type.value = 3
					}
          if(viewInfoData.value){
            viewInfoModal.value=true;
          }
         
  }
  }).catch(() => {
    // viewInfoModal.value=false;
  })
}

//模态框方法
const modalOk = () => {
  viewInfoModal.value = false
}
const modalCancel = () => {
  viewInfoModal.value = false
}

const taskType= (val) =>  {
				if (val == 3) {
					return "普通扫码任务"
				} else if (val == 1) {
					return "再查一次"
				} else {
					return "长期查询"
				}
			}

const exportGroup = reactive({
  loading: false,
  inModal: {
    visible: false,
  },
  inCall: (data) => {
    // if(data) {
    //   console.log(data);
    exportGroup.inModal.visible = false
    // exportGroup.loading = true
    getList()
    // }
  },
  inZip: () => { // 导入返回数据
    // exportGroup.loading = true
    exportGroup.inModal.visible = true
  },
  outZip: () => { // 导出zip包
    /* 下载时给提示：请妥善保管 */
    exportGroup.loading = true
    exportDeepZip().then(res => {
      let { code, data } = res.data;
      if (code == 200) {
        // console.log(data);
        if (data) {
          // let _o = data.replace(/\/mnt\/userDownloadPathBak/g, '')
          let _o = data.replace(/\/upload/g, '')
          // console.log(global.env.zipUrl + _o);
          fileUtil.save('请到内网_互联网深入侦查页_导入此包', global.env.fileUrl + _o)
          proxy.$Message.success("正在下载")
          getList()
          getNum()
          // window.open( global.env.zipUrl + _o, '_blank')// global.env.zipUrl
          // /mnt/userDownloadPathBak/68b230edbdb6489dbb1445be4658c960/20230302174508/20230302174508.zip
        } else { // null
          proxy.$Message.warning('暂时没有互联网深入侦查返回包可供下载')
        }
        exportGroup.loading = false
      } else {
        proxy.$Message.error(res.data.message)
        exportGroup.loading = false
      }
    }).catch(err => {
      console.log(err);
      exportGroup.loading = false
    })
  }
})
onMounted(() => {
  nextTick(() => {
    getNum()
    getList()
  })
})
</script>
<script>
export default {
  name: "internetDeep"
}

</script>
<template>
  <Card style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center">
        <h2 style="margin-right: .2rem">互联网深入侦查管理</h2>
      </div>
    </template>
    <!--    查询-->
    <div class="sear-area">
      <Form :model="queryFrom" ref="queryFromRef">
        <Row :gutter="30">
          <Col span="4">
          <FormItem prop="name">
            <DatePicker type="date" placeholder="填写日期" v-model="queryFrom.date" @on-change="mcczrqPick"></DatePicker>
          </FormItem>
          </Col>
          <Col span="8">
          <Button type="primary" style="margin-left: 8px" icon="ios-search" @click="handleSearch">查询</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="resetForm">重置</Button>
          </Col>
        </Row>
      </Form>
      <div class="btn-group">
        <Poptip confirm transfer title="确定要导出互联网深入侦查包?" @on-ok="exportGroup.outZip()" @on-cancel="() => { }">
          <Button v-if="!permission.networkType" :loading="exportGroup.loading"
            class="out-btn">&nbsp;导出&nbsp;{{ total }}</Button>

        </Poptip>
        <Button v-if="permission.networkType" @click="exportGroup.inZip()"
          :loading="exportGroup.loading">&nbsp;导入&nbsp;</Button>
      </div>
    </div>

    <div v-if="!permission.networkType" style="border: 1px solid #cccccc">
      <Table :columns="column" :data="table" :loading="tableLoading">
        <template #operate="{ row, index }">
          <div>
            <Button v-show="!permission.networkType && permission.isAdmin" type="primary" @click="download(row)"
              :disabled="!row.url">下载</Button>
            <Button type="success" @click="viewInfo(row)" style="margin-left: 5px;">查看</Button>
          </div>
        </template>
      </Table>
    </div>
    <div v-else style="border: 1px solid #cccccc">
      <Table :columns="column1" :data="table" :loading="tableLoading">
      </Table>
    </div>
  </Card>
  <Footer style="position: absolute;bottom: .2rem">
    <pagination v-model:pageSize="pageOpt.pageSize" :total="pageOpt.total" v-model:pageNo="pageOpt.pageNo"
      :render="getList" show-elevator show-total />
  </Footer>

  <Modal v-model="exportGroup.inModal.visible" :footer-hide="true" :mask-closable="false">
    <zip-upload @upload="exportGroup.inCall"></zip-upload>
  </Modal>
  <Modal v-model="viewInfoModal" @on-ok="modalOk" @on-cancel="modalCancel">
    <p>线索类型:{{ viewInfoData?.channelTypeName}}</p>
    <p>线索名称:{{ viewInfoData?.traceName}}</p>
    <p>任务类型:{{ viewInfoData?.traceType}}</p>
    <div v-for="(item,index) in viewInfoData?.historyList" :key="index">
      <p>任务下发时间：{{item?.createdTime}}</p>
      <p>任务类型：{{taskType(item?.taskType)}}</p>
    </div>
  </Modal>
</template>
<style lang="less">
.ivu-table-wrapper {
  overflow: visible;

  .ivu-table {
    overflow: visible;
  }
}

.sear-area {
  position: relative;

  .btn-group {
    position: absolute;
    right: 10px;
    top: 0;
    //border: 1px solid red;

  }
}
</style>

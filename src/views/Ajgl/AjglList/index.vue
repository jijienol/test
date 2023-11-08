<script setup>
import {computed, getCurrentInstance, onMounted, reactive, ref, watch} from "vue";
import {detectCaseList, acceptCase} from "@/api/ajJs.js";
import {dictStore} from "@/store/modules/dictionary.js";
import {ajListStore} from "@/store/modules/ajList.js";
import {globalStore} from "@/store/modules/global.js";
import {permissionStore} from "@/store/modules/permission.js";
import {exportZip} from '@/api/file.js'
import {useRouter} from "vue-router";
import aes from "@/libs/aes.js";
import {deleteCase, saveReadVersionLog, exportCaseZip} from "@/api/ajJs.js";
import fileUtil from '@/utils/fileSaver.js'
import scoreTip from "../component/scoreTip.vue";
import addAj from "../component/addAj.vue";
import Report from '@/components/report/index.vue'
import previewDoc from "@/libs/previewDoc.js";
import xkUpload from '@/components/fileUpload/kan_upload.vue'
import zipUpload from '@/components/fileUpload/innerzip_upload.vue'
import caseUpload from '@/components/fileUpload/caseUpload.vue'
import {storeToRefs} from "pinia";
const ajList = ajListStore()
const dict = dictStore()
const global = globalStore()
const permission = permissionStore()
const {proxy} = getCurrentInstance()
const ajStore = ajListStore()
let {caseInfo} = storeToRefs(ajStore)
const showInoutBtn = computed(() => { // dev环境才显示内网导出按钮
  // return true
  return permission.network == 0 ? true : false
})
// 添加案件
const modalOpt = reactive({
  add: {
    title:'新增案件',
    visible: false,
    close() {
      modalOpt.add.visible = false
    },
    open() {
      modalOpt.add.visible = true
    },
    callback() {
      modalOpt.add.visible = false
      tabHandler(tabValue.value)
    }
  },
  report: {
    visible: false,
    param: {
      id: '',
      name:'',
      num: '',
      money: 0
    },
    close: () => {
      modalOpt.report.visible = false
      // modalOpt.visible = false
    }
  },
  aj: {
    visible: false,
    param: {

    },
    open: () => {
      modalOpt.aj.visible = true
    },
    finish: (d) => { // 刷新案件列表
      modalOpt.aj.visible = false
      getDetectCaseList()

    }
  }
})

const loading = ref(false)
const form = ref({
  acceptTime: '', // 受理时间
  createDate: '', // 录入时间
  hostName: '', // 主办人姓名
  name: '', // 案件名称
  num: '', // 案件编号
  officeId: null, // 承办单位id
  orderBy: '', // 排序条件
  state: '', // 侦查状态;0未受理 1在侦 2已侦 3止侦
  type: '', // 案件类别;0：网络诈骗 1：游戏诈骗 2：金融诈骗
  pageNo: 1, // 当前页
  pageSize: 12 //	每页条数
})
const searchsValue = ref('')

// 搜索数据
watch(searchsValue, (a, b) => {
  // 判断是查询案件名还是编号
  if (a.slice(0, 2) == 'AJ') {
    form.value.num = a
    form.value.name = ''

  } else {
    form.value.name = a
    form.value.num = ''
  }
})
// 获取列表数据
let dataList = ref([])
let totals = ref()
let loadingT = ref(false)
let testList = ref([])
const getDetectCaseList = () => {
  loadingT.value = true
  dataList.value = []
  totals.value = 0
  console.log(form.value)
  detectCaseList(form.value).then(res => {
    if (res.data.code == '200') {
      if (res.data.data) {
        let TestList = []
        let DateList = []
        let _list = res.data.data.list;

        _list.forEach(item => {
          item.createdDate = item.createdTime.split(' ')[0]
          let userIdArr = []
          let marster = []
          let others = []
          item.caseUserList.forEach(c => {
            userIdArr.push(c.userId)
            if(c.type == 1) {
              marster.push(c.userName)
            } else {
              others.push(c.userName)
            }
          })
          item._userids = userIdArr
          item._marster = marster
          item._others = others
          item._downloading = false
          if(item.sfCsal == 1) {
            TestList.push(item)
          } else {
            DateList.push(item)
          }
        })

        let obj = proxy.$lodash.groupBy(DateList, 'createdDate')
        testList.value = TestList
        dataList.value = obj
        // dataList.value = _list
        totals.value = res.data.data.total
        // console.log(obj);

      }
      loadingT.value = false
    } else {
      proxy.$Message.error(res.data.message)
      loadingT.value = false
    }
  }).catch(err => {
    console.log(err);
    if(err.status == 500) {
      proxy.$Message.error('网络错误')
    }
    loadingT.value = false
  })
  /*const res = await detectCaseList(form.value)
  if (res.data.code == '200') {
    if (res.data.data) {
      dataList.value = res.data.data.list
      totals.value = res.data.data.total
    }
  } else {
    proxy.$Message['error'](res.data.message)
  }
  loadingT.value = false*/
}
// 搜索案件
const handleFilter = () => {
  form.value.pageNo = 1
  getDetectCaseList()
}


onMounted(() => {

  dict.getDict('detectCaseType')
  dict.getDict('trackType')
  form.value.state = '1'
  form.value.currentUserId = 'userId'
  getDetectCaseList()
})
//案件类型列表
const detectCaseType = computed(() => dict.dict.detectCaseType.list)


// 切换案件列表
const tabs = ref([
  {
    label: '所有案件',
    name: '0'
  },
  {
    label: '我的在侦',
    name: '1'
  },
  {
    label: '我的已侦',
    name: '2'
  }
])
const tabValue = ref('1')
const tabHandler = (e) => {

  form.value.pageNo = 1
  if (e === '0') {
    form.value.currentUserId = null
    form.value.state = null
  } else if (e === '1') {
    form.value.state = name
    form.value.currentUserId = 'userId'
  } else {
    form.value.state = e
    form.value.currentUserId = 'userId'
  }
  getDetectCaseList()
}
// 工具  移入移出显示工具
const toolIsShow = ref(false)

function mouseenterItem(index) {
  toolIsShow.value = index
}

function mouseleaveItem() {
  toolIsShow.value = false
}

// 换页
function handlePageChange(num) {
  form.value.pageNo = num
  getDetectCaseList()
}

// 高中低
function tall(val) {
  if (val) {
    let num = 0
    val.forEach(item => {
      if (item.level == '高' && item.hit == 1) {
        num = num + 1
      }
    })
    return num
  }
}

function centre(val) {
  if (val) {
    let num = 0
    val.forEach(item => {
      if (item.level == '中' && item.hit == 1) {
        num = num + 1
      }
    })
    return num
  }
}

function low(val) {
  if (val) {
    let num = 0
    val.forEach(item => {
      if (item.level == '低' && item.hit == 1) {
        num = num + 1
      }
    })
    return num
  }
}

// 跳转详情页
const router = useRouter()
function open(item) {
  // 旧 根据状态判断
  /*if(item.state == '1') {
    let origin = window.location.origin
    let param = aes.encrypt(JSON.stringify({caseId: item.id}))
    console.log(param,item.id)
    window.open(origin + '/detect?param=' + param, '_blank')
  } else {
    proxy.$Message.warning('请先受理案件！')
  }*/
  let origin = window.location.origin
  let param = aes.encrypt(JSON.stringify({caseId: item.id}))
  // 新 根据是否有主办人判断
  if(!canAccept(item._userids)) {

    // console.log(param,item.id)
    window.open(origin + '/detect?param=' + param, '_blank')
  } else {
    // 判断管理员
    if(permission.userInfo.roleList.includes('admin') || permission.userInfo.roleList.includes('zhongduizhang') || permission.userInfo.roleList.includes('tanzhang')) {
      window.open(origin + '/detect?param=' + param, '_blank')
    } else if(item.sfCsal == '1'){ //演示案例直接可以看
      window.open(origin + '/detect?param=' + param, '_blank')
    }else {
      proxy.$Message.warning('请先受理案件！')

    }
  }
}

// 查看报告
function openReport(c) {
  console.log(c)
  if(c) {
    caseInfo.value.id = c.id
  
    // let {id,money, name, num} = c
    modalOpt.report.param.money = c.money
    modalOpt.report.param.id = c.id
    modalOpt.report.param.name = c.name
    modalOpt.report.param.num = c.num
    modalOpt.report.visible = true
  } else {
    proxy.$Message.warning('暂无案件报告')
  }

}
//删除案件
let confirmVisible = ref(false)
const delId = ref('')
function delCase(id) {
  if(id) {
    confirmVisible.value= true
    delId.value = id
  } else {
    proxy.$Message.warning('只有主办人可以删除案件')
  }


}
function update(val) {
  if(val) {
    
    ajList.addInfo = val
    modalOpt.add.open()
    modalOpt.add.title="修改案件"
  } else {
    proxy.$Message.warning('只有主办人可以修改案件')
  }
  
  
}
async function handleDel(){
  const res = await deleteCase({ id: delId.value })
  if (res.data.code == 200) {
    proxy.$Message.success('删除成功')
    await getDetectCaseList()
  } else {
    proxy.$Message.success('删除失败')
  }
}
function acceptHandler(id) {
  acceptCase({id:id}).then(res => {
    let {code, data} = res.data;
    if(code == 200) {
      proxy.$Message.success('受理成功！')
      // tabValue.value = '1'
      // tabHandler('1')
      getDetectCaseList()
    }
  })
}
function addCall(flag) {
  tabValue.value = '0'
  tabHandler('0')
}

function titleSS(info){
  let a = ''
  info.forEach(i=>{
    a = a + i.trackTypeName +"  "
  })
  return a
}

function openVideo() {
  // let src = global.env.fileUrl + '/20230221.mp4'
  let src = 'http://39.101.70.40:6888/upload/20230221.mp4'
  // let s = previewDoc.src(src)
  console.log(src)
  window.open(src, '_blank')
}

function caseDetail(id) {

}
const kanModal = reactive({
  caseItem: '',
  visible: false,
  title:'',
  param: {
    caseId: ''
  },
  open(c) {
    kanModal.caseItem = c
    kanModal.title = c.num + '/' + c.name + '现勘文件上传'
    kanModal.param.caseId = c.id
    kanModal.visible = true
  }
})
// 现堪文件上传回调
function xkupCall(data) {
  if(data) {
    kanModal.caseItem.sfscxk = 1
    kanModal.visible = false
    /*dataList.value.forEach(item => {
      if(item.id == kanModal.param.caseId) {
        item.sfscxk = 1
      }
    })*/
  }
}

const exportGroup = reactive({
  loading: false,
  inModal: {
    visible: false,
  },
  inCall: (data) => {
    if(data) {
      exportGroup.inModal.visible = false
      // exportGroup.loading = true
    }
  },
  inZip: () => { // 导入返回数据
    // exportGroup.loading = true
    exportGroup.inModal.visible = true
  },
  outZip: () => { // 导出zip包
    /* 下载时给提示：请妥善保管 */
    exportGroup.loading = true
    exportZip().then(res => {
      let {code, data} = res.data;
      if(code == 200) {
        // console.log(data);
        if(data) {
          let _o = data.replace(/\/mnt\/userDownloadPathBak/g, '')
          // console.log(global.env.zipUrl + _o);
          fileUtil.save('解压后上传到解析平台', global.env.zipUrl + _o)
          proxy.$Message.success("正在下载")
          // window.open( global.env.zipUrl + _o, '_blank')// global.env.zipUrl
          // /mnt/userDownloadPathBak/68b230edbdb6489dbb1445be4658c960/20230302174508/20230302174508.zip
        } else { // null
          proxy.$Message.warning('暂时没有包可供下载')
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
function canAccept(ids) { // 是否有受理的权限
  if(ids.includes(permission.userId)) { // 有主办人
    return false
  }else {
    return true
  }
}
// const downloadList = ref([])
// const isDownloadingCase = ref(false)
function downloadCaseUrl(c) {
  // console.log(c);
  if(c._downloading) {
    proxy.$Message.info(c.name + '正在下载中,请等待')
    return
  } else {
    c._downloading = true;
    proxy.$Message.success('开始下载');
    exportCaseZip({caseId: c.id}).then(res => {
      // console.log(res);// /case_zip_file/f4b317c311f54c0a856eb55a72ed3ca8.zip
      let _o = res.data.data
      fileUtil.save(c.num+ '_' +c.name, global.env.fileUrl + _o)
      setTimeout(() => {
        c._downloading = false
      }, 3000)
    }).catch((err) => {
      console.log(err);
      proxy.$Message.error(c.name + '下载出现错误');
      c._downloading = false
    })
  }

  // fileUtil.save(c.name, url)
}
function downloadCase(c) { // 下载案件
  if(c._downloading) {
    proxy.$Message.info(c.name + '正在下载中,请等待')
    return
  } else {
    c._downloading = true
    proxy.$Message.success('开始下载');
    exportCaseZip({caseId: c.id}).then(res => {
      fileUtil.saveBlob(res.data, c.num + '_' + c.name+'文件' + '.zip');
      setTimeout(() => {
        c._downloading = false
      }, 3000)
    }).catch((err) => {
      console.log(err);
      proxy.$Message.error(c.name + '下载出现错误');
      c._downloading = false
    })
  }

}
//添加案件提示上传受案登记表可以解析
const addAjtishi = ref(false)


</script>

<template>
  <Layout class="ajgl-layout">
    <Header class="header">
      <!-- 查询-->
      <div class="top-search">
          <Row>
            <Col span="6">
              <Input v-model="searchsValue"
                     clearable
                     placeholder="请填写案件编号或案件名"
                     @keyup.enter="handleFilter"/>
            </Col>
            <Col span="2" style="margin-left: .50rem">
              <Select v-model="form.type"
                      clearable
                      placeholder="请选择案件类型"
                      @on-change="handleFilter"
              >
                <Option v-for="item in detectCaseType" :key="item.id" :value="item.value">
                  {{ item.label }}
                </Option>
              </Select>
            </Col>
            <div class="btn-group">
              <Button type="primary" @click="addAjtishi = true" >+添加案件</Button>
              <Button @click="modalOpt.aj.open" v-if="showInoutBtn && (permission.userInfo.roleList.includes('admin') || permission.userInfo.roleList.includes('bananjian'))">导入案件</Button>
              
              <Poptip
                  confirm
                  transfer
                  title="确定要导出所有未完成请求?"
                  @on-ok="exportGroup.outZip()"
                  @on-cancel="() => {}">
                <Button v-if="showInoutBtn" @click="" :loading="exportGroup.loading" class="out-btn">&nbsp;导出任务&nbsp;</Button>

              </Poptip>
              <Button v-if="showInoutBtn" @click="exportGroup.inZip()" :loading="exportGroup.loading">&nbsp;导入结果&nbsp;</Button>
            </div>

          </Row>
      </div>
      <div class="tabs-box">
        <Tabs v-model="tabValue" @on-click="tabHandler" :loading="loadingT">
          <TabPane v-for="(tab, tabIndex) in tabs" :key="'tab_'+tabIndex" :label="tab.label" :name="tab.name" ></TabPane>
        </Tabs>
      </div>
    </Header>
    <Content class="content">
        <Spin size="large" fix :show="loadingT"></Spin>

        <Row gutter="30">
          <Col class="title" :span="24" style="height: 20px" v-if="testList.length">演示案例</Col>
          <Col :span="8" v-for="(item) in testList" :key="item.id">
            <div class="item" @click="open(item)" @mouseenter="mouseenterItem(item.id)" @mouseleave="mouseleaveItem">
              <div class="top">
                <div class="num">
                  <span v-if="item.sfCsal == 1" class="video" @click.stop="openVideo()"><Icon type="ios-videocam" size="20"/></span>
                  {{ item.num }}<span v-if="item.jjdbh">({{item.jjdbh}})</span>
                </div>
                <div class="name">
                  <div class="nameWrap">
                    <span class="txt">{{ item.name }}</span>
                    <div v-if="item.typeLabel" class="type" @mouseenter="caseDetail(item.id)">{{ item.typeLabel }}<Icon type="ios-arrow-forward"/></div>
                  </div>

                  <div class="toolWrap">
                    <span class="icon" title="现勘录入" @click.stop="kanModal.open(item)">
                      <img src="@/assets/icons/aj-xk1.png" width="22" alt="" v-if="item.sfscxk == 1">
                      <img src="@/assets/icons/aj-xk.png" width="22" alt="" v-else>
<!--                      <Icon type="ios-folder" size="21" color="#3F86FF" v-if="item.sfscxk == 1"/>-->
<!--                      <Icon type="ios-folder" size="21" color="#999" v-else/>-->
                    </span>
                    
                      <span class="icon" title="案件报告" >
<!--                      <Icon type="ios-paper" size="22" color="#999"/>-->
                         <img src="@/assets/icons/aj-report1.png" width="22" alt=""  v-if="item.detectStatus == '2' || item.detectStatus == '3'" @click.stop="openReport(item)">
                          <img src="@/assets/icons/aj-report.png" width="22" alt="" v-else @click.stop="openReport()">
                    </span>
                    <span class="icon" v-if="!showInoutBtn"><!--只有外网有导出-->
                      <Tooltip content="导出案件" placement="top-start">
                        <img src="@/assets/icons/aj-download1.png" width="22" alt="" @click.stop="downloadCaseUrl(item)">
                        <!--                             <Icon type="md-cloud-download" size="22" color="#999" @click.stop="downloadCaseUrl(item)"/>-->
                      </Tooltip>
                    </span>
                    <span class="icon">
                      <Tooltip content="修改案件信息" placement="top-start">
                        <img src="@/assets/icons/update1.png" width="22" alt="" v-if="!canAccept(item._userids)" @click.prevent.stop="update(item)">
                        <img src="@/assets/icons/update.png" width="22" alt="" v-else @click.prevent.stop="update()">
                      </Tooltip>
                    </span>
                      <span class="icon" title="删除案件" >
<!--                      <Icon size="23" type="md-trash" color="#999"/>-->
                        <img src="@/assets/icons/aj-delete1.png" width="22" alt="" v-if="!canAccept(item._userids)" @click.prevent.stop="delCase(item.id)">
                        <img src="@/assets/icons/aj-delete.png" width="22" alt="" v-else @click.prevent.stop="delCase()">
                    </span>
                  </div>

                </div>
                <Divider style="margin: 4px 0 8px"></Divider>
                <div class="bottom" @click.stop="() => {return false}">
                  <div class="username">
                    <div class="office">
                      <Icon type="ios-home-outline" size="16"/> <span>单位：{{item.officeName}}</span>
                    </div>
                    <div class="host-user">
                      <Icon class="s-icon" sizi="18" type="ios-person-outline"/>
                      <div class="host">
                      主办人：<span v-for="m in item._marster">{{m}}&nbsp;</span>
                      <template v-if="item._others.length > 0">
                        (
                        <span v-for="user in item._others">{{user}}&nbsp;</span>
                        )
                      </template>
                      </div>

                    </div>
                    <Button v-if="item.sfCsal!='1' && canAccept(item._userids)" class="accept" type="success" ghost @click.stop="acceptHandler(item.id)">受理</Button>

                  </div>
                  <div class="traceType">
                    <Icon class="s-icon" sizi="18" type="ios-cube-outline" />
                    <div class="types">
                      线索类型：<span v-for="trace in item.caseTraceInfo">{{trace.trackTypeName}}&nbsp;</span>
                    </div>
<!--                    <template v-if="item.caseTraceInfo">
                      <div :title="titleSS(item.caseTraceInfo)"><Icon type="ios-cube-outline" /> &nbsp;线索类型：<span v-for="trace in item.caseTraceInfo">{{trace.trackTypeName}}&nbsp;</span></div>
                    </template>-->
                  </div>
                  <div class="description">
                    <Icon class="s-icon" sizi="18" type="ios-list-box-outline"/>
                    <span class="s-label">简要案情：</span>
                    <span class="desc">
                      <Ellipsis :text="item.description" :lines="1" tooltip theme="dark" max-width="550"></Ellipsis>
                    </span>
                  </div>

                </div>
              </div>
              <div v-if="item.state == '0'" class="rightTop">
                <div v-show="item.detectStatus==0" class="rightTop-tab" style="background:#CCC;">案件未受理</div>
              </div>
              <div v-else class="rightTop">
                <div v-show="item.detectStatus==0" class="rightTop-tab todo">线索未录入</div>
                <div v-show="item.detectStatus==1" class="rightTop-tab tofirst">已录入待初侦</div>
                <div v-show="item.detectStatus==2 || item.detectStatus == 3" class="rightTop-tab todeep">

                    <p>深入侦察中</p>
<!--                    <p>高{{ tall(item.caseScoreList) }} 中{{ centre(item.caseScoreList) }} 低{{ low(item.caseScoreList) }}</p>-->

                </div>

              </div>
            </div>
          </Col>
        </Row>

        <Row v-for="(v,k,i) in dataList" gutter="30">
          <Col class="title" :span="24" style="height: 20px">{{k}}</Col>
          <Col :span="8" v-for="(item) in v" :key="item.id">
            <div class="item" @click="open(item)" @mouseenter="mouseenterItem(item.id)" @mouseleave="mouseleaveItem">
              <div class="top">
                <div class="num">
                  <span v-if="item.sfCsal == 1" class="video" @click.stop="openVideo()"><Icon type="ios-videocam" size="20"/></span>
                  {{ item.num }}<span v-if="item.jjdbh">({{item.jjdbh}})</span>
                </div>
                <div class="name">
                  <div class="nameWrap">
                    <span class="txt">{{ item.name }}</span>
                    <div class="type " v-if="item.typeLabel" @mouseenter="caseDetail(item.id)">{{ item.typeLabel }}<Icon type="ios-arrow-forward"/></div>
                  </div>

                  <div class="toolWrap" >
                    <span class="icon" >
                      <Tooltip content="现勘录入" placement="top-start">
                        <img src="@/assets/icons/aj-xk1.png" width="22" alt="" v-if="item.sfscxk == 1" @click.stop="kanModal.open(item)">
                        <img src="@/assets/icons/aj-xk.png" width="22" alt="" v-else @click.stop="kanModal.open(item)">
                      </Tooltip>
                    </span>
                    <span class="icon">
                      <Tooltip content="案件报告" placement="top-start">
                      <img src="@/assets/icons/aj-report1.png" alt="" width="22"  v-if="item.detectStatus == '2' || item.detectStatus == '3'" @click.stop="openReport(item)">
                          <img src="@/assets/icons/aj-report.png" width="22" alt="" v-else @click.stop="openReport()">
                      </Tooltip>
                    </span>
                    <span class="icon" v-if="!showInoutBtn"><!--只有外网有导出-->
                      <Tooltip content="导出案件" placement="top-start">
                        <img src="@/assets/icons/aj-download1.png" width="22" alt="" @click.stop="downloadCaseUrl(item)">
<!--                             <Icon type="md-cloud-download" size="22" color="#999" @click.stop="downloadCaseUrl(item)"/>-->
                      </Tooltip>
                    </span>
                    <span class="icon">
                      <Tooltip content="修改案件信息" placement="top-start">
                        <img src="@/assets/icons/update1.png" width="22" alt="" v-if="!canAccept(item._userids)" @click.prevent.stop="update(item)">
                        <img src="@/assets/icons/update.png" width="22" alt="" v-else @click.prevent.stop="update()">
                      </Tooltip>
                    </span>
                    
                    <span class="icon">
                      <Tooltip content="删除案件" placement="top-start">
                        <img src="@/assets/icons/aj-delete1.png" width="22" alt="" v-if="!canAccept(item._userids)" @click.prevent.stop="delCase(item.id)">
                        <img src="@/assets/icons/aj-delete.png" width="22" alt="" v-else @click.prevent.stop="delCase()">
                      </Tooltip>
                    </span>
               
                  </div>

                </div>
                <Divider style="margin: 4px 0 8px"></Divider>
                <div class="bottom" @click.stop="() => {return false}">
                  <div class="username">
                    <div class="office">
                      <Icon type="ios-home-outline" size="16"/> <span>单位：{{item.officeName}}</span>
                    </div>
                    <div class="host-user">
                      <Icon sizi="16" type="ios-person-outline"/> &nbsp;
                      主办人：<span v-for="m in item._marster">{{m}}&nbsp;</span>
                      <template v-if="item._others.length > 0">
                        (<span v-for="user in item._others">{{user}}&nbsp;</span>)
                      </template>

                    </div>
                    <Button v-if="item.sfCsal!='1' && canAccept(item._userids)" class="accept" type="success" ghost @click.stop="acceptHandler(item.id)">受理</Button>

                  </div>
                  <div  class="traceType">
                    <Icon class="s-icon" sizi="16" type="ios-cube-outline" />
                    <div class="types">
                      线索类型：<span v-for="trace in item.caseTraceInfo">{{trace.trackTypeName}}&nbsp;</span>
                    </div>
<!--                    <template v-if="item.caseTraceInfo">
                      <div :title="titleSS(item.caseTraceInfo)"><Icon type="ios-cube-outline" /> &nbsp;线索类型：<span v-for="trace in item.caseTraceInfo">{{trace.trackTypeName}}&nbsp;</span></div>
                    </template>-->
                  </div>
                  <div class="description">
                    <Icon class="s-icon" sizi="18" type="ios-list-box-outline"/>
                    <span class="s-label">简要案情：</span>
                    <div class="desc"><Ellipsis :text="item.description" :lines="1" tooltip theme="dark" max-width="360"></Ellipsis>
                    </div>
                  </div>

                </div>
              </div>
              <div v-if="item.state == '0'" class="rightTop">
                <div v-show="item.detectStatus==0" class="rightTop-tab" style="background:#CCC;">案件未受理</div>
              </div>
              <div v-else class="rightTop">
                <div v-show="item.detectStatus==0" class="rightTop-tab todo">线索未录入</div>
                <div v-show="item.detectStatus==1" class="rightTop-tab tofirst">已录入待初侦</div>
                <div v-show="item.detectStatus==2 || item.detectStatus == 3" class="rightTop-tab todeep">
                    <p>深入侦察中</p>
<!--                    <p>高{{ tall(item.caseScoreList) }} 中{{ centre(item.caseScoreList) }} 低{{ low(item.caseScoreList) }}</p>-->


                </div>

              </div>
            </div>

          </Col>
        </Row>


    </Content>
    <Footer class="footer">
      <Page :model-value="form.pageNo" :page-size="form.pageSize" :total="totals" show-elevator show-total
            @on-change="handlePageChange"/>
    </Footer>
    <Modal v-model="modalOpt.add.visible"
           :closable="false"
           :footer-hide="true"
           :mask-closable="false"
           class-name="vertical-center-modal"
           :styles="{  width: '70%' }"
           :title="modalOpt.add.title">
      <addAj :visible="modalOpt.add.visible" :title="modalOpt.add.title" @callback="modalOpt.add.callback" @cancel="modalOpt.add.close"></addAj>`
    </Modal>
    <Modal
        v-model="confirmVisible"
        title="删除提示"
        @on-ok="handleDel"
        @on-cancel="confirmVisible = false">
      <p style="font-size: 15px">确定删除该案件?</p>
    </Modal>
    <Modal v-model="modalOpt.report.visible" fullscreen :footer-hide="true">
      <Report :visible="modalOpt.report.visible" :info="modalOpt.report.param" @close="modalOpt.report.close"></Report>
    </Modal>
    <Modal v-model="kanModal.visible"  :title="kanModal.title" :footer-hide="true" :mask-closable="false">
      <xk-upload :caseId="kanModal.param.caseId" @upload="xkupCall"></xk-upload>
    </Modal>
    <Modal v-model="exportGroup.inModal.visible" :footer-hide="true" :mask-closable="false">
      <zip-upload @upload="exportGroup.inCall"></zip-upload>
    </Modal>
   
    <Modal title="导入案件" v-model="modalOpt.aj.visible" :mask-closable="false" footer-hide>
      <div>
        <case-upload @upload="modalOpt.aj.finish"></case-upload>
      </div>
    </Modal>
    <Modal
      v-model="addAjtishi"
      title="提示"
      :loading="loading"
      @on-ok="modalOpt.add.open"
      ok-text="下一步"
    >
      <div style="height: 2rem;line-height: 2rem" >
        <h2 style="text-align: center">上传《受案登记表》可以获取到简要案情</h2>
      </div>
    </Modal>
    </Layout>
</template>
<style lang="less" scoped>
/*:deep(.ivu-tabs-bar) {
  padding: .1rem .2rem 0;
  margin: 0;
}*/
.vertical-center-modal{
  display: flex;
  align-items: center;
  justify-content: center;
}
.vertical-center-modal .ivu-modal{
  top: 0;
}
.ajgl-layout {
  
  position: relative;
  height:100vh;
  overflow: hidden;
}
.header {
  padding: 10px 10px 0;
  height: 12vh;
  background-color: #fff;
  .top-search {
    position: relative;
    padding: 0 20px;
    /*height: .75rem;*/
    height: calc(100% - 46px);
    .btn-group {
      position: absolute;
      right: 10px;
      top: 0;
      z-index: 1000;
      .out-btn {
        margin-left: 30px;

      }
    }
  }
}
.content {
  height: 80vh;
  padding: 20px 30px;
  overflow-y: scroll;
  //background-color: #fff;
}
.footer {
  height: 5vh;
  padding: 10px 20px;
  background-color: #fff;
}
.top {
  .video {
    cursor: pointer;
    font-size: 13px;
    color: rgba(64, 158, 255, 0.85);
    &:hover {
      text-decoration: underline;
    }
  }
}


.item {
  position: relative;
  background-color: #fff;
  border-radius: .1rem;
  //height: 1.75rem;
  padding: 5px 18px 10px;
  box-shadow: 1px 1px 5px 1px rgba(211,211,211, 0.3), -1px -1px 5px 1px rgba(211,211,211, 0.3);
  margin-bottom: 20px;
  .top {
    height: 50%;
    .num {
      height: 50px;
      line-height: 50px;
    }
    .name {
      position: relative;
      display: flex;
     min-height: 30px;
      .nameWrap {
        flex: 0 0 80%;
        display: flex;
        text-align: left;
        .txt {
          font-size: .18rem;
          flex: 0 1 auto;
          max-width: 70%;
          //white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          //border: 1px solid red;
        }
        .type {
          display: inline-block;
          flex: 0 1 auto;
          margin-left: 4px;
          padding: 0 .1rem;
          height: .24rem;
          line-height: .24rem;
          font-size: .14rem;
          background: #E9E9E9;
          white-space: nowrap;
          text-align: center;
        }
      }

      .toolWrap {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 20%;
        display: flex;
        justify-content: space-around;
        //flex: 0 1 20%;
        text-align: right;
        .icon {
          flex: 1;
        }
      }
    }
  }
  .bottom {
    height: 50%;
    //display: flex;
    .username {
      position: relative;
      .host-user {
        width: 80%;
        display: flex;
        align-items: center;
        overflow: hidden;
        .s-icon {
          flex: 0 0 20px;
          text-align: left;
        }
        .host {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
      .accept {
        position: absolute;
        right: 10px;
        top: 5px;
        z-index: 2;
      }
    }
    .description {
      display: flex;
      align-items: center;
      .s-icon {
        flex: 0 0 20px;
        text-align: left;
      }
      .s-label {
        flex: 0 0 auto;
      }
      .desc {
        flex: 0 1 auto;
      }
    }
    .traceType {
      display: flex;
      align-items: center;
      .s-icon {
        flex: 0 0 20px;
        text-align: left;
      }
      .types {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  .rightTop {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 2;
    font-size: .14rem;
    //padding: .05rem .15rem;
    border-top-right-radius: .1rem;
    border-bottom-left-radius: .1rem;
    color: #FFFFFF;
    text-align: center;
    .rightTop-tab {
      font-size: .14rem;
      padding: .025rem .125rem;
      border-top-right-radius: .1rem;
      border-bottom-left-radius: .1rem;
      color: #FFFFFF;
      text-align: center;
      font-family: "PingFang SC";

      &.todo {
        color: rgba(255, 74, 74, 1);
        background-color: rgba(255, 74, 74, 0.15);
      }
      &.tofirst {
        color: rgba(29, 131, 255, 1);
        background-color: rgba(29, 131, 255, 0.15);
      }
      &.todeep {
        color: rgba(36, 180, 147, 1);
        background-color: rgba(36, 180, 147, 0.15);
      }
    }
  }
}
.ivu-row {
  //height: 100%;
}
:deep(.ivu-tabs-bar) {
  padding: .1rem .2rem 0;
  margin: 0;
}
.title {
  font-size: 20px;
  text-indent: 10px;
  height: 40px!important;
  line-height: 40px;
  font-weight: bold;
}
.log-con {
  max-height: 60vh;
  //overflow: auto;
  width: 100%;
  padding: .2rem;
  :deep(img) {
    width: 100%;
  }
}
</style>

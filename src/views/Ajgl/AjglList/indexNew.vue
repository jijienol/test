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
import {insertCase} from '@/api/ajJs.js'
import {detectCaseListNum} from '@/api/ajJs.js'
import {swdtStore} from '@/store/modules/swdt.js'
import {caseTypeNum} from 'src/api/ajJs.js'

const swdt = swdtStore()
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
    title: '新增案件',
    visible: false,
    close () {
      modalOpt.add.visible = false
    },
    open () {
      modalOpt.add.visible = true
    },
    callback () {
      modalOpt.add.visible = false
      page.pageNo = 1
      getDetectCaseList()
    }
  },
  report: {
    visible: false,
    param: {
      id: '',
      name: '',
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
    param: {},
    open: () => {
      modalOpt.aj.visible = true
    },
    finish: (d) => { // 刷新案件列表
      modalOpt.aj.visible = false
      console.log(1)
      getDetectCaseList()
      
    }
  }
})

const loading = ref(false)
const form = ref({
  focusLevel: '',//重点关注
  slzt: '2',//是否受理
  beginCreateDate: '', // 开始时间
  endCreateDate: '', // 结束时间
  searchKey: '', // 案件名称
  orderBy: 'desc', // 排序条件
  type: '', // 案件类别;0：网络诈骗 1：游戏诈骗 2：金融诈骗
  
})
const page = reactive({
  pageNo: 1, // 当前页
  pageSize: 10 //	每页条数
})
// 获取列表数据
let dataList = ref([])
let totals = ref()
let loadingT = ref(false)
const getDetectCaseList = () => {
  loadingT.value = true
  dataList.value = []
  totals.value = 0;
  
  detectCaseList({...form.value, ...page}).then(res => {
    // console.log(res.data.data.list)
    if (res.data.code == '200') {
      if (res.data.data) {
        let _list = res.data.data.list;
        _list.forEach(item => {
          item.createdDate = item.createdTime.split(' ')[0]
          let userIdArr = []
          let marster = []
          let others = []
          item.caseUserList.forEach(c => {
            userIdArr.push(c.userId)
            if (c.type == 1) {
              marster.push(c.userName)
            } else {
              others.push(c.userName)
            }
          })
          item._userids = userIdArr
          item._marster = marster
          item._others = others
          item._downloading = false
        })
        dataList.value = _list
        totals.value = res.data.data.total
      }
      loadingT.value = false;
    } else {
      proxy.$Message.error(res.data.message)
      loadingT.value = false
    }
  }).catch(err => {
    console.log(err);
    if (err.status == 500) {
      proxy.$Message.error('网络错误')
    }
    loadingT.value = false
  })
  
}
// 搜索案件
const handleFilter = () => {
  page.pageNo = 1
  getDetectCaseList()
}
const numList = ref(
  {
    allCaseNum: 0,
    acceptancedNum: 0,
    unAcceptanceNum: 0,
    myAcceptancedNum: 0
  }
)

async function getNum () {
  try {
    const res = await detectCaseListNum()
    if (res.data.code == 200) {
      numList.value = res.data.data
    }
  }
  catch (e) {
    console.log(e)
  }
  
}

const detectCaseTypeNum = ref([])

async function getCaseTypeNum () {
  try {
    const res = await caseTypeNum()
    if (res.data.code == 200) {
      detectCaseTypeNum.value = res.data.data
    }
  }
  catch (e) {
    console.log(e)
  }
  
}

function getNum1 (val) {
  let num
  detectCaseTypeNum.value.filter(item => {
    if (item.value == val) {
      num = item.num
    }
  })
  return num
}

onMounted(() => {
  getCaseTypeNum()
  dict.getDict('detectCaseType')
  dict.getDict('trackType')
  dict.getDict('case_focus_level')
  
  
  // form.value.currentUserId = ''
  getNum()
  getDetectCaseList()
})


//案件类型列表
const detectCaseType = computed(() => dict.dict.detectCaseType.list)
const caseFocusLevel = computed(() => dict.dict.case_focus_level.list)


// 换页
function handlePageChange (num) {
  page.pageNo = num
  console.log('换页')
  getDetectCaseList()
}


// 跳转详情页
const router = useRouter()

function open (item) {
  
  let origin = window.location.origin
  let param = aes.encrypt(JSON.stringify({caseId: item.id}))
  // 新 根据是否有主办人判断
  if (canAccept(item._userids)) {
    // console.log(param,item.id)
    window.open(origin + '/detect?param=' + param, '_blank')
    swdt.qjs = null
  } else {
    // 判断管理员
    if (permission.userInfo.roleList.includes('admin') || permission.userInfo.roleList.includes('zhongduizhang') || permission.userInfo.roleList.includes('tanzhang')) {
      window.open(origin + '/detect?param=' + param, '_blank')
      swdt.qjs = null
      
    } else if (item.sfCsal == '1') { //演示案例直接可以看
      window.open(origin + '/detect?param=' + param, '_blank')
      swdt.qjs = null
      
    } else {
      proxy.$Message.warning('请先受理案件！')
    }
  }
}

// 查看报告
function openReport (c) {
  // console.log(c)
  if (c) {
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

function delCase (id) {
  if (id) {
    confirmVisible.value = true
    delId.value = id
  } else {
    proxy.$Message.warning('只有主办人可以删除案件')
  }
  
  
}

function update (val) {
  if (val) {
    
    ajList.addInfo = val
    modalOpt.add.open()
    modalOpt.add.title = "修改案件"
  } else {
    proxy.$Message.warning('只有主办人可以修改案件')
  }
  
  
}

async function handleDel () {
  const res = await deleteCase({id: delId.value})
  if (res.data.code == 200) {
    proxy.$Message.success('删除成功')
    console.log('删除')
    await getDetectCaseList()
  } else {
    proxy.$Message.success('删除失败')
  }
}

function acceptHandler (id) {
  acceptCase({id: id}).then(res => {
    let {code, data} = res.data;
    if (code == 200) {
      proxy.$Message.success('受理成功！')
      console.log('受理')
      getDetectCaseList()
    }
  })
}

function addCall (flag) {
  tabValue.value = '0'
  tabHandler('0')
}

function titleSS (info) {
  let a = ''
  info.forEach(i => {
    a = a + i.trackTypeName + "  "
  })
  return a
}

function openVideo () {
  // let src = global.env.fileUrl + '/20230221.mp4'
  let src = 'http://39.101.70.40:6888/upload/20230221.mp4'
  // let s = previewDoc.src(src)
  // console.log(src)
  window.open(src, '_blank')
}

function caseDetail (id) {

}

const kanModal = reactive({
  caseItem: '',
  visible: false,
  title: '',
  param: {
    caseId: ''
  },
  open (c) {
    kanModal.caseItem = c
    kanModal.title = c.num + '/' + c.name + '现勘文件上传'
    kanModal.param.caseId = c.id
    kanModal.visible = true
  }
})

// 现堪文件上传回调
function xkupCall (data) {
  if (data) {
    kanModal.caseItem.sfscxk = 1
    kanModal.visible = false
    
  }
}

const exportGroup = reactive({
  loading: false,
  inModal: {
    visible: false,
  },
  inCall: (data) => {
    if (data) {
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
      if (code == 200) {
        // console.log(data);
        if (data) {
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

function canAccept (ids) { // 是否有受理的权限
  // console.log(ids)
  let a = false
  // console.log(ids,permission.userId)
  ids.some(item => {
    if (item == permission.userId) {
      a = true
    }
  })
  return a
  
}


function downloadCaseUrl (c) {
  // console.log(c);
  if (c._downloading) {
    proxy.$Message.info(c.name + '正在下载中,请等待')
    return
  } else {
    c._downloading = true;
    proxy.$Message.success('开始下载');
    exportCaseZip({caseId: c.id}).then(res => {
      // console.log(res);// /case_zip_file/f4b317c311f54c0a856eb55a72ed3ca8.zip
      let _o = res.data.data
      fileUtil.save(c.num + '_' + c.name, global.env.fileUrl + _o)
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

function downloadCase (c) { // 下载案件
  if (c._downloading) {
    proxy.$Message.info(c.name + '正在下载中,请等待')
    return
  } else {
    c._downloading = true
    proxy.$Message.success('开始下载');
    exportCaseZip({caseId: c.id}).then(res => {
      fileUtil.saveBlob(res.data, c.num + '_' + c.name + '文件' + '.zip');
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

// 关注
const levelInfo = ref({label: '未关注', value: '10'})
const typeList = ref([])

function level (val) {
  levelInfo.value = {
    label: val.label, value: val.value
  }
  form.value.focusLevel = val.value
  getDetectCaseList()
}


const open1 = ref(false)
const timeData = ref()

function handleClick () {
  
  open1.value = !open1.value
}

function handleChange (date) {
  
  timeData.value = date;
}

function handleClear () {
  open1.value = false;
}

function handleOk () {
  if (timeData.value) {
    form.value.beginCreateDate = timeData.value[0]
    form.value.endCreateDate = timeData.value[1]
  }
  open1.value = false;
}

const caseType1 = ref('')

function caseType (val) {
  form.value.type = val.value
  caseType1.value = val.label
}


function focusLevel (val) {
  if (val == 10) {
    return '未关注'
  } else if (val == 20) {
    return '低'
  } else if (val == 30) {
    return '中'
  } else if (val == 40) {
    return '高'
  }
}

function dian (val) {
  if (val == 10) {
    return 'background: rgba(0,0,0,0.1);'
  } else if (val == 20) {
    return 'background: #057AFF;'
  } else if (val == 30) {
    return 'background: #FFAC2F;'
    
  } else if (val == 40) {
    return 'background: #F56C6C;'
  }
}

async function updataLevel (type, val, n) {
  
  if (canAccept(val._userids)) {
    ajList.addInfo = val
    if (n == 1) {
      ajList.addInfo.focusLevel = Number(type)
    } else {
      ajList.addInfo.type = Number(type)
    }
    
    
  } else if (permission.userInfo.roleList.includes('admin') || permission.userInfo.roleList.includes('zhongduizhang') || permission.userInfo.roleList.includes('tanzhang')) {
    ajList.addInfo = val
    if (n == 1) {
      ajList.addInfo.focusLevel = Number(type)
    } else {
      ajList.addInfo.type = Number(type)
    }
    
  } else {
    proxy.$Message.warning('只有主办人可以修改')
    return
  }
  
  
  // console.log(type, val, n)
  ajList.addInfo = val
  if (n == 1) {
    ajList.addInfo.focusLevel = Number(type)
  } else {
    ajList.addInfo.type = Number(type)
  }
  
  
  const data = {
    num: ajList.addInfo.num,
    focusLevel: ajList.addInfo.focusLevel,
    jjdbh: ajList.addInfo.jjdbh,
    name: ajList.addInfo.name,
    type: ajList.addInfo.type ? JSON.stringify(ajList.addInfo.type) : '',
    alarmPeoplePhone: ajList.addInfo.alarmPeoplePhone, // 报警人电话
    alarmPeople: ajList.addInfo.alarmPeople, // 报警人姓名
    alarmPeopleSex: ajList.addInfo.alarmPeopleSex, // 报警人姓别
    address: ajList.addInfo.address,
    description: ajList.addInfo.description,
    bjsjDt: ajList.addInfo.bjsjDt, // 报警时间
    fasjsxDt: ajList.addInfo.fasjsxDt, // 发案时间上限
    fasjxxDt: ajList.addInfo.fasjxxDt, // 发案时间下限
    createTime: [ajList.addInfo.fasjsxDt, ajList.addInfo.fasjxxDt],
    money: ajList.addInfo.money,
    sfCsal: ajList.addInfo.sfCsal,
    caseRegistrationForm: ajList.addInfo.caseRegistrationForm,
    writtenDecisionOfCaseFiling: ajList.addInfo.writtenDecisionOfCaseFiling,
    id: ajList.addInfo.id
  }
  
  const res = await insertCase(data)
  if (res.data.code == 200) {
    proxy.$Message.success('修改成功')
    await getDetectCaseList()
  } else {
    proxy.$Message.success('修改失败')
  }
}

watch(() => form.value, (val) => {
  console.log(val)
  page.pageNo = 1
  console.log('监控')
  getDetectCaseList()
}, {
  deep: true
})
</script>

<template>
  <Layout class="ajgl-layout">
    <Header class="header">
      <!-- 查询-->
      <div class="top-search">
        
        <Dropdown class="btn active " trigger="click">
          <div class="title">
            <Icon size="24" type="md-alarm"/>
            时间排序
            <Icon size="18" style="color: #cccccc" type="md-arrow-dropdown"/>
          </div>
          <template #list>
            <DropdownMenu>
              <DropdownItem @click="form.orderBy='asc'">时间正序</DropdownItem>
              <DropdownItem @click="form.orderBy='desc'">时间倒序</DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
        
        <Dropdown :class="form.focusLevel?'active':''" class="btn " trigger="click">
          <div class="title">
            <Icon size="24" type="md-star-outline"/>
            重点关注
            <Icon size="18" style="color: #cccccc" type="md-arrow-dropdown"/>
          </div>
          <template #list>
            <DropdownMenu>
              <DropdownItem v-for="item in caseFocusLevel" @click="level(item)"><span :style="dian(item.value)" class="dian"></span>{{ item.label }}</DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
        
        
        <Dropdown :class="form.slzt?'active':''" class="btn " trigger="click">
          <div class="title">
            <Icon size="24" type="md-grid"/>
            
            所有案件
            <Icon size="18" style="color: #cccccc" type="md-arrow-dropdown"/>
          </div>
          <template #list>
            <DropdownMenu>
              <DropdownItem @click="form.slzt=''">所有案件 &nbsp;&nbsp;<span style="color: #cccccc">({{ numList.allCaseNum }})</span></DropdownItem>
              <DropdownItem @click="form.slzt='1'">已受理&nbsp;&nbsp;<span style="color: #cccccc">({{ numList.acceptancedNum }})</span></DropdownItem>
              <DropdownItem @click="form.slzt='0'">未受理&nbsp;&nbsp;<span style="color: #cccccc">({{ numList.unAcceptanceNum }})</span></DropdownItem>
              <DropdownItem style="border-left:4px solid #dc6457 ;" @click="form.slzt='2'">我的在侦&nbsp;&nbsp;<span style="color: #cccccc">({{ numList.myAcceptancedNum }})</span></DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
        
        <Dropdown :class="form.type?'active':''" class="btn " trigger="click">
          <div class="title">
            <Icon size="24" type="md-list"/>
            案件类别
            <Icon size="18" style="color: #cccccc" type="md-arrow-dropdown"/>
          </div>
          <template #list>
            <DropdownMenu>
              <DropdownItem v-for="item in detectCaseType" style="display: flex;justify-content: space-between" @click="caseType(item)">{{ item.label }} <span>({{getNum1(item.value)}})</span></DropdownItem>
            </DropdownMenu>
          </template>
        </Dropdown>
        <DatePicker
          :model-value="timeData"
          :open="open1"
          confirm
          type="daterange"
          @on-change="handleChange"
          @on-clear="handleClear"
          @on-ok="handleOk">
          <div :class="form.beginCreateDate?'active':''" class="btn " @click="handleClick">
            <div class="title">
              <Icon size="24" type="md-barcode"/>
              创建时间
              <Icon size="18" style="color: #cccccc" type="md-arrow-dropdown"/>
            </div>
          </div>
        </DatePicker>
        <div class="top-tool">
          <Input v-model="form.searchKey" enter-button placeholder="搜索案件名或编号" search @on-click="getDetectCaseList"/>
          <div class="btn-group">
            <Button v-if="!showInoutBtn || permission.userInfo.roleList.includes('admin') || permission.userInfo.roleList.includes('tanzhang')" style="margin: 10px" type="primary" @click="addAjtishi = true">+添加案件
            </Button>
            <Button v-if="showInoutBtn && (permission.userInfo.roleList.includes('admin') || permission.userInfo.roleList.includes('bananjian'))" style="margin: 10px" @click="modalOpt.aj.open">导入案件</Button>
            <Poptip
              confirm
              title="确定要导出所有未完成请求?"
              transfer
              @on-ok="exportGroup.outZip()"
              @on-cancel="() => {}">
              <Button v-if="showInoutBtn" :loading="exportGroup.loading" class="out-btn" style="margin: 10px" @click="">&nbsp;导出任务&nbsp;</Button>
            </Poptip>
            <Button v-if="showInoutBtn " :loading="exportGroup.loading" style="margin: 10px" @click="exportGroup.inZip()">&nbsp;导入结果&nbsp;</Button>
          </div>
        </div>
      </div>
      <div class="tagList">
        <div class="tag">时间排序：{{ form.orderBy == 'asc' ? '正序' : '倒序' }}
        
        </div>
        <div v-if="form.focusLevel" class="tag">重点关注：{{ form.focusLevel == 10 ? '未关注' : '' }}{{ form.focusLevel == 20 ? '低' : '' }}{{ form.focusLevel == 30 ? '中' : '' }}{{ form.focusLevel == 40 ? '高' : '' }}
          <div @click="form.focusLevel=''">X</div>
        </div>
        
        <div v-if="form.slzt" class="tag">案件：{{ form.slzt == 0 ? '未受理' : '' }}{{ form.slzt == 1 ? '已受理' : '' }}{{ form.slzt == 2 ? '我的在侦' : '' }}
          <div @click="form.slzt = ''">X</div>
        </div>
        
        <div v-if="form.type" class="tag">案件类型：{{ caseType1 }}
          <div @click="form.type=''">X</div>
        </div>
        
        <div v-if="form.beginCreateDate" class="tag">创建时间：{{ form.beginCreateDate }}—{{ form.endCreateDate }}
          <div @click="form.beginCreateDate='',form.endCreateDate = ''">X</div>
        </div>
      </div>
    </Header>
    <Content class="content">
      <div class="spaceloding" v-if="dataList.length==0" >
        <Space size="large">
        <Spin size="small" />
        <Spin />
        <Spin size="large" />
    </Space>
      </div>
      <div v-for="item in dataList" class="ajItem" @dblclick="open(item)">
        <div class="left">
          <div class="one">
            <span class="name">{{ item.name }}</span>
            <div v-if="item.state == '0'" class="tab">
              <div v-show="item.detectStatus==0" class="rightTop-tab" style="background:#CCC;">案件未受理</div>
            </div>
            <div v-else class="tab">
              <div v-show="item.detectStatus==0" class="rightTop-tab todo">线索未录入</div>
              <div v-show="item.detectStatus==1" class="rightTop-tab tofirst">已录入待初侦</div>
              <div v-show="item.detectStatus==2 || item.detectStatus == 3" class="rightTop-tab todeep">
                <p>深入侦察中</p>
              </div>
            </div>
            <div class="toolWrap">
                    <span class="icon" title="现勘录入" @click.stop="kanModal.open(item)">
                      <img v-if="item.sfscxk == 1" alt="" src="@/assets/icons/aj-xk1.png" width="22">
                      <img v-else alt="" src="@/assets/icons/aj-xk.png" width="22">
                    </span>
              
              <span class="icon" title="案件报告">
                         <img v-if="item.detectStatus == '2' || item.detectStatus == '3'" alt="" src="@/assets/icons/aj-report1.png" width="22" @click.stop="openReport(item)">
                          <img v-else alt="" src="@/assets/icons/aj-report.png" width="22" @click.stop="openReport()">
                    </span>
              <span v-if="!showInoutBtn" class="icon"><!--只有外网有导出-->
                      <Tooltip content="导出案件" placement="top-start">
                        <img alt="" src="@/assets/icons/aj-download1.png" width="22" @click.stop="downloadCaseUrl(item)">
                      </Tooltip>
                    </span>
              <span class="icon">
                      <Tooltip content="修改案件信息" placement="top-start">
                        <img v-if="canAccept(item._userids) || permission.userInfo.roleList.includes('caseAdmin')" alt="" src="@/assets/icons/update1.png" width="22" @click.prevent.stop="update(item)">
                        <img v-else alt="" src="@/assets/icons/update.png" width="22" @click.prevent.stop="update()">
                      </Tooltip>
                    </span>
              <span class="icon" title="删除案件">
                        <img v-if="canAccept(item._userids)" alt="" src="@/assets/icons/aj-delete1.png" width="22" @click.prevent.stop="delCase(item.id)">
                        <img v-else alt="" src="@/assets/icons/aj-delete.png" width="22" @click.prevent.stop="delCase()">
                    </span>
            </div>
          </div>
          <div class="two">
            <div><span class="hui">创建时间：</span>{{ item.createdTime }}</div>
            <div><span class="hui">案件编号：</span>{{ item.num }}</div>
          </div>
          <div class="three">
            <Dropdown class="btn " trigger="click" @click.stop>
              <div class="title">
                <span :style="dian(item.focusLevel)" class="dian"></span>{{ focusLevel(item.focusLevel) }}
                <Icon size="18" style="color: #cccccc" type="md-arrow-dropdown"/>
              </div>
              <template #list>
                <DropdownMenu>
                  <DropdownItem v-for="it in caseFocusLevel" @click="updataLevel(it.value,item,1)"><span :style="dian(it.value)" class="dian"></span> {{ it.label }}</DropdownItem>
                </DropdownMenu>
              </template>
            </Dropdown>
            
            <Dropdown :class="form.type?'active':''" class="btn " trigger="click" @click.stop>
              <div class="title" style="margin-left:20px">
                <Icon size="14" type="md-list"/>
                <span v-if="item.typeLabel">{{ item.typeLabel }}</span><span v-else>案件类别</span>
                <Icon size="18" style="color: #cccccc" type="md-arrow-dropdown"/>
              </div>
              <template #list>
                <DropdownMenu>
                  <DropdownItem v-for="it in detectCaseType" @click="updataLevel(it.value,item,2)">{{ it.label }}</DropdownItem>
                </DropdownMenu>
              </template>
            </Dropdown>
            <span class="hui" style="margin-left: 15px">线索数：</span>{{ item.traceNum }}
            <span class="hui" style="margin-left: 15px">任务数：</span>{{ item.taskNum }}
	          <span class="hui" style="margin-left: 15px">标定人：</span>{{ item.objectPeopleNum }}
	          <span class="hui" style="margin-left: 15px">技战法：</span>{{ item.jzfCollisionNum }}
	          <span class="hui" style="margin-left: 15px">最深研判层级：</span>{{ item.maxLevel }}
	
	          <Button v-if="item.sfCsal!='1' && !canAccept(item._userids)" class="accept" ghost type="success" @click.stop="acceptHandler(item.id)">受理</Button>
            <Button v-else class="accept" ghost type="primary" @click.stop="open(item)">深入研判</Button>
          </div>
        </div>
        <div class="right">
          <div>
            <div style="width: 200px"><span class="hui">主办人：</span><span v-for="name in  item._marster"> {{ name }} &nbsp;&nbsp;&nbsp;&nbsp;</span></div>
            <div><span v-if="item._others.length" class="hui">协办人：</span><span v-for="user in item._others">{{ user }}&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
          
          </div>
          <div>
            <div style="width: 200px"><span class="hui">单位：</span>{{ item.officeName }}</div>
            <span class="hui">线索类型：</span><span v-for="trace in item.caseTraceInfo">{{ trace.trackTypeName }}&nbsp;</span>
          </div>
          <div>
            <span class="hui">简要案情：</span>
            <Ellipsis :lines="1" :text="item.description" max-width="200" theme="dark" tooltip></Ellipsis>
          </div>
        </div>
      </div>
    </Content>
    <Footer class="footer">
      <Page :model-value="page.pageNo" :page-size="page.pageSize" :total="totals" show-elevator show-total
            @on-change="handlePageChange"/>
    </Footer>
    <Modal v-model="modalOpt.add.visible"
           :closable="false"
           :footer-hide="true"
           :mask-closable="false"
           :styles="{  width: '70%' }"
           :title="modalOpt.add.title"
           class-name="vertical-center-modal">
      <addAj :title="modalOpt.add.title" :visible="modalOpt.add.visible" @callback="modalOpt.add.callback" @cancel="modalOpt.add.close"></addAj>
      `
    </Modal>
    <Modal
      v-model="confirmVisible"
      title="删除提示"
      @on-ok="handleDel"
      @on-cancel="confirmVisible = false">
      <p style="font-size: 15px">确定删除该案件?</p>
    </Modal>
    <Modal v-model="modalOpt.report.visible" :footer-hide="true" fullscreen>
      <Report :info="modalOpt.report.param" :visible="modalOpt.report.visible" @close="modalOpt.report.close"></Report>
    </Modal>
    <Modal v-model="kanModal.visible" :footer-hide="true" :mask-closable="false" :title="kanModal.title">
      <xk-upload :caseId="kanModal.param.caseId" @upload="xkupCall"></xk-upload>
    </Modal>
    <Modal v-model="exportGroup.inModal.visible" :footer-hide="true" :mask-closable="false">
      <zip-upload @upload="exportGroup.inCall"></zip-upload>
    </Modal>
    
    <Modal v-model="modalOpt.aj.visible" :mask-closable="false" footer-hide title="导入案件">
      <div>
        <case-upload @upload="modalOpt.aj.finish"></case-upload>
      </div>
    </Modal>
    <Modal
      v-model="addAjtishi"
      :loading="loading"
      ok-text="下一步"
      title="提示"
      @on-ok="modalOpt.add.open"
    >
      <div style="height: 2rem;line-height: 2rem">
        <h2 style="text-align: center">上传《受案登记表》可以获取到简要案情</h2>
      </div>
    </Modal>
  </Layout>
</template>
<style lang="less" scoped>

:deep(.ivu-dropdown-item) {
  border-left: 4px solid #1D83FF;
}

.top-tool {
  position: absolute;
  right: 10px;
  display: flex;
  height: 30px;
  justify-content: center;
  align-items: center;
  
  .btn-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.accept {
  margin: 0 30px;
}

.dian {
  border-radius: 5px;
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
}

.vertical-center-modal {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vertical-center-modal .ivu-modal {
  top: 0;
}

.ajgl-layout {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.header {
  margin: 20px 20px 0;
  border-radius: 20px;
  height: 180px;
  background-color: #fff;
  
  .top-search {
    position: relative;
    border-bottom: 1px solid #CCC;
    padding: 24px 0;
    display: flex;
    
    .btn {
      margin: 0 10px;
      border-radius: 5px;
      line-height: 18px !important;
      padding: 5px 10px;
      cursor: pointer;
      
      .title {
        display: flex;
        align-items: center;
      }
    }
    
    .active {
      
      color: #1F5DEA;
      background: #E9EFFD;
    }
  }
  
  .tagList {
    display: flex;
    padding-top: 30px;
    
    .tag {
      margin: 0 10px;
      line-height: 18px;
      padding: 5px 10px;
      border: 1px solid #1D83FF;
      background: rgba(31, 93, 234, 0.1);
      font-size: 14px;
      border-radius: 4px 4px 4px 4px;
      display: flex;
      
      div {
        border-left: 2px solid #CCC;
        padding-left: 10px;
        margin-left: 10px;
        cursor: pointer;
      }
    }
  }
}

.content {
  height: 80vh;
  padding: 20px 30px;
  overflow-y: auto;
  
  .spaceloding{
    display: flex;
    justify-content: center;
    padding-top: 20%;
  }
  .ajItem {
    height: 120px;
    background: #FFFFFF;
    border-radius: 8px 8px 8px 8px;
    padding: 16px 24px;
    opacity: 1;
    margin-bottom: 15px;
    
    
    display: flex;
    justify-content: space-between;
    
    .hui {
      min-width: 70px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(64, 64, 64, 0.4);
      line-height: 16px;
      
    }
    
    .left {
      
      .one {
        display: flex;
        
        .name {
          font-size: 16px;
          font-weight: 400;
          color: #057AFF;
          line-height: 19px;
        }
        
        .tab {
          margin: 0 20px;
          
          .rightTop-tab {
            font-size: .14rem;
            color: #FFFFFF;
            text-align: center;
            padding: 0 8px;
            
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
        
      }
      
      .two {
        margin: 10px 0;
        display: flex;
        
        div {
          margin-right: 20px;
        }
      }
      
      .three {
      
      }
    }
    
    .right {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      line-height: 18px;
      width: 38%;
      overflow: hidden;
      
      div {
        display: flex;
        
      }
      
      .desc {
        flex: 0 1 auto;
      }
    }
  }
  
  //background-color: #fff;
}

.footer {
  height: 5vh;
  padding: 10px 20px;
  background-color: #fff;
}


</style>

<!-- 详情弹窗 模块 -->
<script setup>
import {ref, reactive, watch, computed, getCurrentInstance, nextTick, markRaw} from 'vue';
import vDrag from '@/directives/drag.js'; //拖拽指令
import {globalStore} from '@/store/modules/global.js'; //公共变量
import {ajListStore} from "@/store/modules/ajList.js";
// import {getTaskChannelGroupAbility} from '@/api/details.js';
import {storeToRefs} from "pinia";
import {getTraceById} from '@/api/trace.js'
// import offlineDetail from './basic/index.vue'
import offlineDetail from './basic/indexNew.vue'
// import drawDetail from './evidence/index.vue'
import drawDetail from './evidence/indexNew.vue'
import rightDrawer from "@/components/rightDrawer/index.vue";
import internetDetail from './internet/index.vue'
import {clientH} from "@/utils/vueuse.js";
import clip from '@/components/clipboard.vue'
import inner from './internal/index.vue'
import {noteStore} from "@/store/modules/note.js";
import {swdtStore} from "@/store/modules/swdt.js";

const swdt = swdtStore()
const note = noteStore()
const task = computed(() => swdt.history.new.node)

const clipRef = ref(null)
const compList = reactive([
  {
    type: 'inner',
    tabComp: markRaw(inner)
  },
  {
    type: 'offlineDetect',
    tabComp: markRaw(offlineDetail)
  },
  {
    type: 'internet',
    tabComp: markRaw(internetDetail)
  },
  {
    type: 'drawProof',
    tabComp: markRaw(drawDetail)
  }
])
const {proxy} = getCurrentInstance()
let g = globalStore();
const ajStore = ajListStore()
const {popupVisible} = storeToRefs(g)
const isLoading = ref(false)
const props = defineProps({
  node: {
    type: Object, //卡片数据
    default: () => {
    }
  },
  visible: {
    type: Boolean, //控制弹窗是否显示或隐藏
    default: false
  }
});

const popup = reactive({
  height: 400,
  visible: false, //控制弹窗显示或隐藏
  close: (value) => {
    popupVisible.value = false
  },
  handleFullScreen: () => { // 双击改变高度
    if (g.popupHeight <= clientH.value + 100 && g.popupHeight >= clientH.value - 100) {// 顶部
      popup.height = 400
    } else if (g.popupHeight >= 200 && g.popupHeight < clientH.value) { // 200 到顶部
      popup.height = clientH.value - 10
    } else { // < 200
      popup.height = clientH.value - 10
    }
    
    /*if(g.popupHeight >= 440 && g.popupHeight < clientH.value) {
     popup.height = clientH.value - 10;
     } else if(g.popupHeight >= clientH.value * 0.75 && g.popupHeight <= clientH.value + 50){
     popup.height = 450
     }*/
    
  }
});


watch(
  //监听详情可视区域高度变化
  () => g.popupHeight,
  (o, n) => {
    // console.log(o)
    popup.height = o == undefined ? 400 : o;
  }
);

//监听弹窗关闭事件
watch(
  () => popupVisible.value,
  n => {
    if (!n) {
      nextTick(() => {
        init();
      })
    }
  }
);
let TabDefault = [{
  name: '玄武能力',
  value: 'internet',
  show: false,
  data: ''
},
  {
    name: '线下协同',
    value: 'offlineDetect',
    show: true,
    data: ''
  },
  {
    name: '内部能力',
    value: 'inner',
    show: false,
    data: ''
  },
  {
    name: '调证能力',
    value: 'drawProof',
    show: true,
    data: ''
  }
]
const Data = reactive({
  id: '',
  active: '0', //默认展示能力
  activeName: '',
  height: 450, //弹窗默认高度设置
  tabList: [], //获取当前卡片返回能力列表
  childList: [],
  task: '',
  taskId: '',
  solutionId: '',
  traceId: computed(() => {
    return props.node ? props.node.id : ''
  }),
  comp: computed(() => {
    if (swdt.qjs) {
      
      Data.activeName = swdt.qjs.channelType
      swdt.qjs = null
      
    }
    
    let c = compList.find(o => {
      return o.type === Data.activeName
    })
    
    if (c) {
      return c.tabComp
    } else {
      return ''
    }
  }),
  handleTitleActive: (tab) => { // 能力标题切换事件
    swdt.dzmb = []
    Data.taskId = ''
    
    let obj = proxy.$lodash.find(ajStore.abilityTabList, o => {
      return o.value == tab.value
    })
    Data.id = obj.id
    
    Data.taskId = obj.data.taskId ? obj.data.taskId : ''
    Data.solutionId = obj.data.solutionId ? obj.data.solutionId : ''
    // if(Data.taskId) {
    ajStore.setDeepDetectParam({traceTaskChannelId: Data.taskId})
    // }
    // if(Data.solutionId) {
    ajStore.setDeepDetectParam({solutionId: Data.solutionId})
    // }
    nextTick(() => {
      Data.activeName = tab.value
      swdt.type12 = tab.value
    })
    
    
  }
});

// 当popup展开时，点击变更内容
watch(() => Data.traceId, (n) => {
  if (popupVisible.value) {
    if (n) init()
  }
  ;
})
watch(() => props.node, (n) => {
  
  ajStore.abilityTabList = []
  TabDefault = [{
    id: 0,
    name: '玄武能力',
    value: 'internet',
    show: false,
    data: {}
  },
    {
      id: 1,
      name: '线下协同',
      value: 'offlineDetect',
      show: true,
      data: {}
    },
    {
      id: 2,
      name: '调证能力',
      value: 'drawProof',
      show: true,
      data: {}
    }, {
      id: 3,
      name: '内部能力',
      value: 'inner',
      show: false,
      data: ''
    }]
  let taskList = n.taskList;
  
  TabDefault.forEach(tab => {
    taskList.forEach(task => {
      if (task.channelType == tab.value) {
        tab.data = task
      }
    })
  })
  // console.log(taskList);
  // 判断是否包含互联网能力,线下和调证默认都包含
  let judgeInternet = proxy.$lodash.find(taskList, o => {
    return o.channelType == 'internet'
  })
  let judgeInner = proxy.$lodash.find(taskList, o => {
    return o.channelType == 'inner'
  })
  if (!judgeInternet) {
    TabDefault[0].show = false
  } else {
    TabDefault[0].show = true
  }
  if (!judgeInner) {
    TabDefault[3].show = false
  } else {
    TabDefault[3].show = true
  }
  ajStore.abilityTabList = proxy.$lodash.filter(TabDefault, o => {
    return o.show
  })
  // console.log(ajStore.abilityTabList);
  // nextTick(() => {
  // console.log(taskList[0]);
  ajStore.setDeepDetectParam({traceTaskChannelId: taskList[0].taskId, solutionId: taskList[0].solutionId})
  
  swdt.type12 = taskList[0].channelType
  Data.activeName = taskList[0].channelType
  Data.taskId = taskList[0].taskId
  Data.solutionId = taskList[0].solutionId
  Data.id = ajStore.abilityTabList[0].id
  
  // })
})

//获取当前线索有那些能力 // getInternetAbility({traceId: id});


//初始化
function init () {
  getTraceDetail(Data.traceId)
}

function tabHandler () {
  Data.taskId = ''
  let value = Data.activeName;
  let obj = proxy.$lodash.find(ajStore.abilityTabList, o => {
    return o.value == value
  })
  Data.taskId = obj.data ? obj.data.taskId : ''
}

// 获取线索详情
function getTraceDetail (id) {
  if (!id) {
    return false
  }
  isLoading.value = true
  
  getTraceById({id: id}).then(res => {
    // console.log('traceDetail',res);
    let {code, data} = res.data
    if (code == 200) {
      if (data != null) {
        let obj = {
          traceParentId: data.parentId,
          traceGroupId: data.groupId,
          traceTraceId: data.traceId,
          trackType: data.trackType,
          trackTypeName: data.trackTypeName,
          traceName: data.name,
          id: data.id
        }
        ajStore.setDeepDetectParam(obj)
        
      }
      isLoading.value = false
      
    } else {
      proxy.$Message.error(data.message)
      isLoading.value = false
    }
  }).catch(err => {
    proxy.$Message.error(err.message)
    isLoading.value = false
  })
}

function infoCopy (v) {
  clipRef.value.copy(v.name)
}

function setVirtualIdLabel (msg) {
  if (!msg) return
  try {
    let _arr = msg ? JSON.parse(msg) : []
    // console.log(_arr);
    let obj = _arr.find(o => {
      return o.key == '所属平台'
    })
    // console.log(obj);
    return obj ? ('(' + obj.value + ')') : ''
  }
  catch {
    return ''
  }
}


//笔记
const noteNum = computed(() => swdt.history.num)
const signNum = computed(() => swdt.history.markNum)

function qwe (dzmb) {
  // console.log(dzmb)
  if (dzmb.length < 1) return
  try {
    // console.log(dzmb)
    return dzmb.some(item => item.companyName == '广东堡塔安全技术有限公司')
  }
  catch {
    return ''
  }
  
}

// const str = global.env.fileUrl.replace('upload', '') + 'xw2_dev.apk'
const str = g.env.fileUrl.replace('upload', '') + 'baoTa.xlsx'

function diao () {
  window.open(str)
}
</script>

<template>
  <div class="warp">
    <Drawer v-model="popupVisible" :height="popup.height" :mask="false" :mask-closable="false"
            class-name="warp-drawer" placement="bottom" @on-close="popup.close">
      <template #header>
        <div class="header-view">
          <div v-drag="{ name: '.ivu-drawer.ivu-drawer-bottom' }" class="mask" title="拖拽放大，右键关闭" @dblclick="popup.handleFullScreen" @contextmenu.prevent="popup.close">
          </div>
          <div class="header-view-body">
            <div v-if="props.node" :title="props.node.label" class="header-view-body-title">{{ props.node.label }}{{ setVirtualIdLabel(props.node.msg) }}
              <Button v-if="qwe(swdt.dzmb)" style="margin-left: 10px" type="primary" @click="diao">下载堡塔模板</Button>
            </div>
            
            <div class="header-view-body-tab">
              <div class="tab-warp">
                
                <template v-for="(tab, index) in ajStore.abilityTabList" :key="index">
                  <span v-show="tab.show" :class="Data.activeName == tab.value ? 'tab-active' : ''" class="tab-item"
                        @click="Data.handleTitleActive(tab)">{{ tab.name }}</span>
                </template>
              </div>
            </div>
            <div class="header-view-body-right">
              <Button @click="note.openSign('kapian',task.data.data.caseId,task.data.data.id)">标定 {{ signNum }}</Button>
              <Button @click="note.openList(task.data.data,'xs')">笔记 {{ noteNum }}</Button>
              <!--                            <Button @click="swdt.fileNode.visible = true" >技战法 {{ noteNum }}</Button>-->
            </div>
          </div>
        </div>
      </template>
      <div v-if="popupVisible" class="">
        <div style="">
          <component :is="Data.comp" :id="Data.id" :solutionId="Data.solutionId" :task="task.data.data" :taskId="Data.taskId" :traceId="Data.traceId" :type="Data.activeName"></component>
        </div>
        <Spin :show="isLoading" fix></Spin>
      </div>
    </Drawer>
    <rightDrawer/>
    <clip ref="clipRef"></clip>
  </div>
</template>

<style lang="less" scoped>
:deep(.ivu-table td) {
  &.EXTEND {
    background-color: #edf7fb;
    
  }
}

:deep(.ivu-drawer-header) {
  user-select: initial;
  padding: 0;
}

.header-view {
  position: relative;
  height: 38px;
  
  .mask {
    width: 100px;
    //height: 40px;
    border-bottom: 40px solid black;
    border-right: 16px solid transparent;
    border-left: 16px solid transparent;
    margin: 0 auto;
    position: relative;
    top: -34px;
    cursor: pointer;
    
    &:hover {
      .mask-left, .mask-right {
        visibility: visible;
      }
    }
    
    &:after {
      content: '';
      height: 2px;
      width: 35px;
      background-color: white;
      position: absolute;
      transform: translate(50%, 50%);
      top: 10px;
      left: 0;
    }
    
    &:before {
      content: '';
      height: 2px;
      width: 35px;
      background-color: white;
      position: absolute;
      transform: translate(50%, 50%);
      top: 26px;
      left: 0;
    }
    
    .mask-left {
      position: absolute;
      left: -40px;
      height: 40px;
      width: 30px;
      //border: 1px solid #999;
      background-color: transparent;
      color: #555;
      text-align: center;
      padding-top: 10px;
      visibility: hidden;
      
      .ivu-icon {
        border: 1px solid #999;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        border-radius: 50%;
      }
    }
    
    .mask-right {
      position: absolute;
      right: -40px;
      height: 40px;
      width: 30px;
      background-color: transparent;
      color: #555;
      text-align: center;
      padding-top: 10px;
      visibility: hidden;
      
      .ivu-icon {
        border: 1px solid #999;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        border-radius: 50%;
      }
    }
  }
  
  .header-view-body {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    //display: flex;
    //height: 100%;
    //background-color: #eee;
    padding-top: 10px;
    //transform: translateY(-20px);
    .header-view-body-right {
      display: flex;
      justify-content: space-around;
      position: absolute;
      right: 30px;
      top: 4px;
      //background: #1D83FF;
      height: 30px;
      //line-height: 30px;
      //width: 200px;
      div {
        padding: 10px;
        border: 1px solid #1D83FF;
      }
    }
    
    .header-view-body-title {
      position: absolute;
      left: 0;
      top: 4px;
      z-index: 1000;
      font-size: 15px;
      max-width: 500px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    /*.header-view-body-tab {
      display: flex;
      justify-content: center;
    }*/
    
    .header-view-body-tab {
      //flex: 1;
      position: relative;
      //display: inline-block;
      margin: 0 auto;
      
      .tab-warp {
        height: 100%;
        display: flex;
        justify-content: center;
        
        .tab-item {
          padding: 0 35px;
          cursor: pointer;
        }
        
        .tab-active {
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 2px;
            background-color: #1d83ff;
            bottom: -14px;
            left: 0;
            animation: animationColor 500ms linear;
          }
        }
      }
    }
  }
}

//过渡动画展示 animationColor
@keyframes animationColor {
  0% {
    background-color: white;
    width: 0;
  }
  100% {
    background-color: #1d83ff;
    width: 100%;
  }
}

:deep(.ivu-tabs-tab) {
  padding: 0 16px 8px;
}

:deep(.ivu-tabs-bar) {
  border-bottom: none;
}

:deep(.ivu-select-dropdown) {
  height: auto;
}
</style>

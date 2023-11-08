<script setup="">
  import {ref, reactive, markRaw, computed, onMounted, watch, nextTick} from "vue";
  import {dictStore} from "@/store/modules/dictionary.js";
  import {ajListStore} from "@/store/modules/ajList.js";
  import {globalStore} from "@/store/modules/global.js";
  import {permissionStore} from "@/store/modules/permission.js";
  import {getAllTrackTypeNum} from "@/api/ajJs.js";
  import {createPlTask} from "@/api/trace.js";
  import {storeToRefs} from "pinia";
  import {useRouter} from "vue-router";
  import compApk from '@/views/Detect/components/addTrace/apk.vue'
  import compUrl from '@/views/Detect/components/addTrace/url.vue'
  import compPhone from '@/views/Detect/components/addTrace/phone.vue'
  import compMac from '@/views/Detect/components/addTrace/mac.vue'
  import compIp from '@/views/Detect/components/addTrace/ip.vue'
  import compVirtual from '@/views/Detect/components/addTrace/virtualid.vue'
  import compIdcard from '@/views/Detect/components/addTrace/idcard.vue'
  import compEwallet from '@/views/Detect/components/addTrace/ewallet.vue'
  import compBankcard from '@/views/Detect/components/addTrace/bankcard.vue'
  import compOfflineTask from '@/views/Detect/components/addTrace/offlineTask.vue'
  import bilu from '@/components/bl/bl.vue'
  import traceList from './traceList.vue'
  import {resetRouter} from "@/router/index.js";
  import $Message from "@/utils/message.js";
  const compList = reactive([
    {
      type:'apk',
      tabComp: markRaw(compApk)
    },
    {
      type:'url',
      tabComp: markRaw(compUrl)
    },{
      type:'phone',
      tabComp: markRaw(compPhone)
    },{
      type:'wifi',
      tabComp: markRaw(compMac)
    },{
      type:'ip',
      tabComp: markRaw(compIp)
    },{
      type:'virtualId',
      tabComp: markRaw(compVirtual)
    },
    {
      type: 'idcard',
      tabComp: markRaw(compIdcard)
    },
    {
      type: 'ewallet',
      tabComp: markRaw(compEwallet)
    },
    {
      type: 'bankCard',
      tabComp: markRaw(compBankcard)
    },
    {
      type: 'offlineTask',
      tabComp: markRaw(compOfflineTask)
    }
  ])
  const router = useRouter()
  const dict = dictStore()
  const ajStore = ajListStore()
  const global = globalStore()
  const permission = permissionStore()
  let {traceTypeOptions, traceTypeTabs, caseInfo} = storeToRefs(ajStore)
  const submitLoading = ref(false)
  const traceCount = computed(() => {
    return  listRef.value ? listRef.value.count : 0
  })
  const colSpan = computed(() => {
  // console.log(traceCount.value);
  // console.log(ajStore.caseInfo.detectStatus);
  if(ajStore.caseInfo.detectStatus==1 && traceCount.value == 0)  {
    return false
  } else {
    return true
  }
  // return ajStore.caseInfo.detectStatus != 0 ? true : false
  // return traceCount.value > 0 ? true : false
})
  const listRef = ref(null)
  const curType = ref('')
  const traceTypeOptionsSX = computed(()=> traceTypeOptions.value.filter(item=>(item.value!='imsi' && item.value != 'imei'))) // 筛选后的
  const traceType = reactive({
    selected: '',
    list: computed(() => {
      return [{key: 'all',value:'all', label:'全部类型'}, ...traceTypeOptionsSX.value]
    }),//
    comp: ''
    /*comp: computed(() => {
      let c = compList.find(o => {
        return o.type === tabData.selected
      })
      if(c) {
        return c.tabComp
      } else {
        return ''
      }
    })*/
  })
  const tabData = reactive({
    selected: 'apk',
    list: traceTypeTabs
  })
watch(() => traceType.selected, (n) => {
  // alert(n);
  nextTick(() => {
    // curType.value = n == 'all' ? '' : n
    // listRef.value.Data.list = []
    // listRef.value.getData(curType.value)
  })

}, {immediate: false})
watch(() =>tabData.selected, (n) => {
  // console.log(n);
  nextTick(() => {
    let c = compList.find(o => {
      return o.type === tabData.selected
    })
    // return c.tabComp
    traceType.comp = c.tabComp
  })
}, {immediate: true})

  function typeChange(sel) {
    // console.log('typeChange', sel);
    curType.value = sel.value == 'all' ? '' : sel.value
    // refreshList()
  }
  function tabClick(tab) {
    // console.log('tabClick',tab);
  }

  function getTraceType() {
    let param = {
      id: ajStore.caseInfo.id,
      property: 'show'
    }
    getAllTrackTypeNum(param).then(res => {
        let {code, data} = res.data
      // console.log(data)
        if(code == 200) {
          let traceTypeList = []

          data.forEach((p) => {
            p.children.forEach(c => {
              traceTypeList.push(c)
            })
          })
          ajStore.setTraceTypeList(traceTypeList)
        }
    })
  }
  // 添加笔录
  function addBl() {
    modalBl.visible = !modalBl.visible
    global.setBlShow(modalBl.visible)
  }

  // 一键初侦
  function createTask() {
    let list = listRef.value.Data.yjcz
    // return false
    if(list.length == 0) {
      $Message.warning('请先添加线索！')
    } else {
      let traceIdArr = []
      let traceIds = ''
      list.forEach(item => {
        traceIdArr.push(item.id)
      })
      traceIds = traceIdArr.join(',')
      let param = {
        caseId: caseInfo.value.id,
        caseNo: caseInfo.value.num,
        caseName: caseInfo.value.name,
        caseAmount: caseInfo.value.money,
        // caseNo: caseNo,
        // traceIds: traceIds,
        ids: traceIds,
        token: permission.token
      }
      submitLoading.value = true
      createPlTask(param).then(res => {
        let {code, data} = res.data;
        if(code == 200) {
          // console.log(data);
          $Message.success('成功！')
          submitLoading.value = false
          // 刷新列表
          refreshList(true)
          ajStore.getCaseInfo()
        } else {
          console.log('else',data);
          submitLoading.value = false

        }
      }).catch(err => {
        console.log(err);
        $Message.error(err.data.message)
        submitLoading.value = false

      })
    }
  }
  if(tabData.list.length == 0) {
    getTraceType()
  }
  function goback() {
    if(permission.cantDeep) {
      $Message.error('请在内网进行深入侦查！')
    } else {
      router.push('/swdt')
    }
  }
  const modalBl = reactive({
    visible: false,
  })
  function refreshList(flag) {
    if(flag) {
      // tra
      // ceType.selected = 'all'
      if(curType.value != '') {
        curType.value = ''
      } else {
        if(listRef.value) listRef.value.getData()
      }


    } else {
      if(listRef.value) listRef.value.getData()
    }
  }
  
  const flag = ref(false)
  onMounted(() => {
    // traceType.selected = 'all'
    //   listRef.value.getData()
    console.log(12312)
    getTraceType()
  
  })

</script>
<template>
<Layout class="layout">
  <Header class="layout-header">
<!--    <Row><span class="back" @click="goback()"><Icon type="md-arrow-back" size="20"/>&nbsp;初侦初查</span></Row>-->
    <Row :gutter="40">
      <Col span="7" class="header-left">
          <div class="search-area">
            <span class="hr-title">已添加线索（{{traceCount}}）</span>
            <Select v-model="traceType.selected" style="width:150px" @on-select="typeChange">
<!--              <Option :value="''" :key="'all'">全部类型</Option>-->
              <Option v-for="item in traceType.list" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </div>
          <Button class="submit-btn" type="primary" ghost @click="createTask()" :loading="submitLoading">一键初侦</Button>
      </Col>
      <Col span="17" class="header-right">
        <div class="hr-title"><p v-if="!flag">线索录入</p></div>
        <div>
          <Button @click="flag=!flag"  class="submit-btn" type="primary" ghost  style="margin-right: .1rem">{{flag?'添加线索':'展开线索列表'}}</Button>
          <Button @click="addBl()"><Icon class="icon"  color="#1D83FF" type="md-list-box"/>&nbsp;添加笔录</Button>
        </div>
      </Col>
    </Row>
  </Header>
  <Content class="layout-content">
    <Row v-if="!flag" style="height: 100%" :gutter="40">
      <Col span="7" style="height: 100%;">
        <div class="trace-wrap">
          <trace-list ref="listRef" :track-type="curType"></trace-list>
        </div>
      </Col>
      <Col :span="17">
        <div class="content-right">
          <Tabs v-model="tabData.selected" @on-click="tabClick">
            <TabPane v-for="(item, index) in tabData.list" :key="index" :label="item.label"
                     :name="item.value"
                     :disabled="item.disabled"></TabPane>
          </Tabs>
          <div style="height: 95%">
            <KeepAlive>
              <component :is="traceType.comp" @callback="refreshList"></component>

            </KeepAlive>
          </div>
        </div>
      </Col>
    </Row>
    <Row v-else style="height: 100%" :gutter="40">
      <Col span="24">
      <div class="trace-wrap">
        <trace-list ref="listRef" :track-type="curType" :flag="flag"></trace-list>
      </div>
      </Col>
    </Row>
  </Content>
  <Drawer title="笔录文件" placement="left" :closable="true" v-model="global.blDrawer" :mask="false" width="38%">
    <div style="height:100%;"><bilu :visible="global.blDrawer"></bilu></div>
  </Drawer>
</Layout>
</template>
<style scoped lang="less">
.layout {
  position: relative;
  height: 100%;
  background-color: #ECEEF3;
  padding: 20px 30px;
}
.layout-header {
  height: 80px;
  padding: 0;
  background-color: #ECEEF3;
  line-height: initial;
  .back {
    font-size: 18px;
    color: rgba(13, 38, 63, 1);
    cursor: pointer;
    margin-bottom: 5px;
    line-height: 20px;
    &:hover {
      color: #1D83FF;
    }
  }
}
.header-left {
  display: flex;
  //padding: 8px 0;
  .search-area {
    flex: 1;
  }
  .submit-btn {
    flex: 0 0 80px;
  }
}
.header-right {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .hr-title {
    font-size: 15px;
    color: #333;
  }
}
.layout-content {
  height: 100%;
  overflow: hidden;
  .content-right {
    background-color: #fff;
    padding: 20px;height: 100%;
    border-radius: 8px;
  }
  .trace-wrap {
    height: 100%;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      width: 10px!important;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 4px!important;
      background: rgba(153, 153, 153, 0.5);
      /* -webkit-box-shadow: inset006pxrgba(0, 0, 0, 0.5); */
    }
  }
}
</style>

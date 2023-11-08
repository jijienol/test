<script setup>
import {ref, onBeforeMount, onMounted} from "vue";
import sider from './components/sider.vue'
import {permissionStore} from "@/store/modules/permission.js";
import {dictStore} from "@/store/modules/dictionary.js";
import {ajListStore} from '@/store/modules/ajList.js'
import aes from "@/libs/aes.js";
import {getUrlData} from "@/utils/parseUrl.js";
import {detectCaseDetail, getAllTrackTypeNum} from '@/api/ajJs.js'
import {globalStore} from "@/store/modules/global.js";
import {storeToRefs} from "pinia";
import {swdtStore} from '@/store/modules/swdt.js'

// import {noteStore} from "@/store/modules/note.js";
import {useRouter} from "vue-router";
// import rightDrawer from "@/components/rightDrawer/index.vue";
// import {swdtStore} from "@/store/modules/swdt.js";
import AddSign from "@/components/sign/components/addSign/index.vue";
import $Message from "@/utils/message.js";
// import {changeIconTitle} from "../../main.js";
const swdt = swdtStore()
// const note = noteStore()
const enter = () => { // 解析url并返回案件id
  let str = window.location.search
  if (str && str.length > 1) {
    let urlData = getUrlData(str)
    const paramde = aes.decrypt(urlData.param)
    let param = JSON.parse(paramde)
    // console.log(urlData,param,paramde)
    if (urlData.traceId) {
      swdt.qjs = {
        traceId: urlData.traceId,
        channelType: urlData.channelType
      }
    } else {
      swdt.qjs = null
    }
    
    
    if (param.caseId) {
      return param.caseId
    } else {
      return false
    }
  } else {
    return false
  }
  
}

const isVisible = ref(false) // 页面加载
const dict = dictStore()
const permission = permissionStore()
const ajStore = ajListStore()
const global = globalStore()
let {detectSideCollapse} = storeToRefs(global)
const {userInfo} = storeToRefs(permission)
// console.log(dict);
const router = useRouter()

function getCaseInfo (id) {
  return new Promise((resolve, reject) => {
    detectCaseDetail({id: id}).then(res => {
      let {code, data} = res.data;
      if (code == 200) {
        console.log(data.hasXk);
        if (data.delFlag == 1) { //被删除
          $Message.warning('该案件已被删除!')
          resolve(false)
        } else {
          let info = {
            id: id,
            name: data.name,
            num: data.num,
            money: data.money,
            typeLabel: data.typeLabel,
            description: data.description,
            address: data.address,
            alarmPeople: data.alarmPeople,
            bjsjDt: data.bjsjDt,
            fasjsxDt: data.fasjsxDt,
            fasjxxDt: data.fasjxxDt,
            officeName: data.officeName,
            hostName: data.hostName,
            hostNo: data.hostNo,
            alarmPeoplePhone: data.alarmPeoplePhone,
            detectStatus: data.detectStatus,
            traceMap: [],
            countCaseScore: data.countCaseScore,
            scoreList: data.scoreList,
            sfscxk: data.sfscxk,
            sfscbl: data.sfscbl,
            hasXk: data.hasXk,
            returnVisitNum: data.returnVisitNum,
            caseFileList: data.caseFileList,
            caseUserList: data.caseUserList,
            writtenDecisionOfCaseFiling: data.writtenDecisionOfCaseFiling,
            caseRegistrationForm: data.caseRegistrationForm
            
          }
          let traceMap = data.firstDetectMap
          if (traceMap.length > 0) {
            let arr = []
            traceMap.forEach(t => {
              for (let key in t) {
                arr.push({label: key, num: t[key]})
              }
            })
            info.traceMap = arr
          }
          ajStore.setCaseInfo(info)
          global.setDetectState()
          resolve(true)
        }
        
      } else {
        resolve(false)
      }
    }).catch((err) => {
      // code: 500, data: '', message: '请求超时'
      // console.log(err);
      if (err.code == 500) {
        $Message.warning('页面失效，请重新登录')
      } else {
        console.log(err);
        $Message.warning(err.message)
      }
      reject(false)
    })
  })
  
}

onBeforeMount(() => {
  
  
  //浏览器logo
  // changeIconTitle(userInfo.value.logo)
  // swdt.getTabNums(ajStore.caseId)
  let isDetect = global.isDetect;
  if (isDetect) {// 处在侦查页，刷新保留路由
    let canEnter = enter();
    if (canEnter && canEnter != ajStore.caseId) {
      getCaseInfo(canEnter).then(flag => {
        if (flag) {
          isVisible.value = true
          if (ajStore.caseInfo.detectStatus == '2' || ajStore.caseInfo.detectStatus == '3') {
            router.push('/swdt')
          } else {
            router.push('/czcc')
          }
        } else {
          router.replace('/login')
        }
        
      }).catch(() => {
        
        router.replace('/login')
      })
    } else {
      getCaseInfo(ajStore.caseId).then(flag => {
        if (flag) {
          isVisible.value = true
          if (ajStore.caseInfo.detectStatus == '2' || ajStore.caseInfo.detectStatus == '3') {
            router.push('/swdt')
            
          } else {
            router.push('/czcc')
          }
        } else {
          // console.log(res);
          router.replace('/login')
        }
        
      }).catch(() => {
        $Message.warning('页面失效，请重新登录')
        router.replace('/login')
      })
    }
    
    
  } else {
    let canEnter = enter();
    let hasPerm = permission.init() // 从本地读权限
    
    if (canEnter && hasPerm) {
      dict.init()
      isVisible.value = true
      getCaseInfo(canEnter).then(flag => {
        if (flag) {
          getTraceType(canEnter)
          if (ajStore.caseInfo.detectStatus == '2' || ajStore.caseInfo.detectStatus == '3') {
            router.push('/swdt')
          } else {
            router.push('/czcc')
          }
          
        } else {
          $Message.warning('页面失效，请重新登录')
          router.replace('/login')
        }
      }).catch(() => {
        $Message.warning('页面失效，请重新登录')
        router.replace('/login')
      })
      
    } else {
      $Message.warning('页面失效，请重新登录')
      router.replace('/login')
    }
  }
  
})

function getTraceType (id) {
  let param = {
    id: id,
    property: 'show'
  }
  getAllTrackTypeNum(param).then(res => {
    let {code, data} = res.data
    
    if (code == 200) {
      let traceTypeList = []
      
      data.forEach((p) => {
        p.children.forEach(c => {
          traceTypeList.push(c)
        })
      })
      // traceType.list = traceTypeList
      ajStore.setTraceTypeList(traceTypeList)
    }
  })
}


</script>
<template>
  <Layout v-if="isVisible" class="layout">
    <Sider v-model="detectSideCollapse" :collapsed-width="0" class="layout-sider" collapsible hide-trigger width="280">
      <sider></sider>
      <div class="colla" @click="detectSideCollapse = !detectSideCollapse">
        <Icon v-if="!detectSideCollapse" size="16" type="ios-arrow-back"/>
        <Icon v-else size="16" type="ios-arrow-forward"/>
      </div>
    </Sider>
    <Layout>
      <router-view></router-view>
    </Layout>
  </Layout>
  <div v-else class="demo-spin-container">
    <Spin :show="!isVisible" fix></Spin>
  </div>
  <!--  <rightDrawer/>-->
  <add-sign/>
</template>
<style lang="less" scoped>
.demo-spin-container {
  height: 100%;
  
}

.layout {
  height: 100%;
}

.layout-sider {
  position: relative;
  
  .colla {
    position: absolute;
    right: -22px;
    top: 45%;
    width: 22px;
    height: 69px;
    background: #FFFFFF;
    opacity: 1;
    border: 1px solid rgba(24, 31, 67, 0.12);
    cursor: pointer;
    display: flex;
    align-items: center;
    z-index: 100;
  }
}

</style>

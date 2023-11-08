<script setup>
import {ref, reactive, computed, onMounted, nextTick, watch} from "vue";
import {download} from "@/api/swdt.js";
import {storeToRefs} from "pinia";
import {ajListStore} from "@/store/modules/ajList.js";
import myTag from '@/components/tag.vue'
import {useRouter} from "vue-router";
import blPreview from '@/components/bl/bl.vue'
import xkPreview from '@/components/bl/xk.vue'
import liAnPreview from '@/components/bl/liAn_preview.vue'
import shouAnPreview from '@/components/bl/shouAn_preview.vue'

import bookPreview from '@/components/bl/book_preview.vue'
import Report from '@/components/report/index.vue';
import {swdtStore} from "@/store/modules/swdt.js";
// import {clientH} from "@/utils/vueuse.js";
import $Message from "@/utils/message.js";
import reportIcon from '@/assets/images/report1.png'
// import {permissionStore} from "@/store/modules/permission.js";
// import {Modal} from "view-ui-plus";
import axios from "axios";
import {globalStore} from "@/store/modules/global.js";
import {batchInsertCaseUser, caseTurnOver, exitCase, getUserListBySn} from "../../../api/ajJs.js";
import {permissionStore} from "@/store/modules/permission.js";
import {cloneDeep} from "lodash";
import { Modal} from "view-ui-plus";
// const permission = permissionStore()
const czbg = ref(false) //初侦初查报告
const ajStore = ajListStore()
let global = globalStore();
let permission = permissionStore()
const router = useRouter()
const {caseInfo} = storeToRefs(ajStore)
const {userInfo} = storeToRefs(permission)
const {popupVisible} = storeToRefs(global)
const swdt = swdtStore()
const {tabNums} = storeToRefs(swdt)
const collapseIndex = ref(1)
const type = ref('')
const Data = reactive({ // null 录线索
  curStep: computed(() => {
    if(caseInfo.value.detectStatus == '2' || caseInfo.value.detectStatus == '3') {
      return 2
    } else if(caseInfo.value.detectStatus == '1') {
      return 0
    } else { // 0
      return null
    }
  }),
  issfscxk: computed(() => {
    // console.log(caseInfo.value.sfscxk);
    return caseInfo.value.sfscxk == 1 ? true : false
  }),
  traceCount:computed(() => {
    return caseInfo.value.traceMap.length
  }),
  signCount:computed(() => {
    return [
        {label: '人', num: tabNums.value.peopleCount || 0, color: '#F25858' },
        {label: '物', num: tabNums.value.objectCount || 0, color: '#FE9830' },
        // {label: '地', num: tabNums.value.addressCount || 0, color: '#2F8CFF' },
        // {label: '组织', num: tabNums.value.orgCount || 0, color: '#30AF45' },
    ]
  }),
  scoreCount: computed(() => {
    if(caseInfo.value.countCaseScore) {
      return [
        {label: '高', num: caseInfo.value.countCaseScore.highNum, color:'#F25858'},
        {label: '中', num: caseInfo.value.countCaseScore.mediumNum, color:'#FE9830'},
        {label: '低', num: caseInfo.value.countCaseScore.lowNum, color:'#2F8CFF'},
      ]
    } else {
      return []
    }

  })
})
// 跳转初祯
function gotoCzcc() {
  router.push('/czcc')
  popupVisible.value = false

}

//跳转深入侦查
function gotoDeep() {
  if(permission.cantDeep) {
    $Message.error('请在内网进行深入侦查')
  } else {
    router.push('/swdt')

  }
}
//跳转到调查表
function gotoQuestionnaire(){
  router.push('/questionnaire')
}
// 打开报告
const modalOpt = reactive({
  visible: false,
  param: {

  },
  close: () => {
    modalOpt.visible = false
  }
})
// 初侦报告
const pandaun = ()=>{
  let val = true
  swdt.treeData.children.forEach(siliu=>{
    siliu.children.forEach(firstDetect=>{
      firstDetect.taskList.some(item=>{
        if(item.channelType == "internet" ){
          if(item.status == 0){
            val = false
          }
        }
      })
    })
  })
  return val
}


watch(()=>swdt.treeData,(val)=>{
 
 if(val) czbg.value = pandaun()
})
function openFirstReport() {
  if( pandaun()){
    modalOpt.visible = true
  }else {
    $Message.warning('报告还在生成中')
  }

  //
}
// 研判报告
function openSecondReport() {
  $Message.warning('暂未开放')
}
// 一案一档
function openTotalReport() {
  $Message.warning('暂未开放')
}
// 主办人协办人

function host(val){
  return val.filter(item => item.type==1)
}
function synergy(val){
  return val.filter(item => item.type==0)
}
const modalBl = reactive({
  visible: false,
  type: '',
  title: '',
  open(t) {
    if(t == 'bl') {
      modalBl.title = '笔录'
    } else if(t == 'xk') {
      modalBl.title = '现勘'
    } else if(t == 'shouAn') {
      modalBl.title = '受案登记表'
    } else if(t == 'liAn') {
      modalBl.title = '受立案文书'
    }else {
      modalBl.title = '报告'
  
    }
    modalBl.type = t
    modalBl.visible = true
  },
  openKan() {
    $Message.warning('暂未开放')
  }
})

const drawerOpt = reactive({
  bl: {
    width: '42%',
    iscolla: false,
    toggleWidth() {
      drawerOpt.bl.iscolla = !drawerOpt.bl.iscolla
      drawerOpt.bl.width = drawerOpt.bl.iscolla ? '100%' : '42%'
    }
  }
})

const userList = ref([])
const sourceId = ref('')
const caseUserList = ref([])
const target = ref([])
const targetId = ref(null)
const getUserList = async ()=>{

  const res = await getUserListBySn()
  let list =  res.data.data
  for (let key in list ) {
    list[key].forEach(item => {
      if (caseInfo.value.caseUserList.filter(val => val.type == modalUserOpt.value.num).some(val => val.userId == item.id)) {
        caseUserList.value.push(item.username?item.username:item.userName)
        if (modalUserOpt.value.num == 1) {
          sourceId.value = item.id
          target.value = item.username?item.username:item.userName
        }
      }
    })
  }
  userList.value = res.data.data
}
//退出案件
async function exit() {
  try {
  await Modal.confirm({
      title: '确认退出案件',
      content: '您确定要退出案件吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const res = await exitCase(caseInfo.value.id);
        if (res.data.code === 200) {
          $Message.success('退出成功');
  
          router.replace('/aj');
        } else {
          $Message.warning('退出失败');
        }
      },
      onCancel: () => {
        $Message.info('已取消退出案件');
      }
    });
  } catch (e) {
    console.log(e);
  }
}
// 管理协办人
const modalUserOpt = ref({
  visible:false,
  num:1
})
function update(val){
  modalUserOpt.value.visible = true
  caseUserList.value = []
  targetId.value = null
  
  if(val){
    modalUserOpt.value.title = '协办人管理'
    modalUserOpt.value.num = 0
  }else {
    modalUserOpt.value.title = '移交案件'
    modalUserOpt.value.num = 1
  }
  getUserList()
}
//提交
async function Submitrole(){
  let caseUserL = []
  caseUserList.value.forEach(item=>{
    for (let key in userList.value ){
      userList.value[key].forEach(val =>{
        if(val.username==item){
  
          console.log(val)
          caseUserL.push({
            "type":modalUserOpt.value.num,
            "userId":val.id,
            "userName":val.username,
            "officeId":val.officeId,
            "status":"0"
          })
        }
      })
    }
  })
  if(modalUserOpt.value.num==1){
    if(!targetId.value){
      $Message.warning('请选择移交对象')
      return
    }else {
      caseTurnOver({caseId:caseInfo.value.id,targetId:targetId.value,sourceId:sourceId.value}).then( res =>{
        if(res.data.code==200){
          $Message.success('移交成功')
          router.replace('/aj')
        }else {
          $Message.success(res.data.message)
        }
      }).catch((err) => {
        $Message.error('移交失败')
      })
    }
    console.log(target.value)
  }else if(modalUserOpt.value.num==0){
    caseInfo.value.caseUserList.filter(item => item.type == 1).forEach(val=>{
      console.log(val)
        caseUserL.push({
          "type":1,
          "userId":val.userId,
          "userName":val.userName,
          "officeId":val.officeId,
          "status":"0"
        })
      }
    )
    const res = await batchInsertCaseUser({caseId:caseInfo.value.id,caseUserList:caseUserL})
    if(res.data.code==200){
      $Message.success('修改协办人成功')
      modalUserOpt.value.visible = false
      ajStore.getCaseInfo()
    }
  }

}
function show1(){
  return caseInfo.value.caseUserList.filter(item => item.type == 1).some(item=>item.userName==userInfo.value.username)
}

function changeTarget(value){
    for (let key in userList.value ){
      userList.value[key].forEach(val =>{
        if(val.username==target.value){
          targetId.value = val.id
        }
      })
    }
  console.log(sourceId.value)
}

</script>
<template>
  <Layout class="layout">
    <Header class="header">
      <div class="title">
<!--        案件名称-->
        <div class="case-name">
          {{caseInfo.name}}
        </div>
<!--        案件编号-->
        <div class="case-no">
          {{caseInfo.num}}
        </div>
<!--        案件类型-->
        <div v-if="caseInfo.typeLabel" class="case-type">
          {{caseInfo.typeLabel}}
        </div>
      </div>
    </Header>
    <Content class="main-content left-wrap">
      <Collapse v-model="collapseIndex" accordion class="collapse-wrap">
        <Panel name="1" class="colla-panel">
          侦办进度
          <template #content>
            <div class="steps-wrap">
              <Steps :current="Data.curStep" direction="vertical">
                <Step :class="{'stepActive': Data.curStep}">
                 <template #icon>
                   <div class="step-icon">
                     <Icon type="ios-search-outline" />
                   </div>
                 </template>
                  <template #title>
                    <p class="step-title has-icon" @click="modalBl.open('xk')">现勘录入<Icon class="icon" type="md-arrow-forward" /></p>

                  </template>
                  <template #content>
                    <div class="steps-con">
                      <div class="step-sub-title"></div>
                      <div class="step-sub-con kan">
                        <div class="report" @click="modalBl.open('bl')">
                          <Icon class="icon" type="md-list-box" :color="caseInfo.sfscbl == 1 ? '#3F86FF': '#999'" size="30"/>
                          <br>笔录
                      </div>
                  <div class="report"  @click="modalBl.open('liAn')">
                          <Icon class="icon iconfont icon-chakanjiexi" :color="caseInfo.caseRegistrationForm ? '#3F86FF': '#999'" size="30" />
                          <br>立案书
                        </div>
                      </div>
                    </div>
                    <div class="steps-con">
                      <div class="step-sub-title"></div>
                      <div class="step-sub-con kan">
                        <div class="report" @click="modalBl.open('xk')">
                          <Icon class="icon" type="md-list-box" :color="caseInfo.hasXk ? '#3F86FF': '#999'" size="30"/>
                          <br>现勘
                        </div>
                        <div class="report"  @click="modalBl.open('shouAn')">
                          <Icon class="icon iconfont icon-chakanjiexi" :color="caseInfo.writtenDecisionOfCaseFiling ? '#3F86FF': '#999'" size="30" />
                          <br>受案表
                        </div>
                        <div class="report" v-if="permission.isCnfj" @click="modalBl.open('qt')">
                          <Icon class="icon iconfont icon-chakanjiexi" :color="caseInfo.caseFileList.length ? '#3F86FF': '#999'" size="30"/>
                          <br>报告附件
                        </div>
                      </div>
                    </div>
<!--                    <div class="steps-con">-->
<!--                    <div class="step-sub-title"></div>-->
<!--                    <div class="step-sub-con kan">-->
<!--                      <div class="report" @click="gotoQuestionnaire()">-->
<!--                        <Icon class="icon" type="md-list-box" :color="caseInfo.returnVisitNum == 1 ? '#3F86FF': '#999'" size="30"/>-->
<!--                        <br>回访调查问卷-->
<!--                      </div>-->
<!--                    </div>-->
<!--                  </div>-->
                  </template>
                </Step>
                <Step title="" content="" :class="{'stepActive': Data.curStep}">
                  <template #icon>
                    <div class="step-icon">
                      <Icon type="ios-search-outline" />
                    </div>
                  </template>
                  <template #title>
                    <p class="step-title has-icon" @click="gotoCzcc()">初侦初查<Icon class="icon" type="md-arrow-forward" /></p>
                  </template>
                  <template #content>
                    <div class="steps-con">
                      <div class="step-sub-title">线索录入</div>
                      <div class="step-sub-con traceMap" v-show="caseInfo.traceMap.length > 0">
                        <span v-for="(trace, i) in caseInfo.traceMap" :key="i">{{trace.label}}（{{trace.num}}）</span>
                      </div>
                    </div>
<!--                    <div class="steps-con">-->
<!--                      <div class="step-sub-title">线索评级</div>-->
<!--                      <div class="step-sub-con" v-show="Data.curStep && Data.scoreCount.length">-->
<!--                        <my-tag style="margin-right: 8px" v-for="(tag, i) in Data.scoreCount" :opacity="0.1" :text="tag.label+ ' ' + tag.num" :color="tag.color"></my-tag>-->
<!--&lt;!&ndash;                        <my-tag :color="'#F25858'" :opacity="0.1" :text="'高 1'"></my-tag>&nbsp;-->
<!--                        <my-tag :color="'#FE9830'" :opacity="0.1" :text="'中 2'"></my-tag>&nbsp;-->
<!--                        <my-tag :color="'#2F8CFF'" :opacity="0.1" :text="'低 3'"></my-tag>&nbsp;&ndash;&gt;-->
<!--                        &lt;!&ndash; <scoreTip :item = caseInfo.scoreList></scoreTip> &ndash;&gt;-->
<!--                      </div>-->
<!--                    </div>-->
                    <div class="steps-con">
                      <div class="step-sub-title">初侦报告</div>
                      <div class="step-sub-con" v-show="Data.curStep">
<!--                        <Icon class="icon iconfont icon-chakanjiexi" :color="swdt.chuzhengBG ? '#3F86FF': '#999'" size="30" @click="openFirstReport()"/>-->
                        <Icon class="icon iconfont icon-chakanjiexi" :color="czbg?'#3F86FF':'#999'" size="30" @click="openFirstReport()"/>
                      </div>
                    </div>
                  </template>
                </Step>
                <Step title="" content="" :class="{'stepActive': Data.curStep}">
                  <template #icon>
                    <div class="step-icon">
                      <Icon type="ios-infinite" />
                    </div>

                  </template>
                  <template #title>
                    <p class="step-title has-icon" @click="gotoDeep()">深入侦查<Icon class="icon" type="md-arrow-forward" /></p>
                  </template>
                  <template #content>
                    <div class="steps-con">
                      <div class="step-sub-title">标定</div>

                      <div class="step-sub-con" v-show="Data.curStep">
                        <my-tag style="margin-right: 8px" v-for="(tag, i) in Data.signCount" :color="tag.color" :opacity="0.1" :text="tag.label + ' ' + tag.num"></my-tag>
                      </div>
                    </div>
                    <div class="steps-con">
                      <div class="step-sub-title">侦查报告</div>
                      <div class="step-sub-con" v-show="Data.curStep">
                        <Icon class="icon iconfont icon-chakanjiexi" color='#999' size="30" @click="openSecondReport()"/>
<!--                        <img style="cursor: pointer" :src="reportIcon" alt="" width="30" @click="openSecondReport()">-->
                      </div>
                    </div>
                  </template>
                </Step>
                <Step title="" content="" :class="{'stepActive': Data.curStep}">
                  <template #icon>
                    <div class="step-icon">
                      <Icon type="ios-paper-outline" />
                    </div>
                  </template>
                  <template #title>
                    <p class="step-title has-icon" @click="openTotalReport()">一案一档<Icon class="icon" type="md-arrow-forward" /></p>
                  </template>
                  <template #content>
                    <p>
                      &nbsp;
                    </p>
                  </template>
                </Step>
              </Steps>
            </div>
          </template>
        </Panel>
        <Panel name="2">
          案件详情
          <template #content>
            <div class="info-con">
              <div>
                <div v-if="show1()">
                <Button  type="primary" @click="update(false)" style="margin: 10px"> 移交案件</Button>
                <Button type="primary"  @click="update(true)" style="margin: 10px"> 协办人管理</Button>
              </div>
                <Button v-else type="primary" @click="exit" style="margin: 10px"> 退出案件</Button>
              </div>
              <div>主办人：<Tag   v-for="item in host(caseInfo.caseUserList)"  type="border"  color="primary" :name="item.userName" >{{item.userName}}</Tag></div>
              <div>协办人：<Tag  v-for="item in synergy(caseInfo.caseUserList)" type="border"  color="primary" :name="item.userName" >{{item.userName}}</Tag></div>
              <p><span class="label">报警人：</span>{{caseInfo.alarmPeople}}{{caseInfo.alarmPeoplePhone}}</p>
              <p><span class="label">案发时间：</span>{{caseInfo.fasjsxDt}}<br>{{caseInfo.fasjxxDt}}</p>
              <p><span class="label">案发地点：</span>{{caseInfo.address}}</p>
              <p><span class="label">金额：</span>{{caseInfo.money}}元</p>
              <p><span class="label">简要案情：</span></p>
              <Tooltip max-width="200" :content="caseInfo.description">
                <div class="desc">
                  {{caseInfo.description}}
                </div>
              </Tooltip>
             
            </div>
          </template>
        </Panel>

      </Collapse>
    </Content>
  </Layout>
  <Modal v-model="modalUserOpt.visible" :footer-hide="true" width="50" :title="modalUserOpt.title">
    <Row v-if="modalUserOpt.num==0">
      <Col span='24' v-for="(value,key) in userList" >
        <p style="margin: 10px">部门：{{key}}</p>
        <CheckboxGroup v-model="caseUserList">
          <Checkbox :label="i.username" border v-for="i in value"> </Checkbox>
        </CheckboxGroup>
      </Col>
    </Row>
    <Row v-else>
     <Col span='24' v-for="(value,key) in userList" >
      <p style="margin: 10px">部门：{{key}}</p>
      <RadioGroup v-model="target" @on-change="changeTarget(value)">
        <Radio v-show="sourceId != i.id" :label="i.username" border v-for="i in value"></Radio>
      </RadioGroup>
    </Col>
    </Row>
    <div style="text-align: right" >
      <Button  type="primary" @click="Submitrole()" class="submit">提交</Button>
      <Button style="margin-left: 8px" @click="modalUserOpt.visible=false" class="cancelrole">取消</Button>
    </div>
  </Modal>
  
  <Modal v-model="modalOpt.visible" fullscreen :footer-hide="true">
    <Report :visible="modalOpt.visible" @close="modalOpt.close"></Report>
<!-- <template #footer>
      <div style="text-align: left">
        <Button>导出PDF</Button>
        <Button>导出WORD</Button>
        <Button @click="modalOpt.visible = false">关闭</Button>
      </div>
    </template> -->
  </Modal>
  <Drawer :title="modalBl.title" :width="drawerOpt.bl.width" placement="left" :mask="false" :closable="true" v-model="modalBl.visible">
    <blPreview v-if="modalBl.type =='bl'" :visible="modalBl.visible" @close="modalBl.visible = false"></blPreview>
    <xkPreview v-else-if="modalBl.type == 'xk'" :visible="modalBl.visible" @close="modalBl.visible = false"></xkPreview>
    <liAnPreview v-else-if="modalBl.type == 'liAn'" :visible="modalBl.visible" @close="modalBl.visible = false"></liAnPreview>
    <shouAnPreview v-else-if="modalBl.type == 'shouAn'" :visible="modalBl.visible" @close="modalBl.visible = false"></shouAnPreview>
  
    <bookPreview v-else-if="modalBl.type == 'qt'" :visible="modalBl.visible" @close="modalBl.visible = false"></bookPreview>
    <div class="toggleWid" @click="drawerOpt.bl.toggleWidth()"><Icon :type="drawerOpt.bl.iscolla ? 'ios-arrow-back' :'ios-arrow-forward'" size="18"/></div>
  </Drawer>

</template>
<style scoped lang="less">
.layout {
  height: 100%;
}
  .header {
    display: flex;
    height: 18vh;
    padding: 0;
    background: #0D263F;
    opacity: 1;
    .title {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      //align-items: center;
      text-align: left;
      padding-left: 24px;
      //white-space: nowrap;
      .case-name {
        width: 2.3rem;
        font-size: 24px;
        color: #fff;
        line-height: 28px;
      }
      .case-no {
        color: rgba(255,255,255,0.7);
        font-size: 14px;
        line-height: 22px;
      }
      .case-type {
        width: 85px;
        height: 28px;
        line-height: 28px;
        background: #D8D8D8;
        border-radius: 3px 3px 3px 3px;
        opacity: 1;
        color: #181F43;
        font-size: 14px;
        text-align: center;
      }
    }
    /*.report {
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      flex: 0 1 26.5%;
      background: #3E5164;

      &:hover {
        background-color: rgba(88, 141, 246, 0.5);
      }
      .icon {
        flex: 0 0 30px;
      }
      p {
        flex: 0 1 auto;
        line-height: 20px;
        color: #fff;
        font-size: 13px;
        margin-bottom: 15px;
      }
    }*/
  }
  .main-content {
    height: 100%;
    background-color: #FFFFFF;
    //padding: 20px;
    //overflow: hidden;

  }
  //.left-wrap{
    //position: relative;
    /*display: flex;
    justify-content: space-between;
    flex-direction: column;*/
    .info-con{
      //flex: 1 0 50%;
      //height: 50%;
      overflow: hidden;
      p {
        margin-bottom: 22px;
        display: flex;
        justify-content: space-between;
        //white-space: nowrap;
        .label {
          color: rgba(24, 31, 67, 0.50);
        }
        .text {
          flex: 1;
          text-align: right;
          &.tr {
            text-align: left;
          }
        }
      }
      .desc {
        width: 2.4rem;
        word-wrap: break-word;
        height: 2rem;
      }
    }

  //}
.steps-wrap {
  position: relative;
  height: 68vh;
  white-space: nowrap;
  //flex: 1 0 auto;
  //height: 50%;
  color: #999;
  margin-bottom: 15px;
  //border: 1px solid blue;
  /*.ivu-steps {
    height: 100%;
    display: flex;
    .ivu-steps-item {
      flex: 1;
    }
  }*/
  .step-icon {
    position: relative;
    //border: 1px solid red;
    &::before {
      content: '';
      position: absolute;
      left: -30%;
      top: -30%;
      width: 160%;
      height: 160%;
      background-color: #eee;
      //border: 1px solid red;
      -webkit-border-radius: 50%;
      -moz-border-radius: 50%;
      border-radius: 50%;
      opacity: 0.5;
    }
  }
  .step-title {
    font-size: 16px;
    padding-left: 5px;
    &.has-icon {
      .icon {
        display: none;
      }
      &:hover {
        text-decoration: underline;
        color: #1D83FF;cursor: pointer;
        &>.icon{
          display: inline-block;
        }
      }
    }

  }
  :deep(.ivu-steps-item) {
    //min-height: 100px;
  }
  :deep(.ivu-steps-main) {
    /*position: absolute;
    left: 13px;*/
    //border: 1px solid black;
    overflow: visible;
    //position: relative;
    /*left: -31px;
    background-color: transparent;*/
    //transform: translateX(-42px);
  }
  .steps-con {
    padding-left: 13px;
    &.active {
      .step-sub-title::before {
        border-color: #1D83FF;
      }
    }
    .step-sub-title {
      position: relative;
      font-size: 14px;
      color: #666;
      padding-left: 30px;
      margin-top: 10px;
      margin-bottom: 10px;
      //border-left: 1px solid #2D8CF0;
      &::before {
        content: '';
        position: absolute;
        left: -4px;
        top: 5px;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        border: 2px solid #999;
        background-color: #fff;
      }
      /*&.active::before {
        border-color: #1D83FF;
      }*/
    }
    .step-sub-con {
      padding-left: 30px;
      margin-top: 4px;
      //margin-bottom: 10px;
      //border-left: 1px solid #2D8CF0;
      &.kan {
        display: flex;
        justify-content: flex-start;
        text-align: left;
        .report {
          flex: 0 1 auto;
          margin: 0 4px;
          cursor: pointer;
          font-size: 13px;
          text-align: center;
          &:nth-child(2) {
            width: 52px;
          }
        }
      }
    }

    //left: -31px;
  }

  .ivu-steps-status-finish {
    .step-title {
      color: #555;

    }
  }
  :deep(.ivu-steps-content) {
    min-height: 50px;
    padding-bottom: 0!important;
    //max-height: 100px;
    //overflow: hidden;
  }
  .traceMap {
    display: flex;
    flex-wrap: wrap;
    span {
      flex: 0 0 32%;
    }
  }
}
.stepActive {
  .step-icon {
    .ivu-icon {
      color: rgba(64, 158, 255, 0.95);
    }
    &::before {
      background-color: rgba(64, 158, 255, 0.3);
    }
  }
  .steps-con {

  }
  .step-title {
    color: #666;
  }
  .step-sub-title::before {
    border-color: #1D83FF!important;
  }
}
.collapse-wrap {
  height: 100%;
  background-color: inherit;
  :deep(.ivu-collapse-header) {
    background-color: #F6F6F7;
    height: 4vh!important;
    line-height: 4vh!important;
    //border: 1px solid red;
  }
  :deep(.ivu-collapse-content) {
    height: 74vh;
    /*height: 500px;
    border: 1px solid red;*/
  }
  .colla-panel {
    //height: 100%;
    //border: 1px solid red;
  }
}
.toggleWid {
  position: absolute;
  right: 0;
  top: 50%;

}

</style>

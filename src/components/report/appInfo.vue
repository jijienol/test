<script setup>

import {computed, defineProps, nextTick, watch} from 'vue'
import UrlInfo from "./urlInfo.vue";


const {apk} = defineProps(['apk'])

const data = computed(()=>apk.appKeyList)
const table = computed(()=>apk.susList)
const SDKcolumn = [
  {
    title: '公司名称',
    key: 'companyName',
    align: 'center'
  },
  {
    title: 'SDK类型',
    key: 'type',
    align: 'center'
  },
  // {
  //   title: '密钥名称',
  //   key: 'keyName',
  //   align: 'center'
  // },
  {
    title: '密钥值',
    key: 'keyValue',
    align: 'center'
  }
]

const susUrl = {
  title: '可疑域名',
  column: [
    // { title: '备案号', key: 'siteLicense',width: 160 ,align: 'center'},
    // { title: '备案公司', key: 'companyName',minWidth: 250 ,align: 'center'},
    // { title: '公司类型', key: 'companyType',minWidth: 120,align: 'center' },
    { title: '链接地址', key: 'webUrl',minWidth: 120 ,align: 'center'},
    // { title: 'IP', key: 'ip',minWidth: 150,align: 'center' },
    // { title: 'IP是否境内', key: 'ipChinaFlag',minWidth: 120 ,align: 'center'},
    // { title: '代理商', key: 'ipOrg',minWidth: 120 ,align: 'center'},
    // { title: '代理商是否境内', key: 'orgChinaFlag' ,minWidth: 120,align: 'center'},
    // { title: '国家', key: 'ipCountry',minWidth: 120,align: 'center' },
    // { title: '省', key: 'ipProvince',minWidth: 120,align: 'center' },
    // { title: '城市', key: 'ipCity',minWidth: 120,align: 'center' },
    // { title: '互联网服务供应商(ISP)', key: 'ipIsp',minWidth: 220 ,align: 'center'},
    // { title: '注册人邮箱', key: 'email',minWidth: 120 ,align: 'center'},
    // { title: '联系人', key: 'contactPerson' ,minWidth: 120,align: 'center'},
    // { title: '联系电话', key: 'phone',minWidth: 120 ,align: 'center'},
    // { title: '注册人/机构', key: 'registrar',minWidth: 120 ,align: 'center'},
    // { title: 'DNS', key: 'dnsServer' ,minWidth: 120,align: 'center'},
    // { title: '域名状态', key: 'domainStatus' ,minWidth: 120,align: 'center'},
    // {title:'服务备案号', key: 'serviceLicence'},
    // { title: '限制连接', key: 'limitAccess' },
    // { title: '主页', key: 'mainPage' ,minWidth: 120,align: 'center'},
    // { title: '所有人', key: 'owner' ,minWidth: 120,align: 'center'},
    { title: '站点名称', key: 'siteName',minWidth: 120 ,align: 'center'},
    { title: 'whois服务器 ', key: 'whoIsServer',minWidth: 120,align: 'center' },
    // { title: '网站建立时间', key: 'creationDate' ,minWidth: 120,align: 'center'},
    // { title: '网站过期时间', key: 'expirationDate' ,minWidth: 120,align: 'center'},
    // { title: '网站审核时间', key: 'verifyTime',minWidth: 120 ,align: 'center'},
  ]

}

const basicInfo = computed(()=>apk.basicInfo)
const urlMasterList = computed(()=>apk.urlMasterList)
console.log(basicInfo.value)
</script>


<template>
  <div  class="app-head" v-if="basicInfo">
    <div class="box">
      <p>基本信息</p>
      <div class="app-text">
        <Row class-name="test-item">
          <Col flex="120px" class="left">应用名称：</Col>
          <Col flex="auto" class="right"><img :src="basicInfo.iconUrl" style="margin: 0 20px" width="36" height="36">{{ basicInfo.appName }}</Col>
        </Row>
        <Row class-name="test-item">
          <Col flex="120px" class="left">应用包名：</Col>
          <Col flex="auto" class="right">{{ basicInfo.appPkg }}</Col>
        </Row>
        <Row class-name="test-item">
          <Col flex="120px" class="left">文件大小：</Col>
          <Col flex="auto" class="right">{{ basicInfo.size }}</Col>
        </Row>
        <Row class-name="test-item">
          <Col flex="120px" class="left">MD5：</Col>
          <Col flex="auto" class="right">{{ basicInfo.appMd5 }}</Col>
        </Row>
        <Row class-name="test-item">
          <Col flex="120px" class="left">版本号：</Col>
          <Col flex="auto" class="right">{{ basicInfo.version }}</Col>
        </Row>
      </div>
    </div>
  
  
    <div class="box">
      <p>证书信息</p>
      <div class="app-text">
        <Row class-name="test-item">
          <Col flex="120px" class="left">SHA1：</Col>
          <Col flex="auto" class="right">{{ basicInfo.appSha1 }}</Col>
        </Row>
        <Row class-name="test-item">
          <Col flex="120px" class="left">SHA256：</Col>
          <Col flex="auto" class="right">{{ basicInfo.appSha256 }}</Col>
        </Row>
        <Row class-name="test-item">
          <Col flex="120px" class="left">序列号：</Col>
          <Col flex="auto" class="right">{{ basicInfo.serial }}</Col>
        </Row>
        <Row class-name="test-item">
          <Col flex="120px" class="left">有效期：</Col>
          <Col flex="auto" class="right">{{ basicInfo.effectiveDate }}</Col>
        </Row>
        <Row class-name="test-item">
          <Col flex="120px" class="left">报告解析时间：</Col>
          <Col flex="auto" class="right">{{ basicInfo.createdTime }}</Col>
        </Row>
      </div>
    </div>
  
  
  </div>
  <div class="box sdk">
    <div class="title1">
      <span style="font-size: 20px;color: #515A6E;font-weight: 600;">SDK信息：</span>
    </div>
    <Table size="large" :columns="SDKcolumn" :data="data" header-class-name="custom-table-header" border></Table>
  </div>
  <div v-for="url in urlMasterList">
    <url-info :url="url"></url-info>
  </div>

  <div class="box sdk">
    <div class="title1">
      <span style="font-size: 20px;color: #515A6E;font-weight: 600;">可疑域名 </span>
    </div>
    <Table size="large" :columns="susUrl.column" :data="table" header-class-name="custom-table-header" border></Table>
  </div>
  <div class="box imgList" v-if="apk.basicInfo">
    <div class="title1">
      <span style="font-size: 20px;color: #515A6E;font-weight: 600;">运行时截图 </span>
    </div>
   <Row v-if="apk.basicInfo.appRunImages">
     <Col v-for="src in apk.basicInfo.appRunImages.split(',')" span="3" style="box-sizing: border-box">
         <img :src="src" alt="" style="padding: 10px;width: 100%" >
     </Col>
   </Row>
  </div>
</template>
<style scoped lang="less">

:deep(.ivu-table-header thead tr th) {
  height: 60px;
  background: #EEEEEE;
  
  border: 1px solid #D3D3D3;
}

.box {
  padding: 40px;
  background: #F8F8F8;
  margin-bottom: 36px;
  border-radius: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  .title1 {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 20px;
  }
  
  .table1 {
    display: flex;
    align-content: center;
    justify-items: center;
    font-size: 18px;
    
    .col1 {
      display: flex;
      align-items: center;
      background: #EEEEEE;
      padding: 15px;
      border: 1px solid #D3D3D3;
      vertical-align: middle;
    }
    
    .col2 {
      display: flex;
      flex-direction: column;
      padding: 15px;
      border: 1px solid #D3D3D3;
      vertical-align: middle;
      background: #FFFFFF;
      
      .bt {
        color: rgba(0, 0, 0, 0.4);
        font-weight: 400;
      }
    }
    
    .col3 {
      display: flex;
      align-items: center;
      background: #EEEEEE;
      padding: 15px;
      border: 1px solid #D3D3D3;
      vertical-align: middle;
      justify-content: center;
    }
  }
}

.app-head {
  display: flex;
  
  .box {
    width: 50%;
    
    &:nth-child(1) {
      margin-right: 36px;
    }
    
    p {
      font-size: 20px;
      
      font-weight: 600;
      color: #515A6E;
      line-height: 23px;
    }
  }
  
  .app-text {
    .test-item {
      display: flex;
      font-size: 18px;
      align-items: center;
      justify-content: center;
      height: 70px;
      
      .left {
        text-align: right;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.4);
        line-height: 21px;
      
      }
      
      
      .right {
        //display: flex;
        //align-items: center;
        font-weight: 400;
        color: #515A6E;
        line-height: 21px;
        overflow: hidden;
        text-wrap: none;
      }
    }
  }
}

.sdk {
  font-weight: 400;
  color: #515A6E;
  line-height: 21px;
}


</style>


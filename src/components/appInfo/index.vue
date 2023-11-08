<script setup="">
import {ref, reactive, watch, getCurrentInstance, nextTick} from "vue";
import {getReport} from '@/api/report.js'
const {proxy} = getCurrentInstance()
const props = defineProps({
  param: {
    type: Object,
    default() {
      return {
        taskChannelId: '',
        caseId: ''
      }
    }
  }
})

/*function reset() {
  Data.iconUrl = ''
  for(let k in Data.basic.obj) {
    Data.basic.obj[k].value = ''
  }
  Data.sdk.table = []
  for(let k in Data.cert.obj) {
    Data.cert.obj[k].value = ''
  }
  for(let k in Data.masterUrl.obj) {
    Data.masterUrl.obj[k].value = ''
  }
  Data.susUrl.table = []
  Data.perm.table = []
  Data.caseUrl.table = []
  Data.runImgList = []
}*/
watch(() => props.param, (n, o) => {
  // console.log('n',n);
  // console.log(o);
  if(n.taskChannelId) {
      nextTick(() => {
        reset()
        Data.getData()
      })

    } else {
      nextTick(() => {
        reset()
        Data.getData()
      })
    }


}, {immediate: false, deep: true})
/*watch(() => props.param.taskChannelId, (n, o) => {
  if(n) {
    nextTick(() => {
      reset()
      Data.getData()
    })

  } else {
    nextTick(() => {
      reset()
    })
  }
})*/
const caseUrl = reactive({
  title: '涉案网址',
  column: [
    {
      title: '名称',
      key: 'name',
      align: 'center'
    },
    {
      title: 'IP',
      key: 'ip',
      align: 'center',
    },
    {
      title: 'IP境内',
      key: 'ipChinaFlag',
      align: 'center',
    },
    {
      title: '代理商',
      key: 'ipOrg',
      align: 'center',
    },
    {
      title: '代理商境内',
      key: 'orgChinaFlag',
      align: 'center',
    },

    {
      title: '运营商',
      key: 'ipIsp',
      align: 'center'
    },
    {
      title: '注册商',
      key: 'registrar',
      align: 'center'
    },
    {
      title: '域名服务器',
      key: 'whoisServer',
      align: 'center'
    },
    {
      title: 'DNS',
      key: 'dnsServer',
      align: 'center'
    },
    {
      title: '归属地',
      key: 'ipCountry',
      align: 'center'
    },
  ],
  table: []
})
const App = ref([])
const Data = reactive({
  iconUrl: '',
  runImgList: [],
  basic: {
    title: '基本信息',
    iconUrl: '',
    obj: {
      appName: {label:'应用名称', value: '', highLight: false},
      appPkg: {label:'应用包名', value: '', highLight: false},
      appLabel: {label:'应用标签', value: '', highLight: false},
      classOne: {label:'一级分类', value: '', highLight: false},
      classTwo: {label:'二级分类', value: '', highLight: false},
      userNum: {label:'总用户数', value: '', highLight: false},
      installingUserNum: {label:'在装用户数', value: '', highLight: false},
      firstInstallTime: {label:'首次安装时间', value: '', highLight: false},
      lastInstallTime: {label:'最近安装时间', value: '', highLight: false},
      size: {label:'文件大小', value: '', highLight: false},
      appMd5: {label:'文件MD5', value: '', highLight: false},
      appSha1: {label:'文件SHA1', value: '', highLight: false},
      appSha256: {label:'文件SHA256', value: '', highLight: false},
      version: {label:'版本号', value: '', highLight: false},
      innerVersion: {label:'内部版本号', value: '', highLight: false},
      packageUpperStatusdesc: {label:'上架状态', value: '', highLight: false},
      // anSourceType: {label:'来源类型', value: '', highLight: false},
    }
  },
  sdk: {
    title: 'SDK信息',
    column: [
      {
        title: '公司名称',
        key: 'companyName',
        align: 'center'
      },
      {
        title: '类型',
        key: 'type',
        align: 'center'
      },
      {
        title: '密钥名称',
        key: 'keyName',
        align: 'center'
      }, {
        title: '密钥值',
        key: 'keyValue',
        align: 'center'
      }
    ],
    table: []
  },
  cert: {
    title:'证书信息',
    obj: {
      certMd5: {label: '文件MD5', value:'',highLight: false},
      certSha1: {label: '文件SHA1', value:'',highLight: false},
      certSha256: {label: '文件SHA256', value:'',highLight: false},
      serial: {label: '序列号', value:'',highLight: false},
      effectiveDate: {label: '有效期', value:'',highLight: false},
      createTime: {label: '报告解析时间', value:'',highLight: false},
    }
  },
  masterUrl: {
    title:'主控域名',
    obj: {
      webUrl: {label: '链接地址', value: '', highLight: false},
      mainPage: {label: '主页', value: '', highLight: false},
      ip: {label: 'IP', value: '', highLight: false},
      ipChinaFlag: {label: 'IP是否境内', value: '', highLight: true},
      ipCountry: {label: 'IP归属地', value: '', highLight: false},// ipProvince ipCity ipDistrict
      ipIsp: {label: '互联网服务供应商(ISP)', value: '', highLight: true},
      ipOrg: {label: '代理商', value: '', highLight: false},
      orgChinaFlag: {label: '代理商是否境内', value: '', highLight: true},
      whoisServer: {label: '域名服务器', value: '', highLight: false},
      dnsServer: {label: 'DNS', value: '', highLight: false},
      creationDate: {label: '网站建立时间', value: '', highLight: false},
      expirationDate: {label: '网站过期时间', value: '', highLight: false},
      verifyTime: {label: '网站审核时间', value: '', highLight: false},
      registrar: {label: '注册人/机构', value: '', highLight: false},
      email: {label: '注册人邮箱', value: '', highLight: false},
      owner: {label: '所有人', value: '', highLight: false},
      contactPerson: {label: '联系人', value: '', highLight: false},
      phone: {label: '联系人电话', value: '', highLight: false},
      companyName: {label: '备案公司', value: '', highLight: false},
      companyType: {label: '备案公司类型', value: '', highLight: false},
      siteName: {label: '备案名', value: '', highLight: false},
      siteLicense: {label: '备案号', value: '', highLight: false},
      limitAccess: {label: '限制连接', value: '', highLight: false},
      domainStatus: {label: '域名状态', value: '', highLight: false},
    },
  },
  susUrl: {
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
      { title: '域名服务器', key: 'whoIsServer',minWidth: 120,align: 'center' },
      // { title: '网站建立时间', key: 'creationDate' ,minWidth: 120,align: 'center'},
      // { title: '网站过期时间', key: 'expirationDate' ,minWidth: 120,align: 'center'},
      // { title: '网站审核时间', key: 'verifyTime',minWidth: 120 ,align: 'center'},

    ],
    table: []
  },
  perm: {
    title: '权限分析',
    column: [
      {
        title: '权限分类',
        key: 'type',
        width: 150,
        align: 'center'
      },
      {
        title: '权限项',
        key: 'permName',
        align: 'center'
      },
      {
        title: '权限描述',
        key: 'detail',
        align: 'center'
      }
    ],
    table:[]
  },
  caseUrl: {
    title: '涉案网址',
    column: [
      {
        title: '名称',
        key: 'name',
        align: 'center'
      },
      {
        title: 'IP',
        key: 'ip',
        align: 'center',
      },
      {
        title: 'IP境内',
        key: 'ipChinaFlag',
        align: 'center',
      },
      {
        title: '代理商',
        key: 'ipOrg',
        align: 'center',
      },
      {
        title: '代理商境内',
        key: 'orgChinaFlag',
        align: 'center',
      },

      {
        title: '运营商',
        key: 'ipIsp',
        align: 'center'
      },
      {
        title: '注册商',
        key: 'registrar',
        align: 'center'
      },
      {
        title: '域名服务器',
        key: 'whoisServer',
        align: 'center'
      },
      {
        title: 'DNS',
        key: 'dnsServer',
        align: 'center'
      },
      {
        title: '归属地',
        key: 'ipCountry',
        align: 'center'
      },
    ],
    table: []
  },
  getData() {
    let param = {
      taskChannelId: props.param.taskChannelId,
      caseId: props.param.caseId
    }
    getReport(param).then(res => {
      let { code, data } = res.data
        if(code == 200) {
          // let appBasicInfo = null
          if(data.appList) {
            data.appList.forEach((info, i) => {
              let image = ''
              let runImages = []// runImages
              let basic = {
                appName: {label:'应用名称', value: ''},
                appPkg: {label:'应用包名', value: ''},
                appLabel: {label:'应用标签', value: ''},
                classOne: {label:'一级分类', value: ''},
                classTwo: {label:'二级分类', value: ''},
                userNum: {label:'总用户数', value: ''},
                installingUserNum: {label:'在装用户数', value: ''},
                firstInstallTime: {label:'首次安装时间', value: ''},
                lastInstallTime: {label:'最近安装时间', value: ''},
                size: {label:'文件大小', value: ''},
                appMd5: {label:'文件MD5', value: ''},
                appSha1: {label:'文件SHA1', value: ''},
                appSha256: {label:'文件SHA256', value: ''},
                version: {label:'版本号', value: ''},
                innerVersion: {label:'内部版本号', value: ''},
                packageUpperStatusdesc: {label:'上架状态', value: ''}
              }
              let sdk = []
              let cert = {
                certMd5: {label: '文件MD5', value:''},
                certSha1: {label: '文件SHA1', value:''},
                certSha256: {label: '文件SHA256', value:''},
                serial: {label: '序列号', value:''},
                effectiveDate: {label: '有效期', value:''},
                createTime: {label: '报告解析时间', value:''},
              }

              let susUrl = [],
                  perm = [],
                  masterUrlList = []
                  // caseUrl = []
              App.value.push({image: image, runImages: runImages, basic: basic, sdk: sdk, cert: cert, masterUrl: {children: masterUrlList},susUrl: susUrl,perm: perm })
              let appBasicInfo = info.appBasicInfo
              if(appBasicInfo) {
                //图标
                if(appBasicInfo.iconUrl){
                  if(appBasicInfo.iconUrl.startsWith('http')){
                    App.value[i].image =  appBasicInfo.iconUrl
                  }else {
                    App.value[i].image = 'data:image/jpg;base64,' +  appBasicInfo.iconUrl
                  }
                }
         
                /*if(appBasicInfo.iconUrl.indexOf('http')!=-1) {
                  Data.setbase64(appBasicInfo.iconUrl).then(r => {
                    App.value[i].image = r
                  })
                } else {
                  App.value[i].image = 'data:image/jpg;base64,' +  appBasicInfo.iconUrl

                }*/

                // 基础
                for(let o in basic) {
                  basic[o].value = appBasicInfo[o]
                  if(o == 'packageUpperStatusdesc') {
                    basic[o].value = appBasicInfo.apkInfo ? appBasicInfo.apkInfo.packageUpperStatusDesc: ''
                  }
                }
                //运行截图
                if(appBasicInfo.appRunImages) {
                  let runList = appBasicInfo.appRunImages.split(',')
                  runList.forEach(img => {
                    // runImgList.push({src: img})
                    Data.setbase64(img).then(r => {
                      App.value[i].runImages.push({src: r})
                    })
                  })
                } else {
                  App.value[i].runImages = [{src: ''}]
                }
              }

             let appKeyList = info.appKeyList
              if(appKeyList) {
                appKeyList = proxy.$lodash.sortBy(appKeyList, (i) => {
                  return i.companyName
                })
                appKeyList.forEach(item => {
                  item.hightlight = item.companyName ? 1 : 0
                })
                App.value[i].sdk = appKeyList
              }

              let appCertList = info.appCertList
              if(appCertList && appCertList[0]) {
                for(let o in cert) {
                  cert[o].value = appCertList[0][o]
                }
              }
              let appUrlMasterList = info.appUrlMasterList
              if(appUrlMasterList) {
                let _masterUrlList = []
                appUrlMasterList.forEach(item => {
                  item.orgChinaFlag = item.orgChinaFlag == 1 ? '是' : '否'
                  item.ipChinaFlag = item.ipChinaFlag == 1 ? '是' : '否'
                  item.ipCountry = (item.ipCountry || '') + ' ' + (item.ipProvince || '') + ' ' + (item.ipCity || '') + ' ' + (item.ipDistrict || '')
                  let masterUrl = {
                    webUrl: {label: '链接地址', value: ''},
                    mainPage: {label: '主页', value: ''},
                    ip: {label: 'IP', value: ''},
                    ipChinaFlag: {label: 'IP是否境内', value: ''},
                    ipCountry: {label: 'IP归属地', value: ''},// ipProvince ipCity ipDistrict
                    ipIsp: {label: '互联网服务供应商(ISP)', value: ''},
                    ipOrg: {label: '代理商', value: ''},
                    orgChinaFlag: {label: '代理商是否境内', value: ''},
                    whoIsServer: {label: '域名服务器', value: ''},
                    dnsServer: {label: 'DNS', value: ''},
                    creationDate: {label: '网站建立时间', value: ''},
                    expirationDate: {label: '网站过期时间', value: ''},
                    verifyTime: {label: '网站审核时间', value: ''},
                    registrar: {label: '注册人/机构', value: ''},
                    email: {label: '注册人邮箱', value: ''},
                    owner: {label: '所有人', value: ''},
                    contactPerson: {label: '联系人', value: ''},
                    phone: {label: '联系人电话', value: ''},
                    companyName: {label: '备案公司', value: ''},
                    companyType: {label: '备案公司类型', value: ''},
                    siteName: {label: '备案名', value: ''},
                    siteLicense: {label: '备案号', value: ''},
                    limitAccess: {label: '限制连接', value: ''},
                    domainStatus: {label: '域名状态', value: ''},
                  }
                  for(let o in masterUrl) {
                    masterUrl[o].value = item[o]
                  }
                  _masterUrlList.push(masterUrl)
                })


                App.value[i].masterUrl.children = _masterUrlList
              }
              let appUrlSusList = info.appUrlSuslist
              if(appUrlSusList) {
                appUrlSusList.forEach(item => {
                  item.orgChinaFlag = item.orgChinaFlag == 1 ? '是' : '否'
                  item.ipChinaFlag = item.ipChinaFlag == 1 ? '是' : '否'
                })
                App.value[i].susUrl = appUrlSusList
              }
              let appPermList = info.appPermList;
              if(appPermList) {
                const levelSortList = ['敏感权限', '特殊权限', '签名权限', '普通权限', '其他权限', undefined, '', null]
                const levelList = proxy.$lodash.sortBy(appPermList, function (o) {
                  return levelSortList.indexOf(o.type)
                })
                for (let i = 0, len = levelList.length; i < len; i++) {
                  const { type } = levelList[i]
                  if (type) {
                    levelList[i].cellClassName = {
                      type: `level-${levelSortList.indexOf(type)}`
                    }
                  }
                }
                App.value[i].perm = levelList
              }
              if(/^\d+$/.test(cert.createTime.value)){
                // 将时间戳转换为Date对象
                const date = new Date(cert.createTime.value*1);

// 提取年、月、日、小时、分钟和秒
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // 月份从0开始，所以需要加1
                const day = date.getDate();
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();

// 构造年月日和时间字符串
                const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

// 打印结果
                console.log(`日期：${formattedDate}`);
                console.log(`时间：${formattedTime}`);
                cert.createTime.value =  formattedDate+'_'+formattedTime
     
              }
              
            })
          
          }
          /*if(data.urlList && data.urlList.length) {
            let urlList = data.urlList;
            urlList.forEach(u => {
              u.ipCountry = u.ipCountry == null ? '' : u.ipCountry
              u.ipProvince = u.ipProvince == null ? '' : u.ipProvince
              u.ipCity = u.ipCity == null ? '' : u.ipCity
              u.ipDistrict = u.ipDistrict == null ? '' : u.ipDistrict
              u.ipCountry = u.ipCountry || '' + ' ' + u.ipProvince + ' ' + u.ipCity + ' ' + u.ipDistrict
              u.orgChinaFlag = u.orgChinaFlag == 1 ? '是' : '否'
              u.ipChinaFlag = u.ipChinaFlag == 1 ? '是' : '否'
            })
            caseUrl.table = urlList
          }*/
        }

      })
  },
  setbase64(url) {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    return new Promise((resolve, reject) => {

      let img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        canvas.height = img.height
        canvas.width = img.width
        ctx.drawImage(img, 0, 0)
        let dataURL = canvas.toDataURL('image/png')
        // canvas = null
        resolve(dataURL)
        canvas = null
      };
      img.onerror = reject;
      img.src = url;
    })

  },
  setRunList (url) {
    let _this = this
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    let img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = function () {
      canvas.height = img.height
      canvas.width = img.width
      ctx.drawImage(img, 0, 0)
      let dataURL = canvas.toDataURL('image/png')
      Data.runImgList.push({src: dataURL})
      canvas = null
    }
    img.src = url
  },
})
function rowClassName(row, index) {
  if (row.hightlight === 1) {
    return 'demo-table-info-row'
  } else {
    return ''
  }
}
function reset() {
  App.value = []
}
/*function setLabel(objName, keyName) {
  return Data[objName].obj[keyName].label
}*/
function setHighLight(k){
  let keys = ['ipChinaFlag','ipIsp', 'orgChinaFlag']
  if(keys.includes(k)) { return true } else { return false}
}

defineExpose({
  App
})
</script>
<template>
  <div class="main">
    <template v-for="(a, i) in App">
    <div class="title">{{Data.basic.title}}</div>
    <ul class="basic-ul">
      <li v-for="(o,v,i) in a.basic" :key="'basic-' + i" v-show="o.value">
        <template v-if="v == 'appName'">
          <span class="label">{{o.label}}：</span>
          <span class="con"><img :src="a.image" src="" alt="" width="40" height="40" class="logo">{{o.value}}</span>
        </template>
        <template v-else>
          <span class="label">{{o.label}}：</span>
          <span class="con">{{o.value}}</span>
        </template>
      </li>
    </ul>
    <div class="title">{{Data.sdk.title}}</div>
    <Table :columns="Data.sdk.column" :data="a.sdk" border>

    </Table>
    <div class="title">{{Data.cert.title}}</div>
    <ul class="basic-ul">
      <li v-for="(o,v,i) in a.cert" :key="'cert-' + i" v-show="o.value">
        <span class="label">{{o.label}}：</span>
        <span class="con">{{o.value}}</span>
      </li>
    </ul>
    <ul class="basic-ul" v-for="item in a.masterUrl.children">
      <div class="title">{{Data.masterUrl.title}}</div>
      <li v-for="(o,v,i) in item" :key="'master-' + i" :class="{'highLight': setHighLight(v)}" v-show="o.value">
        <span class="label">{{o.label}}：</span>
        <span class="con">{{o.value}}</span>
      </li>
    </ul>
    <div class="title">{{Data.susUrl.title}}</div>
    <Table :columns="Data.susUrl.column" :data="a.susUrl" border :show-header="true">

    </Table>
    <div class="title">{{Data.perm.title}}</div>
    <Table :columns="Data.perm.column" :data="a.perm" :row-class-name="rowClassName" border>

    </Table>

    <div class="title">运行时截图</div>
    <Row :gutter="6">
      <Col v-for="(img, index) in a.runImages" :key="index" :span="6">
        <img class="img-item" :src="img.src" alt="">
      </Col>
    </Row>
      <Divider></Divider>
    </template>
  </div>

</template>
<style scoped lang="less">
.main {
  padding: 10px 20px;
  font-size: 15px;
}
ul li {
  list-style: none;
}
.title {
  font-weight: bold;
  line-height: 40px;
}
.basic-ul {
  li {
    border-bottom: 1px solid #e4e4e4;
    line-height: 50px;
    .label {
      display: inline-block;
      width: 180px;
    }
    .con {

    }
    &.highLight {
      color: red!important;
    }
  }
  .logo {
    margin-right: 10px;
    vertical-align: middle;
  }
}
:deep(.ivu-table-row)  {
  .level-0 {
    color: red;
  }
  .level-1 {
    color: #F2B23E;
  }
  .level-2 {
    color: #1DA2F4;
  }
  .level-3 {
    color: #73A940;
  }
  // .level-4 {

  // }
}
:deep(.ivu-table .demo-table-info-row td) {
  color: red;
}
.img-item {
  height: 650px;
}
:deep(.ivu-table td)  {
  border-right: 1px solid #e8eaec!important;
}
</style>

<script setup>
import aes from "@/libs/aes.js";
import {ref, getCurrentInstance, reactive} from 'vue'
import {searchAllTaskReturn} from '@/api/globalSearch.js'
import {swdtStore} from '@/store/modules/swdt.js'
import {Layout, Page} from 'view-ui-plus'

const swdt = swdtStore()
const traceKeyMap = {
  apk: "APK",
  ewallet: "电子钱包",
  url: "URL",
  phone: "手机号",
  virtualId: "虚拟身份",
  bankCard: "卡类",
  ip: "IP",
  idcard: "证件号码",
  wifi: "MAC",
  offlineTask: "其他线索"
};
const {proxy} = getCurrentInstance()
const query = ref({
  name: '',
  visible: false
})
const dataInfo = ref([1])
const pageInfo = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})
const dataList = ref([])
let loadingT = ref(false)
async function search () {
  if (query.value.name.length < 1) {
    proxy.$Message.error('请输入查询参数')
    return
  }
  const params = {
    ...pageInfo,
    searchText: query.value.name
  }
  try {
    loadingT.value=true;
    dataList.value=[];
    const {data: {data, code, message}} = await searchAllTaskReturn(params)
    if (code == 200) {
      dataList.value = data.list
      pageInfo.total = data.total
      proxy.$Message.success('查询成功')
      loadingT.value=false;
    } else {
      loadingT.value=false;
      dataList.value=[];
      proxy.$Message.error(message)
    }
    
  }
  catch (e) {
    console.log(e)
    loadingT.value=false;
    dataList.value=[];
  }
  query.value.visible = true
}
// 换页
function handlePageChange (num) {
  pageInfo.pageNo = num
  console.log('换页')
  search()
}
function to (val) {
  swdt.qjs = val
  let origin = window.location.origin
  let param = aes.encrypt(JSON.stringify({caseId: val.caseId}))
  window.open(origin + '/detect?param=' + param+'&traceId='+val.traceId+'&channelType='+val.channelType, '_blank')

}
</script>

<template>
<Layout class="ajgl-layout">
  <div v-if="!query.visible" class="qjs_box">
    <div class="searchBox">
      <div class="logo"></div>
      <div class="search">
        <Input v-model="query.name" class="inp" placeholder="请输入" prefix="md-search" size="32px"/>
        <div class="btn" @click="search">搜索</div>
      </div>
      <div class="font">url、ip、虚拟身份、手机号、apk、卡类、mac、电子钱包、证件号</div>
    </div>
  </div>
  <div v-else class="dataBox">
    <div class="search">
      <div class="logo"></div>
      <Input v-model="query.name" placeholder="请输入" size="20px"/>
      <div class="btn" @click="search">搜索</div>
    </div>
    <div v-if="dataInfo.length>0" class="dataBox">
      <p style="font-size: 18px">搜索到以下结果</p>
      <div class="spaceloding" v-if="loadingT" >
        <Space size="large">
        <Spin size="small" />
        <Spin />
        <Spin size="large" />
    </Space>
      </div>
      <div v-for="item in dataList" class="item">
        <div class="top">
          <div>
            <span class="font">{{ traceKeyMap[item.traceType] }}：{{ item.traceName }}</span>
            <Icon color="#1D83FF" style="margin: 15px" type="md-arrow-round-forward"/>
            <span class="font">{{ item.solutionName }}</span>
            <Icon color="#1D83FF" style="margin: 15px" type="md-arrow-round-forward"/>
            <span class="font">{{ item.targetTableInfo }}</span>
          </div>
          <div class="details" @click="to(item)">
            <Icon size="18" type="ios-list-box"/>
            查看详情
          </div>
        </div>
        <div class="bottom">
          {{ item.caseName }} — {{ traceKeyMap[item.traceType] }}：{{ item.traceName }} — {{ item.solutionName }} — {{ item.targetTableInfo }}
        </div>
      </div>
      <div style="height: 6vh"></div>
    </div>

    <div v-else>
      <p style="font-size: 18px"> 未查询到数据</p>
    </div>
  </div>
</Layout>
  <Footer class="footer"  v-if="query.visible" >
    <Page :model-value="pageInfo.pageNo" :page-size="pageInfo.pageSize" :total="pageInfo.total" show-elevator show-total
          @on-change="handlePageChange"/>
  </Footer>
  
</template>
<style lang='less' scoped>
.footer {
  position: relative;
  bottom: 5vh;
  height: 5vh;
  padding: 10px 20px;
  background-color: #fff;
}
.ajgl-layout{
  height: 100%;
  overflow: auto;
 
}

.dataBox {
  max-height: 90vh;
  .spaceloding{
    display: flex;
    justify-content: center;
    padding-top: 20%;
  }
  .item {
    padding: 20px;
    margin-top: 10px;
    background: #FFFFFF;
    border-radius: 10px 10px 10px 10px;
    opacity: 1;
    
    .top {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #ccc;
      
      .font {
        font-size: 20px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.8);
        
      }
      
      .details {
        
        line-height: 19px;
        font-size: 16px;
        color: #1D83FF;
      }
    }
    
    .bottom {
      font-size: 16px;
      line-height: 50px;
      color: rgba(0, 0, 0, 0.4);
    }
  }
}


.dataBox {
  width: 100%;
  padding: 20px;
  
  .search {
    display: flex;
    align-items: center;
    width: 100%;
    height: 100px;
    
    :deep(.ivu-input-wrapper) {
      width: 537px;
    }
    
    :deep(.ivu-input ) {
      width: 537px;
      height: 59px;
      background: rgba(0, 21, 75, 0.06);
      border-radius: 10px 10px 10px 10px;
      opacity: 1;
      font-size: 28px;
    }
    
    .logo {
      width: 119px;
      height: 36px;
      margin: 20px;
      background-image: url('@/assets/images/qjs.png');
      background-size: cover;
    }
    
    .btn {
      margin-left: 20px;
      text-align: center;
      line-height: 57px;
      width: 101px;
      height: 57px;
      background: rgba(0, 21, 75, 0.06);
      border-radius: 10px 10px 10px 10px;
      font-size: 20px;
      cursor: pointer;
    }
    
    
  }
}


.qjs_box {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  :deep(.ivu-input ) {
    width: 537px;
    height: 59px !important;
    background: rgba(0, 21, 75, 0.06);
    border-radius: 10px 10px 10px 10px;
    opacity: 1;
    font-size: 32px;
    border: 0;
  }
  
  :deep(.ivu-input-wrapper) {
    width: 100%;
    
    .ivu-input-prefix {
      display: block;
      padding-right: 10px;
    }
  }
  
  :deep(.ivu-icon) {
    font-size: 42px;
    line-height: 60px;
    color: #c3c6ca;
  }
  
  .searchBox {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 500px;
  }
  
  .logo {
    width: 190px;
    height: 58px;
    background-image: url("@/assets/images/qjs.png");
    background-size: cover;
  }
  
  .font {
    margin-top: 10px;
    width: 600px;
    color: rgba(0, 0, 0, 0.4);
  }
  
  .search {
    display: flex;
    margin-top: 30px;
    align-items: center;
    justify-content: center;
    
    .logo {
      width: 119px;
      height: 36px;
      background-image: url('@/assets/images/qjs.png');
      background-size: cover
    }
    
    .btn {
      text-align: center;
      line-height: 57px;
      width: 101px;
      height: 57px;
      background: rgba(0, 21, 75, 0.06);
      border-radius: 10px 10px 10px 10px;
      font-size: 20px;
      cursor: pointer;
    }
    
    
  }
  
  
}
</style>

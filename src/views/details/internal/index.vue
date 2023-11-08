<script setup>
import {getCurrentInstance, onMounted, ref, watch} from 'vue'
import GL from '@/views/details/internal/components/GL.vue'
import AppList from '@/views/details/internal/components/AppList.vue'
import ChangeCard from '@/views/details/internal/components/ChangeCard.vue'
import WifiList from '@/views/details/internal/components/WifiList.vue'
import {getYunshenApiData} from '@/api/details.js'

const {proxy} = getCurrentInstance()
const props = defineProps({
  traceId: {
    type: String,
    default: ''
  },
  taskId: {
    type: String,
    default: ''
  },
  task: {
    type: Object,
    default: {}
  },
  type: {
    type: String,
    default: ''
  }
})

//四码信息
const fourInfo = ref({
  imei: '',
  imsi: '',
  phone: '',
  mac: ''
})
//人员画像
const userInfo = ref({
  name: '',//姓名
  job: '',//职业
  sex: '',//性别
  homeAddress: '',//家庭住址
  workAddress: '',//工作地址
  age: '',//年龄
  phoneModel: '',//设备型号
  brand: ''//系统版本
  
})

const newAddress = ref({
  lat: '',
  lng: '',
  time: '',
  type: '',
  address: ''
})
const appList = ref([])

const addressList = ref([])
const imeiList = ref([])
async function getFourInfo () {
  try {
    const {data} = await getYunshenApiData({taskChannelId: props.taskId})
    if (data.code == 200) {
      console.log(data.data)
      if(data.data.locationRt){
        newAddress.value = data.data.locationRt
        
      }
      if (data.data.userTags){
        userInfo.value = data.data.userTags
  
      }
      if (data.data.locations){
        addressList.value = data.data.locations
  
      }
      if (data.data.appList){
        appList.value = data.data.appList
      }
      if (data.data.idMapping){
        fourInfo.value= data.data.idMapping
      
      }

      if(data.data.imeiList){
        imeiList.value = data.data.imeiList
      }
  
  
    } else {
      proxy.$Message.error(data.message)
    }
  } catch (e) {
    console.log(e)
    proxy.$Message.error(e)
  }
}
watch(()=>props.taskId,()=>{
 
  getFourInfo()
})
onMounted(() => {
  console.log(props.taskId)
  getFourInfo()
})

</script>

<template>
  <Layout class="box">
    <Sider class="left" hide-trigger width="300">
      <div style="margin-bottom: 30px">
        <div class="headline">查询ID</div>
        <div style="margin: 15px;">
          <p class="row"><span class="title">查询ID：</span><span style="color: #1D83FF">{{ props.task.name }}</span></p>
          <!--          <p class="row"><span class="title">归属地：</span><span>上海长宁</span></p>-->
        </div>
      </div>
      <div style="margin-bottom: 30px">
        <div class="headline">人员画像</div>
        <div style="margin: 15px;">
          <p class="row"><span class="title">姓名：</span><span>{{ userInfo.name }}</span></p>
          <p class="row"><span class="title">性别：</span><span>{{ userInfo.sex }}</span></p>
          <p class="row"><span class="title">年龄：</span><span>{{ userInfo.age }}</span></p>
          <p class="row"><span class="title">职业：</span><span>{{ userInfo.job }}</span></p>
          <p class="row"><span class="title">居住地：</span><span>{{ userInfo.homeAddress }}</span></p>
          <p class="row"><span class="title">工作地：</span><span>{{ userInfo.workAddress }}</span></p>
          <!--          <p class="row"><span class="title">用户画像：</span>-->
          
          <!--          </p>-->
        
        </div>
      </div>
      
      <div style="margin-bottom: 30px">
        <div class="headline">最新位置</div>
        <div style="margin: 15px;">
          <p class="row"><span class="title">位置：</span><span>{{ newAddress.address }}</span></p>
          <p class="row"><span class="title">wgs84经纬度：</span><span>lat:{{ newAddress.lat }}<br/>lng:{{ newAddress.lng }}</span></p>
          <p class="row"><span class="title">时间：</span><span>{{ newAddress.time }}</span></p>
          <p class="row"><span class="title">来源：</span><span>{{ newAddress.type }}</span></p>
        
        </div>
      </div>
      
      <div style="margin-bottom: 30px">
        <div class="headline">手机信息</div>
        <div style="margin: 15px;">
          <p class="row"><span class="title">手机号：</span><span>{{ fourInfo.phone }}</span></p>
          <p class="row"><span class="title">mac地址：</span><span>{{ fourInfo.mac }}</span></p>
          <p class="row"><span class="title">imei：</span><span>{{ fourInfo.imei }}</span></p>
          <p class="row"><span class="title">imsi：</span><span>{{ fourInfo.imsi }}</span></p>
          <!--          <p class="row"><span class="title">oaid：</span><span>上海长宁</span></p>-->
          <p class="row"><span class="title">设备类型：</span><span>{{ userInfo.brand }}</span></p>
          <p class="row"><span class="title">设备型号：</span><span>{{ userInfo.phoneModel }}</span></p>
          
          <!--          <p class="row"><span class="title">创建时间：</span><span>上海长宁</span></p>-->
        
        </div>
      </div>
    
    </Sider>
    <Layout class="right">
      <Tabs value="name1">
        <TabPane label="常连WIFI" name="name1">
          <wifi-list :taskId="props.taskId"></wifi-list>
        </TabPane>
        <TabPane label="轨迹信息" name="name2">
          <g-l :taskChannelId="props.taskId" :address="newAddress" :addressList="addressList"/>
        </TabPane>
        <TabPane label="APP列表"  name="name3">
          <app-list :appList="appList"></app-list>
        </TabPane>
        <TabPane label="换机换卡"  name="name4">
          <change-card :imeiList="imeiList"/>
        </TabPane>
      </Tabs>
    </Layout>
  </Layout>
</template>
<style lang="less" scoped>
:deep(.ivu-tabs-nav-scroll) {
  height: 40px;
  display: flex;
  
  font-size: 14px;
  
  border-bottom: 2px solid #cccccc;
  
  .ivu-tabs-tab {
    padding: 0 36px 8px;
  }
}

.box {
  width: 100%;
  height: 94vh;
  display: flex;
  font-size: 14px;
  
  .left {
    width: 400px;
    background: #fff;
    margin: 10px;
    border-radius: 10px;
    
    .headline {
      border-left: 4px solid #1D83FF;
      margin: 15px;
      padding-left: 15px;
      font-size: 16px;
    }
    
    .row {
      display: flex;
      
      line-height: 30px;
      
      .title {
        display: inline-block;
        width: 100px;
        
        font-weight: 400;
        color: rgba(91, 100, 119, 0.5);
      }
    }
    
  }
  
  .right {
    position: relative;
    margin: 10px;
    border-radius: 10px;
    background: #fff;
    padding: 20px;
  }
}

</style>

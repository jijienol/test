<script setup>
import {ref, onMounted, getCurrentInstance, reactive, computed, watch} from 'vue';
import {findLocationByTaskChannelId} from '@/api/details.js'


const {proxy} = getCurrentInstance()
const props = defineProps({
  address: {
    type: Object,
    default: ''
  },
  taskChannelId: {
    type: String,
    default: ''
  },
  addressList: {
    type: Array,
    default: []
  },
})


const columns = [
  {
    title: '序号',
    type: 'index',
    width: 70,
    align: 'center'
  },
  {
    title: '出现位置及时间',
    key: 'address',
    render: (h, params) => {
      return params.row.address+ '\n' +params.row.time
    }
  },
  {
    title: '来源',
    key: 'type',
    align: 'right'
  }
]

const queryFrom = reactive({
  startDate: '',
  endDate: '',
  taskChannelId: props.taskChannelId,
  address:''
})

const newAddress = computed(() => {
  if (props.address.address) {
    return props.address
  } else if (props.addressList[0]) {
    return props.addressList[0]
  } else {
    return {
      address: '',
      time: '',
      type: ''
    }
  }
})
const data = ref([])

watch(()=>props.addressList,()=>{
  data.value = props.addressList
})
function timeChanger (val) {
  console.log(val)
  queryFrom.startDate = val[0]
  queryFrom.endDate = val[1]
}


function gps (row) {
  console.log(row)
  map.value.center = [row.lng, row.lat]
}

  function query () {
  function filterDataByTimeAndAddress(data, startTime, endTime, address) {
    return data.filter(obj => {
      const objTime = new Date(obj.time);
      return (
        (startTime ? objTime >= new Date(startTime) : true) &&
        (endTime ? objTime <= new Date(endTime) : true) &&
        (address ? obj.address.includes(address) : true)
      );
    }).map(obj => ({ ...obj }));
  }
  
  
  
    data.value  = filterDataByTimeAndAddress(props.addressList, queryFrom.startDate, queryFrom.endDate, queryFrom.address);
    console.log(data.value)
}
</script>


<template>
  <div class="boxGL">
    <div class="left">
      <div style=" border-left: 4px solid #1D83FF; padding-left: 15px;font-size: 16px;">轨迹信息<span style="color: #cccccc;font-size: 14px;margin-left: 15px;line-height: 16px">(共{{ data.length }}条)</span></div>
      <div class="kuang">
        <div>最新</div>
        <div><p>{{ newAddress.address }}</p>
          <p>{{ newAddress.time }}</p></div>
        <div>{{ newAddress.type }}</div>
      </div>
      <div style="padding:25px 0px;font-size: 16px;">查询列表</div>
      <DatePicker placeholder="查询时间区间" style="width: 100%" type="daterange" @on-change="timeChanger"/>
      <div style="display: flex;margin: 20px 0 20px">
        <Input v-model="queryFrom.address" placeholder="查询地址" style="width: 280px;margin-right: 10px"/>
        <Button type="primary" @click="query">搜索</Button>
      </div>
      <Table ref="currentRowTable" :columns="columns" :data="data" height="1000" highlight-row  ></Table>
    </div>
    
    <div class="right">
    <h2>地图开发中</h2>
    </div>
  </div>

</template>

<style lang="less">
.boxGL {
  display: flex;
  
  .left {
    width: 650px;
    padding: 20px;
    
    .kuang {
      height: 56px;
      width: 100%;
      background: rgba(29, 131, 255, 0.1);
      margin-top: 30px;
      padding: 20px;
      border-radius: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .right {
    width: 100%;
    height: 98vh;
    
    .map {
      z-index: -1;
      width: 100%;
      height: 86vh;
      
      div {
        border-radius: 30px;
      }
    }
    
  }
}

</style>

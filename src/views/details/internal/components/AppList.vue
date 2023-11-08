<script setup="">


import {computed, onMounted, ref, watch} from 'vue'




import {uniq} from 'lodash'
const props = defineProps({
  appList: {
    type: Object,
    default: ''
  },
})
const indeterminate = ref(false)
const checkAll = ref(false)
const checkAllGroup = ref([])

const type = ref([])

const DataList = ref([])
const Data = ref([])


function handleCheckAll () {
  if (indeterminate.value) {
    checkAll.value = false;
  } else {
    checkAll.value = !checkAll.value;
  }
  indeterminate.value = false;
  
  if (checkAll.value) {
    type.value.forEach(item => {
      checkAllGroup.value.push(item)
    })
  } else {
    checkAllGroup.value = [];
  }
}


function checkAllGroupChange (data) {
  if (data.length === 3) {
    indeterminate.value = false;
    checkAll.value = true;
  } else if (data.length > 0) {
    indeterminate.value = true;
    checkAll.value = false;
  } else {
    indeterminate.value = false;
    checkAll.value = false;
  }
  
}

const sensitiveAppList = ref([])
const minorityAppList = ref([])
watch(() => checkAllGroup.value, (val) => {
  console.log(val)
  
  Data.value = []
  val.forEach(type => {
    DataList.value.forEach(app => {
      if (app.category == type) {
        Data.value.push(app)
      }
    })
  })
  sensitiveAppList.value = []
  minorityAppList.value = []
  Data.value.forEach(item => {
    if (item.isSensitive) {
      sensitiveAppList.value.push(item)
    }
    if (item.isXz) {
      minorityAppList.value.push(item)
    }
  })
}, {
  deep: true
})

const appList = computed(()=>{
  return props.appList
})
watch(()=>appList.value,()=>{
  appList.value.forEach(item => {
    if (item.category) {
      type.value.push(item.category)
      DataList.value.push(item)
    } else {
      item.category = '未知'
      DataList.value.push(item)
      type.value.push('未知')
    }
  })
  Data.value == DataList.value
  checkAllGroup.value = uniq(type.value)
  type.value = uniq(type.value)
  
  checkAll.value = true;
})
onMounted(() => {
  console.log(appList.value)
  appList.value.forEach(item => {
    if (item.category) {
      type.value.push(item.category)
      DataList.value.push(item)
    } else {
      item.category = '未知'
      DataList.value.push(item)
      type.value.push('未知')
    }
  })
  Data.value == DataList.value
  checkAllGroup.value = uniq(type.value)
  type.value = uniq(type.value)
  
  checkAll.value = true;
})

let sortOrder = "asc"; // 初始排序顺序为升序
const active1 = ref('1')
const active2 = ref('1')
const active3 = ref('1')


function mgSort () {
  active1.value = 1
  sensitiveAppList.value = []
  minorityAppList.value = []
  Data.value.forEach(item => {
    if (item.isSensitive) {
      sensitiveAppList.value.push(item)
    }
    if (item.isXz) {
      minorityAppList.value.push(item)
    }
  })
}

function mgSort1 (name) {
  
  if (name == 'lastActiveTime') {
    active1.value = 2
  } else {
    active1.value = 3
  }
  if (sortOrder === "asc") {
    sensitiveAppList.value.sort(function (a, b) {
      const dateA = new Date(a[name])
      const dateB = new Date(b[name])
      return dateA - dateB;
    });
    sortOrder = "desc"; // 改变排序顺序为降序
  } else {
    sensitiveAppList.value.sort(function (a, b) {
      const dateA = new Date(a[name])
      const dateB = new Date(b[name])
      return dateB - dateA;
    });
    sortOrder = "asc"; // 改变排序顺序为升序
  }
}

function xzSort () {
  active2.value = 1
  sensitiveAppList.value = []
  minorityAppList.value = []
  Data.value.forEach(item => {
    if (item.isSensitive) {
      sensitiveAppList.value.push(item)
    }
    if (item.isXz) {
      minorityAppList.value.push(item)
    }
  })
}

function xzSort1 (name) {
  if (name == 'lastActiveTime') {
    active2.value = 2
  } else {
    active2.value = 3
  }
  if (sortOrder === "asc") {
    minorityAppList.value.sort(function (a, b) {
      const dateA = new Date(a[name])
      const dateB = new Date(b[name])
      return dateA - dateB;
    });
    sortOrder = "desc"; // 改变排序顺序为降序
  } else {
    minorityAppList.value.sort(function (a, b) {
      const dateA = new Date(a[name])
      const dateB = new Date(b[name])
      return dateB - dateA;
    });
    sortOrder = "asc"; // 改变排序顺序为升序
  }
}


function APPListSort0 () {
  active3.value = 1
  Data.value = []
  checkAllGroup.value.forEach(type => {
    DataList.value.forEach(app => {
      if (app.category == type) {
        Data.value.push(app)
      }
    })
  })
}

function APPListSort2 (name) {
  if (name == 'lastActiveTime') {
    active3.value = 2
  } else {
    active3.value = 3
  }
  if (sortOrder === "asc") {
    Data.value.sort(function (a, b) {
      const dateA = new Date(a[name])
      const dateB = new Date(b[name])
      return dateA - dateB;
    });
    sortOrder = "desc"; // 改变排序顺序为降序
  } else {
    Data.value.sort(function (a, b) {
      const dateA = new Date(a[name])
      const dateB = new Date(b[name])
      return dateB - dateA;
    });
    sortOrder = "asc"; // 改变排序顺序为升序
  }
}
const columns = [
  {
    title: 'APP名称',
    key: 'name'
  }, {
    title: 'APP分类',
    key: 'category'
  }, {
    title: 'APP包名',
    key: 'pkg'
  }, {
    title: '是否敏感',
    key: 'isSensitive',
    render: (h, params) => {
      return params.row.isSensitive ? "是" : "否"
    }
  }, {
    title: '敏感分类名称',
    key: 'sensitiveCategory'
  }, {
    title: '小众/大众',
    key: 'isXz',
    render: (h, params) => {
      return params.row.isXz ? "是" : "否"
    }
  }, {
    title: '最早安装时间',
    key: 'installTime'
  }, {
    title: '最后活跃时间',
    key: 'lastActiveTime'
  }, {
    title: '是否卸载',
    key: 'uninstallTime',
    render: (h, params) => {
      return params.row.uninstallTime.length > 0 ? "是" : "否"
    }
  }

]
</script>

<template>
  <Row class="AppList">
    <Col class="left" flex="300px">
      <Space direction="vertical" type="flex">
        <Checkbox
          :indeterminate="indeterminate"
          :model-value="checkAll"
          @click.prevent="handleCheckAll">全选
        </Checkbox>
        <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange">
          <Checkbox v-for="name in type" :key="name" :label="name"></Checkbox>
        </CheckboxGroup>
      </Space>
    </Col>
    <Col class="right" flex="auto">
      <div v-if="sensitiveAppList.length>0">
        <div class="px">
          <div class="title">敏感类</div>
          <div :class="active1 == 1?'active':''" class="pxLi" @click="mgSort"><i class="iconfont icon-paixu" style="font-size: 18px"/>默认排序</div>
          <div :class="active1 == 2?'active':''" class="pxLi" @click="mgSort1('lastActiveTime')"><i class="iconfont icon-paixu" style="font-size: 18px"/>最后活跃</div>
          <div :class="active1 == 3?'active':''" class="pxLi" @click="mgSort1('installTime')"><i class="iconfont icon-paixu" style="font-size: 18px"/>最早安装</div>
        </div>
        <div class="appBox">
          
          <div v-for="app in sensitiveAppList" class="app">
            <Poptip placement="right" width="400">
              <div style=" padding: 20px 30px 20px 15px;">
                <p style="font-size: 16px;font-weight: 700">{{ app.name }}</p>
                <p>{{ app.category }}</p>
              </div>
              <template #content>
                <div><span class="appXQTitle">APP名称：</span>{{app.name}}</div>
                <div><span class="appXQTitle">APP类别：</span>{{app.category}}</div>
                <div><span class="appXQTitle">APP包名：</span>{{app.pkg}}</div>
                <div><span class="appXQTitle">是否敏感：</span>{{app.isSensitive ? "是" : "否"}}</div>
                <div><span class="appXQTitle">敏感分类名称：</span>{{app.sensitiveCategory}}</div>
                <div><span class="appXQTitle">大众/小众：</span>{{app.isXz ? "小众" : "大众"}}</div>
                <div><span class="appXQTitle">最早安装时间：</span>{{app.installTime}}</div>
                <div><span class="appXQTitle">最后活跃时间：</span>{{app.lastActiveTime}}</div>
                <div><span class="appXQTitle">卸载/未卸载：</span>{{app.uninstallTime.length > 0 ? "卸载" : "未卸载"}}</div>
              </template>
            </Poptip>
          </div>
        
        
        </div>
      </div>
      <div v-if="minorityAppList.length>0">
        <div class="px">
          <div class="title">小众类</div>
          <div :class="active2==1?'active':''" class="pxLi" @click="xzSort"><i class="iconfont icon-paixu" style="font-size: 18px"/>默认排序</div>
          <div :class="active2==2?'active':''" class="pxLi" @click="xzSort1('lastActiveTime')"><i class="iconfont icon-paixu" style="font-size: 18px"/>最后活跃</div>
          <div :class="active2==3?'active':''" class="pxLi" @click="xzSort1('installTime')"><i class="iconfont icon-paixu" style="font-size: 18px"/>最早安装</div>
        </div>
        <div class="appBox">
          <div v-for="app in minorityAppList" class="app" style="background: rgba(29,131,255,0.1);">
            <Poptip placement="right" width="400">
              <div style=" padding: 20px 30px 20px 15px;">
                <p style="font-size: 16px;font-weight: 700">{{ app.name }}</p>
                <p>{{ app.category }}</p>
              </div>
              <template #content>
                <div><span class="appXQTitle">APP名称：</span>{{app.name}}</div>
                <div><span class="appXQTitle">APP类别：</span>{{app.category}}</div>
                <div><span class="appXQTitle">APP包名：</span>{{app.pkg}}</div>
                <div><span class="appXQTitle">是否敏感：</span>{{app.isSensitive ? "是" : "否"}}</div>
                <div><span class="appXQTitle">敏感分类名称：</span>{{app.sensitiveCategory}}</div>
                <div><span class="appXQTitle">大众/小众：</span>{{app.isXz ? "小众" : "大众"}}</div>
                <div><span class="appXQTitle">最早安装时间：</span>{{app.installTime}}</div>
                <div><span class="appXQTitle">最后活跃时间：</span>{{app.lastActiveTime}}</div>
                <div><span class="appXQTitle">卸载/未卸载：</span>{{app.uninstallTime.length > 0 ? "卸载" : "未卸载"}}</div>
              </template>
            </Poptip>
          </div>
        </div>
      </div>
      <div class="px">
        <div class="title">APP列表</div>
        <div :class="active3 == 1?'active':''" class="pxLi" @click="APPListSort0"><i class="iconfont icon-paixu" style="font-size: 18px"/>默认排序</div>
        <div :class="active3 == 2?'active':''" class="pxLi" @click="APPListSort2('lastActiveTime')"><i class="iconfont icon-paixu" style="font-size: 18px"/>最后活跃</div>
        <div :class="active3 == 3?'active':''" class="pxLi" @click="APPListSort2('installTime')"><i class="iconfont icon-paixu" style="font-size: 18px"/>最早安装</div>
      </div>
      <Table :columns="columns" :data="Data" height="1000"></Table>
    </Col>
  </Row>


</template>
<style lang="less" scoped>
.active {
  color: #1D83FF;
}

.AppList {
  padding-top: 20px;
  height: 100vh;
  display: flex;
  flex-wrap: nowrap;
  
  .left {
    padding-left: 30px;
    width: 200px;
    height: 80vh;
    overflow: auto;
    
    :deep(.ivu-checkbox-group) {
      overflow: auto;
      border-right: 1px solid #ccc;
      display: flex;
      flex-direction: column;
      line-height: 50px;
    }
  }
  
  .right {
    padding-left: 30px;
    
    .px {
      display: flex;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: 700;
        margin: 20px;
      }
      
      .pxLi {
        margin: 0 20px;
        cursor: pointer;
        
      }
    }
    
    .appBox {
      .app {
        display: inline-block;
        
        border-radius: 10px;
        background: #FEF0F0;
        margin: 10px;
        height: 85px;
        
        p {
          text-wrap: none;
          
        }
      }
    }
  }
}

</style>

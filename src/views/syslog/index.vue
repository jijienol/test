<script setup="">
import {reactive, ref, getCurrentInstance, onMounted} from "vue";
import {getFindLogListByPage} from "../../api/syslog.js";
import Pagination from "../../components/viewui/pagination.vue";

import {dictStore} from "../../store/modules/dictionary.js";
const dict = dictStore()
const {proxy} =getCurrentInstance()
const logColumns = [
  {
    title: '请求名称',
    key: 'title',
    tooltip: true
  },
  {
    title: '请求类型',
    key: 'requestMethod',
    width: 100
  },
  {
    title: '请求地址',
    key: 'requestUri',
    tooltip: true
  },
  {
    title: '请求参数',
    key: 'requestParams',
    tooltip: true
  },
  {
    title: '是否异常',
    key: 'isExceptionLabel',
    width: 100
  },
  {
    title: '请求人IP',
    key: 'requestIp',
    width: 150
  },
  {
    title: '请求人',
    key: 'createUserName',
    width: 150
  },
  {
    title: '请求时间',
    key: 'createdTime',
    width: 160
  }
]
const seachLogParams = reactive({
  pageNo: 1,
  pageSize: 10,
  total:0,
  appType: '3',
  isException: '',
  title: '',
  createUserName: '',
  startTime: '',
  endTime: ''
})


const sysLogList = ref([])
const tableLoading = ref(false)
function   findLogListByPage () {
  sysLogList.value = []
  tableLoading.value = true
  getFindLogListByPage(seachLogParams).then((res) => {
    if (res.data.code == 200) {
      sysLogList.value = res.data.data.list
      seachLogParams.total = res.data.data.total
    } else {
      proxy.$Message.error(res.data.message)
    }
  tableLoading.value = false
  })
}
function   getSearchTime (dataTimeArr) {
  // console.log(JSON.stringify(dataTimeArr))
  seachLogParams.startTime = dataTimeArr[0]
  seachLogParams.endTime = dataTimeArr[1]
}
const yesOrNoList = reactive(dict.dict.yes_no.list)

onMounted(()=>{
  findLogListByPage()
  dict.getDict( 'yes_no')
})
</script>
<script>
export default {
  name: "syslog"
}

</script>
<template>
  <!-- 查询条件 -->
  <Card style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center">
        <h2 style="margin-right: .2rem">系统日志管理</h2>
      </div>
    </template>
    <Form :model="seachLogParams" ref="searchForm">
      <Row :gutter="24" class="search-div">
        <Col span="6">
          <FormItem prop="title" label="请求名称">
            <Input v-model="seachLogParams.title"></Input>
          </FormItem>
        </Col>
        <Col span="6">
          <FormItem prop="createUserName" label="请求人">
            <Input v-model="seachLogParams.createUserName"></Input>
          </FormItem>
        </Col>
        <Col span="3">
          <FormItem prop="isException" label="是否异常">
            <Select v-model="seachLogParams.isException" style="width: 50%" clearable>
              <Option v-for="item in yesOrNoList" :value="item.value" :key="item.id">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="5">
          <FormItem prop="createTime" label="请求时间">
            <DatePicker
              v-model="seachLogParams.createTime"
              @on-change="getSearchTime"
              type="datetimerange"
              format="yyyy-MM-dd HH:mm"
              placeholder="开始时间-结束时间"
            ></DatePicker>
          </FormItem>
        </Col>
        <Col span="4">
          <Button type="primary" style="margin-left: 8px" icon="ios-search" @click="findLogListByPage">查询</Button>
          <Button style="margin-left: 8px" icon="md-refresh" @click="resetForm('searchForm')">重置</Button>
        </Col>
      </Row>
    </Form>
    <!-- 列表信息 -->
    <div style="border: 1px solid #CCC">
      <Table :loading="tableLoading" :columns="logColumns" :data="sysLogList">
        <template slot-scope="{ row, index }" slot="操作">
          <!-- <Button type="error" size="small" @click="delLog(index)" v-if="isedit === true">删除</Button> -->
        </template>
      </Table>
    </div>
  </Card>
  <Footer style="position: absolute;bottom: .2rem">
    <pagination v-model:pageSize="seachLogParams.pageSize" :total="seachLogParams.total" v-model:pageNo="seachLogParams.pageNo" :render="findLogListByPage" show-elevator show-total />
  </Footer>
</template>
<style scoped lang="less">
.search-div {

.ivu-input-wrapper {
  width: auto
}

.ivu-date-picker-editor {

.ivu-input {
  width: 250px;
}

}
}
</style>

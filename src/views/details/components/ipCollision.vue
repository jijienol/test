<script setup="">
import {watch, reactive} from "vue";
import {ipCollision} from "@/api/details.js";
import $Message from "@/utils/message.js";
import bus from "vue3-eventbus";

  const props = defineProps({
    visible: false,
    param: {
      caseId: '',
      ip: '',
      virtualId: ''
    }
  })
watch(() => props.visible, (n) => {
  if(n) {
    getData()
  }else {
    Data.table = []
  }
})
const Data = reactive({
  loading: false,
  column: [
    {
      title: '线索名',
      key: 'targetTraceName',
      width: 'auto',
      align: 'center'
    },
    {
      title: '任务名',
      key: 'targetTaskName',
      width: 'auto',
      align: 'center'
    },
    {
      title: '表名',
      key: 'targetTableName',
      width: 'auto',
      align: 'center'
    },
    {
      title: '',
      key: '',
      width: 'auto',
      align:'center',
      slot: 'operation'
    }
  ],
  table: []
})
  function getData() {
    let param = {
      caseId: props.param.caseId,
      property: props.param.ip,
      virtualId: props.param.virtualId
    }
    Data.loading = true
    ipCollision(param).then(res => {
      // console.log(res);
      let { code, data } = res.data
      if (code == 200) {
        Data.table = data
        Data.loading = false
      } else {
        $Message.warning(res.data.message)
        Data.loading = false
      }
    }).catch(() => {
      Data.loading = false
    })
  }
  function jump(row) {
    console.log(row);

  }
</script>
<template>
  <div class="main">
    <Table style="height: 100%" :columns="Data.column" :data="Data.table" height="200" stripe :loading="Data.loading">
      <template #operation="{row, index}">
        <span @click="jump(row)">查看</span>
      </template>
    </Table>
  </div>
</template>
<style scoped>
.main {
  height: 100%;
}
</style>
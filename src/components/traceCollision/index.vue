<script setup>

import {noteStore} from "@/store/modules/note.js";
import {computed, getCurrentInstance} from "vue";
import aes from "@/libs/aes.js";
const {proxy} = getCurrentInstance()
const note = noteStore()
//案件间的跳转
function open(item) {
  console.log(item)
    let origin = window.location.origin
    let param = aes.encrypt(JSON.stringify({caseId: item.caseId}))
  console.log(param,item)
    window.open(origin + '/detect?param=' + param, '_blank')
}
function setMaster(item) {
  return proxy.$lodash.filter(item.caseUserList, (o) => {
    return o.type == 1
  })
}
function setMaster2(item) {
  return proxy.$lodash.filter(item.caseUserList, (o) => {
    return o.type == 0
  })
}
</script>
<script>
export default {
  name: "traceCollision"
}

</script>
<template>

  <div class="trace">
<!--    <div v-for="item in note.TraceCollisionDetail" @click="open(item)" :key="item.id" class="item">-->
      <div v-for="item in note.TraceCollisionDetail" :key="item.id" class="item">
      <div>案件名称：{{item.caseName}}</div>
      <div>案件编号：{{item.caseNum}}</div>
      <div>线索类别：{{item.trackTypeName}}</div>
      <div>线索名称：{{item.traceName}}</div>
      <div>主办人：<span style="margin-right: .15rem" v-for="person in setMaster(item)">{{person.userName}}</span></div>
      <div>协办人：<span  style="margin-right: .15rem"  v-for="person in setMaster2(item)">{{person.userName}}</span></div>
    </div>
  </div>
</template>
<style scoped lang="less">
h3{
  margin-bottom: .1rem;
}
.trace{
  padding: .1rem;
  overflow: auto;
  .item{
    padding: .1rem;
    margin-bottom: .1rem;
    background: #f5f7f9;
    &:hover{
      background: rgba(76,92,219,0.08);
    }
    div{
      line-height: .32rem;
    }
  }
}
</style>

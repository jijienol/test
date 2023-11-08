<script setup>

import {getCurrentInstance, ref, watch} from 'vue'
import {noteStore} from '@/store/modules/note.js'

import {saveDeployUserList, findDeployUserList} from '@/api/ControlBK.js'
import {swdtStore} from '@/store/modules/swdt.js'
import {bus} from 'vue3-eventbus'

const {proxy} = getCurrentInstance()
const note = noteStore()
const swdt = swdtStore()
const props = defineProps(['BKGSList', 'BKRYList'])
// console.log(props)

const border1 = ref([])
const border = ref([])

function BK (row) {
  
  note.BK1 = 'xg'
  note.addSign.addSignVisible = true
  if (row.pid) {
    note.peopleForm = {
      id: row.pid,
      name: row.name,
      type: row.ptype,
      gender: row.gender,
      idcard: row.idcard,
      phone: row.phone,
      age: row.age,
      remark: row.remark,
      objectSourceId: row.id
    }
  } else {
    // console.log(row)
    note.peopleForm = {
      id: row.id,
      name: row.name,
      type: row.ptype,
      gender: row.gender,
      idcard: row.idcard,
      phone: row.phone,
      age: row.age,
      remark: row.remark,
      objectSourceId: row.objectSourceId
    }
    
  }
  
}

watch(() => note.BkListVisible, (val) => {
  border1.value = []
  border.value = []
})


function xq (val) {
  console.log(val)
  
  function isValidChineseID (idStr) {
    // 使用正则表达式匹配身份证号码的规则
    const pattern = /^\d{17}[\dX]$/;
    return pattern.test(idStr);
  }
  
  if (border1.value.length >= 10) {
    proxy.$Message.error('最多只能批量十个')
    return
  } else if (!isValidChineseID(val.idcard)) {
    proxy.$Message.error('请录入正确的身份证号码')
    return
  }
  
  if (border1.value.some(item => item == val)) {
    border1.value = border1.value.filter(item => item != val)
  } else {
    border1.value.push(val)
  }
}

function active (val) {
  const flag = border1.value.filter(item => item.objectSourceId == val)
  if (flag.length) {
    return 'active'
  } else {
    return ''
  }
}

async function save () {
  console.log(border1.value, border.value)
  if (!border.value.id) {
    proxy.$Message.error('请选择布控公司')
    return
  }
  if (!border1.value.length) {
    proxy.$Message.error('请选择布控人员')
    return
  }
  
  const info = {companyId: border.value.id, iiDeployPeopleList: []}
  border1.value.forEach(item => {
    info.iiDeployPeopleList.push({
      idCard: item.idcard,
      phone: item.phone,
      objectSourceId: item.objectSourceId
    })
  })
  try {
    const res1 = await saveDeployUserList(info)
    if (res1.data.code == 200) {
      console.log(res1.data.data)
      bus.emit('gs', {border:border.value, bkBatchNo:res1.data.data})
      note.BkListVisible = false
      swdt.qrcode = {
        visible: true,
        bkBatchNo: res1.data.data,
        channelType: 'offlineBk'
      }
      
    } else {
      proxy.$Message.error(res1.data.message)
    }
  }
  catch (e) {
    console.log(e)
    
    proxy.$Message.error(e)
    
  }
  
}
</script>

<template>
  <div class="bkList">
    <div class="left">
      <h2>请选择布控公司</h2>
      <RadioGroup v-model="border" class="radioList">
        <Radio v-for="item in props.BKGSList" :label="item" border style="margin-bottom: 5px">
          {{ item.name }}&nbsp;&nbsp;&nbsp;&nbsp;<span v-if="item.maxDeployDay"> 最大布控天数{{ item.maxDeployDay }}天</span>
        </Radio>
      </RadioGroup>
    </div>
    <div class="right">
      <h2>请选择人员</h2>
      <div class="radioList">
        <div v-for="item in props.BKRYList" :class="active(item.objectSourceId)" class="li " @click="xq(item)">
          <p><span style="width: 150px;">姓名：{{ item.name }}</span><span style="width: 200px;">手机号：{{ item.phone }}</span></p>
          <p><span>证件号：{{ item.idcard }}</span></p>
          <Button class="bt" icon="ios-create" @click.stop="BK(item)"></Button>
        </div>
      </div>
    </div>
    <Button class="bt1" type="primary" @click="save">确认布控</Button>
  </div>

</template>
<style lang='less' scoped>
.active {
  border: 1px solid #0073e5 !important;
}

.bkList {
  display: flex;
  width: 800px;
  height: 580px;
  
  .bt1 {
    position: absolute;
    bottom: 10px;
    right: 20px;
  }
  
  .left {
    width: 300px;
  }
  
  .right {
    width: 480px;
    height: 500px;
  }
  
  .radioList {
    display: flex;
    flex-direction: column;
    height: 500px;
    overflow: auto;
    
    .li {
      position: relative;
      border: 1px solid #cccccc;
      width: 400px;
      border-radius: 4px;
      margin: 0 0 5px;
      padding: 5px;
      
      span {
        display: inline-block;
      }
      
      .bt {
        position: absolute;
        right: 10px;
        top: 5px;
        font-size: 22px;
      }
    }
  }
}
</style>

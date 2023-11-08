<script setup="">
import {ref, reactive, getCurrentInstance, computed, watch, onMounted} from "vue";
import {ajListStore} from "@/store/modules/ajList.js";
import {storeToRefs} from "pinia";
import {reg_ip, reg_mac} from "@/utils/regExp.js";
const {proxy} = getCurrentInstance()
const ajStore = ajListStore()
import {deepDetectCart, addIntoCart, removeFromCart, selectCart, getCartSolution} from '@/api/ajJs.js'
import {swdtStore} from "@/store/modules/swdt.js";
/*const props = defineProps({
  param: [Object]
})*/
const submitLoading = ref(false)
const {traceList, traceListVisible, traceItem} = storeToRefs(ajStore)
const swdt = swdtStore()
const Data = reactive({
  traceType:'',
  ipList: traceList.ip,
  macList: traceList.wifi,
  traceIdIp: computed(() => {
    let obj = proxy.$lodash.find(traceList.value.ip, r => { // 第一个包含traceId的元素
      return r.traceId != ''
    })
    return obj ? obj.traceId: ''
  }),
  traceIdWifi: computed(() => {
    let obj = proxy.$lodash.find(traceList.value.wifi, r => { // 第一个包含traceId的元素
      return r.traceId != ''
    })
    return obj ? obj.traceId: ''
  }),
  submitRule: computed(() => {
    if(Data.traceIdIp && Data.traceIdWifi) {
      return false
    } else {
      return true
    }
  }),

})
/*watch(() => traceList.value.ip, (n) => {
  let obj = proxy.$lodash.find(n, r => { // 第一个包含traceId的元素
    return r.traceId != ''
  })
  return Data.traceIdIp = obj ? obj.traceId: ''

}, {})*/
/*watch(() => traceList.value.wifi, (n) => {
  let obj = proxy.$lodash.find(n, r => { // 第一个包含traceId的元素
    return r.traceId != ''
  })
  Data.traceIdWifi = obj ? obj.traceId: ''

}, {})*/
const inputValue = ref('')
watch(() => traceItem.value, (n) => {
  if(n.traceName) {
    // console.log(n);
    verifyHandler(n)
  }
}, {deep: true})

function addItem(item) {

  addIntoCart(item).then(res => {
    // console.log(res);
    let {code, data} = res.data;
    if(code == 200) {
      // console.log(data);
      ajStore.setTraceListItem(item.traceType, item.traceName, {id: data})
      inputValue.value = ''

    }
  })
}

function verify() {
  // console.log(Data.traceType);
  if(inputValue.value) {
    let param = {
      "traceName": inputValue.value,
      "traceId": "",
      "caseId": ajStore.caseId,
      "taskChannelId": "",
      "traceType": Data.traceType
    }
    verifyHandler(param)
  }
}
function verifyHandler(obj) {
  if(obj.traceType == 'ip') {
    if(reg_ip(obj.traceName)) {
      let r = ajStore.setTraceList('ip', obj)
      if(!r.flag) {
        proxy.$Message.warning(r.msg)
      } else {
        addItem(obj)
      }
    }else {
      proxy.$Message.warning('ip格式有误')
    }
  } else if(obj.traceType == 'wifi') {
    obj.traceName = obj.traceName.replace(/-/g, ':')
    if(reg_mac(obj.traceName)) {
      let r = ajStore.setTraceList('wifi', obj)
      if(!r.flag) {
        proxy.$Message.warning(r.msg)
      } else {
        addItem(obj)
      }
    } else {
      proxy.$Message.warning('mac格式有误')
    }
  }
}
function verifyIp() {
  if(inputValue.value) {
    if(reg_ip(inputValue.value)) {

      let param = {
        "traceName": inputValue.value,
        "traceId": "",
        "caseId": ajStore.caseId,
        "taskChannelId": "",
        "traceType": "ip"
      }

      let r = ajStore.setTraceList('ip', param)
      if(!r.flag) {
        proxy.$Message.warning(r.msg)
      } else {
        addItem(param)
      }
    }else {
      proxy.$Message.warning('ip格式有误')
    }
  }
}
function verifyMac() {
  if(inputValue.value) {
    inputValue.value = inputValue.value.replace(/-/g, ':')
    if(reg_mac(inputValue.value)) {
      let r = ajStore.setTraceList('wifi', {traceName: inputValue.value, traceId:''})
      if(!r.flag) {
        proxy.$Message.warning(r.msg)
      }else {
        let param = {
          "traceName": inputValue.value,
          "traceId": "",
          "caseId": ajStore.caseId,
          "taskChannelId": "",
          "traceType": "wifi"
        }
        addItem(param)
      }
    }else {
      proxy.$Message.warning('mac格式有误')
    }
  }
}
function cancel() {
  inputValue.value = ''
}

function submit() {
  // console.log(Data);
  submitLoading.value = true
  if(traceList.value.ip.length > 1) {
    getCartSolution({type:'internet',targetType:'ip' ,apiType:1}).then(res => {
      // console.log(res);
      let {code, data} = res.data;
      let channel = data[0]

      let _traceName = ''
      traceList.value.ip.forEach(i => {
        _traceName += i.traceName + ','
      })
      _traceName = _traceName.substring(0, _traceName.length -1)
      // console.log(_traceName);
      let _channelFieldList = []
      let _channelSolutionList = []
      channel.fields.forEach(f => {
        _channelFieldList.push({
          fieldName: f.fieldName,
          fieldValue: _traceName,
          id: f.id,
          sourceCode: f.sourceCode,
        })
      })
      _channelSolutionList = [channel.id]
      let param = {
        caseId: ajStore.caseId,
        channelFieldList: _channelFieldList,
        channelSolutionIdList: _channelSolutionList,
        channelType:'internet',
        id: null,
        type: 'deepDetect',
        issueType: 1,
        noteId: '',
        taskId: '',
        traceId: '',
        traceName: _traceName,
        traceParentId: Data.traceIdIp,
        trackType: 'ip',
        trackTypeName: 'IP'
      }
      deepDetectCart(param).then(response => {
        console.log(response);
        if(response.data.code == 200) {
          swdt.getData(ajStore.caseId)
          getList()
          submitLoading.value = false
        }else {
          submitLoading.value = false
        }

      })
    })
  }
  if(traceList.value.wifi.length > 1) {
    getCartSolution({type:'internet',targetType:'wifi' ,apiType:1}).then(res => {
      let {code, data} = res.data;
      let channel = data[0]

      let _traceName = ''
      traceList.value.wifi.forEach(i => {
        _traceName += i.traceName + ','
      })
      _traceName = _traceName.substring(0, _traceName.length -1)
      // console.log(_traceName);
      let _channelFieldList = []
      let _channelSolutionList = []
      channel.fields.forEach(f => {
        _channelFieldList.push({
          fieldName: f.fieldName,
          fieldValue: _traceName,
          id: f.id,
          sourceCode: f.sourceCode,
        })
      })
      _channelSolutionList = [channel.id]
      let param = {
        caseId: ajStore.caseId,
        channelFieldList: _channelFieldList,
        channelSolutionIdList: _channelSolutionList,
        channelType:'internet',
        id: null,
        type: 'deepDetect',
        issueType: 1,
        noteId: '',
        taskId: '',
        traceId: '',
        traceName: _traceName,
        traceParentId: Data.traceIdWifi,
        trackType: 'wifi',
        trackTypeName: 'WIFI'
      }
      deepDetectCart(param).then(response => {
        console.log(response);
        if(response.data.code == 200) {
          swdt.getData(ajStore.caseId)
          getList()
        } else {
          submitLoading.value = false
        }

      })
    })
  }

}
function del(type, i) { // 批量删除多个id用逗号分隔
  let obj = traceList.value[type][i]
  let param = {
    id: obj.id
  }
  removeFromCart(param).then(res => {
    // console.log(res);
    let {code, data} = res.data;
    if(code == 200) {
      ajStore.removeTraceList(type, i)
    }
  })

}
function getList() {
  ajStore.clearTraceList()
    selectCart({caseId: ajStore.caseId}).then(res => {
    // console.log(res);
    let {code, data} = res.data;
    if(code == 200) {
      data.forEach(d => {
        if(d.traceType == 'wifi') {
          ajStore.setTraceList('wifi', d)

        } else if(d.traceType == 'ip'){
          ajStore.setTraceList('ip', d)

        }
      })
    }
  })
}
onMounted(() => {
  getList()
})
</script>
<template>
<div class="main">
  <div>
    <div class="title">IP分析（需添加两个以上）
      <Poptip
          confirm
          title=""
          width="220"
          placement="top-start"
          @on-ok="verify"
          @on-cancel="cancel"
          :ok-text="'添加'">
        <template #title>
          <div class="pop-title"><Input class="pop-inp" v-model.trim="inputValue"></Input></div>
        </template>
        <Icon type="md-add-circle" color="#1D83FF" size="20" @click="Data.traceType = 'ip'" />
      </Poptip>

    </div>

    <ul class="ul-wrap" v-show="traceList.ip.length">
      <li v-for="(item, i) in traceList.ip" :key="'ip-' + i">
{{item.traceName}}<Icon class="del-icon" type="md-trash" @click="del('ip', i)"/>
      </li>
    </ul>
  </div>
  <Divider style="margin-top: 15px;"></Divider>
  <div>
    <div class="title">MAC分析（需添加两个以上）
      <Poptip
          confirm
          title=""
          width="220"
          placement="top-start"
          @on-ok="verify"
          @on-cancel="cancel"
          :ok-text="'添加'">
        <template #title>
          <div class="pop-title"><Input class="pop-inp" v-model.trim="inputValue"></Input></div>
        </template>
        <Icon type="md-add-circle" color="#1D83FF" size="20" @click="Data.traceType = 'wifi'"/>
      </Poptip>
    </div>

    <ul class="ul-wrap" v-show="traceList.wifi.length">
      <li v-for="(item, i) in traceList.wifi" :key="'mac-' + i">
        {{item.traceName}}<Icon class="del-icon" type="md-trash" @click="del('wifi', i)"/>
      </li>
    </ul>
  </div>
  <Button v-if="traceList.ip.length >=2 || traceList.wifi.length >=2" class="submit-btn" long @click="submit" type="primary" :loading="submitLoading">线索碰撞</Button>

    <Button v-else class="submit-btn" long>
      <Poptip trigger="hover" title="提示" content="IP或MAC至少需要两条数据">
        <span>线索碰撞</span>
      </Poptip>
    </Button>

</div>
</template>
<style scoped lang="less">
*{
  margin: 0;
  padding: 0;}
ul li {
  list-style: none;
}
.main {
  position: relative;
  .ul-wrap {
    padding: 10px;
    border-radius: 8px;
    background-color: #F6F6F8;
    .del-icon {
      font-size: 17px;
      padding: 2px 0;
      cursor: pointer;
      display: none;
    }
    li {
      display: flex;
      justify-content: space-between;
      height: 20px;
      //height: 40px;
      &:hover {
        .del-icon {
          display: inline-block;
          height: 100%;
          &:hover {
            color: rgba(64, 158, 255, 0.95);
          }
        }
      }
    }
  }
  .submit-btn {
    position: absolute;
    bottom: 0;
    left: 0;
  }
}
.title {
  padding: 10px 0 5px;
  display: flex;
  justify-content: space-between;
}
.pop-title {
  display: flex;
  .pop-inp {
    flex: 1 0 100px;
  }
  .pop-btn {
    flex: 0 1 50px;
    padding: 0 4px;
  }
}
:deep(.ivu-icon-ios-help-circle) {
  display: none;
}
</style>

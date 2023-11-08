<script setup>
import {noteStore} from "@/store/modules/note.js";
import {swdtStore} from "@/store/modules/swdt.js";
import {ajListStore} from "@/store/modules/ajList.js";
import AddSignPeople from "./people.vue";
import peopleXQ from "./peopleXQ.vue";
import AddSignObject from "./object.vue";
import AddSignOrg from "./org.vue";
import AddSignAddress from "./address.vue";
import {
  addAddress,
  addObject,
  addOrg,
  addPeople,
  updateAddress,
  updateObject,
  updateOrg,
  updatePeople
} from "@/api/ajJs.js";
import {getCurrentInstance} from "vue";
import bus from 'vue3-eventbus'
import {cloneDeep} from "lodash";
import {getListData} from "@/utils/tree.js";
import People from "../../../../views/Detect/components/people.vue";

const ajStore = ajListStore()
const {proxy} = getCurrentInstance()
const note = noteStore()
const swdt = swdtStore()

async function save () {
  note.addSign.loading = true
  let params = {}
  let res = ''
  console.log(note.addSign)
  if (note.peopleForm.idcard) {
    note.peopleForm.idcard = note.peopleForm.idcard.trim( )
  }
  try {
    if (note.addSign.type == 'add') {
      if (note.addSign.signType == 'people') {
        params = Object.assign(note.param, note.peopleForm)
        params.traceName = note.peopleForm.name
        
        res = await addPeople(params)
        if (res.data.code == 200) {
          swdt.getData(ajStore.caseId)
        }
      } else if (note.addSign.signType == 'address') {
        params = Object.assign(note.param, note.addressForm)
        params.traceName = note.addressForm.name
        res = await addAddress(params)
        
      } else if (note.addSign.signType == 'object') {
        params = Object.assign(note.param, note.objectForm)
        params.traceName = note.objectForm.name
        res = await addObject(params)
        
      } else if (note.addSign.signType == 'org') {
        params = Object.assign(note.param, note.orgForm)
        params.traceName = note.orgForm.name
        res = await addOrg(params)
        
      }
      
      if (res.data.code == '200') {
        
        note.addSign.loading = false
        note.addSign.addSignVisible = false
        note.addSign.flag = !note.addSign.flag
        let flag = note.type == 'sign'
        if (note.noteVisible) {
          if (note.noteVisible == flag) {
            await note.openSign(note.signOpenType, note.signParams.caseId, note.signParams.traceId, note.signParams.virtualId)
          }
        }
        await swdt.getTabNums(note.caseId)
        swdt.treeData1.map(item => {
          if (item.id == note.param.traceId) {
            if (item.sum) {
              item.sum.markNum = item.sum.markNum + 1
            }
          }
        })
        swdt.treeData = cloneDeep(getListData(swdt.treeData1))
        proxy.$Message.success('添加成功')
        swdt.history.markNum += 1
        console.log("12312312312")
        bus.emit('table', 'sign')
      } else {
        note.addSign.loading = false
        note.addSign.addSignVisible = false
        console.log(res)
        proxy.$Message.error(res.data.message)
      }
    } else if (note.addSign.type == 'update') {
      if (note.addSign.signType == 'people') {
        params = Object.assign(note.param, note.peopleForm)
      } else if (note.addSign.signType == 'address') {
        params = Object.assign(note.param, note.addressForm)
      } else if (note.addSign.signType == 'object') {
        params = Object.assign(note.param, note.objectForm)
      } else if (note.addSign.signType == 'org') {
        params = Object.assign(note.param, note.orgForm)
      }
      switch (note.addSign.signType) {
        case 'people':
          params = note.peopleForm
          updatePeople(params).then(res => {
            if (res.data.code == '200') {
              note.addSign.loading = false
              note.addSign.addSignVisible = false
              proxy.$Message.success('保存成功')
              note.addSign.flag = !note.addSign.flag
              note.openSign(note.signOpenType, note.signParams.caseId, note.signParams.traceId, note.signParams.virtualId)
            } else {
              note.addSign.loading = false
              note.addSign.addSignVisible = false
              proxy.$Message.error(res.data.message)
            }
          }).catch(err => {
            console.log(err);
            note.addSign.loading = false
            proxy.$Message.error(err.data.message)
          })
          // res = await
          
          break
        case 'object':
          params = note.objectForm
          updateObject(params).then(res => {
            if (res.data.code == '200') {
              note.addSign.loading = false
              note.addSign.addSignVisible = false
              proxy.$Message.success('修改成功')
              note.addSign.flag = !note.addSign.flag
              note.openSign(note.signOpenType, note.signParams.caseId, note.signParams.traceId, note.signParams.virtualId)
            } else {
              note.addSign.loading = false
              note.addSign.addSignVisible = false
              proxy.$Message.error(res.data.message)
            }
          }).catch(err => {
            console.log(err);
            note.addSign.loading = false
            proxy.$Message.error(err.data.message)
          })
          // res = await updateObject(params)
          break
        case 'org':
          params = note.orgForm
          updatePeople(params).then(res => {
            if (res.data.code == '200') {
              note.addSign.loading = false
              note.addSign.addSignVisible = false
              proxy.$Message.success('修改成功')
              note.addSign.flag = !note.addSign.flag
              note.openSign(note.signOpenType, note.signParams.caseId, note.signParams.traceId, note.signParams.virtualId)
            } else {
              note.addSign.loading = false
              note.addSign.addSignVisible = false
              proxy.$Message.error(res.data.message)
            }
          }).catch(err => {
            note.addSign.loading = false
            console.log(err);
            proxy.$Message.error(err.data.message)
          })
          // res = await updateOrg(params)
          break
        case 'address':
          params = note.addressForm
          updatePeople(params).then(res => {
            if (res.data.code == '200') {
              note.addSign.loading = false
              note.addSign.addSignVisible = false
              proxy.$Message.success('修改成功')
              note.addSign.flag = !note.addSign.flag
              note.openSign(note.signOpenType, note.signParams.caseId, note.signParams.traceId, note.signParams.virtualId)
            } else {
              note.addSign.loading = false
              note.addSign.addSignVisible = false
              proxy.$Message.error(res.data.message)
            }
          }).catch(err => {
            note.addSign.loading = false
            console.log(err);
            proxy.$Message.error(err.data.message)
          })
          // res = await updateAddress(params)
          break
      }
    }
  }
  catch (err) {
    note.addSign.loading = false
    
    if (err.data.code != '200') {
      proxy.$Message.error(err.data.message)
    }
  }
  
}
</script>
<script>
export default {
  name: "addSign"
}

</script>
<template>
  <Modal
    v-model="note.addSign.addSignVisible"
    :draggable="true"
    :mask="false"
    :reset-drag-position="true"
    :scrollable="false"
    :title="note.addSign.title"
    footer-hide
    width="1000"
  >
    <span v-if="note.addSign.signType === 'people'&& note.addSign.type == 'add'">
            <add-sign-people @save="save"></add-sign-people>
    </span>
    <span v-if="note.addSign.signType === 'people' && note.addSign.type == 'update'">
      <peopleXQ @save="save"></peopleXQ>
    </span>
    <span v-if="note.addSign.signType === 'object'">
      <add-sign-object @save="save"></add-sign-object>
    </span>
    <!--    <span v-if="note.addSign.signType === 'org'">-->
    <!--            <add-sign-org   @save="save"></add-sign-org>-->
    <!--    </span>-->
    <!--    <span v-if="note.addSign.signType === 'address'">-->
    <!--            <add-sign-address   @save="save"></add-sign-address>-->
    <!--    </span>-->
  </Modal>
</template>
<style lang="less" scoped>
</style>

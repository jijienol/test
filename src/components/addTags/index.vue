<script setup>
import {swdtStore} from "@/store/modules/swdt.js";
import {ref, getCurrentInstance} from "vue";

const {proxy} = getCurrentInstance()
const swdt = swdtStore()
const props = defineProps(['caseId'])
//关闭
function handleCancel(){
  swdt.visible = false
}
function cancelTag(){
  swdt.tagVisible = false
}
const tagLabel = ref('')
function saveTag () {
  swdt.customTags.push({
    tagCode: '',
    tagName: tagLabel.value,
    sourceType: 0,
    checked: true
  })
  tagLabel.value = ''
}
async function  savePlTag () {
  const res = await swdt.savePlTag()
    if (res == 111) {
      proxy.$Message.error('最多添加6个标签')
    }else if(res){
      proxy.$Message.success("标签编辑成功")
    }else {
      proxy.$Message.error('标签编辑失败')
    }
}
</script>
<script>
export default {
  name:"AddTags"
}

</script>
<template>
  <div>
    <Modal
      title="新增标签"
      v-model="swdt.tagVisible"
      @on-ok="saveTag"
      @on-cancel="cancelTag"
    >
      <Input v-model="tagLabel" maxlength="13" placeholder="请填写标签名称"></Input>
    </Modal>
    <Modal
      title="线索标签"
      v-model="swdt.visible"
      ok-text="添加"
      @on-ok="savePlTag"
      @on-cancel="handleCancel"
    >
      <div class="tags__wrapper">
        <template v-if="swdt.customTags.length">
          <span v-for="(item, i) in swdt.customTags" :key="i" :class="['tags__inner',{active: item.checked}]" @click="item.checked = !item.checked">
          {{item.tagName}}
        </span>
        </template>
        <Button icon="md-add" type="dashed" @click="swdt.tagVisible = true" :style="{marginBottom: '10px', height: '36px', fontSize: '14px'}">新增标签</Button>
      </div>
    </Modal>
  </div>

</template>
<style scoped lang="less">
.no-data {
  font-size: 14px;
  color: #999;
}

.tags {
&__wrapper {
   display: flex;
   align-items: center;
   flex-wrap: wrap;
 }

&__inner {
   cursor: pointer;
   font-size: 14px;
   padding: 8px 10px;
   border: 1px solid #e3e8ee;
   border-radius: 3px;
   background: #f7f7f7;
   margin-right: 10px;
   margin-bottom: 10px;

&.active {
   background-color: #39f;
   color: #fff;
 }
}
}
</style>

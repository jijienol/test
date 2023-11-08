<script setup>
// import {inject} from "vue";
//
// const getGraph =inject('getGraph')
const getNode = inject('getNode')
const node = getNode() // 获取节点
// const graph = getGraph()
// console.log(graph.getSuccessors(node.animation.cell))
import {permissionStore} from "@/store/modules/permission.js";
import {globalStore} from "@/store/modules/global.js";
import {swdtStore} from "@/store/modules/swdt.js";
import {cloneDeep} from "lodash";
import {computed, inject, ref} from "vue";
import {getListData} from "@/utils/tree.js";

const props = defineProps(['task'])
const {task} = props

const permission = permissionStore()
const global = globalStore()
const swdt = swdtStore()
const flag = ref()

flag.value = computed(() => task.collapseSub).value

//折叠
async function fold() {
 
  flag.value = flag.value == 0 ? 1 : 0
  
  swdt.treeData1 = swdt.treeData1.map(item => {
    if (item.id == node.id) {
      item.collapseSub = flag.value
    }
    return item
  })
  swdt.treeData = cloneDeep(getListData(swdt.treeData1))
}
</script>

<template>
  <div class="police__wrapper">
    <div class="police__item">
      <p class="title" :title="task.name">{{ task.name }}</p>
    </div>
    <div  class="fold" @click.once="fold">
      <i v-if="flag == 0" class="iconfont icon-caidanzhedie "></i>
      <i v-else class="iconfont icon-caidanzhankai"></i>
    </div>
  </div>
</template>
<style lang="less" scoped>
.police__wrapper {
    margin-top: 20px;
  width: 1rem;
  min-height: .76rem;
  background: #FFFFFF;
  border-radius: 8px 8px 8px 8px;
  box-shadow: 0px 2px 8px 1px rgba(24, 31, 67, 0.32);
  opacity: 1;
  cursor: pointer;
  position: relative;
  
  .tool {
    display: none;
    z-index: 999999 !important;
  }
  
  .fold {
    width: .25rem;
    height: .25rem;
    position: absolute;
    right: -.25rem;
    top: .28rem;
    border-radius: 50%;
    background: #FFF;
    border: 1px solid #ccc;
    
    i {
      font-size: .25rem;
      line-height: .22rem;
      text-align: center;
    }
  }
  
  .police__item {
    position: relative;
    padding: .15rem;
    
    .title {
      width: 1rem;
      //white-space: nowrap;
      //overflow: hidden;
      //text-overflow: ellipsis;
      font-size: .22rem;
      color: #000;
    }
  }
  
}

</style>

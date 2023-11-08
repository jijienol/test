<script setup>
// import {inject} from "vue";
//
// const getGraph =inject('getGraph')
import bus from 'vue3-eventbus'

// const graph = getGraph()
// console.log(graph.getSuccessors(node.animation.cell))
import {permissionStore} from "@/store/modules/permission.js";
import {globalStore} from "@/store/modules/global.js";
import {swdtStore} from "@/store/modules/swdt.js";
import {cloneDeep} from "lodash";
import {computed, inject, ref} from "vue";
import {getListData} from "@/utils/tree.js";
import {Icon} from 'view-ui-plus'

import {noteStore} from '@/store/modules/note.js'
import {storeToRefs} from 'pinia'
const note = noteStore()
const props = defineProps(['task'])
const {task} = props

const permission = permissionStore()
const global = globalStore()
const swdt = swdtStore()
const flag = ref()
const {popupVisible} = storeToRefs(global)
const {noteVisible} = storeToRefs(note)
flag.value = computed(() => task.collapseSub).value


function png (v) {
  return 'icon-' + v
}

const asd = computed(() => {
  return task.childs
})

function toCell () {
  bus.emit('toCell', task.pid)
}

//删除节点
function delNode () {
  if (popupVisible.value) { // 打开状态判断是否需要关闭
    // if(task.id == swdt.history.new.node.id) { // 删除了当前激活状态的节点
    popupVisible.value = false
    // }
  }
  if (noteVisible.value) { // 关闭笔记或标定
    noteVisible.value = false
  }
  swdt.delNode(task)
}

//移入移出 工具栏显示
const tool = ref(false)


function enter () {
  tool.value = true
}

function shiftOut () {
  tool.value = false
}

function openRemarkEdit (id, remark) {
	task.remark = remark
	bus.emit('remark', {id: id, remark: remark})
}
</script>

<template>

<div style="min-height: 1.6rem;padding-top: .2rem;position: relative" @mouseenter="enter" @mouseleave="shiftOut">
  <div :class="tool ? 'top-tool':''" class="tool ">
    <div class="left">
      <div class="left-item" @click.stop="delNode">
        <i class="iconfont icon-shanchu"></i>
        <span>删除</span>
      </div>
	    <div class="left-item" style="min-width: .42rem;overflow: hidden;" :title="task.createName">
		    <Icon type="ios-person " size="24" />
		    <span >{{task.createName}}</span>
	    </div>
    </div>
  </div>
  <div :class="task.id==swdt.border? 'active':''" class="police__wrapper" >

    <div :class="asd?'masks':''">
      
      <div class="police__item">
        <div :title="task.label" class="title">
          <i :class="png(task.trackType)" class="iconfont" style="font-size: .20rem;margin-right: .05rem"></i>
          <span v-if="task.trackType!='virtualId'">{{ task.trackTypeName }}</span>
          <span v-else>{{ task.trackTypeName }}</span>
          <span>{{ task.name }}</span>
        </div>
      </div>
	   
      <div class="createdTime">{{ task.createdTime }}</div>
	    <div class="remark-wrap">
		    <i class="iconfont icon-xiugai"></i>
		    <span :title="task.remark" class="txt" @click="openRemarkEdit(task.id, task.remark)">
            {{ task.remark || '填写备注' }}
          </span>
	    </div>
      <div class="num" @click="toCell"><span style="font-size: 32px;font-weight: 500;line-height: 0;">{{ task.sort }}</span><span>/{{ task.num }}次</span>
        <div style="font-size: 12px;color:#fff;">返回首次</div>
      </div>
    </div>
  </div>
</div>
</template>
<style lang="less" scoped>
.createdTime {
	font-size: .12rem;
}
.tool {
  display: none;
  z-index: 999999 !important;
}
.top-tool {
  display: flex;
  align-items: center;
  position: absolute;
  justify-content: space-between;
  min-width: 2.64rem;
  height: .58rem;
  border-radius: 8px 8px 8px 8px;
  box-shadow: 0px 2px 8px 1px rgba(24, 31, 67, 0.32);
  background: #FFF;
  top: -.48rem;
  left: 0;
  //z-index: 999999 !important;
  
  .left {
    display: flex;
    align-items: center;
    height: .58rem;
    margin-right: .2rem;
    
    .left-item {
      width: .32rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      span {
        font-size: .12rem;
      }
    }
  }
	
  .right {
    display: flex;
    
    .right-item {
      display: flex;
      width: .5rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: .1rem;
      
      .icon-box {
        width: .28rem;
        height: .28rem;
        border-radius: 8px 8px 8px 8px;
        opacity: 1;
        border: 1px solid rgba(24, 31, 67, 0.12);
        text-align: center;
        line-height: .28rem;
      }
      
      span {
        font-size: .12rem;
      }
    }
  }
}

.title {
  width: 2.64rem;
  display: flex;
  
  span {
    font-size: 14px;
    
    &:nth-child(2) {
      color: rgba(24, 31, 67, 0.5);
      margin-right: .1rem;
      line-height: 28px;
    }
    
    &:nth-child(3) {
      width: 1.3rem;
      color: rgba(0, 0, 0, 0.85);
      line-height: 28px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.police__wrapper {
  position: relative;
  //margin-top:20px;
  width: 2.7rem;
  min-height: 1rem;
  background: #e2e2e2;
  border-radius: 40px;
  box-shadow: 0px 2px 8px 1px rgba(24, 31, 67, 0.32);
  padding: 20px;
  border: 3px solid #fff;
  
  .num {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 70px;
    height: 70px;
    background: #d5d0d0;
    border-radius: 50%;
    text-align: center;
    color: #d8a09f;
    padding-top: 20px;
  }
  
  .police__item {
    position: relative;
    display: flex;
  }
  
}

.active {
  border: 2px solid rgba(29, 131, 255, 0.4);
}

.masks {
  position: absolute;
  left: -3px;
  top: -3px;
  padding: 20px;
  width: 2.7rem;
  min-height: 1rem;
  background: #ECF5FF;
  box-shadow: 0px 4px 12px 0px #CDE3FB;
  border-radius: 40px;
  opacity: 1;
  border: 3px solid #006DDD;
}
.remark-wrap {
	padding-top: 15px;
	display: flex;
	color: #888;
	align-items: center;
	
	.iconfont {
		flex: 0 0 20px;
	}
	
	.txt {
		flex: 0 1 auto;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		
		&:hover {
			color: #2d8cf0;
			text-decoration: underline;
		}
	}
}

</style>

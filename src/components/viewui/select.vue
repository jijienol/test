<script setup="">
import {reactive, ref} from "vue";
import {ajListStore} from "@/store/modules/ajList.js";
import {storeToRefs} from "pinia";
const props = defineProps({
  list: []
})
const ajStore = ajListStore()
const {traceTypeOptions} = storeToRefs(ajStore)
console.log(traceTypeOptions);
const emits = defineEmits(['select'])
const height = ref(400)
const visible = ref(false)
const selected = ref('')
const outTimer = ref(null)
function toggle() {
  visible.value = !visible.value
}
function sel(item) {
  emits('select', item.value)
}
function leaveHandler() {
  outTimer.value = setTimeout(() => {
    visible.value = false
  }, 1000)
}
function wrapLeave() {
  clearTimeout(outTimer.value)
}
</script>
<template>
  <span class="main">
    <span class="con" @click="toggle()" @mouseleave="leaveHandler()">{{selected}}</span>
    <div v-show="visible" class="scroll-wrap" @mouseenter="wrapLeave()" @mouseleave="leaveHandler()">
<!--      <Scroll :height="height">-->
        <ListItem class="option" v-for="(item, i ) in traceTypeOptions.value" @click="sel(item)">{{item.label}}</ListItem>
<!--      </Scroll>-->
    </div>
  </span>
</template>
<style scoped lang="less">
.main{
  position: relative;
  display: inline-block;
  height: 30px;
  min-width: 180px;
  //padding: 0 10px;
  //border: 1px solid #999;
  //background-color: #fff;
  .con {
    display: inline-block;
    width: 100%;
    line-height: 30px;
    height: 30px;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid #cdcccc;
    outline: 0;
    background-color: #fff;
    &:hover {
      border-color: #57a3f3;
    }
  }
  .scroll-wrap {
    position: absolute;
    left: 0;
    top: 100%;
    height: 200px;
    overflow: scroll;
    width: 100%;
    transition: height 0.2s ease;
    border: 1px solid red;
    z-index: 10;
    background: #fff;
  }
}
.option {
  color: #000;
  &:hover {
    color: #109dfb;
  }
}
</style>
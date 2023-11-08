<script setup>
// import {inject} from "vue";
//
// const getGraph =inject('getGraph')
// const getNode = inject('getNode')
// const node = getNode() // 获取节点
// const graph = getGraph()
// console.log(graph.getSuccessors(node.animation.cell))
import {ref, computed} from "vue";
import {permissionStore} from "@/store/modules/permission.js";
import {downloadRequest} from '@/api/file.js'
import $Message from '@/utils/message.js'
import fileUtil from '@/utils/fileSaver.js'
import {globalStore} from "@/store/modules/global.js";
import {swdtStore} from "@/store/modules/swdt.js";
const permission = permissionStore()
const global = globalStore()
const swdt = swdtStore()

const props = defineProps({
  task: [Object]
})
// console.log(props.task);
const downloading = ref(false)
function downZip() {
  if(downloading.value) { // 防止重复点击
    $Message.warning('正在下载')
    return
  }
  downloading.value = true
  downloadRequest({caseId: props.task.caseId}).then(res => {
    let {code, data} = res.data
    if(code == 200) {
      if(data) {// 有包
        if(permission.networkType) {
          let _o = data.replace(/\/mnt\/runziDownloadBak/g, '')
          fileUtil.save('无需解压请将请求包直接上传', global.env.undozipUrl + _o)
          $Message.success('正在下载');
        } else {

          $Message.success('已全部重新发起请求!');
          swdt.getData(props.task.caseId)// 刷新导图的任务状态
        }
        downloading.value = false
      } else { // 没有包
        if(permission.networkType) {
          $Message.info('暂无重新请求的包');
        } else {
          $Message.info('不存在需要重新请求的任务');
        }
        downloading.value = false
      }
    } else {
      downloading.value = false
      $Message.error(data.message);
    }

  }).catch(err => {
    $Message.success('出现错误');
    downloading.value = false
  })
}

</script>
<script>
export default {
  name: "rootNode",
  // props: ['task'],
}

</script>
<template>
  <div class="police__wrapper">
      <div class="police__item">
        <p class="title" :title="task.name">{{task.name}}</p>
        <p style="font-size: .15rem;color: rgba(24,31,67,0.5);">{{task.caseNum}}</p>
        <p class="down" @click="downZip" title="重发"><i class="iconfont icon-repeat_"></i></p>
      </div>
  </div>
</template>
<style lang="less" scoped>
.police__wrapper {
  width: 2.4rem;
  min-height: .76rem;
  background: #FFFFFF;
  border-radius: 8px 8px 8px 8px;
  box-shadow: 0px 2px 8px 1px rgba(24,31,67,0.32);
  opacity: 1;
  .police__item{
    position: relative;
    padding: .15rem;
    .title{
      width: 2rem;
      //white-space: nowrap;
      //overflow: hidden;
      //text-overflow: ellipsis;
      font-size: .2rem;
      color:#000;
    }
  }

}
.down {
  position: absolute;
  display: inline-block;
  right: 10px;
  bottom: 4px;
  color: #999;
  &:hover {
    color: #2d8cf0;
  }
  .iconfont {
    font-size: 26px;
  }
}
</style>

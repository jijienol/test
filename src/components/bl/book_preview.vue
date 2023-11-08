<script setup="">
/* apkurl报告 */
import {ref, reactive, computed, watch, nextTick} from "vue";
import {ajListStore} from "@/store/modules/ajList.js";
import {globalStore} from "@/store/modules/global.js";
import qtUpload from '../fileUpload/qt_upload.vue'
import previewDoc from "@/libs/previewDoc.js";
import {delReportAttach} from "@/api/report.js";
import {storeToRefs} from "pinia";
import fileUtil from '@/utils/fileSaver.js'
import $Message from '@/utils/message'
import {permissionStore} from "@/store/modules/permission.js";

const fileSrc = ref('')
const modalVisible = ref(false)
const ajStore = ajListStore()
const global = globalStore()
const emits = defineEmits(['close'])
const permission = permissionStore()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
const {caseInfo} = storeToRefs(ajStore)
const tabValue = ref('')
const tabData = computed(() => {
  return caseInfo.value.caseFileList || []
})
const tabId = ref('')
function tabClick(val) {
  let r = tabData.value.find(obj => {return obj.id == val})

  fileSrc.value = ''
  let _o = r.url.replace(/\/mnt\/data\/upload/g,'')
  let s = global.env.fileUrl + _o
  setSrc(s)
  // fileSrc.value = previewDoc.src(s)
}
function handleContextMenu(val) {
  // console.log('handleContextMenu',val);
  tabId.value = val.name
}
function handleContextMenuEdit() {
  // 下载
  let r = tabData.value.find(obj => {return obj.id == tabId.value})
  let url = r.url.replace(/\/mnt\/data\/upload/g,'')
  // console.log(global.env.fileUrl + url);
  fileUtil.download(r.name, global.env.fileUrl + url)
  $Message.success('正在下载！')
}
function handleContextMenuDelete(val) {
  // console.log(val);
  delReportAttach({id: tabId.value}).then(res => {
    let {code, data} = res.data;
    if(code == 200) {
      if(tabId.value == tabValue.value) {// 删除了当前激活的需要清空内容
        fileSrc.value = ''
      }
      caseInfo.value.caseFileList.map((a, i, arr) => {
        if(a.id == tabId.value) {
          arr.splice(i, 1)
        }
      })
      $Message.success('删除成功！')
      if(caseInfo.value.caseFileList.length) {// 打开第一个
        let r = caseInfo.value.caseFileList[0]
        // console.log(r);
        tabValue.value = r.id
        fileSrc.value = ''

        let _o = r.url.replace(/\/mnt\/data\/upload/g,'')

        let s = global.env.fileUrl + _o

        // fileSrc.value = previewDoc.src(s)
        setSrc(s)
      }
    }

  })
}

function add() {
  modalVisible.value = true
}
function upCall(data) {
  // console.log(data.url);
  if(data) {
    fileSrc.value = ''
    // console.log(data);
    let _o = data.url.replace(/\/mnt\/data\/upload/g,'')
    let s = global.env.fileUrl + _o
    // fileSrc.value = previewDoc.src(s)
    setSrc(s)
    modalVisible.value = false
    ajStore.getCaseInfo()
  }

}
function close() {
  emits('close', '')
}
watch(() => tabData.value, (n) => {
  if(n && n.length> 0) {

    tabValue.value = n[0].id
  }
})
watch(() => props.visible, (n) => {

  if(n) {
    nextTick(() => {
      if(caseInfo.value.caseFileList.length) {
        let r = caseInfo.value.caseFileList[0]
        // console.log(r);
        tabValue.value = r.id
        fileSrc.value = ''
        // console.log(data);
        let _o = r.url.replace(/\/mnt\/data\/upload/g,'')
        // console.log(_o);
        let s = global.env.fileUrl + _o
        // console.log(s);
        // fileSrc.value = previewDoc.src(s)
        setSrc(s)
      }
    })
  }
}, {immediate: true})

function setSrc(s) {
  // console.log(!permission.networkType);
  if(permission.networkType) {
    fileSrc.value = s
  } else {
    fileSrc.value = previewDoc.src(s)
  }
  console.log(fileSrc.value)
}
</script>
<template>
  <Layout class="layout">
    <Header class="header" height="60">
      <Tabs type="card" v-model="tabValue" @on-click="tabClick" @on-contextmenu="handleContextMenu">
        <TabPane v-for="tab in tabData" :label="tab.name" :name="tab.id" context-menu></TabPane>

        <template #contextMenu>
          <DropdownItem @click="handleContextMenuEdit">下载</DropdownItem>
          <DropdownItem @click="handleContextMenuDelete" style="color: #ed4014">删除</DropdownItem>
        </template>
      </Tabs>
    </Header>
    <Content class="layout-content">
      <p v-show="!fileSrc" style="text-align: center;line-height: 50px;">暂无文件</p>
      <iframe v-show="fileSrc" :src="fileSrc" width="100%" height="100%"></iframe>
    </Content>
    <Footer class="layout-footer">
      <Button @click="close">关闭</Button><Button v-show="ajStore.caseId" type="primary" @click="add()" style="margin: 0 10px;">添加</Button>
    </Footer>
  </Layout>
  <Modal v-model="modalVisible" :footer-hide="true" :mask-closable="false">
    <qt-upload :caseId="ajStore.caseId" @upload="upCall"></qt-upload>
  </Modal>
</template>
<style scoped lang="less">
.layout {
  height: 100%;
  background-color: #fff;
}
.header {
  padding: 0;
  background-color: #fff;
}
.layout-content {
  height: 88%;
}
.layout-footer {
  padding: 10px 10px 0;
  border-top: 1px solid #eee;
  background-color: #fff;
  text-align: right;
}
</style>

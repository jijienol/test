<script setup="">
import {computed, ref,reactive, watch, getCurrentInstance, onMounted} from "vue";
  import previewDoc from "@/libs/previewDoc.js";
  import {getWordUrl} from '@/api/file.js';
    import docxPreview from '../docxPreview.vue';
  import blUpload from '@/components/fileUpload/bl_upload.vue';
  import {ajListStore} from "@/store/modules/ajList.js";
  import {globalStore} from "@/store/modules/global.js";
  import {permissionStore} from "@/store/modules/permission.js";
  import {storeToRefs} from "pinia";
  import fileUtil from "@/utils/fileSaver.js";
  import {docPath,batchCreateTrace} from "@/api/file.js";
  import {dictStore} from "@/store/modules/dictionary.js";
import {useRouter} from "vue-router";
const router = useRouter()
  const dict = dictStore()
  const {proxy} =getCurrentInstance()
  const permission = permissionStore()
  const ajStore = ajListStore()
let {traceTypeOptions} = storeToRefs(ajStore)

  const global = globalStore()
  const {network} = storeToRefs(permission)// 判断内外网环境，内网用插件，外网在线预览
  const {caseInfo} = storeToRefs(ajStore)
  const fileSrc = ref('')
  const downloadUrl = ref('')
  const modalVisible = ref(false)
  const uploadVisible = ref(false)
  const emits = defineEmits(['close'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  })
  const fileType = ref('')
  watch(() => props.visible, (n) => {
    if(n) {
      // if(!fileSrc.value) {
        getSrc()
      // }
    }
    // fileSrc.value = previewDoc.src(n)
  }, {immediate: true})
  const docPathUrl = ref()
  function getSrc() {
    downloadUrl.value = ''
    fileSrc.value = ''
    getWordUrl({caseId:ajStore.caseId}).then(res => {
     let {code, data} = res.data;
     if(code == 200) {
       if(data) {
         let _t = data.url.split('.')[1]
         fileType.value = _t
         let _o = data.url.replace(/\/mnt\/data\/upload/g,'')
         // let _n = _o.replace(/\/\//g, '/')
         let s = global.env.fileUrl + _o
         downloadUrl.value = s
         if(permission.networkType) {
           fileSrc.value = s
         } else {
           // console.log(previewDoc.src(s));
           fileSrc.value = previewDoc.src(s)
         }

         docPathUrl.value = data.url
       }

     }
    })
  }
  const clueList = ref([])
  async function upCall(data) {
    if(data) {
      fileSrc.value = ''
      downloadUrl.value = ''
      let _t = data.split('.')[1]
      fileType.value = _t
      let _o = data.replace(/\/mnt\/data\/upload/g,'')
      let s = global.env.fileUrl + _o
      downloadUrl.value = s
      // fileSrc.value = s
      if(permission.networkType) {
        fileSrc.value = s
      } else {
        fileSrc.value = previewDoc.src(s)
      }
      // fileSrc.value = previewDoc.src(s)
      caseInfo.value.sfscbl = 1
      try {
        docPathUrl.value = data
        const res = await docPath({docPath:data})
        if(res.data.code==200){
        clueList.value = res.data.data
        }else {
          proxy.$Message.error('线索解析失败')
        }
      }catch(e){
        proxy.$Message.error('线索解析失败')
      }
      modalVisible.value = false
    }

  }
  const modalType = ref('office')
  function add() {
    modalVisible.value = true
    // uploadVisible.value = !uploadVisible.value
    modalType.value = 'office'
  }
const clueGroup = ref('')
 async function add2() {
   clueGroup.value = ''
   // console.log(docPathUrl.value)
    if(!docPathUrl.value){
      proxy.$Message.error('请先上传word文件或笔录照片再操作')
    }else {
      try {
        const res = await docPath({docPath:docPathUrl.value})
        if(res.data.code==200){
          if(res.data.data.length) {
            proxy.$Message.success('文件解析成功')
            // let list = res.data.data
            clueList.value = res.data.data
            console.log(clueList.value)
          } else {
            proxy.$Message.info('文件解析成功，但未解析出任何线索！')
          }

        }else {
          proxy.$Message.error(res.data.message)
        }
      }catch(e){
        proxy.$Message.error('线索解析失败')
      }
    }
 
}

  function download() {
    if(downloadUrl.value) {
      fileUtil.save(ajStore.caseInfo.name + '笔录', downloadUrl.value)
    }
  }
  function close() {
    uploadVisible.value = false
    emits('close', '')
  }
  const TabsName = ref('name1')
  const trackTypeList = computed(()=>dict.dict.trackType.list)

function find(val) {
  let value = ''
  trackTypeList.value.forEach(item=>{
    if(item.value == val){
      value = item.label
    }
  })
  return value
}

onMounted(()=>{
    dict.getDict('trackType')
})
function del(index){
 
  console.log(clueList.value[index])
  clueList.value= clueList.value.filter((item,i)=>i!=index)
}
const batchLoading = ref(false)
const batchTishi = ref(false)
async function batch(){
  batchLoading.value = true
    try{
     const res = await batchCreateTrace({
        'caseId':ajStore.caseId,
        'traceItemVOS':clueList.value
      })
      // console.log(res.data.code)
      if(res.data.code!=200){
        batchLoading.value = false
  
        proxy.$Message.error(res.data.message)
      }else {
        batchLoading.value = false
        proxy.$Message.success('批量下发成功')
        await router.push('/czcc')
        global.bl = !global.bl
        close()
        // clueList.value = []
      }
    }catch (e){
      batchLoading.value = false
  
      proxy.$Message.error(e.data.message)
    }

}
</script>
<template>
  <Layout class="layout">
    <Tabs v-model="TabsName">
      <TabPane label="笔录详情" name="name1"></TabPane>
      <TabPane v-if="clueList.length >= 1" label="线索列表" name="name2"></TabPane>
    </Tabs>
    <Content v-if="TabsName=='name1'"  class="layout-content">
      <p v-show="!fileSrc" style="text-align: center;line-height: 50px;">暂无笔录文件</p>
      <docx-preview v-if="permission.networkType && fileType== 'docx'" :url="fileSrc" :type="'office'"></docx-preview>
      <iframe v-else :src="fileSrc" width="100%" height="100%"></iframe>

    </Content>
    <Content v-else class="layout-content">
      <p v-show="clueList.length == 0" style="text-align: center;line-height: 50px;">暂无笔录文件</p>
            <div span="24" v-for="(v,k,i) in clueList" style="display: flex">
              <Select v-model="v.type" style="width:200px">
                <Option v-for="item in traceTypeOptions" :value="item.value" :key="item.value" >{{ item.label }}</Option>
              </Select>
              <Input v-model="v.value" width="200"/>
              <Button @click="del(k)">删除</Button>
          </div>
      <Button type="primary" :loading="batchLoading" @click="batchTishi = true"  style="margin: 0 10px 0 0 ;align-items: end">批量下发</Button>
    </Content>
    <Footer class="layout-footer">
      <Button @click="close">关闭</Button>
      <Button v-show="ajStore.caseId" type="primary" @click="add()" style="margin: 0 10px;">添加文件</Button>
      <Button v-show="ajStore.caseId" type="primary" @click="add2()" style="margin: 0 10px 0 0 ;">OCR</Button>
      <Button type="primary" :disabled="!downloadUrl" @click="download()">下载</Button>
    </Footer>
  </Layout>
  <Modal v-model="modalVisible" :footer-hide="true">
    <RadioGroup v-model="modalType">
      <Radio label="office">word</Radio>
      <Radio label="image">图片</Radio>
    </RadioGroup>
      <bl-upload :caseId="ajStore.caseId" @upload="upCall" :modalType="modalType"></bl-upload>
<!--    <template #footer><Button @click="modalVisible.value = false">关闭</Button></template>-->
  </Modal>
  
  <Modal
    v-model="batchTishi"
    title="提示"
    @on-ok="batch()">
    <div style="height: 2rem;line-height: 2rem" >
      <h2 style="text-align: center">是否已确认批量下发任务的内容无误</h2>
    </div>
  </Modal>
</template>
<style scoped lang="less">
.layout {
  height: 100%;
  background-color: #fff;
  //border: 1px solid red;
}
.layout-header {
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
ul li {
  list-style: none;
}
.trace-type {
  font-size: 16px;
  font-weight: bold;
}
</style>

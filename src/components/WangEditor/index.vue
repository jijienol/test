<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {defineEmits, defineProps, onBeforeUnmount, ref, shallowRef, watch} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {permissionStore} from "@/store/modules/permission.js";
import ElMessage from "view-ui-plus/dist/viewuiplus.min.esm.js";
import {globalStore} from "@/store/modules/global.js";

const permission = permissionStore()
const global = globalStore()

//value富文本内容，images是否可以上传照片
const props = defineProps({
  value: {
    type: String,
    default: '',
    required: true
  },
  images: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 0
  },
  upload:{
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['changeValue'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const toolbarConfig = {

  
  insertKeys: {
    keys: ['uploadAttachment'], // “上传附件”菜单
  },
  excludeKeys: [
    props.images ? '' : 'group-image',
    'group-video',
    'emotion',
    props.upload?'':'uploadAttachment'
  ]
}

const editorConfig = {
  placeholder: '内容...',
  hoverbarKeys: {
    attachment: {
      menuKeys: ['downloadAttachment'], // “下载附件”菜单
    },
  },
  MENU_CONF: {
    uploadAttachment: {
      server: 'api/detectNote/uploadNoteAttachment', // 服务端地址
      fieldName: 'file',
      metaWithUrl: true, // meta 拼接到 url 上
      headers: {
        Accept: ['application/json', ' text/plain', ' */*'],
        Authorization: permission.token
      },
      
      maxFileSize: 100 * 1024 * 1024, // 10M
      
      onBeforeUpload(file) {
        console.log('onBeforeUpload', file)
        return file // 上传 file 文件
        // return false // 会阻止上传
      },
      // 失败回调
      onFailed(file, res) {
        console.log(res)
        if(res.errno === 1){
          ElMessage.success(`${file}附件上传失败，`+res.message)
        }
      },
      // 错误
      onError( res) {
        console.log('onError', res)
      },
     // 上传成功后，用户自定义插入文件
      customInsert(res, file, insertFn) {
        console.log('customInsert', res)
        const {filePath} = res.data || {}
        // 插入附件到编辑器
        insertFn(`附件-${file.name}`, filePath)
      }
    },
    // 上传图片
    uploadImage: {
      server: 'api/detectNote/uploadNoteAttachment',// uploadNoteAttachment
      fieldName: 'file',
      headers: {
        Accept: ['application/json', ' text/plain', ' */*'],
        Authorization: permission.token
      },
      // 自定义上传图片
      customInsert(res, insertFn) {
        console.log('customInsert',res.data)
        /*extName
:
"png"
fileName
:
"111.png"
filePath
: "http://39.101.1.212:6888/upload/notebook/2023-04-14/2d9d5f06dafd414a93d466cd2017c5ec/111.png"*/
        let {filePath, fileName} = res.data
        let url = global.env.fileUrl + filePath
        
        // console.log(url);
        insertFn(url, fileName)
      }
      // withCredentials: true
    }
  }
};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})


const valueHtml = ref('')
watch(() => props.value, (value) => {
  valueHtml.value = value
}, {
  immediate: true
})

watch(() => valueHtml.value, (value) => {
  emits('changeValue', value);
});


const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
const mode = ref('default')

</script>
<script>
export default {
  name: "WangEditor"
}

</script>
<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      style="height: 400px; overflow-y: hidden;"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
    />
  </div>
</template>

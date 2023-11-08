<script setup>
import {ref, reactive, getCurrentInstance, watch, computed} from "vue";
import {getAttachmentJson, getAttachmentJsonAfterUpload} from '@/api/details.js'
import {ajListStore} from "@/store/modules/ajList.js";
import {storeToRefs} from "pinia";
import vContextStyle from "@/directives/contextStyle.js";
const ajStore  = ajListStore()
const {proxy} = getCurrentInstance()
let {traceTypeOptions} = storeToRefs(ajStore)
import vTableDrag from "@/directives/tableDrag.js";
const props = defineProps({
  id: '',
  type: '1', // 首次标记还是二次标记 '1' '2'
  visible: {
    type: Boolean,
    default: false
  }
})
watch(() => props, (n) => {
    if(props.id && props.visible) {
      if(props.type == 1) {
        getJsonAfterUpload()
      } else {
        getJson()
      }

    }
}, {deep: true})
watch(() => props.visible, (n) => {
  if(!n) {
    // 关闭时清空
    Data.reset()
  }
})
const bdRef = ref(null)
const Data = reactive({
  originColumns: [],// 保存原始列
  columns: [],
  tableData: [],
  pageNo: 1,
  pageSize: 10,
  loading: false,
  reset: () => {
    Data.columns = []
    Data.tableData = []
    if(Data.collisionTypeList) {
      // console.log(Data.collisionTypeList);
      Data.collisionTypeList.forEach((c) => {
        c.disabled = false
      })
    }
    Data.colIndex = ''
    // Data.pageNo = 1
    // Data.pageSize = 1
  },
  bdColumns: computed(() => {
    let bdColumn = []
    let _columns = Data.columns
    _columns.forEach(c => {
      if (c.bdData!= '' && c.bdData!= null && c.bdData!= undefined) {
        bdColumn.push({key: c.key, bdData: c.bdData})
      }
    })
    return bdColumn
  }),
  colIndex: '',
  primary: '',// 主键
  contextDisable: false,
  collisionTypeList: traceTypeOptions || [],
  colSelected: null,
  getIndex: (tableObj, pageX) => {

    let arr = []
    let leftPx = ''
    for (let i in tableObj.columnsWidth) {
      let msg = {}
      if (i == 0) {
        msg = {
          index: i,
          startWidth: 0,
          endWidth: tableObj.columnsWidth[i].width
        }
      } else {
        msg = {
          index: i,
          startWidth: arr[i - 1].endWidth,
          endWidth: tableObj.columnsWidth[i].width + arr[i - 1].endWidth
        }
      }
      arr.push(msg)
    }
    leftPx = pageX - tableObj.$el.getBoundingClientRect().left
    let scrollLeft = tableObj.$refs.body.scrollLeft
    for (let i in arr) {
      if (leftPx < arr[i].endWidth - scrollLeft) {
        return i
      }
    }
  },
  contextHandler: (row, event) => {
    let pageX = event.pageX
    console.log(Data,bdRef.value, pageX);
  
    Data.colIndex = Data.getIndex(bdRef.value, pageX)
    console.log(Data.columns);
    let col = Data.columns[Data.colIndex]
    if(col.collision == 1) {
      Data.contextDisable = true
    } else {
      Data.contextDisable = false
    }
    Data.colSelected = col
  },
  setBd: (value, label) => {
    /* 0 标记为主键的列不能再设为比对列
      1 标记选中列高亮,同时改变表头项显示内容
      * 2 改变对应选项高亮
      * 3 再次点击取消标定（高亮）
      * */
    let _columns = Data.columns
    let uploadColumnItem = Data.colSelected
    let isContain = false// 已经标定过会把当前项的value放进uploadColumns的bdData中，所以判断包含来避免重复
    // _columns.forEach(item => {
    //   if (item.bdData == value) {
    //     isContain = true
    //   }
    // })
    
    let collisionTypeCurItem = Data.collisionTypeList.find(o => {
      return o.value === value
    })
    let bdSelect = Data.collisionTypeList.find(o => {
      return uploadColumnItem.bdData == o.value
    })

    /*if (uploadColumnItem.isZj) {
      this.$Message.info('当前列已被设置为主键')
      return
    }*/
    console.log(isContain,collisionTypeCurItem)
    if (isContain) { // 对选中列的操作

      if (collisionTypeCurItem.value == uploadColumnItem.bdData) {
        uploadColumnItem.className = ''
        uploadColumnItem.title = `${
            uploadColumnItem.title2
        }`
        uploadColumnItem.bdData = ''
        collisionTypeCurItem.disabled = false
      }
    } else {
  
      if (collisionTypeCurItem.value == uploadColumnItem.bdData) {
        uploadColumnItem.className = ''
        uploadColumnItem.title = `${
          uploadColumnItem.title2
        }`
        uploadColumnItem.bdData = ''
        collisionTypeCurItem.disabled = false
      } else {
        uploadColumnItem.className = 'bdzj-class'
        // this.uploadColumns[this.fkbjTableIndex].bdData += value + ','
        let _index = uploadColumnItem.title.indexOf('(')
        if (_index != -1) {
          let title = uploadColumnItem.title.substring(0, _index)
          uploadColumnItem.title = title
        }
        uploadColumnItem.title = `${
            uploadColumnItem.title
        }(${label})`
        uploadColumnItem.bdData = value
        // collisionTypeCurItem.disabled = true
        if (bdSelect) {
          if (bdSelect.disabled) {
            bdSelect.disabled = false
          }
        }
      }
    }
  }
})

const fieldFilter = ['extend', 'note', 'mark', 'case_id', 'task_channel_id', 'id'] // 不显示的列


// 二次标定时获取json
function getJson() {
  Data.reset()
  Data.loading = true
  let param = {attachmentId: props.id, pageNo: Data.pageNo, pageSize: Data.pageSize}
  getAttachmentJson(param).then(res => {
    let {code, data} = res.data
    if(code == 200 && data != null) {
      let _fields = []
      let columns = data.fieldList
      Data.originColumns = columns
      columns.forEach((item) => {
        if (!fieldFilter.includes(item.targetCode)){
          let field = {
            align: 'center',
            tooltip: false,
            title: item.fieldName,
            title2: item.fieldName,
            key: item.targetCode,
            width: 'auto',
            minWidth: 180,
            collision: item.collision,
            // targetTable: 'ii_attachment', // ii_attachment
            targetColumn: item.targetCode,
            dataType: '',
            renderHeader: ''

          }
          // 已标记的列高亮展示
          if (item.collision == 1) {
            let label = ajStore.getTraceType(item.dataType)
            let signedLabel = '(' + label + ')'
            field.renderHeader = (h, column) => {
              return h('span', {
                    style: {
                      marginRight: '5px',
                      color: '#19BE6B',
                      backgroundColor: '#EFF9FF'
                    }
                  },
                  item.fieldName + signedLabel)
            }
          }
          _fields.push(field)
        }
      })

      Data.columns = _fields
      Data.tableData = data.pageInfo.list
      Data.loading = false
    } else {
      proxy.$Message.error(data.message)
      Data.loading = false
    }
  }).catch(() => {
    Data.loading = false
  })
}

// 上传完成后通过url获取Json
function getJsonAfterUpload() {
  Data.reset()
  Data.loading = true
  let param = {
    url: props.id
  }
  getAttachmentJsonAfterUpload(param).then(res => {
    let {code, data} = res.data;
    if(code == 200 && data != null) {
      let _fields = []
      let columns = data.fieldList
      Data.originColumns = columns
      columns.forEach(item => {
        let field = {
          title: item.fieldName,
          title2: item.fieldName,
          tooltip: false,
          key: item.targetCode,
          isZj: false, // 是否为主键
          bdData: '', // 标定的比队列的类型
          renderHeader: '',
          minWidth: 220,
          align: 'center'
        }
        _fields.push(field)
      })
      Data.columns = _fields
      Data.tableData = data.data
      Data.loading = false
    } else {
      proxy.$Message.error(res.data.message)
      Data.loading = false
    }
  }).catch((err) => {
    console.log(err);
    Data.loading = false
    proxy.$Message.error(err.data.message)
  })
}
defineExpose({
  Data
})
</script>
<template>
	<div class="main">
    <Table style="flex: 1" ref="bdRef"
           v-table-drag
           :columns="Data.columns"
           :data="Data.tableData" context-menu
           show-context-menu
           :height="600"
           @on-contextmenu="Data.contextHandler"
           :loading="Data.loading"
    >
      <template #contextMenu>
          <DropdownMenu v-context-style="">
            <DropdownItem
                v-for="item in Data.collisionTypeList"
                @click.native="Data.setBd(item.value, item.label)"
                :key="item.value"
                :selected="item.disabled" :disabled="Data.contextDisable">{{ item.label }}</DropdownItem>
            <DropdownItem v-if="Data.contextDisable">取消标定</DropdownItem>
          </DropdownMenu>
      </template>
    </Table>
  </div>
</template>

<style scoped lang="less">
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.ivu-table td.bdzj-class)  {
  background-color: #2db7f5;
  color: #fff;
}
/*:deep(.ivu-select-dropdown) {
  height: auto;
}*/
:deep(.ivu-table) {
  overflow: scroll;
}
</style>

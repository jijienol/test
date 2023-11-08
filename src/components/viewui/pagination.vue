<script setup>
import {computed, reactive, ref} from "vue";
const props = defineProps({
  // pageCount:[Number, String],
  pageSize: [Number, String],
  pageNo: [Number, String],
  total: [Number,String],
  // options: [Object],
  render: [Function],
  sizeOpt: [10,20,50,100,200],
  layout: {
    type: Array,
    default() {
      return ['size', 'total', 'elevator']
    }
  }
})
const emit = defineEmits(['update:pageNo','update:pageSize'])
const pageNo = ref(props.pageNo)
const pageSize = ref(props.pageSize)
const Data = reactive({

  showSizer: computed(() => {
    if(props.layout.includes('size')) {
      return true
    } else {
      return false
    }
  }),
  showTotal: computed(() => {
    if(props.layout.includes('total')) {
      return true
    } else {
      return false
    }
  }),
  showElevator: computed(() => {
    if(props.layout.includes('elevator')) {
      return true
    } else {
      return false
    }
  }),
})
function changePage(page) {

  pageNo.value = page
  emit('update:pageNo', pageNo.value)
  if(props.render) props.render()
}
function changePageSize(size) {
  pageSize.value = size
  pageNo.value = 1
  emit('update:pageNo', pageNo.value)
  emit('update:pageSize', pageSize.value)
  if(props.render) props.render()
}
</script>
<template>
  <Page :current="pageNo" :page-size="pageSize" :total="props.total" :show-sizer="Data.showSizer" :show-total="Data.showTotal" :show-elevator="Data.showElevator"
        :page-size-opts="[10,20,50,100,200]"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        placement="top"
  />
</template>
<style scoped>
</style>

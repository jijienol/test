<!--互联网能力-->
<script setup>
import { reactive, markRaw, computed} from "vue";
import {ajListStore} from "@/store/modules/ajList.js";
import ipComp from './ip/index.vue'
import phoneComp from './phone/index.vue'
import macComp from './mac/index.vue'
import urlComp from './url/index.vue'
import apkComp from './apk/index.vue'

const ajStore = ajListStore()
const props = defineProps({
  traceId: {
    type:String,
    default: ''
  },
  taskId: {
    type:String,
    default: ''
  },
  task: {
    type: Object,
    default: {}
  },
  type: {
    type:String,
    default: ''
  }
})

const compList = reactive([
  {type:'phone', component: markRaw(phoneComp)},
  {type:'wifi', component: markRaw(macComp)},
  {type:'ip', component: markRaw(ipComp)},
  {type:'url', component: markRaw(urlComp)},
  {type:'apk', component: markRaw(apkComp)},
])

const comp = computed(() => {
  let c = compList.find(o => {
    return o.type === ajStore.trackType
  })
  if(c) {
    return c.component
  } else {
    return ''
  }
})

</script>
<template>
	<Layout class="layout">
    <component :is="comp" :traceId="props.traceId" :type="props.type"></component>
  </Layout>
</template>

<style scoped lang="less">
.layout {
  height: 100%;
}

</style>

<script setup>
import {noteStore} from "@/store/modules/note.js";

import NoteCom from "../note/index.vue";
import Sign from "../sign/index.vue";
import TraceCollision from "../traceCollision/index.vue";
import NodeOutline from 'src/views/details/G6/nodeOutline.vue'

const note = noteStore()

</script>

<template>
<Drawer transfer :z-index="99999" :mask="false" width="30" v-model="note.noteVisible" :title="note.typeName">
  <note-com v-if="note.type == 'noteCom'"/>
  <sign v-if="note.type == 'sign'"/>
  <trace-collision v-if="note.type =='collision'"/>
	<node-outline v-if="note.type == 'outline'"></node-outline>
</Drawer>
</template>
<style scoped lang="less">
.card-div{
  overflow: hidden;
}
.noteItem{
  background: rgba(24,31,67,0.04);
  padding: .2rem;
  .title{
    font-size: .20rem;
  }
  .userName{
    padding: .1rem 0;
  }
  .content{
    padding: .1rem;
    background: #FFF;
  }
}
</style>

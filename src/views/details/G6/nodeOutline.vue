<template>
	<Tree :data="arr"  @on-select-change="to"></Tree>
</template>

<script setup>

import { swdtStore } from '@/store/modules/swdt.js';
import {computed} from 'vue'
import bus from 'vue3-eventbus'

const swdt = swdtStore();

swdt.treeData.title = swdt.treeData.name
const arr = computed(()=> [swdt.treeData])


function to (val) {
	bus.emit('toCell', val[0].id)
}
</script>

<style scoped>
:deep(.ivu-tree-children){
	border-left: 1px dashed #cccccc;
	margin: 10px;
	padding-left: 10px;
}
</style>

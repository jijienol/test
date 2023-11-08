<script setup>

import RecursiveTree from 'src/views/details/G6/recursiveTree.vue'

const props = defineProps(['data', 'index'])
</script>

<template>
	
	<div :style="`margin-left:${props.index+20+'px'} `">
		<div v-for="item in props.data" :key="item.id" :class=" item.children.length ? 'item':'i'">
			<span><Icon type="md-arrow-dropdown" /></span>{{item.name}}
			<template v-if="item.children && item.children.length">
				<recursive-tree :data="item.children" :index="props.index +1"/>
			</template>
		</div>
	</div>
</template>
<style lang='less' scoped>
.item{
	border-left: 1px dashed #cccccc;
	margin: 10px;
	padding-left: 10px;
}
.i{

}
</style>

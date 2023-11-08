<script setup="">
import {ref, onMounted, nextTick, watch} from 'vue';
import * as echarts from 'echarts'


const props = defineProps({
	option: [Object],
	colorStop: [Array]
})
const eRef = ref(null)
let Chart = null

function init () {
	Chart = echarts.init(eRef.value)
	// Chart.value.setOption(props.option)
}

function gradient (colorStop) {
	let color = new echarts.graphic.LinearGradient(0, 0, 0, 1, colorStop)
	return color
}

function render (option) {
	option = option || props.option
	nextTick(() => {
		if (option && typeof option === 'object') {
			if (Chart) {
				Chart.clear();
				Chart.setOption(option);
			} else {
				init()
				Chart.setOption(option);
			}
		}
	})
	
}

watch(() => props.option, () => {
	render()
})

function resize () {
	Chart.resize();
}

onMounted(() => {
	nextTick(() => {
		init()
	})
})
defineExpose({
	render,
	resize,
	gradient
})
</script>
<template>
	<div class="main" style="width:100%;height:100%;display: flex;">
		<div ref="eRef" style="flex: 1;"></div>
	</div>
</template>
<style scoped>

</style>

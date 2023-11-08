<script setup>

import {onMounted, ref, watch} from 'vue'
import Echarts from '@/components/echarts.vue'
import {getE1New, getE2New, getE3New, getE4New, getE5New, getE6New, getE7New, getE8New} from 'src/api/homePage.js'
import {cloneDeep} from 'lodash'


const E1 = ref()
const E2 = ref()
const E3 = ref()
// 定义图表的配置选项

const option = ref({
	tooltip: {
		trigger: 'item',
		formatter: '{b}:数量{c}({d}%)',
	},
	legend: {
		top: 'bottom',
		data: []
	},
	series: [
		{
			type: 'pie',
			radius: ['30%', '70%'],
			avoidLabelOverlap: false,
			itemStyle: {
				borderRadius: 10,
				borderColor: '#fff',
				borderWidth: 10,
			},
			label: {
				show: true,
				position: 'inside', // 将标签显示在饼图中间
				formatter: ' {d}%',
			},
			emphasis: {
				label: {
					show: true,
					fontSize: 20,
					fontWeight: 'bold',
				},
			},
			labelLine: {
				show: false, // 不显示标签连接线
			},
			data: [],
		},
	],
})


const T1 = ref({
	data: {
		time: ''
	},
	time: {
		period: 'week'
	},
	title: '周'
})
const T2 = ref({
	data: {
		time: ''
	},
	time: {
		period: 'week'
	},
	title: '周'
})

const T6 = ref({
	data: {
		time: ''
	},
	time: {
		period: 'week'
	},
	title: '周'
})
const T7 = ref({
	type: 1,
	data: {
		time: '',
		data: [],
		columns: [{
			title: '侦察员',
			key: 'username',
			className: 'custom-header-cell'
		}, {
			title: '部门',
			key: 'deptName',
			className: 'custom-header-cell',
			width: 120
		}, {
			title: '任务数',
			'sortable': true,
			className: 'custom-header-cell',
			key: 'taskCount',
			
		}, {
			title: '标定人',
			'sortable': true,
			className: 'custom-header-cell',
			key: 'peopleCount'
		}, {
			title: '标定物',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'objectCount'
			
		}, {
			title: '完成任务',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'successTaskCount'
		}, {
			title: '上传文件',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'uploadFileCount'
		}, {
			title: '技战法',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'ruleCount'
		}, {
			title: '认领',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'acceptanceCount'
		}, {
			title: '完成任务',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'successTaskCount'
		}],
		columns1: [{
			title: '部门',
			key: 'deptName',
			className: 'custom-header-cell',
			width: 120
		}, {
			title: '任务数',
			'sortable': true,
			className: 'custom-header-cell',
			key: 'taskCount',
			
		}, {
			title: '标定人',
			'sortable': true,
			className: 'custom-header-cell',
			key: 'peopleCount'
		}, {
			title: '标定物',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'objectCount'
			
		}, {
			title: '完成任务',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'successTaskCount'
		}, {
			title: '上传文件',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'uploadFileCount'
		}, {
			title: '技战法',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'ruleCount'
		}, {
			title: '认领',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'acceptanceCount'
		}, {
			title: '完成任务',
			'sortable': true,
			className: 'custom-header-cell',
			
			key: 'successTaskCount'
		}],
	},
	time: {
		period: 'week'
	},
	title: '周'
})

function tiemChange (val) {
	if (val == 1) {
		if (T1.value.title == '周') {
			T1.value.time.period = 'month'
			T1.value.title = '月'
		} else {
			T1.value.time.period = 'week'
			T1.value.title = '周'
		}
		get1()
	} else if (val == 2) {
		if (T2.value.title == '周') {
			T2.value.time.period = 'month'
			T2.value.title = '月'
		} else {
			T2.value.time.period = 'week'
			T2.value.title = '周'
		}
		get2()
		get3()
	} else if (val == 6) {
		if (T6.value.title == '周') {
			T6.value.time.period = 'month'
			T6.value.title = '月'
		} else {
			T6.value.time.period = 'week'
			T6.value.title = '周'
		}
		get6()
	} else if (val == 7) {
		if (T7.value.title == '周') {
			T7.value.time.period = 'month'
			T7.value.title = '月'
		} else {
			T7.value.time.period = 'week'
			T7.value.title = '周'
		}
		get7()
	}
}

async function get1 () {
	try {
		const {data} = await getE1New(T1.value.time)
		if (data.code == 200) {
			T1.value.data = data.data
			T1.value.data.bf = data.data.acceptedCase ? data.data.acceptedCase / data.data.totalCase * 100 : '0'
		}
	}
	catch (e) {
		console.log(e)
	}
}

async function get2 () {
	try {
		const {data} = await getE3New(T2.value.time)
		T2.value.data = data.data
	}
	catch (e) {
		console.log(e)
	}
}

async function get3 () {
	try {
		const {data} = await getE2New(T2.value.time)
		if (data.code == 200) {
			option.value.series.data = []
			option.value.series[0].data = []
			data.data.forEach(item => {
				option.value.legend.data.push(item.LABEL)
				option.value.series[0].data.push({value: item.COUNT, name: item.LABEL})
			})
		}
	}
	catch (e) {
		console.log(e)
	}
	E1.value.render(cloneDeep(option.value))
}

const option1 = ref({
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: [],
	},
	yAxis: {
		type: 'value',
	},
	tooltip: {
		trigger: 'axis'
	},
	grid: {
		left: '3%',   // 网格区域左边距
		right: '4%',  // 网格区域右边距
		bottom: '3%', // 网格区域底边距
		containLabel: true, // 是否包含刻度标签
	},
	
	color: ['#FFAF37', '#00B384'],
	series: [
		{
			name: '月案件数',
			data: [],
			type: 'line',
			smooth: true,
			markPoint: {
				data: [
					{type: 'max', name: 'Max'},
					{type: 'min', name: 'Min'}
				]
			},
		},
		
		{
			name: '标定人数',
			data: [],
			type: 'line',
			smooth: true,
			markPoint: {
				data: [
					{type: 'max', name: 'Max'},
					{type: 'min', name: 'Min'}
				]
			},
		}
	]
});

async function get4 () {
	try {
		const {data} = await getE5New()
		if (data.code == 200) {
			option1.value.series.data = []
			data.data.forEach(item => {
				option1.value.xAxis.data.push(item.dateTime)
				option1.value.series[0].data.push(item.totalCases)
				option1.value.series[1].data.push(item.nominalNumberPeople)
			})
		}
		E2.value.render(option1.value)
		
	}
	catch (e) {
		console.log(e)
	}
}

const option2 = ref({
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'cross'
		}
	},
	legend: {
		data: ['已受理', '未受理', '标定人']
	},
	grid: {
		left: '1%',
		right: '1%',
		bottom: '1%',
		containLabel: true
	},
	xAxis: [
		{
			type: 'category',
			data: []
		}
	],
	yAxis: [
		{
			type: 'value'
		}
	],
	color: ['#00B384', 'rgba(255,175,55,0.3)', '#FFAF37'],
	series: [
		{
			name: '标定人',
			type: 'bar',
			stack: 'Ad',
			emphasis: {
				focus: 'series'
			},
			
			data: []
		},
		{
			name: '未受理',
			type: 'bar',
			stack: 'Ad',
			
			emphasis: {
				focus: 'series'
			},
			data: []
		},
		{
			name: '已受理',
			type: 'bar',
			stack: 'Ad',
			emphasis: {
				focus: 'series'
			},
			data: [],
		}
	]
});

async function get5 () {
	try {
		const {data} = await getE4New({period: 'month'})
		if (data.code == 200) {
			option2.value.series.data = []
			data.data.forEach(item => {
				option2.value.xAxis[0].data.push(item.dateTime.slice(5))
				option2.value.series[2].data.push(item.totalAcceptedCases)
				option2.value.series[1].data.push(item.totalUnAcceptedCases)
				option2.value.series[0].data.push(item.nominalNumberPeople)
			})
		}
	}
	catch (e) {
		console.log(e)
	}
	E3.value.render(option2.value)
}

async function get6 () {
	try {
		const {data} = await getE6New(T6.value.time)
		if (data.code == 200) {
			T6.value.data = data.data.statList
			T6.value.data.time = data.data.time
		}
	}
	catch (e) {
		console.log(e)
	}
}

async function get7 () {
	try {
		if (T7.value.type == 1) {
			const {data} = await getE8New(T7.value.time)
			if (data.code == 200) {
				T7.value.data.data = data.data.statList
				T7.value.data.time = data.data.time
			}
		} else {
			const {data} = await getE7New(T7.value.time)
			if (data.code == 200) {
				T7.value.data.data = data.data.statList
				T7.value.data.time = data.data.time
			}
		}
		
	}
	catch (e) {
		console.log(e)
	}
}

watch(() => T7.value.type, () => {
	get7()
})
const rowClassName = () => 'demo-table-info-row'
onMounted(() => {
	get1()
	get2()
	get3()
	get4()
	get5()
	get6()
	get7()
})
</script>

<template>
	<layout class="box">
		<Row :gutter="16" class="row">
			<Col span="3">
				<Card class="item border">
					<div class="top" @click="tiemChange(1)">按{{T1.title}}
						<Icon type="ios-arrow-down"/>
					</div>
					<div class="time hui">
						{{T1.data.time}}
					</div>
					<h3>案件统计</h3>
					<div>
						<div class="num">
							<Numeral :value="T1.data.totalCase" format="0,"/>
							<span v-if="T1.data.increaseAndDecrease>1" class="ja"><Icon type="md-arrow-up"/><span style="font-size: 16px">+{{T1.data.increaseAndDecrease}}</span></span>
							<span v-else class="jian"><Icon type="md-arrow-down"/><span style="font-size: 16px">{{T1.data.increaseAndDecrease}}</span></span>
						</div>
						<p class="hui">较上{{T1.title}}{{T1.data.increaseAndDecrease >= 0 ? '新增' + T1.data.increaseAndDecrease : '减少' + T1.data.increaseAndDecrease * (-1)}}</p>
					</div>
				</Card>
			</Col>
			<Col span="3">
				<Card class="item border" style="		display: flex;flex-direction: column;align-items: center;justify-content: center;">
					<div style="width: 100%;display: flex;justify-content: center;align-items: center;margin-bottom: 10px">
						<Circle :percent="T1.data.bf" size="60" stroke-color="#0061FF" stroke-width="10" trail-width="10">
							<span class="demo-Circle-inner" style="font-size:13px">{{Math.round(T1.data.bf)}}%</span>
						</Circle>
					</div>
					
					
					<div style="display: flex">
						<div style="width: .5rem;display: flex;align-items: center">
							<i style="width: 12px;height: 12px;background: #cccccc;border-radius: 3px;display: inline-block"></i>
							<span>{{T1.data.unacceptedCase}}</span>
						</div>
						<div class="hui">(未受理)</div>
					</div>
					
					<div style="display: flex">
						<div style="width: .5rem;display: flex;align-items: center">
							<i style="width: 12px;height: 12px;background:#0061FF;border-radius: 3px;display: inline-block"></i>
							<span>
							<Numeral :value="T1.data.acceptedCase" format="0,"/>
							</span>
						
						</div>
						<div class="hui">(已受理)</div>
					</div>
				
				</Card>
			</Col>
			<Col span="18">
				<Card class="item border">
					<div class="top" @click="tiemChange(2)">按{{T2.title}}
						<Icon type="ios-arrow-down"/>
					</div>
					<div class="time hui">
						{{T2.data.time}}
					</div>
					<div style="width: 100%;display: flex;justify-content: space-between ">
						<div class="top3">
							<h3>线索总数</h3>
							<div style="border-right: 1px solid #ccc;width: 100%;text-align: center;margin-top: .1rem "><span class="num">	<Numeral :value="T2.data.clueCount" format="0,"/>
								<span v-if="T2.data.clueIncreaseCount>1" class="ja">
									<Icon type="md-arrow-up"/><span style="font-size: 16px">+{{T2.data.clueIncreaseCount}}</span>
								</span>
						  	<span v-else class="jian">
								  <Icon type="md-arrow-down"/><span style="font-size: 16px">{{T2.data.clueIncreaseCount}}</span>
							  </span>
								</span></div>
							<div class="hui">
								较上{{T2.title}}{{T2.data.clueIncreaseCount >= 0 ? '新增' + T2.data.clueIncreaseCount : '减少' + T2.data.clueIncreaseCount * (-1)}}
							</div>
						</div>
						
						<div class="top3">
							<h3>任务总数</h3>
							<div style="border-right: 1px solid #ccc;width: 100%;text-align: center;margin-top: .1rem "><span class="num">	<Numeral :value="T2.data.taskCount" format="0,"/> </span>
								<span v-if="T2.data.taskIncreaseCount > 1" class="ja">
									<Icon type="md-arrow-up"/><span style="font-size: 16px">+{{T2.data.taskIncreaseCount}}</span>
								</span>
								<span v-else class="jian">
								  <Icon type="md-arrow-down"/><span style="font-size: 16px">{{T2.data.taskIncreaseCount}}</span>
							  </span>
							</div>
							<div class="hui">
								较上{{T2.title}}{{T2.data.taskIncreaseCount >= 0 ? '新增' + T2.data.taskIncreaseCount : '减少' + T2.data.taskIncreaseCount * (-1)}}
							</div>
						</div>
						<div class="top3">
							<h3>标定人数</h3>
							<div style="border-right: 1px solid #ccc;width: 100%;text-align: center;margin-top: .1rem ">
								<span class="num">	<Numeral :value="T2.data.peopleCount" format="0,"/> </span>
								<span v-if="T2.data.peopleIncreaseCount > 1" class="ja">
									<Icon type="md-arrow-up"/><span style="font-size: 16px">+{{T2.data.peopleIncreaseCount}}</span>
								</span>
								<span v-else class="jian">
								  <Icon type="md-arrow-down"/><span style="font-size: 16px">{{T2.data.peopleIncreaseCount}}</span>
							  </span>
							</div>
							<div class="hui">
								较上{{T2.title}}{{T2.data.peopleIncreaseCount >= 0 ? '新增' + T2.data.peopleIncreaseCount : '减少' + T2.data.peopleIncreaseCount * (-1)}}
							</div>
						</div>
						<div class="top3">
							<h3>技战法命中</h3>
							<div style="margin-top: .1rem "><span class="num"> <Numeral :value="T2.data.skillWarfareCount" format="0,"/> </span>
								<span v-if="T2.data.skillWarfareIncreaseCount >= 0" class="ja">
									<Icon type="md-arrow-up"/><span style="font-size: 16px">+{{T2.data.skillWarfareIncreaseCount}}</span>
								</span>
								<span v-else class="jian">
								  <Icon type="md-arrow-down"/><span style="font-size: 16px">{{T2.data.skillWarfareIncreaseCount}}</span>
							  </span>
							</div>
							<div class="hui">
								较上{{T2.title}}{{T2.data.skillWarfareIncreaseCount >= 0 ? '新增' + T2.data.skillWarfareIncreaseCount : '减少' + T2.data.skillWarfareIncreaseCount * (-1)}}
							</div>
						</div>
					</div>
				</Card>
			</Col>
		</Row>
		<Row :gutter="16" class="row">
			<Col span="6">
				<Card class="item2 border">
					<div class="top" @click="tiemChange(2)">按{{T2.title}}
						<Icon type="ios-arrow-down"/>
					</div>
					<div class="time hui">
						{{T2.data.time}}
					</div>
					<div style="display: flex;justify-content: space-between">
						<h3>案件类型统计</h3>
					
					</div>
					<div style="width:100%;height: 3rem;margin: 0 auto">
						<Echarts ref="E1"/>
					</div>
				</Card>
			</Col>
			<Col span="18">
				
				<Card class="item2 border">
					<div style="display: flex;justify-content: space-between">
						<h3>月案件情况统计</h3>
						<div style="display: flex;align-items: center">
							<div class="type1">
								<div class="icon1"></div>
								<span>月案件数</span>
							</div>
							<div class="type2">
								<div class="icon2"></div>
								<span>标定人数</span>
							</div>
						</div>
					</div>
					<div style="width:100%;height:2.78rem;margin: 0 auto">
						<Echarts ref="E2"/>
					</div>
				</Card>
			</Col>
		</Row>
		<Row :gutter="16" class="row">
			<Col span="24">
				<Card class="item3 border">
					<div style="display: flex;justify-content: space-between">
						<h3>月案件情况统计</h3>
					
					
					</div>
					<div style="width:100%;height: 4rem;overflow-y: hidden">
						<div style="width:100%;height: 3.5rem">
							<Echarts ref="E3"/>
						</div>
					</div>
				</Card>
			</Col>
		</Row>
		<Row :gutter="16" class="row">
			<Col span="8">
				<Card class="item4 border">
					<div style="display: flex;justify-content: start">
						<h3>案件情况</h3><img alt="" src="./img/top5.png" style="height: .26rem;margin-left: .1rem">
					</div>
					<div class="time hui">
						{{T6.data.time}}
					</div>
					<div class="top" @click="tiemChange(6)">按{{T6.title}}
						<Icon type="ios-arrow-down"/>
					</div>
					<div>
						<div class="tabs">
							<div class="tab active">优质案件</div>
						
						</div>
						<div class="ajList">
							<div v-for="(item,index) in T6.data" class="ajItem">
								<div class="ajItem-top">
									
									<div :title="item.caseName" class="title" style="width: 250px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display: inline-block;">
										<img v-if="index ==0" alt="" src="./img/1.png" style="width: 16px">
										<img v-if="index ==1" alt="" src="./img/2.png" style="width: 16px">
										<img v-if="index ==2" alt="" src="./img/3.png" style="width: 16px">
										{{item.caseName}}
									</div>
									<div class="hui" style="width: 1.1rem">
										主办人：{{item.userName}}
									</div>
								</div>
								<div class="ajItem-bottom">
									<div>标定人数 <span class="num">{{item.peopleCount}}</span></div>
									<div>标定物 <span class="num">{{item.objectCount}}</span></div>
									<div>技战法数 <span class="num">{{item.ruleCount}}</span></div>
								</div>
							</div>
						</div>
					</div>
				
				
				</Card>
			</Col>
			<Col span="16">
				<Card class="item4 border">
					<div style="display: flex;justify-content: start">
						<h3>受案情况</h3><img alt="" src="./img/top10.png" style="height: .26rem;margin-left: .1rem">
					</div>
					<div class="time hui">
						{{T7.data.time}}
					</div>
					<div class="top" @click="tiemChange(7)">按{{T7.title}}
						<Icon type="ios-arrow-down"/>
					</div>
					<div>
						<div class="tabs">
							<div :class="T7.type==1?'active':''" class="tab " @click="T7.type=1">受案人</div>
							<div :class="T7.type==2?'active':''" class="tab" @click="T7.type=2">受案部门</div>
						</div>
						<div class="ajList">
							<Table :columns="T7.type==1?T7.data.columns:T7.data.columns1" :data="T7.data.data" :row-class-name="rowClassName"></Table>
						</div>
					</div>
				</Card>
			</Col>
		</Row>
	</layout>
</template>
<style lang='less' scoped>

.ja {
	font-size: 20px;
	color: red !important;
}

.jian {
	font-size: 20px;
	color: #00A389 !important;
}

:deep(.ivu-table .demo-table-info-row td) {
	height: .6rem;
	border-bottom: 0;
}

:deep(.ivu-table-header) {
	background: #ECF5FF;
	
	border-radius: 12px 12px 12px 12px;
	
	.custom-header-cell {
		background-color: #ECF5FF !important; /* 设置表头背景颜色 */
		border-bottom: 0;
		font-weight: bold; /* 设置表头文字加粗 */
		color: #333; /* 设置表头文字颜色 */
		margin: 5px;
		/* 可以根据需要添加更多自定义样式 */
	}
}

.tabs {
	.tab {
		display: inline-block;
		margin: 10px 10px;
		color: #cccccc;
	}
	
	.active {
		border-bottom: 2px solid #1D83FF;
		color: #222222;
	}
}

.ajList {
	.ajItem {
		margin-bottom: 20px;
		background: linear-gradient(90deg, rgba(5, 122, 255, 0.12) 0%, rgba(5, 122, 255, .08) 100%);
		border-radius: 12px 12px 12px 12px;
		height: 1.1rem;
		
		.ajItem-top {
			display: flex;
			justify-content: space-between;
			height: .4rem;
			align-items: center;
			padding: 15px;
			background: linear-gradient(90deg, rgba(5, 122, 255, 0.1) 0%, rgba(5, 122, 255, 0) 100%);
			border-radius: 12px 12px 0 0;
			
			.title {
				display: flex;
				align-items: center;
				font-size: 18px;
				font-weight: bold;
			}
		}
		
		.ajItem-bottom {
			height: .7rem;
			display: flex;
			justify-content: space-evenly;
			align-items: center;
			
			.num {
				font-size: 24px;
				line-height: 36px;
			}
			
			div::before {
				content: '';
				display: inline-block;
				width: 8px;
				height: 8px;
				background-color: #AED4FF; /* 设置点的颜色 */
				border-radius: 50%; /* 使点呈圆形 */
				margin-right: 5px; /* 调整点与标签之间的间距 */
			}
			
		}
	}
}

.box {
	box-sizing: border-box;
	height: 100vh;
	overflow-x: hidden;
}

.demo-Circle-inner {
	color: #0061FF;
}

.type1 {
	width: 92px;
	height: 37px;
	background: rgba(255, 175, 55, 0.1);
	border-radius: 6px 6px 6px 6px;
	opacity: 1;
	display: flex;
	justify-content: center;
	align-items: center;
}

.type2 {
	width: 92px;
	height: 37px;
	background: rgba(0, 163, 137, 0.1);
	border-radius: 6px 6px 6px 6px;
	opacity: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 5px;
}

.icon1 {
	width: 12px;
	height: 12px;
	background: #FFAF37;
	border-radius: 4px 4px 4px 4px;
	opacity: 1;
	margin: 5px;
}

.icon2 {
	width: 12px;
	height: 12px;
	background: #00A389;
	border-radius: 4px 4px 4px 4px;
	opacity: 1;
	margin: 5px;
	
}

.time {
	position: absolute;
	top: .35rem;
	right: 0;
	width: .7rem;
	height: .3rem;
	line-height: 12px !important;
}

.top3 {
	width: 24%;
	height: 1rem;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.row {
	display: flex;
	padding: 10px 20px;
	
	.border {
		border-radius: 16px 16px 16px 16px;
		position: relative;
		
		.top {
			position: absolute;
			top: 0;
			right: 0;
			width: .6rem;
			height: .3rem;
			background: #0061FF;
			border-radius: 0px 16px 0px 16px;
			opacity: 1;
			text-align: center;
			line-height: .3rem;
			color: #FFFFFF;
			
		}
		
		.num {
			margin-top: .2rem;
			color: #0061FF;
			font-size: 30px;
			font-weight: bold;
		}
		
		.hui {
			font-weight: 400;
			color: rgba(0, 0, 0, 0.4);
			line-height: 22px;
			font-size: 12px;
		}
	}
	
	.item {
		min-height: 1.5rem;
	}
	
	.item2 {
		min-height: 3.5rem;
	}
	
	.item3 {
		
		min-height: 4.5rem;
	}
	
	.item4 {
		
		min-height: 7.5rem;
	}
}
</style>

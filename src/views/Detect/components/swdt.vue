<script setup>

import AddTags from '@/components/addTags/index.vue';
import ShopCar from '@/components/shopcar/index.vue'
import Vdetails from '@/views/details/index.vue';
import {formatUrl} from '@/libs/format.js'
import {Curve, Graph, Line, Path} from '@antv/x6';
import '@antv/x6-vue-shape'
import {storeToRefs} from 'pinia';
import aes from '@/libs/aes.js'
import {computed, createVNode, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue';
import {noteStore} from '@/store/modules/note.js';
import {dictStore} from '@/store/modules/dictionary.js';
import {ajListStore} from '@/store/modules/ajList.js';
import {globalStore} from '@/store/modules/global.js';
import {swdtStore} from '@/store/modules/swdt.js';
import {permissionStore} from 'src/store/modules/permission.js'
import {reg_ip, reg_mac, reg_phone, reg_url} from '@/utils/regExp.js';
import {listIiChannelSolution} from '@/api/ajJs.js';
import {deleteTrace, updateTraceRemark} from '@/api/trace.js';
import {updateSwdtList, updateTaskChannelTime, exportXmind, phoneClueAnalysis} from '@/api/swdt.js';
import Hierarchy from '@antv/hierarchy';
import SiLiu from './x6/SiLiu.vue';
import Duo from './x6/Duo.vue'
import RootNode from './x6/rootNode.vue';
import GreenCard from './x6/GreenCard.vue';
import {useRouter} from 'vue-router';
import {cloneDeep} from 'lodash';
import {getListData} from '../../../utils/tree.js';
import bus from 'vue3-eventbus';
import {Button, Modal} from 'view-ui-plus';
import PeopleV from './people.vue';

import ChannelQrcode from './channelQrcode.vue';
import FilePzDialog from '@/components/note/components/filePzDialog.vue';
import CollisionDrawer from '@/components/note/components/collisionDrawer.vue';
import {messageList, updateStatus} from '@/api/login.js'
import {searchAllTaskReturn} from 'src/api/globalSearch.js'
import {countUnReply, deleteById, listComment, listCommentUser, saveCaseComment} from 'src/api/swdt.js'

const permission = permissionStore()
const userId = computed(() => permission.userId)
const degreesToRadians = (degrees) => degrees * (Math.PI / 180);
const transCanvasAngleToRos = (angle) => angle - 90;
const calcPoint = (p) => {
	const distance = 10;
	const theta = degreesToRadians(transCanvasAngleToRos(p.angle));
	const x = p.x + distance * Math.cos(theta);
	const y = p.y + distance * Math.sin(theta);
	return {x, y};
};
const calcIntersectionPoint = (points) => {
	const [p1, p2] = points;
	const p11 = calcPoint(p1);
	const p22 = calcPoint(p2);
	const d1 = (p1.x - p11.x) * (p2.y - p22.y);
	const d2 = (p1.y - p11.y) * (p2.x - p22.x);
	const d = d1 - d2;
	if (d === 0) {
		return {x: p1.x, y: p1.y};
	}
	const u1 = p1.x * p11.y - p1.y * p11.x;
	const u4 = p2.x * p22.y - p2.y * p22.x;
	const u2x = p2.x - p22.x;
	const u3x = p1.x - p11.x;
	const u2y = p2.y - p22.y;
	const u3y = p1.y - p11.y;
	const px = (u1 * u2x - u3x * u4) / d;
	const py = (u1 * u2y - u3y * u4) / d;
	const p = {x: px, y: py};
	return p;
};
const searchText = ref('');
const graphContainer = ref(null);

Graph.registerConnector(
	'multi-smooth',
	(
		sourcePoint,
		targetPoint,
		routePoints,
		options,
	) => {
		const {index = 0, total = 1, gap = 12} = options
		const line = new Line(sourcePoint, targetPoint)
		const centerIndex = (total - 1) / 2
		const dist = index - centerIndex
		const diff = Math.abs(dist)
		const factor = diff === 0 ? 1 : diff / dist
		const vertice = line
			.pointAtLength(line.length() / 2 + gap * factor * Math.ceil(diff))
			.rotate(90, line.getCenter())
		
		const points = [sourcePoint, vertice, targetPoint]
		const curves = Curve.throughPoints(points)
		const path = new Path(curves)
		return options.raw ? path : path.serialize()
	},
	true,
)

Graph.registerConnector(
	'curve',
	(sourcePoint, targetPoint) => {
		const path = new Path()
		path.appendSegment(Path.createSegment('M', sourcePoint))
		// 基于方向获取控制点
		const controlPoint = calcIntersectionPoint([{
			...sourcePoint,
			angle: graph.getNodesFromPoint(sourcePoint)[0]?.getAngle()
		},
			{
				...targetPoint,
				angle: graph.getNodesFromPoint(targetPoint)[0]?.getAngle()
			}])
		// 基于控制点生成二次贝塞尔曲线
		path.appendSegment(path.quadTo(controlPoint, targetPoint))
		return path.serialize()
	},
	true,
)

function queryCell (targetId) {
	function traverseTree (node, id) {
		// console.log(node.name); // 执行任何您想要在每个节点上执行的操作
		node.childs = false
		
		if (node.id == id) {
			node.childs = true
		}
		if (node.children && node.children.length > 0) {
			// 如果当前节点有子节点，则递归遍历子节点
			node.children.forEach(child => {
				traverseTree(child, id);
			});
		}
	}
	
	swdt.treeData.children.forEach(node => {
		
		traverseTree(node, targetId)
	});
}

const minimapContainer = ref()
const {proxy} = getCurrentInstance()
const notePina = noteStore()
const dict = dictStore()
const ajList = ajListStore()
const global = globalStore()
const swdt = swdtStore()
const {popupVisible} = storeToRefs(global)
const {traceListVisible} = storeToRefs(ajList)
const router = useRouter()
const {qrcode} = storeToRefs(swdt)
// 缩放数据
const minZoom = ref(0.25)
const maxZoom = ref(3)
const curZoom = ref(0.75)

const cardData = ref(null); //当前卡片数据
let graph = reactive({});
const graphRef = ref(null)


const caseId = computed(() => ajList.caseInfo.id)
// 获取导图数据
const treeData = computed(() => swdt.treeData)
// 初始化画布
//当前卡片数据
function initGraphContainer () {
	graph = new Graph({
		container: document.getElementById('swdt_container'),
		grid: true,
		minimap: {
			enabled: true,
			container: minimapContainer.value,
			width: 250,
			height: 250,
			graphOptions: {
				async: true,
				createCellView (cell) {
					// 在小地图中不渲染边
					if (cell.isEdge()) {
						return null
					}
				},
			}
		},
		scroller: { // 画布滚动条
			enabled: true,
			pannable: true,
			pageVisible: true,
			pageBreak: false,
			autoResize: true,
			autoResizeOptions: {
				border: 50
			},
		},
		
		panning: {
			enabled: false
		},
		interacting: {
			nodeMovable: !1, // 节点是否可拉动
			edgeMovable: !1 // 边是否可拉动
		},
		mousewheel: { // 滚轮缩放
			enabled: true, // 是否开启滚轮缩放交互。
			zoomAtMousePosition: true, // 是否将鼠标位置作为中心缩放，默认为 true
			modifiers: 'ctrl',
			minScale: minZoom.value, // 最小的缩放级别
			maxScale: maxZoom.value
		},
		connecting: { // 配置全局的连线规则
			allowEdge: true,
			
			// router: 'orth',
			connector: {
				name: 'rounded',//圆角线
				args: {
					radius: 30
				}
			},
			// anchor: 'registry',
			connectionPoint: 'anchor',
			allowBlank: false,
			snap: {
				radius: 20
			},
			validateConnection ({targetMagnet}) {
				return !!targetMagnet
			}
		},
		snapline: false,
		sorting: 'approx'
	})
	
	graphContainer.value = graph.container;
	// 节点双击事件
	graph.on('node:dblclick', ({node}) => {
		// console.log(node)
		if (node.data.pid) {
			graph.getNodes().forEach((n) => {
				if (n.id == node.data.pid) {
					queryCell(node.data.pid)
					graph.scrollToCell(n)
				}
			})
		}
		if (node.data.data) { // 排除根节点
			// console.log(node)
			cardData.value = node.data.data
			notePina.dblData = node.data.data
			popupVisible.value = true
			notePina.caseId = node.data.data.caseId
			notePina.traceId = node.data.data.id
			swdt.border = node.data.data.id
			swdt.setNodeHistoryNode(node)
			
			if (node.data.data.sum) {
				swdt.history.num = node.data.data.sum.noteNum
				swdt.history.markNum = node.data.data.sum.markNum
			} else {
				swdt.history.num = 0
				swdt.history.markNum = 0
			}
			
			
			// graph.centerCell(node, { padding: { bottom: 450, right: 500 }, animation: {duration: 360}}) // duration?: number; easing?: string
		}
	})
	//边移入移出事件
	graph.on('edge:mouseenter', ({e, edge, view}) => {
		if (edge.attrs.line.strokeWidth == 3) {
			edge.attr('line/strokeDasharray', 0)
		}
	})
	graph.on('edge:mouseleave', ({e, edge, view}) => {
		if (edge.attrs.line.strokeWidth == 3) {
			edge.attr('line/strokeDasharray', 2)
		}
	})
	//边点击事件
	graph.on('edge:click', (e, x, y, edge, view) => {
			let cell = e.cell
			if (e.cell.attrs.line.strokeWidth == 3) {
				swdt.toggleShow({from: cell.source.cell, to: cell.target.cell, visible: true})
			}
		}
	)
	//多线索边点击事件
	graph.on('edge:click', (e, x, y, edge, view) => {
			let cell = e.cell
			if (e.cell.attrs.line.strokeWidth == 4) {
				
				queryCell(e.cell.target.cell)
				graph.scrollToCell(e.cell)
			}
		}
	)
	//边移入移出事件
	graph.on('edge:mouseenter', ({e, edge, view}) => {
		if (edge.attrs.line.strokeWidth == 4) {
			edge.attr('line/strokeDasharray', 0)
		}
	})
	graph.on('edge:mouseleave', ({e, edge, view}) => {
		if (edge.attrs.line.strokeWidth == 4) {
			edge.attr('line/strokeDasharray', 2)
		}
	})
	graph.on('cell:added', ({cell, index, options}) => {
		
		// cell.connector={ name: 'curve' }
		
		cell.attr({
			
			line: {
				strokeWidth: 4,
				stroke: '#770',
				strokeDasharray: 2,
				// targetMarker: 'classic',
				targetMarker: {
					tagName: 'path',
					fill: '#f77380', // 使用自定义填充色
					stroke: 'green', // 使用自定义边框色
					strokeWidth: 2,
					d: 'M 10 -5 0 0 10 5 Z'
				},
				style: {
					animation: 'ant-line 30s infinite linear'
				},
				cursor: 'pointer'
			}
		});
	})
// 监听链接桩的连接事件
	graph.on('edge:connected', ({edge}) => {
		// 修改边的样式
		
		// 获取目标节点的 ID
		const sourceId = edge.getSourceCell().id;
		const targetId = edge.getTargetCell().id;
		// 在链接完成后立即获取目标节点的 ID，并进行处理
		console.log('目标节点 ID:', targetId, sourceId);
		
	});
	
	swdt.getData(caseId.value, zdxsList.value)
	swdt.getTabNums(caseId.value)
}

// 渲染
function render (b) {
	const dir = 'LR' // LR RL TB BT
	const result = Hierarchy.mindmap(treeData.value, {
		type: 'compactBox',
		direction: 'LR',
		getHeight () {
			return 160
		},
		getWidth () {
			return 280
		},
		getHGap () {
			return 80
		}
	})
	const model = {nodes: [], edges: []}
	const traverse = (data) => {
		if (data.data.root) {
			model.nodes.push({
				id: data.id,
				shape: 'vue-shape',
				width: 200,
				height: 120,
				x: data.x + 100,
				y: data.y + 500,
				zIndex: 999,
				data: {
					zIndex: 999
				},
				component: {
					render: () => {
						return createVNode(RootNode, {task: data.data})
					}
				}
			})
		} else if (data.data.caseNum == 1) {
			model.nodes.push({
				id: data.id,
				shape: 'vue-shape',
				width: 100,
				height: 120,
				x: data.x + 100,
				y: data.y + 100,
				zIndex: 999,
				
				data: {
					zIndex: 999,
					// name:data.data.name
				},
				component: {
					render: () => {
						return createVNode(SiLiu, {task: data.data})
					}
				}
			})
		} else if (data.data.sort > 1) {
			model.nodes.push({
				id: data.id,
				shape: 'vue-shape',
				width: 250,
				height: 120,
				x: data.x + 100,
				y: data.y + 100,
				zIndex: 999,
				
				data: {
					zIndex: 999,
					name: data.data.name,
					pid: data.data.pid
				},
				component: {
					render: () => {
						return createVNode(Duo, {task: data.data})
					}
				}
			})
		} else {
			model.nodes.push({
				id: data.id,
				shape: 'vue-shape',
				width: 250,
				height: 120,
				x: data.x + 100,
				y: data.y + 100,
				zIndex: 999,
				ports: [
					// 自定义链接桩样式
					// {
					//   id: data.id,
					//   attrs: {
					//     circle: {
					//       magnet: true,
					//       r: 10,
					//       stroke: '#31d0c6',
					//       fill: '#fff',
					//       strokeWidth: 2,
					//     },
					//   },
					// },
				],
				data: {
					zIndex: 999,
					collapse: data.data.collapse,
					data: data.data,
					name: data.data.name
				},
				component: {
					render: () => {
						return createVNode(GreenCard, {task: data.data})
					}
				}
			})
		}
		if (data.children) {
			data.children.forEach((item) => {
				model.edges.push({
					source: data.id,
					target: item.id,
					zIndex: -1,
					// 连线优化
					// router: {
					//   name: 'orth',
					//
					// },
					attrs: {
						line: {
							stroke: '#8f92a5',
						},
					},
				})
				traverse(item)
			})
		}
	}
	if (b) {
		// console.log(b)
		b.target.forEach((bItem, bIndex) => {
			let flag = []
			graph.getNodes().forEach(item => {
				if (item.data.data) {
					if (item.data.data.zdxs) {
						if (item.data.data.id == bItem && item.data.data.zdxs.length > 0) {
							return flag = item.data.data.zdxs
						}
					}
				}
			})
			
			if (flag.length > 0) {
				let text = ''
				
				flag.forEach(i => {
					text = text + i.title + ' '
				})
				text = text + b.labels[bIndex]
				model.edges.push({
					source: b.source,
					target: bItem,
					labels: [
						{
							attrs: {label: {text: text, fontSize: 20, fill: '#ff0000', fontWeight: 'bold'}}
						}
					],
					connector: {
						name: 'multi-smooth',
						// name: 'rounded',
						args: {
							total: 30 + bIndex,
							index: bIndex,
							type: 'gap',
							
						},
					},
					
					attrs: {
						line: {
							strokeWidth: 3,
							stroke: '#ff0000',
							strokeDasharray: 2,
							targetMarker: {
								tagName: 'path',
								fill: '#f77380', // 使用自定义填充色
								stroke: 'green', // 使用自定义边框色
								strokeWidth: 2,
								d: 'M 10 -5 0 0 10 5 Z'
							},
							style: {
								animation: 'ant-line 30s infinite linear'
							},
							cursor: 'pointer'
						}
					}
				})
			} else if (b.detail.length > 0) {
				model.edges.push({
					source: b.source,
					target: bItem,
					labels: [
						{
							attrs: {label: {text: b.detail[bIndex], fontSize: 30, fill: '#ff0000', fontWeight: 'bold'}}
						}
					],
					connector: {
						name: 'multi-smooth',
						// name: 'rounded',
						args: {
							total: 30 + bIndex,
							index: bIndex,
							type: 'gap',
							
						},
					},
					
					attrs: {
						line: {
							strokeWidth: 4,
							stroke: '#ff0000',
							strokeDasharray: 2,
							targetMarker: {
								tagName: 'path',
								fill: '#f77380', // 使用自定义填充色
								stroke: 'green', // 使用自定义边框色
								strokeWidth: 2,
								d: 'M 10 -5 0 0 10 5 Z'
							},
							style: {
								animation: 'ant-line 30s infinite linear'
							},
							cursor: 'pointer'
						}
					}
				})
			} else {
				model.edges.push({
					source: b.source,
					target: bItem,
					labels: [
						{
							attrs: {label: {text: b.labels[bIndex], fontSize: 20, color: '#000', fontWeight: 'bold'}}
						}
					],
					connector: {
						name: 'multi-smooth',
						// name: 'rounded',
						args: {
							total: 30 + bIndex,
							index: bIndex,
							type: 'gap',
							
						},
					},
					
					attrs: {
						line: {
							strokeWidth: 3,
							stroke: '#5e8c2e',
							strokeDasharray: 2,
							targetMarker: {
								tagName: 'path',
								fill: '#7eae53', // 使用自定义填充色
								stroke: 'green', // 使用自定义边框色
								strokeWidth: 2,
								d: 'M 10 -5 0 0 10 5 Z'
							},
							style: {
								animation: 'ant-line 30s infinite linear'
							},
							cursor: 'pointer'
						}
					}
				})
			}
			
		})
	}
	traverse(result)
	graph.fromJSON(model)
	//弧度的线
	graph.getEdges().forEach((edge) => {
		const source = edge.getSourceNode()
		const target = edge.getTargetNode()
		const sourceBBox = source.getBBox()
		const targetBBox = target.getBBox()
		
		if ((dir === 'LR' || dir === 'RL') && sourceBBox.y !== targetBBox.y) {
			const gap =
				dir === 'LR'
					? targetBBox.x - sourceBBox.x - sourceBBox.width
					: -sourceBBox.x + targetBBox.x + targetBBox.width
			const fix = dir === 'LR' ? sourceBBox.width : 0
			const x = sourceBBox.x + fix + gap / 2
			edge.setVertices([
				{x, y: sourceBBox.center.y},
				{x, y: targetBBox.center.y}
			])
		} else {
			edge.setVertices([])
		}
	})
	graph.zoomTo(curZoom.value)
	spinLoading.value = false
}


//通知信息
const messageListData = ref([])
const messageListum = ref(0)
//技战法参数
const jzfData = ref([])
const jzfNum = ref(0)
const zdxsList = ref([])

onMounted(async () => {
	await getCountUnReply()
	
	if (!dict.trackType) {
		await dict.getDict('trackType')
	}
	try {
		const res = await messageList({page: 1, pageSize: 30, status: 0, caseId: caseId.value})
		if (res.data.code == 200) {
			messageListData.value = res.data.data.list
			messageListum.value = res.data.data.total
		}
	}
	catch (e) {
		console.log(e)
	}
	try {
		const res = await phoneClueAnalysis({page: 1, pageSize: 30, status: 0, caseId: caseId.value})
		if (res.data.code == 200) {
			jzfData.value = res.data.data.clueAnalysisVos
			jzfNum.value = res.data.data.clueAnalysisVos.length
			zdxsList.value = res.data.data.relatedClue
		}
	}
	catch (e) {
		console.log(e)
		
	}
	await nextTick(() => {
		if (caseId.value) {
			initGraphContainer()
			// console.log(swdt.qjs)
			
		}
		// Data.getVirtualSubType()
	})
})

// 画布缩放
function zoom (num) {
	let step = num * 0.1
	curZoom.value -= step
	if (curZoom.value <= minZoom.value) {
		curZoom.value = minZoom.value
	}
	if (curZoom.value >= maxZoom.value) {
		curZoom.value = maxZoom.value
	}
	graph.zoomTo(curZoom.value)
}

//接收详情组件
function handlePopupChange (flag) {
	// console.log(ev);
	// detailsVisible.value = ev;
	popupVisible.value = false
}

// 回归中心
function handleCenter () {
	if (graph) {
		graph.zoomToFit()
		graph.zoomTo(.5)
	}
}


const spinLoading = ref(false)

//刷新
function refresh () {
	graph.dispose()
	spinLoading.value = true
	initGraphContainer()
	setTimeout(() => {
		spinLoading.value = false
	}, 2000)
}

//删除节点
async function delNode () {
	spinLoading.value = true
	let params = {
		id: swdt.clueData.id,
		trackType: swdt.clueData.trackType
	}
	const res = await deleteTrace(params)
	if (res.data.code === 200) {
		proxy.$Message.success('删除成功')
		spinLoading.value = true
		await swdt.getData(caseId.value, zdxsList.value)
		ajList.getCaseInfo()
		await swdt.getTabNums(caseId.value)
	} else {
		proxy.$Message.error(res.data.message)
	}
}

//深入侦查
function getChannelSolution (type, trackType, traceName) {
	let params = {
		type: type,
		targetType: trackType,
		apiType: 0
	}
	return new Promise((resolve, reject) => {
		listIiChannelSolution(params).then(res => {
			if (res.data.code == 200) {
				let channelFieldList = []
				let data = res.data.data
				let channelSolutionIdList = [data[0].id]
				data[0].fields.forEach(item => {
					channelFieldList.push({
						fieldName: item.fieldName,
						fieldValue: traceName,
						id: item.id,
						sourceCode: item.sourceCode
					})
				})
				resolve({channelSolutionIdList: channelSolutionIdList, channelFieldList: channelFieldList})
			} else {
				reject()
			}
		}).catch(() => {
			reject()
		})
	})
	
}

//深入侦查
async function deep () {
	// 输入校验
	if (swdt.deepParams.trackType == 'ip') {
		if (!reg_ip(swdt.deepParams.traceName)) {
			proxy.$Message.error('IP格式不正确')
			return false
		}
	} else if (swdt.deepParams.trackType == 'wifi') {
		if (!reg_mac(swdt.deepParams.traceName)) {
			proxy.$Message.error('MAC格式不正确')
			return false
		}
		swdt.deepParams.traceName = swdt.deepParams.traceName.toUpperCase().replace(/-/g, ':')//转大写
	} else if (swdt.deepParams.trackType == 'url') {
		// else if (swdt.deepParams.trackType == 'phone') {
		// 		if (!reg_phone(swdt.deepParams.traceName)) {
		// 			proxy.$Message.error('手机号格式不正确')
		// 			return false
		// 		}
		// 	}
		if (!reg_url(swdt.deepParams.traceName)) {
			proxy.$Message.error('URL格式不正确')
			return false
		}
		swdt.deepParams.traceName = formatUrl(swdt.deepParams.traceName)
	} else if (swdt.deepParams.trackType == 'virtualId') {
		swdt.deepParams.msg = Data.formatMsg(swdt.deepParams.virtualType)
	}
	Data.submitLoading = true
	const channelTypeList = ['ip', 'apk', 'url', 'phone', 'wifi']
	if (channelTypeList.some(item => item == swdt.deepParams.trackType)) {
		swdt.deepParams.channelType = 'internet'
	} else {
		swdt.deepParams.channelType = 'offlineDetect'
	}
	// 判断类型名称
	ajList.traceTypeTabs.forEach(item => {
		if (item.value == swdt.deepParams.trackType) {
			swdt.deepParams.trackTypeName = item.label
		}
	})
	getChannelSolution(swdt.deepParams.channelType, swdt.deepParams.trackType, swdt.deepParams.traceName).then(result => {
		swdt.deepParams.channelFieldList = result.channelFieldList
		swdt.deepParams.channelSolutionIdList = result.channelSolutionIdList
		if (swdt.deepParams.trackType == 'wifi' && !swdt.deepParams.wifiType) {
			proxy.$Message.warning('请选择子类')
			Data.submitLoading = false
			return
		}
		swdt.doInternetDeep().then(res => {
			if (res.code == 200) {
				proxy.$Message.success('侦查成功！')
				swdt.getData(caseId.value, zdxsList.value)
				swdt.deep.visible = false
				Data.submitLoading = false
				// swdt.deep.loading = false
				// 清空深入侦查参数
				swdt.deepParams.trackType = ''
				swdt.deepParams.traceName = ''
				swdt.deepParams.virtualType = ''
				swdt.deepParams.wifiType = ''
				swdt.deepParams.phoneType = ''
			} else if (res.code == 500) {
				proxy.$Message.warning(res.message)
				Data.submitLoading = false
			} else {
				proxy.$Message.error('侦查失败！' + res.message)
				Data.submitLoading = false
			}
		})
		
	}).catch(() => {
		proxy.$Message.error('深入侦查失败')
		Data.submitLoading = false
	})
	
	
}

const virtualTypes = ref([])
const wifiType = ref([])
const phoneType = ref([])
//深入侦查参数
const Data = reactive({
	btnDisable: true,
	submitLoading: false,
	options: computed(() => {
		let arr = proxy.$lodash.filter(ajList.traceTypeTabs, o => {
			return o.value != 'apk'
		})
		return arr || []
	}),
	msg: {
		subType: {key: '所属平台', value: ''}
	},
	formatMsg: (virtualType) => {
		let msg = []
		let obj = virtualTypes.value.find(o => {
			return o.shortName == virtualType
		})
		Data.msg.subType.value = obj ? obj.label : ''
		msg.push(Data.msg.subType)
		return JSON.stringify(msg)
	},
	getVirtualSubType () {
		dict.getVirtualType().then(res => {
			let r = proxy.$lodash.cloneDeep(res)
			r.forEach(item => {
				item.id = item.id + '_' + new Date().getTime()
			})
			// console.log(r);
			virtualTypes.value = r
			// Data.virtualTypes = r
		})
	},
	getMacType () {
		dict.getDict('wifiType').then(res => {
			wifiType.value = res
		})
	},
	getPhoneType () {
		dict.getDict('phoneType').then(res => {
			phoneType.value = res
		})
	}
})


//循环查找
function dateChange (val) {
	swdt.beginTime = val[0]
	swdt.endTime = val[1]
}

async function beginFind () {
	if (swdt.endTime) {
		const res = await updateTaskChannelTime({
			beginTime: swdt.beginTime,
			endTime: swdt.endTime,
			taskChannelId: swdt.taskChannelId
		})
		if (res.data.code == 200) {
			proxy.$Message.success('查询成功')
			swdt.dateVisible = false
			await swdt.getData(caseId.value, zdxsList.value)
		} else {
			proxy.$Message.error(res.data.message)
		}
	} else {
		proxy.$Message.error('请选择查找时间')
	}
}

//购物车
function openShopCar () {
	if (traceListVisible.value) {
		ajList.setTraceListVisible(false)
	} else {
		ajList.setTraceListVisible(true)
	}
}


watch(() => swdt.qjpzType, () => {
	if (Array.isArray(swdt.collisionData)) {
		let source = ''
		let target = []
		let labels = []
		let detail = []
		
		swdt.collisionData.forEach(item => {
			source = item.from
			if (swdt.qjpzType == 'all') {
				target.push(item.to)
				if (item.detail) {
					detail.push(item.detail)
				}
				labels.push(item.statDesc)
				
			} else if (swdt.qjpzType == 'SAME') {
				if (item.type == 'SAME') {
					
					target.push(item.to)
					if (item.detail) {
						detail.push(item.detail)
					}
					labels.push(item.statDesc)
				}
			} else if (swdt.qjpzType == 'INTERSECT') {
				if (item.type == 'INTERSECT') {
					target.push(item.to)
					if (item.detail) {
						detail.push(item.detail)
					}
					labels.push(item.statDesc)
				}
			}
			
			
		})
		render({source, target, labels, detail})
	}
})

//监控碰撞连线参数
watch(() => swdt.collisionData, async (value, oldValue, onCleanup) => {
	if (value != 'k') {
		swdt.taskIdList = []
		swdt.treeData1.forEach(item => {
			if (item.collapseSub == '1') {
				swdt.taskIdList.push(item.id)
				item.collapseSub = 0
			}
		})
		if (swdt.taskIdList.length > 0) {
			swdt.treeData = cloneDeep(getListData(swdt.treeData1))
			await updateSwdtList({collapseSub: '0', traceIdList: swdt.taskIdList})
		}
		render()
	}
	
	// 判断连线为交链还是同链
	if (Array.isArray(value)) {
		let source = ''
		let target = []
		let labels = []
		let detail = []
		
		value.forEach(item => {
			// console.log(item,swdt.qjpzType)
			source = item.from
			if (swdt.qjpzType == 'all') {
				target.push(item.to)
				if (item.detail) {
					detail.push(item.detail)
				}
				labels.push(item.statDesc)
				
			} else if (swdt.qjpzType == 'SAME') {
				if (item.type == 'SAME') {
					
					target.push(item.to)
					if (item.detail) {
						detail.push(item.detail)
					}
					labels.push(item.statDesc)
				}
			} else if (swdt.qjpzType == 'INTERSECT') {
				if (item.type == 'INTERSECT') {
					target.push(item.to)
					if (item.detail) {
						detail.push(item.detail)
					}
					labels.push(item.statDesc)
				}
			}
			
			
		})
		render({source, target, labels, detail})
	}
})
watch(() => swdt.deepParams, (n, o) => {
	if (n.trackType == 'virtualId') {
		if (!n.traceName || !n.virtualType) {
			Data.btnDisable = true
		} else {
			Data.btnDisable = false
		}
	} else if (n.trackType != '') {
		// 判断是否有能力
		if (!n.traceName) {
			Data.btnDisable = true
		} else {
			Data.btnDisable = false
		}
	} else {
		Data.btnDisable = true
	}
}, {deep: true})
const collisionDetail = reactive({})


watch(() => swdt.collisionDetail.visible, (n) => {
	if (n) {
		collisionDetail.virtualId = swdt.collisionDetail.virtualId
		collisionDetail.originColumn = swdt.collisionDetail.originColumn
		collisionDetail.originData = swdt.collisionDetail.originData
		collisionDetail.tableName = swdt.collisionDetail.tableName
		collisionDetail.originTable = swdt.collisionDetail.originTable
	}
})

watch(treeData, (a, b) => {
	nextTick(() => {
		render()
		if (swdt.qjs) {
			nextTick(() => {
				graph.getNodes().forEach((node) => {
					if (node.id == swdt.qjs.traceId) {
						queryCell(swdt.qjs.traceId)
						graph.scrollToCell(node)
						
						if (node.data.pid) {
							graph.getNodes().forEach((n) => {
								if (n.id == node.data.pid) {
									queryCell(node.data.pid)
									graph.scrollToCell(n)
								}
							})
						}
						if (node.data.data) { // 排除根节点
							// console.log(node)
							cardData.value = node.data.data
							notePina.dblData = node.data.data
							popupVisible.value = true
							notePina.caseId = node.data.data.caseId
							notePina.traceId = node.data.data.id
							swdt.border = node.data.data.id
							swdt.setNodeHistoryNode(node)
							
							if (node.data.data.sum) {
								swdt.history.num = node.data.data.sum.noteNum
								swdt.history.markNum = node.data.data.sum.markNum
							} else {
								swdt.history.num = 0
								swdt.history.markNum = 0
							}
							// graph.centerCell(node, { padding: { bottom: 450, right: 500 }, animation: {duration: 360}}) // duration?: number; easing?: string
						}
					}
				})
				
			})
			
		}
	})
})
onBeforeUnmount(() => {
	graph.dispose()
})
//备注
const modalOpt = reactive({
	visible: false,
	// remark: '',
	param: {
		traceId: '',
		msg: ''
	},
	close () {
		modalOpt.param.msg = ''
		modalOpt.visible = false
	},
	// 备注修改
	update1 () {
		let param = modalOpt.param
		updateTraceRemark(param).then(async res => {
			let {code, data} = res.data;
			if (code == 200) {
				// 更新对应的node
				modalOpt.close()
				await swdt.getData(caseId.value, zdxsList.value,true)

			}
		})
	}
})
bus.on('remark', (param) => {
	/* * */
	modalOpt.param.traceId = param.id
	modalOpt.param.msg = param.remark
	modalOpt.visible = true
})

bus.on('toCell', (id) => {
	graph.getNodes().forEach((n) => {
		if (n.id == id) {
			queryCell(id)
			graph.scrollToCell(n)
		}
	})
})

// 深入侦查
function deepModalChange (f) {
	if (!f) {
		swdt.deepParams.virtualType = ''
	} else {
		if (virtualTypes.value.length == 0) {
			nextTick(() => {
				Data.getVirtualSubType()
			})
		}
		if (wifiType.value.length == 0) {
			nextTick(() => {
				Data.getMacType()
			})
		}
		if (phoneType.value.length == 0) {
			nextTick(() => {
				Data.getPhoneType()
			})
		}
	}
}


const newNodes = ref([])
const num = ref(1)
// 节点搜索
watch(searchText, (value) => {
	num.value = 1
	
	newNodes.value = []
	
	if (!value) {
		
		queryCell(null);
		
		return
	}
	
	graph.getNodes().forEach((node) => {
		
		const name = node.data.name
		
		if (name) {
			if (name.includes(value)) {
				
				newNodes.value.push(node)
				
			}
		}
	})
	
	if (newNodes.value.length > 0) {
		graph.scrollToCell(newNodes.value[num.value - 1])
		queryCell(newNodes.value[num.value - 1].id)
		
	}
	
	
});


function qh (v) {
	
	if (v == 'a') {
		if (num.value == newNodes.value.length) {
			num.value = 1
		} else {
			num.value += 1
		}
	} else {
		if (num.value == 1) {
			num.value = newNodes.value.length
		} else {
			num.value -= 1
		}
	}
	
	graph.scrollToCell(newNodes.value[num.value - 1])
	
	function traverseTree (node, id) {
		// console.log(node.name); // 执行任何您想要在每个节点上执行的操作
		node.childs = false
		
		if (node.id == id) {
			node.childs = true
		}
		if (node.children && node.children.length > 0) {
			// 如果当前节点有子节点，则递归遍历子节点
			node.children.forEach(child => {
				traverseTree(child, newNodes.value[num.value - 1].id);
			});
		}
	}
	
	swdt.treeData.children.forEach(node => {
		traverseTree(node, newNodes.value[num.value - 1].id);
	});
	
	
}

async function clear (tab) {
	
	graph.getNodes().forEach((n) => {
		if (n.id == tab.traceId) {
			queryCell(tab.traceId)
			graph.scrollToCell(n)
		}
	})
	try {
		const {data} = await updateStatus({traceIdList: [tab.traceId]})
		if (data.code == 200) {
			messageListData.value.forEach(item => {
				if (item.traceId == tab.traceId) {
					item.status = 1
				}
			})
		} else {
			proxy.$Message.error(data.message)
		}
	}
	catch (e) {
		proxy.$Message.error(e)
	}
	
}


async function downloadXmind () {
	const res = await exportXmind({caseId: caseId.value})
	
	if (res.data.code == 200) {
		// 下载
		let url = res.data.data.path.replace(/\/mnt\/data\/upload/g, '')
		
		// 用你从后端获取的下载链接替换 'YOUR_DOWNLOAD_LINK' 这部分
		let downloadLink = window.location.origin + '/upload' + url;
		if (window.location.origin == 'http://localhost:10000') {
			downloadLink = global.env.fileUrl + url;
		}
		// console.log(downloadLink)
		
		// 创建一个隐藏的<a>标签来模拟点击下载链接
		const a = document.createElement('a');
		a.href = downloadLink;
		// a.download = 'file_name.ext'; // 可以设置下载文件的默认名称
		a.style.display = 'none';
		
		// 将<a>标签添加到页面并模拟点击
		document.body.appendChild(a);
		a.click();
		
		// 清理掉<a>标签
		document.body.removeChild(a);
		proxy.$Message.success('正在下载！')
		
	}
	// console.log(res)
}


function unreadFollow () {
	let unread = 0;
	messageListData.value.forEach(item => {
		if (!item.status) unread++;
	});
	return unread;
}

//技战法线索类型
const trackType = (val) => {
	let a = ''
	dict.dict.trackType.list.forEach(item => {
		if (item.value == val) {
			a = item.label
		}
	})
	return a
}

function go (val) {
	graph.getNodes().forEach((n) => {
		if (n.id == val) {
			queryCell(val)
			graph.scrollToCell(n)
		}
	})
}


const qjs = ref({
	type: '案内搜',
	name: '',
	visible: false
})
const pageInfo = reactive({
	pageNo: 1,
	pageSize: 50,
})
const qjsList = ref([])

async function qjsBtn () {
	if (!qjs.value.name) {
		proxy.$Message.error('请输入查询条件')
		return
	}
	qjs.value.visible = true
	const params = {
		...pageInfo,
		searchText: qjs.value.name
	}
	try {
		const {data: {data, code, message}} = await searchAllTaskReturn(params)
		if (code == 200) {
			qjsList.value = data.list
			pageInfo.total = data.total
			proxy.$Message.success('查询成功')
		} else {
			proxy.$Message.error(message)
		}
		
	}
	catch (e) {
		console.log(e)
	}
	
}

//类型转换
const traceKeyMap = {
	apk: 'APK',
	ewallet: '电子钱包',
	url: 'URL',
	phone: '手机号',
	virtualId: '虚拟身份',
	bankCard: '卡类',
	ip: 'IP',
	idcard: '证件号码',
	wifi: 'MAC',
	offlineTask: '其他线索'
};

function qjsTo (val) {
	swdt.qjs = val
	let origin = window.location.origin
	let param = aes.encrypt(JSON.stringify({caseId: val.caseId}))
	window.open(origin + '/detect?param=' + param + '&traceId=' + val.traceId + '&channelType=' + val.channelType, '_blank')
	
}

watch(() => swdt.deepParams.wifiType, (v, a) => {
	console.log(v, a)
})

const jzfType = ref('all')
const jzfTypeData = computed(() => {
	if (jzfType.value == 'phone') {
		return jzfData.value.filter(item => item.ruleType == 'phone')
	} else if (jzfType.value == 'frTerminalCode') {
		return jzfData.value.filter(item => item.ruleType == 'frTerminalCode')
	} else {
		return jzfData.value
	}
})


function openOutline () {
	notePina.noteVisible = true
	notePina.type = 'outline'
	
}

const lyVisible = ref(false)
const lyData = ref({
	userList: [],
	list: []
})
const lyCount = ref(0)

async function getCountUnReply () {
	const res = await countUnReply(caseId.value)
	if (res.data.code == 200) {
		lyCount.value = res.data.data
	} else {
		proxy.$Message.error(res.data.message)
	}
}

async function getListCommentUser () {
	const res = await listCommentUser(caseId.value)
	if (res.data.code == 200) {
		lyData.value.userList = res.data.data
	} else {
		proxy.$Message.error(res.data.message)
	}
}

async function getListComment () {
	const res = await listComment(caseId.value)
	if (res.data.code == 200) {
		lyData.value.list = res.data.data.map(e => {
			let {subComments} = e;
			return {
				...e,
				displayInput: false,
				subComments: subComments?.map(c => ({...c, displayInput: false}))
			}
		})
	} else {
		proxy.$Message.error(res.data.message)
	}
}

function hfBtn (id) {
	lyData.value.list = lyData.value.list.map(e => {
		let {subComments} = e;
		return {
			...e,
			displayInput: false,
			subComments: subComments?.map(c => ({...c, displayInput: false}))
		}
	})
	lyData.value.list.forEach(item => {
		if (item.id == id) {
			item.displayInput = true
		} else {
			item.subComments.forEach(sub => {
				if (sub.id == id) {
					sub.displayInput = true
				}
			})
		}
	})
}

const hfValue = ref('')
const lyValue = ref('')

async function fsSave (val, type, i) {
	console.log(val, type, i)
	if (!val) {
		proxy.$Message.error('请输入内容')
		return
	}
	if (type == 1) {
		const res = await saveCaseComment({
			content: val,
			caseId: caseId.value
		})
		if (res.data.code == 200) {
			lyValue.value = ''
			await getListCommentUser()
			await getListComment()
			await getCountUnReply()
		} else {
			proxy.$Message.error(res.data.message)
		}
	} else {
		const res = await saveCaseComment({
			content: val,
			caseId: caseId.value,
			parentId: i.id
		})
		if (res.data.code == 200) {
			hfValue.value = ''
			await getListCommentUser()
			await getListComment()
			await getCountUnReply()
		} else {
			proxy.$Message.error(res.data.message)
		}
	}
}

async function sc (id) {
	const res = await deleteById(id)
	if (res.data.code == 200) {
		await getListCommentUser()
		await getListComment()
		await getCountUnReply()
	} else {
		proxy.$Message.error(res.data.message)
	}
	
}

watch(() => lyVisible.value, (val) => {
	if (val) {
		getListCommentUser()
		getListComment()
		getCountUnReply()
		console.log(userId.value)
	}
})
</script>

<template>
	<div ref="graphRef" :class="{screen: isAllScreen}" class="swdt__inner">
		<div id="swdt_container" class="swdt_container" @click="lyVisible = false">
		</div>
		<!--	  碰撞线索显示控制按钮-->
		<div v-if="swdt.collisionData !== 'k' && swdt.collisionData" class="pzType">
			<div :class="swdt.qjpzType === 'all'?'active':''" @click="swdt.qjpzType='all'">全局</div>
			<div :class="swdt.qjpzType === 'INTERSECT'?'active':''" @click="swdt.qjpzType='INTERSECT'">交链</div>
			<div :class="swdt.qjpzType === 'SAME'?'active':''" @click="swdt.qjpzType='SAME'">同链</div>
		</div>
		<!--	  案内、全局搜索-->
		<div v-if="qjs.type === '案内搜'" class="search">
			
			<input v-model="searchText" class="inp" placeholder="输入线索名称进行搜索"/>
			<div v-if="newNodes.length>=1" class="qh">{{num}}/{{newNodes.length}} &nbsp;&nbsp;
				<Icon size="24" type="ios-arrow-up" @click="qh('a')"/>
				<Icon size="24" type="ios-arrow-down" @click="qh('b')"/>
			</div>
		
		
		</div>
		<div v-else class="search" style="padding: 0 10px ;height: 40px">
			<input v-model="qjs.name" class="inp" placeholder="输入查询参数"/>
			<Button class="btn" @click="qjsBtn">搜索</Button>
			<div v-if="qjs.visible" class="dataList">
				
				<div style="font-size: 18px;display: flex;justify-content: space-between;align-items: center">
					<div><span style="color:#004bf4">全局：</span>
						<span style="color: #cccccc">共搜索到以下结果</span></div>
					<div style="cursor: pointer" @click="qjs.visible=false">
						<Icon size="20" type="md-close"/>
					</div>
				</div>
				<div v-for="item in qjsList" class="item" @click="qjsTo(item)">
					<div class="top">
						<div style="display: flex;align-items: center;flex-wrap: wrap">
							<span class="font">{{traceKeyMap[item.traceType]}}：{{item.traceName}}</span>
							<Icon color="#1D83FF" style="margin: 15px" type="md-arrow-round-forward"/>
							<span class="font">{{item.solutionName}}</span>
							<Icon color="#1D83FF" style="margin: 15px" type="md-arrow-round-forward"/>
							<span class="font">{{item.targetTableInfo}}</span>
						</div>
					</div>
					<div class="bottom">
						<p>{{item.caseName}}</p>
						<p> {{traceKeyMap[item.traceType]}}：{{item.traceName}}</p>
						<p>{{item.solutionName}} — {{item.targetTableInfo}}</p>
					</div>
				</div>
				<div v-if="qjsList.length<1" style="display: flex;align-items: center;justify-content: center;height: 100px">
					未查询到数据
				</div>
			</div>
		</div>
		<div class="qjs">
			<Dropdown style="margin-left: 20px" trigger="click">
        <span>
          {{qjs.type}}
          <Icon type="ios-arrow-down"></Icon>
        </span>
				<template #list>
					<DropdownMenu>
						<DropdownItem @click="qjs.type='案内搜'">案内搜</DropdownItem>
						<DropdownItem @click="qjs.type='全局搜'">全局搜</DropdownItem>
					</DropdownMenu>
				</template>
			</Dropdown>
		</div>
		<!--	  消息通知-->
		<div class="tz">
			<Notification :count="messageListum+jzfNum">
				<NotificationTab :count="unreadFollow()" :show-clear="false" name="message" style="width: 400px" title="通知">
					<NotificationItem v-for="(item, index) in messageListData" :key="index" :read="item.status" @on-item-click="clear(item)">
						<div class="item">
							<div style="border-bottom: 1px solid #ccc;display: flex;justify-content: space-between;margin-bottom: 10px">
								<p>
									<Tag v-if="item.status==0" color="error">未读</Tag>
									<Tag v-else color="success">已读</Tag>
									{{item.title}}
								</p>
								<p>{{item.createdTime}}</p>
							</div>
							<div>{{item.name}}</div>
						</div>
					</NotificationItem>
				</NotificationTab>
				<NotificationTab :count="jzfNum" :show-clear="false" name="jzf" style="width: 400px" title="技战法">
					<Select v-model="jzfType">
						<Option value="all">全部</Option>
						<Option value="phone">手机号码扩线模型</Option>
						<Option value="frTerminalCode">锋刃终端码扩线模型</Option>
					</Select>
					<NotificationItem v-for="(item, index) in jzfTypeData" :key="index" :read="item.status" @on-item-click="clear(item)">
						<div v-if="item.ruleType=='phone'" class="item">
							<div style="border-bottom: 1px solid #ccc;display: flex;justify-content: space-between;padding-bottom: 10px;margin-bottom: 10px">
								<p>
									<Tag color="error">碰撞</Tag>
									手机号码扩线模型
								</p>
							</div>
							<div style="display: flex;flex-wrap: wrap">{{trackType(item.traceType1)}} &nbsp;<a @click="go(item.traceId1)">{{item.traceName1}}</a>返回的调证信息 与 &nbsp;{{trackType(item.traceType2)}} &nbsp;<a
								@click="go(item.traceId2)">{{item.traceName2}}</a>返回的互联网解析结果发生碰撞，碰撞到{{trackType(item.type)}} <span v-for="i in item.properties">{{i}},&nbsp;</span>建议对以线索 {{item.traceName1}}进行深入研判。
							</div>
						</div>
						<div v-if="item.ruleType=='frTerminalCode'" class="item">
							<div style="border-bottom: 1px solid #ccc;display: flex;justify-content: space-between;padding-bottom: 10px;margin-bottom: 10px">
								<p>
									<Tag color="error">碰撞</Tag>
									锋刃终端码扩线模型
								</p>
								<!--                  <p>20-06-06 12：01：55</p>-->
							</div>
							<div style="display: flex;flex-wrap: wrap">{{trackType(item.traceType1)}} &nbsp;<a @click="go(item.traceId1)">{{item.traceName1}}</a>返回的调证信息 与 &nbsp;{{trackType(item.traceType2)}} &nbsp;<a
								@click="go(item.traceId2)">{{item.traceName2}}</a>返回的互联网解析结果发生碰撞，碰撞到{{trackType(item.type)}} <span v-for="i in item.properties">{{i}},&nbsp;</span>建议对以上线索进行深入研判。
							</div>
						</div>
					</NotificationItem>
				</NotificationTab>
			</Notification>
		</div>
		<div class="lyOpen" @click.stop="lyVisible=!lyVisible">
			<Badge :count="lyCount">
				<Icon type="md-create"/>
			</Badge>
		</div>
		<!--		留言-->
		<div v-if="lyVisible" class="ly">
			<div style="height: 6.2rem;padding: 15px">
				<div v-if="lyData.userList.length>0" class="userList">
					<div>参与者：{{lyData.userList.length}}</div>
					<div class="user">
						<div v-for="item in lyData.userList" class="userItem">
							<span v-if="item.commented" class="dian"></span> {{item.username}}
						</div>
					</div>
					<div>所有动态</div>
					<div class="contentList">
						<div v-for="item in lyData.list" class="contentItem">
							<div style="display: flex;justify-content: space-between">
								<div class="top">
									<span v-if="item.subComments.length<1" class="dian"></span> {{item.username}}留言了
								</div>
								<div class="top">
									{{item.createTime}}
								</div>
							</div>
							<div>
								{{item.content}} <span v-if="userId==item.userId"> <span class="sc" @click.stop="sc(item.id)">删除</span></span> <span v-else class="hf" @click="hfBtn(item.id)">回复</span>
							</div>
							<div v-if="item.displayInput" class="fs">
								<Input v-model="hfValue" class="inp" placeholder="请输入内容"/><a href="#" style="width: .8rem;margin-left: .2rem" @click.stop="fsSave(hfValue,2,item)">
								<Icon type="ios-paper-plane-outline"/>
								发送</a>
							</div>
							<div>
								<div v-for="(sub,index) in item.subComments" style="width:3rem; word-wrap: break-word; word-break: normal;border-left: 2px solid #ccc;color: rgba(0,0,0,0.4);">
									
									<span v-if="userId == sub.userId"><span style="padding-left: 20px"></span> 我{{index < 1 ? '' : '回复了' + sub.replyUsername}}：{{sub.content}}  <span class="sc" @click.stop="sc(sub.id)">删除</span></span>
									<span v-else><span style="padding-left: 20px"></span> {{sub.username}}{{index < 1 ? '' : '回复了' + sub.replyUsername}}：{{sub.content}}  <span class="hf" @click="hfBtn(sub.id)">回复</span></span>
									<div v-if="sub.displayInput" class="fs">
										<Input v-model="hfValue" class="inp" placeholder="请输入内容"/><a href="#" style="width: .8rem;margin-left: .2rem" @click.stop="fsSave(hfValue,2,sub)">
										<Icon type="ios-paper-plane-outline"/>
										发送</a>
									</div>
								</div>
							</div>
						</div>
					
					</div>
				</div>
			</div>
			<div class="lyBtn">
				<Input v-model="lyValue" placeholder="请输入内容"/><a href="#" style="width: .8rem;margin-left: .2rem" @click.stop="fsSave(lyValue,1)">
				<Icon type="ios-paper-plane-outline"/>
				发送</a>
			</div>
		</div>
		
		<!--	  标定结果按钮-->
		<div class="zcjg-top" @click="notePina.openSign('swdt',caseId)">
			<div>
				<span>人 {{swdt.tabNums.peopleCount}}</span>
				<span>物 {{swdt.tabNums.objectCount}}</span>
			</div>
			<Button type="primary">标定结果</Button>
			<Button style="margin-left: 5px" type="primary" @click.stop="openOutline()">大纲</Button>
		</div>
		<div class="tool-bottom">
			<div @click="openShopCar()">
				<Badge :count="ajList.traceCount">
					<i class="iconfont icon-a-10Icaidanbuju" style="font-size: .26rem"></i>
				</Badge>
			</div>
			<div title="刷新" @click="refresh"><i class="iconfont icon-shuaxin"></i></div>
			<div title="放大" @click="zoom(-1)"><i class="iconfont icon-chuangjiantianjiapiliangtianjia"></i></div>
			<div title="缩小" @click="zoom(1)"><i class="iconfont icon-jianshao"></i></div>
			<div title="回归中心" @click="handleCenter"><i class="iconfont icon-dingwei"></i></div>
			<div title="下载" @click="downloadXmind">
				<Icon size="18" type="md-download"/>
			</div>
		</div>
		<Spin :show="spinLoading" fix></Spin>
	</div>
	<!--    底部详情-->
	<Vdetails v-show="popupVisible" :node="cardData" @change-visible="handlePopupChange"></Vdetails>
	<!--    添加标签-->
	<add-tags :caseId="caseId"/>
	<!--    标定详情-->
	<Modal
		v-model="swdt.people.visible"
		footer-hide
		title="标定人员详情"
		width="800">
		<people-v></people-v>
	</Modal>
	<!--    删除提示-->
	<Modal
		v-model="swdt.clueVisible"
		:closable="false"
		title="提示"
		@on-ok="delNode"
	>
		<p style="text-align: center">{{swdt.content}}</p>
	</Modal>
	<!--    循环查询-->
	<Modal
		v-model="swdt.dateVisible"
		footer-hide
		title="循环查找时间段"
	>
		<DatePicker
			v-model="swdt.Time"
			placeholder="请选择时间段"
			split-panels
			style="width: 100%"
			type="daterange"
			@on-change="dateChange"
		></DatePicker>
		<div style="width: 100%;text-align: right;margin-top: .2rem">
			<Button @click="swdt.dateVisible = false">取消</Button>
			<Button style="margin-left: .2rem" type="primary" @click.once="beginFind">查询</Button>
		</div>
	</Modal>
	<!--    碰撞详情-->
	<Modal v-model="swdt.node.modal"
	       :mask="false" draggable scrollable
	       title="拖拽区域"
	       width="82%"
	>
		<collision-drawer></collision-drawer>
	</Modal>
	<!--    深入侦查-->
	<Modal
		v-model="swdt.deep.visible"
		:closable="true"
		:mask="false"
		draggable
		footer-hide
		title="深入侦查"
		width="300"
		@on-visible-change="deepModalChange"
	>
		<div class="srzc">
			<p>字段值</p>
			<Input v-if="swdt.deep.input" v-model.trim="swdt.deepParams.traceName" placeholder="线索名称" type="text"/>
			<p v-else style="color: #000000;word-break: break-all;"> {{swdt.deepParams.traceName}}</p>
			<p>字段类型</p>
			<Select v-model="swdt.deepParams.trackType" placeholder="线索类型" style="width:100%">
				<Option v-for="item in Data.options" :key="item.value" :value="item.value">{{item.label}}</Option>
			</Select>
			<div v-if="swdt.deepParams.trackType == 'phone'">
				<p>子类别</p>
				<Select v-model.trim="swdt.deepParams.phoneType" filterable placeholder="选择子类别" style="width: 100%"
				        @on-open-change="Data.getPhoneType()">
					<Option
						v-for="item in phoneType"
						:key="item.value"
						:value="item.value">
						{{item.label}}
					</Option>
				</Select>
			</div>
			<div v-if="swdt.deepParams.trackType == 'wifi'">
				<p>子类别</p>
				<Select v-model="swdt.deepParams.wifiType" filterable placeholder="选择子类别" style="width: 100%"
				        @on-open-change="Data.getMacType()">
					<Option
						v-for="item in wifiType"
						:key="item.value"
						:value="item.value">
						{{item.label}}
					</Option>
				</Select>
			</div>
			<div v-if="swdt.deepParams.trackType == 'virtualId'">
				<p>所属平台</p>
				<Select v-model.trim="swdt.deepParams.virtualType" filterable placeholder="可选择虚拟身份的所属平台" style="width: 100%"
				        @on-open-change="Data.getVirtualSubType">
					<Option v-for="(item, index) in virtualTypes" :key="index + '_' + item.id" :label="item.label"
					        :value="item.shortName">
						<span> {{item.label}}</span>
						<span v-if="item.isGreenChannel == 1 "
						      style="float:right;color:#FFF;background: #24B493;padding: 0 .1rem;border-radius: .1rem">绿色通道</span>
						<span v-if="item.isImportantFocus == 1 "
						      style="float:right;color:#FFF;background: #1D83FF;padding: 0 .1rem;border-radius: .1rem">重点关注</span>
					</Option>
				</Select>
			</div>
		</div>
		<div style="width: 100%;text-align: right;margin-top: .2rem">
			<Button @click="swdt.deep.visible = false">取消</Button>
			<Button :disabled="Data.btnDisable || Data.submitLoading" style="margin-left: .2rem" title="请输入线索名称与线索类型" type="primary"
			        @click="deep()">深入侦查
			</Button>
		</div>
	</Modal>
	<!--    碰撞池-->
	<Modal v-model="traceListVisible" :closable="true" :footer-hide="true" :mask="false" :reset-drag-position="false" draggable title="碰撞池"
	       transfer width="240">
		<ShopCar style="height: 550px"></ShopCar>
	</Modal>
	<!--    备注-->
	<Modal v-model="modalOpt.visible"
	       :footer-hide="false"
	       :mask-closable="false"
	       title="编辑备注"
	       @on-cancel="">
		<Input v-model="modalOpt.param.msg" :rows="10" placeholder="输入备注" type="textarea"></Input>
		<template #footer>
			<Button @click="modalOpt.close">关闭</Button>
			<Button type="primary" @click="modalOpt.update1">提交</Button>
		</template>
	</Modal>
	<!--  小地图-->
	<div ref="minimapContainer" class="minimapContainer"></div>
	<!--碰撞结果-->
	<Modal
		v-model="swdt.collisionDetail.visible"
		class-name="vertical-center-modal"
		footer-hide
		title="碰撞结果"
		width="80%"
	>
		<file-pz-dialog :collisionDetail="collisionDetail"></file-pz-dialog>
		<div slot="footer" style="text-align: right">
			<Button @click="swdt.collisionDetail.visible = false">关闭</Button>
		</div>
	</Modal>
	<!--  二维码-->
	<Modal v-model="qrcode.visible" :footer-hide="true">
		<channel-qrcode :id="qrcode.traceId" :default="qrcode.channelType" :list="qrcode.params"
		                :visible="qrcode.visible"></channel-qrcode>
	</Modal>

</template>
<style lang="less" scoped>
.dian {
	display: inline-block;
	width: 10px;
	height: 10px;
	border-radius: 5px;
	background: red;
}

.hf {
	margin-left: 20px;
	color: #057AFF;
	cursor: pointer;
}

.sc {
	margin-left: 20px;
	color: #ff0000;
	cursor: pointer;
}

.fs {
	display: flex;
	align-items: center;
	
	.inp {
		:deep(.ivu-input) {
			border: 0;
		}
	}
}

.contentList {
	height: 5rem;
	padding-bottom: 1rem;
	overflow-y: auto;
	
	.contentItem {
		width: 100%;
		background: #F6F6F8;
		border-radius: 8px 8px 8px 8px;
		padding: .16rem;
		margin-bottom: .2rem;
		
		.top {
			color: rgba(0, 0, 0, 0.4);
		}
	}
}

.userList {
	.user {
		display: flex;
		border-bottom: 1px solid #ccc;
		margin-bottom: .2rem;
		
		.userItem {
			background: #ECF5FF;
			padding: .05rem;
			border-radius: .05rem;
			color: #000;
			margin: .05rem ;
		}
	}
}

.ly {
	:deep(	.ivu-tabs-nav-scroll ) {
		display: none;
	}
	
	:deep(.ivu-tabs-bar) {
		display: none;
	}
	
	background: #FFFFFF;
}

.lyBtn {
	height: .5rem;
	display: flex;
	align-items: center;
	padding: .15rem;
	box-shadow: 0px -6px 17px 0px rgba(0, 0, 0, 0.1);
}

.item {
	//color: #222222;
	border-radius: 20px !important;
	padding: 20px;
	background: #fff !important;
	overflow: hidden;
	//white-space: normal;
}

.qjs {
	
	position: absolute;
	top: .8rem;
	right: .3rem;
}

.tz {
	position: absolute;
	top: 1.3rem;
	right: .4rem;
	
	:deep(.ivu-dropdown-menu) {
		width: 400px;
		
		.ivu-notifications-list {
			width: 400px;
		}
	}
}

.lyOpen {
	position: absolute;
	top: 1.3rem;
	right: .8rem;
	font-size: 24px;
	line-height: 20px;
}

.ly {
	position: absolute;
	top: 1.5rem;
	z-index: 99999;
	border-radius: 10px;
	width: 4rem;
	right: .8rem;
	
	:deep(.ivu-dropdown-menu) {
		width: 400px;
		
		.ivu-notifications-list {
			width: 400px;
		}
	}
;
}

.pzType {
	padding: 5px 10px;
	position: absolute;
	top: .3rem;
	right: 50%;
	display: flex;
	background: #FFFFFF;
	border-radius: 10px;
	
	div {
		padding: 5px 15px;
		border-radius: 10px;
		color: #cccccc;
	}
	
	.active {
		background: #ecf5ff;
		color: #499eff;
	}
}

.search {
	position: absolute;
	top: .7rem;
	right: 1rem;
	display: flex;
	//height: .32rem;
	justify-content: center;
	align-items: center;
	background: #FFFFFF;
	border: 1px solid #cccccc;
	border-radius: 10px;
	padding: 10px 20px;
	
	.btn {
		background: #8cb4e6;
		color: #FFFFFF;
		
	}
	
	.dataList {
		border-radius: 10px;
		position: absolute;
		top: 45px;
		right: -86px;
		z-index: 999 !important;
		width: 5rem;
		max-height: 10rem;
		background: #FFFFFF;
		padding: .15rem;
		overflow: auto;
		
		.item {
			background: #f6f6f8 !important;
			border-radius: 10px;
			margin-top: 10px;
			
			
			.top {
				border-bottom: 1px solid #cccccc;
				
				.font {
					display: inline-block;
					max-width: 4.5rem;
					white-space: normal;
					font-size: 16px;
					font-weight: 500;
					color: rgba(0, 0, 0, 0.8);
					
				}
			}
			
			.bottom {
				font-size: 16px;
				color: rgba(0, 0, 0, 0.4);
			}
		}
	}
	
	.inp {
		border: transparent;
		outline: none;
	}
	
	.qh {
		display: flex;
		align-items: center;
	}
}

.srzc {
	p {
		margin-bottom: .1rem;
		color: #cccccc;
	}
}

.swdt__inner {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	
	&.screen {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 999;
		background-color: #fff;
	}
	
	.zcjg-top {
		position: absolute;
		top: .2rem;
		right: .3rem;
		display: flex;
		align-items: center;
		
		div {
			line-height: .32rem;
			height: .32rem;
			background: #FFFFFF;
			
			span {
				margin: 0 .2rem;
			}
		}
	}
	
	.tool-bottom {
		position: absolute;
		right: .3rem;
		bottom: .3rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		font-weight: 900;
		
		div {
			width: .4rem;
			height: .4rem;
			border-radius: .03rem;
			border: 1px solid #979797;
			background: #FFFFFF;
			margin-bottom: .2rem;
			text-align: center;
			line-height: .4rem;
			
			&:nth-child(1) {
				width: .6rem;
				height: .6rem;
				border-radius: 50%;
				background: #0D263F;
				line-height: .6rem;
				color: #FFFFFF;
			}
		}
	}
}

.swdt_container {
	height: 125% !important;
	width: 120% !important;
}

.minimapContainer {
	position: absolute;
	
	z-index: 999;
}
</style>

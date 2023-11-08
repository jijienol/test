<script setup>
import {noteStore} from '@/store/modules/note.js';
import {insertNote} from '@/api/ajJs.js';
import {swdtStore} from '@/store/modules/swdt.js';
import {getCurrentInstance, ref} from 'vue';
import bus from 'vue3-eventbus'
import {cloneDeep} from 'lodash';
import {getListData} from '../../utils/tree.js';
import WangEditor from '@/components/WangEditor/index.vue';

const note = noteStore()
const swdt = swdtStore()
const {proxy} = getCurrentInstance()
// 添加笔记参数

// 校验参数
const ruleAddNote = ref({
	title: [{required: true, message: '笔记标题不能为空', trigger: 'blur'}],
	description: [{required: true, message: '笔记内容不能为空', trigger: 'blur'}]
})

function initAddNoteParams () {
	note.addNoteParams.title = ''
	note.addNoteParams.description = ''
}

// 添加笔记接口
const formNote = ref()
const addNote = () => {
	formNote.value.validate(async (valid) => {
		if (valid) {
			try {
				const res = await insertNote(note.addNoteParams)
				if (res.data.code == '200') {
					note.addNoteParams.id = null
					proxy.$Message.success('笔记添加成功')
					swdt.treeData1.map(item => {
						if (item.id == note.addNoteParams.traceId) {
							if (item.sum) {
								item.sum.noteNum = item.sum.noteNum + 1
							}
						}
					})
					swdt.treeData = cloneDeep(getListData(swdt.treeData1))
					swdt.history.num += 1
					await note.getNodeList()
					initAddNoteParams()
					bus.emit('table', 'note')
				} else {
					proxy.$Message.error(res.data.message)
				}
			}
			catch (e) {
				console.log(e)
				
				proxy.$Message.error(e.data.message)
			}
		}
	})
}

function changeValue (v) {
	note.addNoteParams.description = v
}

function xg (val) {
	console.log(val)
	note.TabsName = 'name1'
	note.addNoteParams.title = val.title
	note.addNoteParams.description = val.description
	note.addNoteParams.id = val.id
	
}
</script>

<template>
	<Tabs v-model="note.TabsName">
		<TabPane label="编辑笔记" name="name1">
			<div class="add">
				<Form ref="formNote" v-model="note.addNoteParams" :rules="ruleAddNote" inline>
					<div class="title">笔记标题</div>
					<Input v-model="note.addNoteParams.title" placeholder="" type="text"></Input>
					<div class="title">笔记内容</div>
					<FormItem>
						<WangEditor :images="true" :type="1" :upload="true" :value="note.addNoteParams.description" @changeValue="changeValue"></WangEditor>
					</FormItem>
				</Form>
			</div>
			<div class="demo-drawer-footer">
				<Button style="margin-right: 8px" @click="note.noteVisible = false">取消</Button>
				<Button type="primary" @click="addNote">保存</Button>
			</div>
		</TabPane>
		<TabPane :label="'已有笔记'+note.nodeNoteList.length" name="name2">
			<div class="card-div">
				<Card class="note-card">
					<div v-show="note.nodeNoteList.length > 0" class="card-list-div">
						<List item-layout="vertical">
							<ListItem v-for="item in note.nodeNoteList" :key="item.id">
								<a href="#" style="position: absolute;right: 10px" @click="xg(item)"> 修改</a>
								<div class="noteItem">
									<div style="display: flex;justify-content: space-between">
										<div class="title">{{item.title}}</div>
										<div class="userName">
											<Icon type="md-contacts"/>
											{{item.createdUser}}&nbsp;{{item.createdTime}}
										</div>
									</div>
									<div class="content" v-html="item.description"></div>
								</div>
							</ListItem>
						</List>
					</div>
					<div v-if="note.nodeNoteList.length == 0" style="text-align: center">暂无数据</div>
				</Card>
			</div>
		</TabPane>
	</Tabs>
</template>
<style lang="less" scoped>
.add {
	position: relative;
	
	.title {
		font-size: .16rem;
		margin-bottom: .15rem;
		margin-top: .15rem;
	}
	
	:deep(.ivu-input-wrapper) {
		.ivu-input {
			width: 98%;
			padding: .2rem;
			font-size: .16rem;
		}
	}
	
	.demo-drawer-footer {
		width: 100%;
		position: absolute;
		bottom: 0;
		right: 0;
		border-top: 1px solid #e8e8e8;
		padding: 10px 16px;
		text-align: right;
		background: #fff;
	}
}

.card-div {
	overflow: auto;
}

.noteItem {
	//background: rgba(24,31,67,0.04);
	padding: .2rem;
	
	&:hover {
		background: rgba(76, 92, 219, 0.08);
	}
	
	.title {
		font-size: .18rem;
		color: #2d64b3;
	}
	
	.userName {
		padding: .1rem 0;
	}
	
	.content {
		padding: .1rem;
		background: #FFF;
		overflow: auto;
	}
	
	.row-info {
		display: flex;
		margin-top: .2rem;
		border-top: 1px solid #CCC;
		overflow-x: auto;
		height: 1rem;
		overflow-y: hidden;
		
		.row-info-item {
			width: 2rem;
			display: inline-block;
			margin-right: .1rem;
		}
	}
}
</style>

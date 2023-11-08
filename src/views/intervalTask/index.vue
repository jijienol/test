<script setup="">
import {getCurrentInstance, onMounted, reactive, ref} from "vue";
import {operate, getDetail, getQrtzList, saveTask, plExecute, pLStop, pLStart} from "../../api/intervalTask.js";
import {dictStore} from "@/store/modules/dictionary.js";
import Pagination from "../../components/viewui/pagination.vue";
const statusList =reactive([
  { name: '运行中', value: 'NORMAL' },
  { name: '停止', value: 'PAUSED' },
  { name: '无触发器', value: 'NONE' },
  { name: '线程阻塞', value: 'BLOCKED' },
  { name: '完成', value: 'COMPLETE' }
])
const dict = dictStore()
const ruleValidate = reactive({
  label: [{ required: true, message: '虚拟身份名称不能为空' }],
  fullName: [{ required: true, message: '公司名称不能为空', trigger: 'blur' }]
})
const {proxy} = getCurrentInstance()
const column = ref([
  {
    type: 'selection',
    width: 60,
    align: 'center',
    fixed: 'left'
  },
  {
    title: '任务名称',
    key: 'description',
    align: 'center',
    width: 'auto'
  },
  {
    title: '时间表达式',
    key: 'cronExpression',
    align: 'center',
    width: 'auto'
  },
  {
    title: '是否并发',
    key: 'concurrent',
    align: 'center',
    width: 'auto',
    render: (h, params) => {
      let txt = params.row.concurrent ? '是' : '否'
      return h('span', {
      
      }, txt)
    }
  },
  {
    title: '上次运行时间',
    key: 'previousFireTime',
    align: 'center',
    width: 'auto'
  },
  {
    title: '下次运行时间',
    key: 'nextFireTime',
    align: 'center',
    width: 'auto'
  },
  {
    title: '目标Bean',
    key: 'targetBean',
    align: 'center',
    width: 'auto'
  },
  {
    title: '目标方法',
    key: 'targetMethod',
    align: 'center',
    width: 'auto'
  },
  {
    title: '状态',
    key: 'status',
    align: 'center',
    width: 'auto',
    render: (h, params) => {
      let status = params.row.status
      let txt = ''
      let color = '#000'
      switch (status) {
        case 'NORMAL':
          txt = '运行中'
          color = '#47cb89'
          break
        case 'PAUSED':
          txt = '停止'
          color = '#ff0000'
          break
        case 'NONE':
          txt = '无触发器'
          break
        case 'BLOCKED':
          txt = '线程阻塞'
          color = '#ffad33'
          break
        case 'COMPLETE':
          txt = '完成'
          break
      }
      return h('span', {
        style: {
          color: color,
          fontWeight: 'bold'
        }
      }, txt)
    }
  },
  {
    title: '操作',
    key: 'operation',
    align: 'center',
    width: 340,
    slot: 'operation'
  }
])
const table = ref([])
const tableLoading = ref(false)
const selection = ref([])
const modalOpt = reactive( {
  visible: false,
  title: ''
})
const form = reactive({
  id: '',
  name: '',
  description: '',
  concurrent: '0',
  cronExpression: '',
  targetBean: '',
  targetMethod: '',
  misfireInstr: '',
  priority: ''
})
function  tableSelection (a) {
  selection.value =  a
}
function edit (row) {
  // console.log(row);
 modalOpt.title = '修改'
  getDetail({ id: row.id }).then(res => {
    // console.log(res);
    let { code, data } = res.data
    if (code == 200) {
      // console.log('getDetail',data);
      data.concurrent = data.concurrent ? '1' : '0'
      form.concurrent = data.concurrent
      form.name = data.name
      form.description = data.description
      form.cronExpression = data.cronExpression
      form.targetBean = data.targetBean
      form.targetMethod = data.targetMethod
      form.misfireInstr = data.misfireInstr
      form.priority = data.priority.toString()
      form.id = data.id
      modalOpt.visible = true
    }
  })
}
function start (row) {
  let param = {
    id: row.id,
    op: 'resume'
  }
  row.loading = true
  operate(param).then(res => {
    // console.log(res);
    if (res.data.code == 200) {
      row.status = 'NORMAL'
      proxy.$Message.success('启动服务成功')
      row.loading = false
    } else {
      proxy.$Message.error('运行一次服务失败')
      
      row.loading = false
    }
  })
}
function stop (row) {
  let param = {
    id: row.id,
    op: 'pause'
  }
  row.loading = true
  operate(param).then(res => {
    // console.log(res);
    if (res.data.code == 200) {
      // this.getList()
      row.status = 'PAUSED'
      proxy.$Message.success('暂停服务成功')
      row.loading = false
    } else {
      proxy.$Message.error('运行一次服务失败')
      
      row.loading = false
    }
  })
}
function startOne (row) {
  let param = {
    id: row.id,
    op: 'runOnce'
  }
  row.loading = true
  operate(param).then(res => {
    // console.log(res);
    if (res.data.code == 200) {
      proxy.$Message.success('运行一次服务成功')
      row.loading = false
    } else {
      proxy.$Message.error('运行一次服务失败')
      
      row.loading = false
    }
  })
}
const pageOpt = reactive({
  total: 0,
  pageNo: 1,
  pageSize: 10
})
function getList () {
  tableLoading.value = true
  let param = {
    pageNo: pageOpt.pageNo,
    pageSize: pageOpt.pageSize
  }
  getQrtzList(param).then(res => {
    let { code, data } = res.data
    if (code == 200) {
      data.list.forEach(a => {
        a.loading = false
      })
      table.value = data.list
      pageOpt.total = data.total
      tableLoading.value = false
    } else {
      tableLoading.value = false
    }
  }).catch(() => {
    tableLoading.value = false
  })
}
const taskAdd = ref()
 function add () {
 taskAdd.value.resetFields()
 form.id = ''
 modalOpt.title = '新增虚拟身份'
 modalOpt.visible = true
}
const submitLoading = ref(false)
function submit () {
  let form1 = Object.assign({}, form)
  // console.log(form);
  form1.concurrent = parseInt(form1.concurrent)
  taskAdd.value.validate((valid) => {
    if (valid) {
     submitLoading.value = true
      saveTask(form1).then(res => {
        // console.log(res);
        let { code, data } = res.data
        if (code == 200) {
          proxy.$Message.success('操作成功！')
          submitLoading.value = false
          getList()
          taskAdd.value.resetFields()
          modalOpt.visible = false
        } else {
          proxy.$Message.error(res.data.message)
          submitLoading.value = false
        }
      })
    }
  })
}
const plLoading = ref(false)
function plStart () {
  if (selection.value.length > 0) {
    let ids = ''
    selection.value.forEach(i => {
      ids += i.id + ','
    })
    plLoading.value = true
    pLStart({ ids: ids }).then(res => {
      // console.log(res);
      if (res.data.code == 200) {
        proxy.$Message.success('批量启动成功！')
        let idList = ids.split(',')
        idList.forEach(id => {
          table.value.forEach(row => {
            if (row.id == id) {
              row.status = 'NORMAL'
            }
          })
        })
        plLoading.value = false
      } else {
        proxy.$Message.error('批量启动失败')
        plLoading.value = false
      }
    })
  }
}
function plStop () {
  // console.log(selection.value);
  if (selection.value.length > 0) {
    let ids = ''
    selection.value.forEach(i => {
      ids += i.id + ','
    })
    plLoading.value = true
    pLStop({ ids: ids }).then(res => {
      // console.log(res);
      if (res.data.code == 200) {
        proxy.$Message.success('批量暂停成功！')
        let idList = ids.split(',')
        idList.forEach(id => {
          table.value.forEach(row => {
            if (row.id == id) {
              row.status = 'PAUSED'
            }
          })
        })
        plLoading.value = false
      } else {
        proxy.$Message.error('批量暂停失败')
        plLoading.value = false
      }
    })
  }
}
function plStartOnce () {
  console.log(selection.value);
  if (selection.value.length > 0) {
    let ids = ''
    selection.value.forEach(i => {
      ids += i.id + ','
    })
    plLoading.value = true
    plExecute({ ids: ids }).then(res => {
      // console.log(res);
      if (res.data.code == 200) {
        proxy.$Message.success('批量运行一次成功！')
        plLoading.value = false
      } else {
        proxy.$Message.error('批量运行一次失败')
        plLoading.value = false
      }
    })
  }
}

const prioritylist = reactive(dict.dict.job_priority.list)
const misfireInstrlist = reactive(dict.dict.job_misfire_instr.list)

onMounted(()=>{
  getList()
  dict.getDictList('job_misfire_instr')
  dict.getDictList('job_priority')
})
</script>
<script>
export default {
  name:"intervalTask"
}

</script>
<template>
  <Card style="width:99%;margin: .1rem">
    <template #title>
      <div style="display: flex;align-items: center;justify-content: space-between">
        <h2 style="margin-right: .2rem">定时任务管理
<!--          <Button @click="add()" icon="md-add" type="primary" style="margin-left: 20px;">添加</Button>-->
          </h2>
        <div class="hr">
          <Button type="success" :loading="plLoading" @click="plStart()">批量启动</Button>
          <Button :loading="plLoading" type="error" @click="plStop()" style="margin: 0 4px;">批量停止</Button>
          <Button :loading="plLoading" @click="plStartOnce()" >批量运行一次</Button>
        </div>
      </div>
    </template>
    <Content class="layout-content">
      <Table  :columns="column" :data="table" :loading="tableLoading" @on-selection-change="tableSelection">
        <template v-slot:operation="{ row, index }">
          <Button :loading="row.loading" :disabled="row.status == 'NORMAL'" @click="start(row)" type="success" class="opera-btn" title="启动">
            <Icon type="md-play" />
          </Button>
          <Button :loading="row.loading" :disabled="row.status == 'PAUSED'" @click="stop(row)" type="error" class="opera-btn" title="停止"><Icon type="md-square" /></Button>
          <Button :loading="row.loading" @click="startOne(row)" class="opera-btn" title="执行一次"><Icon type="md-refresh" /></Button>
          <Button @click="edit(row)" type="info" class="opera-btn" title="编辑"><Icon type="md-create" /></Button>
          <!--          <Button @click="del(row)" type="error" class="opera-btn" title="删除"><Icon type="md-trash" /></Button>-->
      
        </template>
      </Table>
    </Content>
  </Card>
  <Modal v-model="modalOpt.visible" :title="modalOpt.title" width="80%"  footer-hide>
    <div style="height: 500px;">
      <Form :model="form" :rules="ruleValidate" :label-width="100" ref="taskAdd">
        <FormItem label="任务名称" prop="name" class="form-item">
          <Input v-model="form.name"></Input>
        </FormItem>
        <FormItem label="任务描述" prop="description" class="form-item">
          <Input v-model="form.description"></Input>
        </FormItem>
        <FormItem label="是否并发" prop="concurrent" class="form-item">
          <RadioGroup v-model="form.concurrent">
            <Radio label="0">否</Radio>
            <Radio label="1">是</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="时间表达式" prop="cronExpression" class="form-item">
          <Input v-model="form.cronExpression"></Input>
        </FormItem>
        <FormItem label="目标Bean" prop="targetBean" class="form-item">
          <Input v-model="form.targetBean"></Input>
        </FormItem>
        <FormItem label="目标方法" prop="targetMethod" class="form-item">
          <Input v-model="form.targetMethod"></Input>
        </FormItem>
        <FormItem label="优先级" prop="priority" class="form-item">
          <Select v-model="form.priority">
            <Option v-for="item in prioritylist" :value="item.value" :key="item.id">{{item.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="错过执行策略" prop="misfireInstr" class="form-item">
          <Select v-model="form.misfireInstr">
            <Option v-for="item in misfireInstrlist" :value="item.value" :key="item.id">{{item.label}}</Option>
          </Select>
        </FormItem>
      </Form>
    </div>
    <div  style="text-align: right">
      <Button @click="modalOpt.visible = false">关闭</Button>
      <Button  style="margin-left: .1rem" type="success" @click="submit()" :loading="submitLoading">提交</Button>
    </div>
  </Modal>
  <Footer style="position: absolute;bottom: .2rem">
    <pagination v-model:pageSize="pageOpt.pageSize" :total="pageOpt.total" v-model:pageNo="pageOpt.pageNo" :render="getList" show-elevator show-total />
  </Footer>
</template>
<style scoped>
.opera-btn {
  margin: 0 4px;
}
.form-item {
  width: 400px;
}
.layout-content{
  border: 1px solid #CCC;
}
</style>

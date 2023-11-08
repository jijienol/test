import {defineStore} from 'pinia';
import {insertPlTag} from '@/api/dict.js';
import lodash from 'lodash';
import {getSwdtData, getCollectionDetail} from '@/api/swdt.js';
import {getListData} from '@/utils/tree.js';
import {doInternetDetect, getTabNums, saveOfflineTask} from '@/api/ajJs.js';
import {v2GetCollectionDetail} from '../../api/swdt.js';


export const swdtStore = defineStore('swdt', {
  persist: {
    enabled: true,
    strategies: [{
      storage: sessionStorage,
      paths: ['qjs']
    }]
  },
  state: () => ({
    dzmb: [],//调证模板
    pztype: 'all',
    qjpzType: 'all',
    qjs: null,
    task: {},
    chuzhengBG: true,
    type12: 'internet',
    qrcode: {
      traceId: '',
      visible: false,
      // content: '',
      params: [],
      channelType: ''
    },
    people: {
      visible: false,
      
      peopleForm: {
        name: '',
        type: '',
        gender: '1',
        idCard: '',
        phone: '',
        age: '',
      }
    },
    border: 0,
    taskIdList: [],//导图节点
    tagVisible: false,
    visible: false,
    tagArr: [],
    selectedList: [],
    customTags: [],
    id: '',
    trackType: '',
    treeData: [], //导图数据
    treeData1: [], //导图数据
    //删除节点
    clueData: {},
    clueVisible: false,
    content: '',
    //笔记
    ii_channel_return_ip_url: true,
    nodeNoteData: {},
    // 循环查找
    dateVisible: false,
    taskChannelId: '',
    beginTime: '',
    endTime: '',
    Time: '',
    // 碰撞连线
    collisionData: '',
    collisionId: '',
    node: {
      from: '',
      to: '',
      modal: false
    },
    collisionDetail: {
      visible: false,
      virtualId: '',
      tableName: '',
      originColumn: [],
      originData: [],
      originTable: ''
      
    },
    tabNums: {},
    deep: {
      visible: false,
      loading: true,
      input: false
    },
    deepParams: {
      caseId: '',
      channelType: '',
      id: '',
      issueType: '1',
      traceName: '',
      traceParentId: '',
      trackType: '',
      trackTypeName: '',
      type: 'deepDetect',
      channelSolutionIdList: [],
      channelFieldList: [],
      virtualType: '',
      wifiType:'',
      phoneType:'',
      msg: null,
      isXmindDeepDetect: 1
    },
    history: {
      num: 0,
      signNum: 0,
      old: {
        node: null,
        ability: null,
        task: null,
        table: null,
      },
      new: {
        node: null,
        ability: null,
        task: null,
        table: null
      }
    },
    fileNode: {
      visible: false
    }
  }),
  getters: {},
  actions: {
    //获取导图数据
    async getData (id, jzfList,bz) {
      let taskIdList = []
      const res = await getSwdtData({caseId: id})
      if (res.status == 200 && res.data.code == 200) {
        res.data.data.nodes.forEach(item => {
          item.count = 0
          if (item.collapseSub == '1') {
            taskIdList.push(item.id)
          }
        })
        
        this.taskIdList = taskIdList
        this.treeData1 = res.data.data.nodes
        // 不要四流禁掉push
        this.treeData1.push({
            name: '网络流',
            title: '网络流',
            expand: true,
            trackTypeName: false,
            
            label: 'wangluo',
            id: 'qwe1',
            caseNum: 1,
            root: false,
            children: [],
            collapseSub: 0,
            zindex: 1
          },
          {
            name: '资金流',
            title: '资金流',
            expand: true,
            trackTypeName: false,
            
            label: 'zijin',
            id: 'qwe2',
            caseNum: 1,
            root: false,
            children: [],
            collapseSub: 0,
            zindex: 1
          },
          {
            name: '通讯流',
            title: '通讯流',
            expand: true,
            trackTypeName: false,
            label: 'tongxun',
            id: 'qwe3',
            caseNum: 1,
            root: false,
            children: [],
            collapseSub: 0,
            zindex: 1
          },
          {
            name: '其他流',
            title: '其他流',
            expand: true,
            trackTypeName: false,
            
            label: 'other',
            id: 'qwe4',
            caseNum: 1,
            root: false,
            children: [],
            collapseSub: 0,
            zindex: 1
          },
          {
            name: '人员流',
            title: '人员流',
            expand: true,
            trackTypeName: false,
            
            label: 'renyuan',
            id: 'qwe5',
            caseNum: 1,
            root: false,
            children: [],
            collapseSub: 0,
            zindex: 1
          })
        
        this.treeData = getListData(res.data.data.nodes)
        
        if(bz){
          return
        }
        
        const res1 = await getCollectionDetail({caseId: id})
        const res2 = await v2GetCollectionDetail({caseId: id})
        const jzfType = {
          phone: {
            type: 'phone',
            name: '手机号码扩线模型',
            text: '通过调证或线下协同反馈的手机号码，与本案线索通过玄武能力自动关联的手机号码发生关联碰撞',
            title: '重点线索'
          },
          frTerminalCode: {
            type: 'frTerminalCode',
            name: '锋刃终端码扩线模型',
            text: '跨线任务返回的锋刃终端码发生碰撞，建议去锋刃平台做深入研判',
            title: '重点设备码'
          }
        }
        
        
        if (jzfList) {
          
          this.treeData1 = this.treeData1.map(item => {
            item.zdxs = []
            jzfList.forEach(i => {
              if (item.id == i.traceId) {
                
                item.zdxs.push(jzfType[i.type])
              }
            })
            return item
          })
        }
        if ((res1.status == 200 && res1.data.code == 200) && (res2.status == 200 && res2.data.code == 200)) {
          this.treeData1 = this.treeData1.map(item => {
            res1.data.data.forEach(i => {
              if (item.id == i.traceId) {
                item.sum = i.sum
                item.collisionDetail = i.collisionDetail
              }
              res2.data.data.forEach(i => {
                if (item.id == i.traceId) {
                  item.count = i.count
                }
              })
            })
            return item
          })
          this.treeData = getListData(this.treeData1)
          this.collisionData = 'k'
        } else if (res1.status == 200 && res1.data.code == 200) {
          this.treeData1 = this.treeData1.map(item => {
            res1.data.data.forEach(i => {
              if (item.id == i.traceId) {
                item.sum = i.sum
                item.collisionDetail = i.collisionDetail
              }
            })
            return item
          })
          this.treeData = getListData(this.treeData1)
          this.collisionData = 'k'
        } else if (res2.status == 200 && res2.data.code == 200) {
          this.treeData1 = this.treeData1.map(item => {
            res2.data.data.forEach(i => {
              if (item.id == i.traceId) {
                item.sum = i.sum
                item.collisionDetail = i.collisionDetail
              }
            })
            return item
          })
          this.treeData = getListData(this.treeData1)
          this.collisionData = 'k'
        }
      }
    },
    // 打开标签添加窗口
    async getTagArr (task) {
      this.selectedList = task.tagList || []
      this.customTags = []
      this.id = task.id
      this.trackType = task.trackType + 'Tag'
      this.visible = true
      this.selectedList.forEach(s => {
        if (!s.tagCode || !s.checked) {
          this.customTags.push({
            tagCode: '',
            tagName: s.tagName,
            sourceType: 0,
            checked: true
          })
        }
      })
    },
    //添加标签
    async savePlTag () {
      let tagList2 = []
      if (this.customTags.length) {
        tagList2 = lodash.filter(this.customTags, o => {
          return o.checked
        })
      }
      let param = {
        'businessId': this.id,
        'targetType': 1,
        'trackType': this.trackType,
        'tagList': tagList2
      }
      if (tagList2.length > 6) {
        return 111
      }
      const res = await insertPlTag(param)
      if (res.data.code == 200) {
        this.treeData1 = this.treeData1.map(item => {
          if (item.id == this.id) {
            item.tagList = tagList2
          }
          return item
        })
        this.treeData = getListData(this.treeData1)
        
        return 200
      }
      return false
    },
    //删除节点
    delNode (task) {
      if (task.hasChildren) {
        this.content = `确定要删除该线索，以及后面的子线索吗？`
      } else if (task.childs) {
        this.content = `确定要删除该批量线索吗？`
      } else {
        this.content = `确定要删除该线索吗？`
      }
      this.clueData = task
      this.clueVisible = true
    },
    //打开循环查找
    openDate (task) {
      let taskChannelId
      task.taskList.forEach(item => {
        if (item.realTime == '1') {
          taskChannelId = item.taskId
        }
      })
      this.Time = ''
      this.taskChannelId = taskChannelId
      this.beginTime = ''
      this.endTime = ''
      this.dateVisible = true
    },
    //点击碰撞
    openCollision (task, type) {
      let t
      if (!type) {
        t = 'all'
      } else {
        t = type
      }
      if (this.collisionData) {
        if (task[0].from == this.collisionData[0].from) {
          if (this.pztype == t) {
            this.collisionData = ''
            return
          }
        }
      }
      this.pztype = t
      this.collisionData = task
    },
    //碰撞连线点击
    toggleShow (info) {
      let {from, to, visible} = info
      this.node.from = from
      this.node.to = to
      this.node.modal = visible
    },
    //获取标定结果信息
    async getTabNums (caseId, traceId = '') {
      let params = {
        traceId,
        caseId
      }
      const res = await getTabNums(params)
      if (res.data.code == 200) {
        this.tabNums = res.data.data
      }
    },
    // 打开深入侦查弹框
    async openDeep (task, type = null) {// type从详情里面深入侦查禁用输入
      this.deep.input = false
      this.deep.loading = true
      this.deepParams.trackType = task.deepTrackType
      this.deepParams.channelSolutionIdList = []
      this.deepParams.channelFieldList = []
      this.deepParams.msg = null
      this.deep.visible = true
      this.deepParams.caseId = task.caseId
      this.deepParams.traceParentId = task.id
      this.deepParams.isXmindDeepDetect = 0
      
      if (type) {
        this.deepParams.traceName = ''
        this.deep.input = true
        this.deepParams.isXmindDeepDetect = 1
      }
    },
    // 深入侦查
    async doInternetDeep () {
      console.log(this.deepParams)
      let res
      if (this.deepParams.trackType != 'virtualId') {
        this.deepParams.virtualType = null
      }
      if (this.deepParams.trackType != 'wifi') {
        this.deepParams.wifiType = null
      }
      if (this.deepParams.trackType != 'phone') {
        this.deepParams.phoneType = null
      }
      // 判断是否是互联网任务
      if (this.deepParams.channelType != 'internet') {
        res = await saveOfflineTask(this.deepParams).then(r => {
          // console.log(r);
          return r
        }).catch(err => {
          // console.log(err);
          return err
        })
      } else {
        
        res = await doInternetDetect(this.deepParams).then(r => {
          return r
        }).catch(err => {
          // console.log(err);
          return err
        })
      }
      // console.log(res);
      if (res.data.code == 200) {
        return res.data
      } else {
        return res.data
      }
    },
    //打开文件碰撞结果
    openCollisionList (File, row) {
      this.collisionDetail.virtualId = row.id ? row.id : row.ID
      this.collisionDetail.originColumn = File.columns
      this.collisionDetail.originData = []
      this.collisionDetail.originData.push(row)
      // console.log(this.collisionDetail.originData)
      this.collisionDetail.tableName = row.tableName
      this.collisionDetail.originTable = File.name
      this.collisionDetail.visible = true
    },
    setNodeHistoryNode (node) {
      /* 记录点击历史
       没有new先存new，有new比较id，不一样new变为old
       * */
      if (!this.history.new.node) {
        this.history.new.node = node
      } else {
        if (this.history.new.node.id != node.id) {
          this.history.old.node = lodash.cloneDeep(this.history.new.node)
          this.history.new.node = node
        }
        
      }
      
    },
    openQrcode (traceId, statisticList, channelType) {
      this.qrcode.traceId = traceId
      this.qrcode.params = statisticList
      this.qrcode.channelType = channelType
      this.qrcode.visible = true
      
      
    }
  }
})

import {defineStore} from 'pinia';
import {findNoteListByCaseId} from "@/api/note.js";
import {addressList, getTabNums, getTraceCollisionDetail, objectList, orgList, peopleList} from "@/api/ajJs.js";
import {cloneDeep} from "lodash";

export const noteStore = defineStore('note', {
    state: () => ({
        // 笔记
        BK1:'',
        bk:false,//布控
        noteVisible: false,
        type: '',
        nodeNoteList: [],
        traceInfo: {},
        addNoteParams: {
            caseId: '',
            title: '',
            description: '',
            hidden: 0,
            sourceType: 'ii_trace',
            sourceId: '',
            traceId: '',
            rowInfo: ''
        },
        dblData: {},//双击保存数据
        //标定,
        signNums: {},
        caseId: '',
        traceId: '',
        virtualId: '',
        rowInfo: '',
        signOpenType: '',
        signParams: {
            caseId: '',
            traceId: '',
            virtualId: '',
        },
        traceName: '',
        //添加标定
        addSign: {
            addSignVisible: false,
            signType: "",
            title: '',
            rowInfo: '',
            loading: false,
            flag: false
        },
        peopleForm: {
            name: '',
            type: '',
            gender: '1',
            idcard: '',
            phone: '',
            age: ''
        },

        objectForm: {
            name: '',
            remark: '',
            type: ''
        },

        param: {
            virtualId: '',
            returnId: '',
            returnType: '',
            traceId: '',
            traceType: '',
            traceName: '',
            caseId: '',
            originalData: ''
        },
        //案间碰撞详情
        TraceCollisionVisible: false,
        TraceCollisionDetail: [],

        signTypeList: [{name: '人 ', type: 'people'}, {name: '物 ', type: 'object'}],
        signType: 'people',
        signTypeName: '人',
        signDataList: [],
        TabsName: 'name1',
        BkListVisible:false

    }),
    getters: {
        typeName() {
            if (this.type === 'noteCom') {
                return '笔记'
            } else if (this.type === 'sign') {
                return '标定'
            } else if (this.type === 'collision') {
                return '案间碰撞(' + this.TraceCollisionDetail.length + ')'
            }else if (this.type === 'outline') {
                return '大纲'
            }
        }
    },
    actions: {
        //笔记
        async openList(task, type = false) {
            console.log(task)
            if (task.sourceType) {
                this.addNoteParams = {
                    caseId: task.caseId,
                    title: '',
                    description: '',
                    sourceType: task.sourceType,
                    sourceId: task.virtualId,
                    traceId: task.id,
                    virtualId: task.virtualId,
                    attachmentType: 'noteAnnex',
                    taskChannelId: task.taskChannelId,
                    rowInfo: task.rowInfo
                }
            } else {
                this.addNoteParams = {
                    caseId: task.caseId,
                    title: '',
                    description: '',
                    sourceType: 'ii_trace',
                    traceId: task.id,
                    sourceId: task.id
                }
            }
            this.TabsName = 'name1'
            if (type) {
                this.TabsName = 'name2'
                if (type == 'biao') {
                    this.addNoteParams.virtualId = task.virtualId
                } else if (type == 'xs') {
                    this.addNoteParams.virtualId = ''
                    this.addNoteParams.sourceId = task.id
                }
            }
            this.noteVisible = true
            this.type = 'noteCom'
            this.traceInfo = task
            if (this.traceInfo.id) {
                let params = cloneDeep(this.addNoteParams)
                params.sourceId = ''
                const res = await findNoteListByCaseId(params)
                if (res.data.code == 200) {
                    this.nodeNoteList = res.data.data.list
                }
            }
        },
        //能力添加笔记
        async getNodeList() {
            if (this.traceInfo.id) {
                this.addNoteParams.description = ""
                this.addNoteParams.title = ""
                let params = cloneDeep(this.addNoteParams)
                params.sourceId = ''
                const res = await findNoteListByCaseId(params)
                if (res.data.code == 200) {
                    this.nodeNoteList = res.data.data.list
                }
            }
        },
        //案间碰撞详情
        async getTraceCollisionDetail(id) {
            this.noteVisible = true
            this.type = 'collision'
            this.TraceCollisionVisible = true
            this.TraceCollisionDetail = []
            const res = await getTraceCollisionDetail({traceId: id})
            if (res.data.code == 200) {
                this.TraceCollisionDetail = res.data.data
            }
        },
        //获取标定信息列表
        async openSign(type, caseId, traceId = '', virtualId = '') {
            this.noteVisible = true
            this.type = 'sign'
            this.signParams = {
                caseId: '',
                traceId: '',
                virtualId: '',
                returnId: ''
            }
            this.signOpenType = type
            if (type == 'swdt') {
                this.signParams.caseId = caseId
            } else if (type == 'kapian') {
                this.signParams.traceId = traceId
                this.signParams.caseId = caseId
            } else if (type == 'xianxia') {
                this.signParams.traceId = traceId
                this.signParams.caseId = caseId
                this.signParams.virtualId = virtualId
            } else if (type == 'internet') {
                this.signParams.traceId = traceId
                this.signParams.caseId = caseId
                this.signParams.returnId = virtualId
            }
            const res = await getTabNums(this.signParams)
            if (res.data.code == 200) {
                this.signNums = res.data.data
            }
            await this.getSignInfo(this.signType)
        },
        //添加标定
        async addOpenSign(type, task, File, v) {
            console.log( File,task )
            this.addSign.addSignVisible = true
            this.addSign.type = 'add'
            if (v != 'xs') {
                this.param.id = File.id
                this.param.returnId = File.id
                this.param.virtualId = File.row.id
                this.param.returnType = File.row.tableName?File.row.tableName:File.tabValue
                this.param.caseId = task.caseId
                this.param.taskChannelId = task.taskChannelId
                this.param.traceId = task.id
                this.param.originalData = task.rowInfo
            } else {
                this.param.returnId = File.row.ID?File.row.ID:File.row.id
                this.param.returnType = File.row.tableName?File.row.tableName:File.tabValue
                this.param.caseId = task.caseId
                this.param.taskChannelId = task.taskChannelId
                this.param.traceId = task.id
                this.param.originalData = task.rowInfo
            }
            switch (type) {
                case 'people':
                    this.peopleForm = {
                        name: '',
                        type: '',
                        gender: '1',
                        idcard: '',
                        phone: '',
                        age: '',
                        clueType: 'idcard'
                    }
                    this.peopleForm.idcard = this.traceName
                    this.addSign.signType = 'people'
                    this.addSign.title = '添加标定结果：人'
                    this.addSign.rowInfo = task.rowInfo
                    break
                case 'object':
                    this.addSign.signType = 'object'
                    this.addSign.title = '添加标定结果：物'
                    this.addSign.rowInfo = task.rowInfo
                    this.objectForm = {
                        name: '',
                        remark: '',
                        type: ''
                    }
                    this.objectForm.name = this.traceName
                    break

            }
        },
        //更新标定信息
        updateSign(item,bk) {
            if(bk){
                this.bk=bk

            }else {
                this.bk=false
            }
            this.addSign.addSignVisible = true
            this.addSign.type = 'update'

            switch (item.signtype) {
                case 'people':
                    this.addSign.signType = 'people'
                    this.addSign.title = '修改标定结果：人'
                    this.peopleForm = cloneDeep(item)
                    break
                case 'object':
                    this.addSign.signType = 'object'
                    this.addSign.title = '修改标定结果：物'
                    this.objectForm = cloneDeep(item)
                    break
            }
        },
        // 获取标定列表
        async getSignInfo(New) {
            switch (New) {
                case 'people':
                    this.signTypeName = "人"

                    let res1 = await peopleList(this.signParams)
                    if (res1.data.code == 200) {
                        this.signDataList = res1.data.data.list
                        this.signDataList.forEach(item => {
                            item.signtype = 'people'
                        })
                    }
                    break
                case 'org':
                    this.signTypeName = "组织"
                    let res2 = await orgList(this.signParams)
                    if (res2.data.code == 200) {
                        this.signDataList = res2.data.data.list
                        this.signDataList.forEach(item => {
                            item.signtype = 'org'
                        })
                    }
                    break
                case 'object':
                    this.signTypeName = "物"
                    let res3 = await objectList(this.signParams)
                    if (res3.data.code == 200) {
                        this.signDataList = res3.data.data.list
                        this.signDataList.forEach(item => {
                            item.signtype = 'object'
                        })
                    }
                    break
                case 'address':
                    this.signTypeName = "地址"
                    let res4 = await addressList(this.signParams)
                    if (res4.data.code == 200) {
                        this.signDataList = res4.data.data.list
                        this.signDataList.forEach(item => {
                            item.signtype = 'address'
                        })
                    }
                    break
            }
        }
    }

})

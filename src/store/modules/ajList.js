import {defineStore} from 'pinia';
import _ from 'lodash'
import {detectCaseDetail} from "@/api/ajJs.js";
export const ajListStore = defineStore('ajList', {
    state: () => ({
        addInfo:{},
        caseInfo: {
            id: '',
            name: '',
            num: '',
            money: 0,
            typeLabel:'',
            description: '',
            address: '',
            alarmPeople: '',
            bjsjDt: '',
            fasjsxDt: '',
            fasjxxDt: '',
            officeName: '',
            hostName: '',
            hostNo: '',
            alarmPeoplePhone: '',
            traceMap: [],
            detectStatus: '',
            countCaseScore: '',
            scoreList: [],
            sfscxk: null,
            sfscbl: null,
            hasXk1:null,
            returnVisitNum:null,
            caseFileList: [],
            caseUserList:[],
            writtenDecisionOfCaseFiling: '',
            caseRegistrationForm: ''
        },

        traceTypeOptions: [],
        traceTypeTabs: [],
        fileUploading: false,
        traceInfo: { // ii_channel_return_ip_url参数
            traceParentId:'',
            traceGroupId:'',
            traceTraceId:'',
            trackType:'',
            trackTypeName:'',
            traceName:'',
            id:'',
            taskGroupId:'',
            taskParentId:'',
            traceTaskChannelId:'',
            taskId:'',
            solutionId: ''
        },
        traceList: {
            ip:[],
            wifi:[]
        },
        traceListVisible: false,
        traceItem: {
            "traceName": "",
            "traceId": "",
            "caseId": "",
            "taskChannelId": "",
            "traceType": ""
        },
        abilityTabList: []
    }),
    persist: {
        enabled: true,
        strategies: [
            { storage: sessionStorage, paths: ['caseInfo','traceTypeOptions', 'traceTypeTabs','traceList'] },
        ]
    },
    getters: {
        caseId(state) {
            return state.caseInfo.id
        },
        trackType(state) {
            return state.traceInfo.trackType
        },
        traceCount(state) {
            return state.traceList.ip.length + state.traceList.wifi.length
        },
        detectStatus(state) {
            return state.caseInfo.detect
        }
    },
    actions: {
        modifyAbilityTabList(id, key, val) {
            this.abilityTabList.forEach(a => {
                if(a.id == id) {
                    a.data[key] = val
                }
            })
        },
        clearTraceList() {
            this.traceList.ip = []
            this.traceList.wifi = []
        },
        setTraceItem(item) {
            this.traceItem = item
        },
        setTraceListItem(type, name, val) {
            let _list = this.traceList[type]
            _list.forEach(item => {
                if(item.traceName == name) {
                    item.id = val.id
                    item.groupId = val.groupId
                }
            })
        },
        setTraceList(type, val) {
            type = type.toLowerCase()
            let _list = this.traceList[type]
            /*if(_list.length == 5) {
                return {flag: false, msg: '最多不能超过5条！'}
            }*/
            if(_list.length == 0) {
                _list.push(val)
                return {flag: true}
            } else if(_list.length == 5) {
                return {flag: false, msg: '最多不能超过5条！'}
            } else {

                let i = _.find(_list, o => {// 通过线索名称查找
                    return o.traceName == val.traceName
                })
                // console.log('i', i);
                if(i) {
                    return {flag: false, msg:'列表已包含该线索！'}
                } else {
                    _list.push(val)
                    return {flag: true}
                }
            }

        },
        removeTraceList(type, index) {
            let _list = this.traceList[type]
            _list.splice(index, 1)
        },
        setTraceListVisible(flag) {
            this.traceListVisible = flag
        },
        setDeepDetectParam(obj) {
            for(let k in obj) {
                this.traceInfo[k] = obj[k]
            }
        },
        setCaseInfo(data) {
            this.caseInfo = data
        },
        setTraceTypeList(data) {

            this.traceTypeOptions = data;

            const sort = [{value: 'apk', label:'APK（软件安装包）'}, {value:'url',label: 'URL（网址）'}, {value:'phone', label:'手机号'}, {value:'virtualId', label:'虚拟身份'}, {value:'bankCard',label:'卡类'}, {value:'ip',label:'IP'}, {value:'wifi',label:'MAC'}, {value:'ewallet', label:'电子钱包'}, {value:'idcard',label:'证件号码'}, {value:'offlineTask',label:'其他线索'}]
            let list = JSON.parse(JSON.stringify(data));
            let arr = []
            if(list.length) {
                list.forEach(item => {
                    item.Index = _.findIndex(sort, (o) => {
                        // console.log(o,item)
                        return o.value == item.value
                    });
                    item.disabled = false
                    if (item.value !== 'all' && item.value!='imsi' && item.value != 'imei') {
                        arr.push(item)

                    }
                })
                arr = _.sortBy(arr, 'Index')
                arr.forEach(a => {
                        if (a.value == 'apk') {
                            a.label = 'APK（软件安装包）'
                        } else if (a.value == 'url') {
                            a.label = 'URL（网址）'
                        }

                })
               this.traceTypeTabs = arr

            }
        },
        getTraceType (dataType) {
            let sign = this.traceTypeOptions.find(s => {
                return s.value == dataType
            })
            return sign ? sign.label : ''
        },
        getCaseInfo() {
            let id = this.caseInfo.id
            detectCaseDetail({id: id}).then(res => {
                let {code, data} = res.data;
                if(code == 200) {

                    console.log(data)
                    let info = {
                        id: id,
                        name: data.name,
                        num: data.num,
                        money: data.money,
                        typeLabel:data.typeLabel,
                        description: data.description,
                        address: data.address,
                        alarmPeople: data.alarmPeople,
                        bjsjDt: data.bjsjDt,
                        fasjsxDt: data.fasjsxDt,
                        fasjxxDt: data.fasjxxDt,
                        officeName: data.officeName,
                        hostName: data.hostName,
                        hostNo: data.hostNo,
                        alarmPeoplePhone: data.alarmPeoplePhone,
                        detectStatus: data.detectStatus,
                        traceMap: [],
                        countCaseScore: data.countCaseScore,
                        scoreList: data.scoreList,
                        sfscxk: data.sfscxk,
                        sfscbl: data.sfscbl,
                        hasXk1:data.hasXk,
                        returnVisitNum:data.returnVisitNum,
                        caseFileList: data.caseFileList,
                        caseUserList:data.caseUserList,
                        writtenDecisionOfCaseFiling: data.writtenDecisionOfCaseFiling,
                        caseRegistrationForm: data.writtenDecisionOfCaseFiling
                    }
                    let traceMap = data.firstDetectMap
                    if(traceMap.length > 0) {
                        let arr = []
                        // console.log(traceMap);
                        traceMap.forEach(t => {
                            for (let key in t) {
                                arr.push({label: key, num: t[key]})
                            }
                        })
                        // console.log(arr);
                        info.traceMap = arr
                    }
                    this.caseInfo = info
                }
            })
        }
    }
})

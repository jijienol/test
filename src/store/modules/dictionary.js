import {defineStore} from 'pinia';
import {dictList, getVirtualType, selectListByType} from '@/api/dict.js'
import lodash from "lodash";

export const dictStore = defineStore('$XWdict', {
  state: () => ({
    dict: {
      sexual: {
        label: '性别',
        list: []
      },
      ability: {
        label: '能力类型',
        list: []
      },
      detectType: {
        label: '',
        list: []
      },
      IDType: {
        label: '证件类型',
        list: []
      },
      detectCaseType: {
        label: '案件类型',
        list: []
      },
      caseTag: {
        label: '',
        list: []
      },
      wifiType: {
        label: 'mac类型',
        list: []
      },
      phoneType: {
        label: '手机子类型',
        list: []
      },
      peopleType: {
        label: '人员类型',
        list: []
      },
      KL_TYPE: {
        label: '卡类类型',
        list: []
      },
      addressType: {
        label: '地址',
        list: []
      },
      objectType: {
        label: '物',
        list: []
      },
      orgType: {
        label: '组织',
        list: []
      },
      xxzc_dbsx: {
        label: '线下任务名称',
        list: []
      },
      channel: {
        label: '',
        list: []
      },
      on_off: {
        label: '',
        list: []
      },
      yes_no: {
        label: '',
        list: []
      },
      method: {
        label: '',
        list: []
      },
      job_misfire_instr: {
        label: '',
        list: []
      },
      job_priority: {
        label: '',
        list: []
      },
      officeType: {
        label: "部门类型",
        list: []
      },
      trackType: {
        label: "线索类型",
        list: []
      },
      return_visit_ysr: {
        label: "月收入",
        list: []
      },
      return_visit_zy: {
        label: "职业",
        list: []
      },
      return_visit_zctgnztjjs: {
        label: "最初通过哪种途径结识",
        list: []
      },
      return_visit_azfs: {
        label: "安装方式",
        list: []
      },
      return_visit_first_login_time: {
        label: "初次登陆时间段",
        list: []
      },
      return_visit_czhj: {
        label: "被骗时操作环境",
        list: []
      },
      return_visit_bpsyys_ll: {
        label: "被骗时操作使用网络运营商",
        list: []
      },
      return_visit_bpsyys_kd: {
        label: "被骗时操作使用网络运营商",
        list: []
      },
      return_visit_sjlx: {
        label: "手机类型",
        list: []
      }, return_visit_sfyjrlzh: {
        label: "金融类账户",
        list: []
      }, return_visit_jsdxclx: {
        label: "接受的宣传类型",
        list: []
      }, return_visit_xxqr: {
        label: "信息确认",
        list: []
      }, return_visit_czzd: {
        label: "终端",
        list: []
      },
      return_visit_gzdwqy: {
        label: "工作单位区域",
        list: []
      }, return_visit_jzdqy: {
        label: "居住地区域",
        list: []
      }, return_visit_jzdlx: {
        label: "居住地类型",
        list: []
      },
      return_visit_zjly: {
        label: "资金来源",
        list: []
      },
      case_focus_level: {
        label: " 关注度",
        list: []
      },
      cnStreet:{
        label: "长宁派出所",
        list: []
      }
    },
    virtualType: {
      label: '虚拟身份',
      list: []
    },
    traceSubTypeList: {
      label: '线索子类',
      list: []
    },
    ipTypes: [
      {key: '保留IP', value: '国际互联网代理成员管理局(ANA)在IP地址范围内，将一部分地址保留作为私人IP地址空间或者专门用于内部局域网等特殊用途使用的IP地址'},
      {key: '未分配IP', value: '该类IP在区域性IP地址分配机构(如APNIC)中，还未分配给特定的机构'},
      {key: '已分配-未路由', value: '该类IP已经分配给特定的机构,但还没有在网络路由信息中'},
      {key: '已路由', value: '该类IP已经分配给特定的机构且出现在网络路由信息中，但未进行进一步地细分'},
      {key: '已路由-未使用', value: '该类IP已经分配给特定的机构且出现在网络路由信息中但还没有在网络中被使用'},
      {key: '组织机构', value: '该类IP被分配给拥有自有AS号的非运营商机构使用'},
      {key: '数据中心', value: '该类IP分配给IDC公司或运营商在数据中心使用，可以追溯定位到特定的数据中心机房'},
      {key: '学校单位', value: '该类IP分配给的学校单位使用'},
      {key: '运营商', value: '该类IP分配给了运营商，可进一步地将其划分为移动网、家庭宽带和企业专线等'},
      {key: '移动网络', value: '2G/3G/4G/5G等类型的移动网络使用的IP，一般在为移动设备提供互联网服务时使用'},
      {key: '家庭宽带', value: '该类IP被运营商用于为家庭用户提供接入互联网服务'},
      {key: '企业专线', value: '该类IP被运营商长期分配给某家企业使用，覆盖范围为企业所处区域'},
      {key: 'WLAN热点', value: '该类IP被运营商作为商业WIFI的出口使用'},
      {key: '卫星通信', value: '该类IP可被运营商作为与卫星间通讯使用，可以追溯到特定的卫星通讯机构'},
      {key: '交换中心', value: '该类IP被互联网交换中心所使用，可以追溯到特定的交换中心'},
      {key: '基础设施', value: '该类IP被运营商作为路由器的接口IP出现在互联网中'},
      {key: 'CDN', value: '该类IP被应用于内容分发网络中'},
      {key: 'Anycast', value: '该类IP被应用于任播网络中'},
    ]
  }),
  persist: {
    enabled: true,
    strategies: [
      {storage: localStorage, paths: ['dict', 'virtualType']},
      // { storage: sessionStorage, paths: [] },
    ]
  },
  actions: {
    init () {
      let local = localStorage.getItem('$XWdict')
      if (local) {
        let data = JSON.parse(local);
        for (let k in data) {
          this[k] = data[k]
        }
      }
    },
    getDict (type) {
      let _this = this;
      return new Promise((resolve, reject) => {
        let list = _this.dict[type].list;
        if (list.length) {
          resolve(list)
        } else {
          selectListByType({type: type}).then(res => {
            let {code, data} = res.data
            if (code == 200) {
              data.forEach(item => {
                item.checked = false
              })
              _this.dict[type].list = data
              resolve(data)
              // return data
            } else {
              resolve([])
            }
          }).catch(() => {
            resolve([])
          })
        }
      })
      
      
    },
    getDictList (type) {
      let list = this.dict[type].list;
      if (list.length) {
        return this.dict[type].list
      } else {
        dictList({type: type}).then(res => {
          let {code, data} = res.data
          if (code == 200) {
            data.list.forEach(item => {
              item.checked = false
            })
            this.dict[type].list = data.list
          }
        })
      }
    },
    getVirtualType () {
      let _this = this;
      return new Promise((resolve, reject) => {
        let list = _this.virtualType.list
        if (list.length) {
          resolve(list)
        } else {
          getVirtualType().then(res => {
            let {code, data} = res.data
            if (code == 200) {
              _this.virtualType.list = data
              resolve(data)
              // return this.virtualType.list
            } else {
              resolve([])
            }
          }).catch(() => {
            resolve([])
          })
        }
      })
    },
    getIpTypeByKey (k) {
      if (k) {
        let obj = lodash.find(this.ipTypes, o => {
          return o.key == k
        })
        return obj ? obj.value : ''
      } else {
        return ''
      }
    }
  }
})

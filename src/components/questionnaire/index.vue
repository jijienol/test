<script setup="">

import {computed, defineEmits, defineProps, getCurrentInstance, onMounted, ref, watch} from "vue";
import {dictStore} from "@/store/modules/dictionary.js";
import {insertReturnVisit} from "@/api/QuestionnaireList.js";
import {cloneDeep} from "lodash";

import {ajListStore} from "@/store/modules/ajList.js";

const props = defineProps(['rowInfo'])
const emits = defineEmits(['closeBD'])
const {proxy} = getCurrentInstance()
const ajList = ajListStore()

const dict = dictStore()
const ruleValidate = {
  xm: [
    {required: true, message: '姓名不能为空', trigger: 'blur'}
  ],
  xb: [
    {required: true, message: '性别不能为空', trigger: 'blur'}
  ],
  nl: [
    {required: true, type: 'number', message: '年龄不能为空', trigger: 'blur'}
  ],
  xl: [
    {required: true, message: '学历不能为空', trigger: 'blur'}
  ],
  txrq: [
    {required: true, type: 'date', message: '填写日期不能为空', trigger: 'change'}
  ],
  bh: [
    {required: true, message: '敬请编号不能为空', trigger: 'blur'}
  ],
  mobile: [
    {required: true, message: '手机号不能为空', trigger: 'blur'}
  ],
  ssje: [
    {required: true, message: '损失金额不能为空', trigger: 'blur'}
  ],
  
  ysr: [
    {required: true, message: '月收入不能为空', trigger: 'blur'}
  ],
  zy: [
    {required: true, message: '请选择职业', trigger: 'blur'}
  ],
  gzdw: [
    {required: true, message: '工作单位不能为空', trigger: 'blur'}
  ],
  bsjjdz: [
    {required: true, message: '本是居住地址不能为空', trigger: 'blur'}
  ],
  zctgnztjjs: [
    {required: true, message: '最初通过哪种途径结识不能为空', trigger: 'change'}
  ],
  // bzpssjrjList: [
  //   { required: true, message: '被骗时社交软件名不能为空', trigger: 'blur' }
  // ],
  szApp: [
    {required: true, message: '涉诈app不能为空', trigger: 'blur'}
  ],
  zhMm: [
    {required: true, message: '账号密码不能为空', trigger: 'blur'}
  ],
  
  azfs: [
    {required: true, message: '安装方式不能为空', trigger: 'blur'}
  ],
  szwz: [
    {required: true, message: '涉诈网址不能为空', trigger: 'blur'}
  ],
  wzzcsj: [
    {required: true, type: 'date', message: 'APP/网站注册时间不能为空', trigger: 'blur'}
  ]
  ,
  azsj: [
    {required: true, type: 'date', message: '安装时间不能为空', trigger: 'blur'}
  ],
  ccdlsj: [
    {required: true, type: 'date', message: '初次登陆时间不能为空', trigger: 'blur'}
  ],
  ccdlsjd: [
    {required: true, message: '初次登陆时间段不能为空', trigger: 'blur'}
  ],
  bjhappnfdk: [
    {required: true, message: '请选择是否能打开', trigger: 'blur'}
  ],
  szdh: [
    {required: true, message: '涉诈电话不能为空', trigger: 'blur'}
  ],
  sfdxyz: [
    {required: true, message: '请选择是否能短信验证', trigger: 'blur'}
  ]
  ,
  bpsczhj: [
    {required: true, message: '被骗时操作环境不能为空', trigger: 'blur'}
  ],
  zctgnztjjsQt: [
    {required: true, message: '最初通过哪种途径结识不能为空', trigger: 'blur'}
  ],
  bpsczsywlyysLl: [
    {required: true, message: '被骗时操作使用网络运营商（流量）不能为空', trigger: 'blur'}
  ],
  bpsczsywlyysKd: [
    {required: true, message: '被骗时操作使用网络运营商（宽带）不能为空', trigger: 'blur'}
  ],
  sjlx: [
    {required: true, message: '手机类型不能为空', trigger: 'blur'}
  ],
  bpsczzd: [
    {required: true, message: '被骗时操作终端不能为空', trigger: 'blur'}
  ],
  cjsfycljl: [
    {required: true, message: '请选择曾经是否有此类经历', trigger: 'blur'}
  ],
  sfcghdfltx: [
    {required: true, message: '请选择曾经成功获得返利体现', trigger: 'blur'}
  ]
  ,
  scczrq: [
    {required: true, type: 'date', message: '首次充值日期不能为空', trigger: 'blur'}
  ],
  mcczrq: [
    {required: true, type: 'date', message: '末次充值日期不能为空', trigger: 'blur'}
  ],
  sfyjrlzh: [
    {required: true, message: '金融类账户不能为空', trigger: 'blur'}
  ],
  sfjsgfzxc: [
    {required: true, message: '请选择是否接受过反诈宣传', trigger: 'blur'}
  ]
  ,
  jsdxclx: [
    {required: true, message: '接受的宣传类型不能为空', trigger: 'blur'}
  ],
  yxyrjsqgc: [
    {required: true, message: '与嫌疑人结识全过程不能为空', trigger: 'blur'}
  ],
  bzpssjrjList: [
    {required: true, type: 'array', min: 1, message: '被骗时社交软件名不能为空', trigger: 'change'},
  ]
}
const formRef = ref()
watch(() => props.rowInfo, (value) => {
  // console.log(value)
  if (value.id) {
    let arr = []
    formItem.value = value
    for (var key in formItem.value) {
      if (key == 'sfjsgfzxc' || key == 'sfcghdfltx' || key == 'cjsfycljl' || key == 'sfdxyz' || key == 'bjhappnfdk') {
        if (formItem.value[key] == '1') {
          formItem.value[key] = '是'
        } else if (formItem.value[key] == '0') {
          formItem.value[key] = '否'
        }
      }
    }
    formItem.value.xxqrList.forEach(item => {
      if (item) {
        xxqrList.value.forEach(i => {
          if (i.value == item) {
            arr.push(i.label)
          }
        })
      }
    })
    if (!formItem.value.bzpssjrjList) {
      formItem.value.bzpssjrjList = []
    }
    if (value.bzpssjrj) {
      formItem.value.bzpssjrjList = value.bzpssjrj.split(',')
    }
    // console.log(value.bzpssjrj.split(','))
    formItem.value.xxqr = Array(...arr)
    // console.log(formItem.value.xxqr)
  } else {
    formItem.value = {
      xm: '',//姓名
      xb: '',//性别
      nl: '',//年龄
      xl: '',//学历
      txrq: '',//年月日
      bh: '',//编号
      mobile: '',//手机号
      ssje: '',//受损金额
      ysr: '',//月收入
      zy: '',//职业
      gzdw: '',
      bsjjdz: '',
      zctgnztjjs: '',
      bzpssjrjList: [],
      szApp: '',
      zhMm: '',
      azsj: '',
      azfs: '',
      szwz: '',
      wzzcsj: '',
      ccdlsj: '',
      ccdlsjd: '',
      bjhappnfdk: '',
      szdh: '',
      sfdxyz: '',
      scczrq: '',
      mcczrq: '',
      bpsczhj: '',
      bpsczhjQt: '',
      zyQt: '',
      zctgnztjjsQt: '',
      azfsQt: '',
      bpsczsywlyysLl: '',
      bpsczsywlyysLlQt: '',
      bpsczsywlyysKd: '',
      bpsczsywlyysKdQt: '',
      sjlx: '',
      bpsczzd: '',
      cjsfycljl: '',
      sfcghdfltx: '',
      sfyjrlzh: '',
      sfyjrlzhQt: '',
      sfjsgfzxc: '',
      jsdxclx: '',
      jsdxclxQt: '',
      yxyrjsqgc: '',
      dyffjy: '',
      xxqrList: [],
      xxqr: []
    }
  }
})
const ysrList = computed(() => dict.dict.return_visit_ysr.list)
const zyList = computed(() => dict.dict.return_visit_zy.list)
const zctgnztjjsList = computed(() => dict.dict.return_visit_zctgnztjjs.list)
const azfsList = computed(() => dict.dict.return_visit_azfs.list)
const czhjList = computed(() => dict.dict.return_visit_czhj.list)
const bpsyys_ll_List = computed(() => dict.dict.return_visit_bpsyys_ll.list)
const bpsyys_kd_List = computed(() => dict.dict.return_visit_bpsyys_kd.list)
const sjlxList = computed(() => dict.dict.return_visit_sjlx.list)
const czzdList = computed(() => dict.dict.return_visit_czzd.list)
const sfyjrlzhList = computed(() => dict.dict.return_visit_sfyjrlzh.list)
const jsdxclxList = computed(() => dict.dict.return_visit_jsdxclx.list)
const xxqrList = computed(() => dict.dict.return_visit_xxqr.list)
const ccdlsjdList = computed(() => dict.dict.return_visit_first_login_time.list)

onMounted(async () => {
  dict.getDict('return_visit_ysr')
  dict.getDict('return_visit_zy')
  dict.getDict('return_visit_zctgnztjjs')
  dict.getDict('return_visit_azfs')
  dict.getDict('return_visit_bpsyys_kd')
  dict.getDict('return_visit_bpsyys_ll')
  dict.getDict('return_visit_czhj')
  dict.getDict('return_visit_sfyjrlzh')
  dict.getDict('return_visit_czzd')
  dict.getDict('return_visit_sjlx')
  dict.getDict('return_visit_jsdxclx')
  dict.getDict('return_visit_xxqr')
  dict.getDict('return_visit_first_login_time')
  
    console.log(ysrList,
      zyList,
      zctgnztjjsList,
      azfsList,
      czhjList,
      bpsyys_ll_List,
      bpsyys_kd_List,
      sjlxList,
      czzdList,
      sfyjrlzhList,
      jsdxclxList,
      xxqrList,
      ccdlsjdList, 1111111111111111)
})


let formItem = ref({
  xm: '',//姓名
  xb: '',//性别
  nl: '',//年龄
  xl: '',//学历
  txrq: '',//年月日
  bh: '',//编号
  mobile: '',//手机号
  ssje: '',//受损金额
  ysr: '',//月收入
  zy: '',//职业
  gzdw: '',
  bsjjdz: '',
  zctgnztjjs: '',
  bzpssjrjList: [],
  szApp: '',
  zhMm: '',
  azsj: '',
  azfs: '',
  szwz: '',
  wzzcsj: '',
  ccdlsj: '',
  ccdlsjd: '',
  bjhappnfdk: '',
  szdh: '',
  sfdxyz: '',
  scczrq: '',
  mcczrq: '',
  bpsczhj: '',
  bpsczhjQt: '',
  zyQt: '',
  zctgnztjjsQt: '',
  azfsQt: '',
  bpsczsywlyysLl: '',
  bpsczsywlyysLlQt: '',
  bpsczsywlyysKd: '',
  bpsczsywlyysKdQt: '',
  sjlx: '',
  bpsczzd: '',
  cjsfycljl: '',
  sfcghdfltx: '',
  sfyjrlzh: '',
  sfyjrlzhQt: '',
  sfjsgfzxc: '',
  jsdxclx: '',
  jsdxclxQt: '',
  yxyrjsqgc: '',
  dyffjy: '',
  xxqrList: [],
  xxqr: []
})

function save () {
  formRef.value.validate(async (valid) => {
    if (valid) {
      let form1 = cloneDeep(formItem.value)
      form1.xxqrList = []
      for (var key in form1) {
        if (form1[key] == '是') {
          form1[key] = 1
        } else if (form1[key] == '否') {
          form1[key] = 0
        }
      }
      // formItem.value.xxqr.forEach(item => {
      //   if (item) {
      //     xxqrList.value.forEach(i => {
      //       console.log(i.label, item)
      //       if (i.label == item) {
      //         form1.xxqrList.push(i.value)
      //       }
      //     })
      //   }
      // })
      form1.xxqr = null
      try {
        const res = await insertReturnVisit(form1)
        console.log(res)
        if (res.data.code == 200) {
          // ajList.getCaseInfo()
          formItem.value.id = res.data.data
          proxy.$Message.success('保存成功')
          emits('closeBD', 'sx')
        } else {
          proxy.$Message.error(res.data.message)
        }
      }
      catch (e) {
        proxy.$Message.error(e.data.message)
      }
    }
  })
}


</script>
<script>
export default {
  name: "questionnaire"
}

</script>
<template>
  <card style="height: 100%; overflow-y: auto;box-sizing: border-box">
    <h1 style="text-align: center;padding-bottom:.2rem ">回访调查问卷</h1>
    <Form ref="formRef" :label-width="180" :model="formItem" :rules="ruleValidate">
      <Row>
        <Col span="8">
          <FormItem label="姓名" prop="xm">
            <Input v-model="formItem.xm"></Input>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="性别" prop="xb">
            <Input v-model="formItem.xb"></Input>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="年龄" prop="nl">
            <Input v-model="formItem.nl" number type="number"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="8">
          <FormItem label="学历" prop="xl">
            <Input v-model="formItem.xl"></Input>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="填写日期" prop="txrq">
            <DatePicker v-model="formItem.txrq" placeholder="填写日期" style="width: 2rem" type="date"></DatePicker>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="警情编号" prop="bh">
            <Input v-model="formItem.bh"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="8">
          <FormItem label="手机" prop="mobile">
            <Input v-model="formItem.mobile"></Input>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="损失金额" prop="ssje">
            <Input v-model="formItem.ssje"></Input>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="月收入情况" prop="ysr">
            <Select v-model="formItem.ysr">
              <Option v-for="item in ysrList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="8">
          <FormItem label="职业" prop="zy">
            <Select v-model="formItem.zy">
              <Option v-for="item in zyList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="工作单位" prop="gzdw">
            <Input v-model="formItem.gzdw" required></Input>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="本市居住地址" prop="bsjjdz">
            <Input v-model="formItem.bsjjdz" type="textarea"></Input>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="8">
          <FormItem label="最初通过哪种途径结识" prop="zctgnztjjs">
            <Select v-model="formItem.zctgnztjjs">
              <Option v-for="item in zctgnztjjsList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <div v-if="formItem.zctgnztjjs == 10" span="8">
            <FormItem label="其他社交软件">
              <Input v-model="formItem.zctgnztjjsQt"></Input>
            </FormItem>
          </div>
        </Col>
        
        <Col span="12">
          <FormItem label="被骗时社交软件名" prop="bzpssjrjList">
            <Input v-model="formItem.bzpssjrjList[0]" clearable placeholder="1号社交软件"
                   style="width: 1rem;margin-right: .1rem"/>
            <Input v-model="formItem.bzpssjrjList[1]" clearable placeholder="2号社交软件"
                   style="width: 1rem;margin-right: .1rem"/>
            <Input v-model="formItem.bzpssjrjList[2]" clearable placeholder="3号社交软件"
                   style="width: 1rem;margin-right: .1rem"/>
            <Input v-model="formItem.bzpssjrjList[3]" clearable placeholder="4号社交软件"
                   style="width: 1rem;margin-right: .1rem"/>
            <Input v-model="formItem.bzpssjrjList[4]" clearable placeholder="5号社交软件"
                   style="width: 1rem;margin-right: .1rem"/>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="8">
          <FormItem label="涉诈APP名称" prop="szApp">
            <Input v-model="formItem.szApp"/>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="账号密码" prop="zhMm">
            <Input v-model="formItem.zhMm"/>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="安装时间" prop="azsj">
            <DatePicker v-model="formItem.azsj" placeholder="填写日期" type="date"></DatePicker>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="8">
          <FormItem label="安装方式" prop="azfs">
            <Select v-model="formItem.azfs">
              <Option v-for="item in azfsList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <div v-if="formItem.azfs == 3" span="4">
            <FormItem label="其他安装方式">
              <Input v-model="formItem.azfsQt"></Input>
            </FormItem>
          </div>
        </Col>
        
        <Col span="8">
          <FormItem label="涉诈网站" prop="szwz">
            <Input v-model="formItem.szwz"/>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="APP/网站注册时间" prop="wzzcsj">
            <DatePicker v-model="formItem.wzzcsj" placeholder="填写日期" type="date"></DatePicker>
          </FormItem>
        </Col>
      
      </Row>
      <Row>
        
        <Col span="8">
          <FormItem label="初次登陆时间" prop="ccdlsj">
            <DatePicker v-model="formItem.ccdlsj" placeholder="填写日期" type="date"></DatePicker>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="初次登陆时间段" prop="ccdlsjd">
            <Select v-model="formItem.ccdlsjd">
              <Option v-for="item in ccdlsjdList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="报警后涉诈网址/APP能否打开" prop="bjhappnfdk">
            <RadioGroup v-model="formItem.bjhappnfdk">
              <Radio label="是"></Radio>
              <Radio label="否"></Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="是否短信验证" prop="sfdxyz">
            <RadioGroup v-model="formItem.sfdxyz">
              <Radio label="是"></Radio>
              <Radio label="否"></Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="涉诈电话" prop="szdh">
            <Input v-model="formItem.szdh"/>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="首次充值日期" prop="scczrq">
            <DatePicker v-model="formItem.scczrq" placeholder="填写日期" type="date"></DatePicker>
          </FormItem>
        </Col>
      
      </Row>
      <Row>
        <Col span="8">
          <FormItem label="末次充值日期" prop="mcczrq">
            <DatePicker v-model="formItem.mcczrq" placeholder="填写日期" type="date"></DatePicker>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="被骗时操作环境" prop="bpsczhj">
            <Select v-model="formItem.bpsczhj">
              <Option v-for="item in czhjList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <div v-if="formItem.bpsczhj == 6">
            <FormItem label="其他操作环境">
              <Input v-model="formItem.bpsczhjQt"></Input>
            </FormItem>
          </div>
        </Col>
        
        <Col span="8">
          <FormItem label="被骗时操作使用网络运营商(流量)" prop="bpsczsywlyysLl">
            <Select v-model="formItem.bpsczsywlyysLl">
              <Option v-for="item in bpsyys_ll_List" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <div v-if="formItem.bpsczsywlyysLl == 4">
            <FormItem label="其他运营商(流量)">
              <Input v-model="formItem.bpsczsywlyysLlQt"></Input>
            </FormItem>
          </div>
        </Col>
        
        <Col span="8">
          <FormItem label="被骗时操作使用网络运营商(宽带)" prop="bpsczsywlyysKd">
            <Select v-model="formItem.bpsczsywlyysKd">
              <Option v-for="item in bpsyys_kd_List" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <div v-if="formItem.bpsczsywlyysKd == 4">
            <FormItem label="其他运营商(宽带)">
              <Input v-model="formItem.bpsczsywlyysKdQt"></Input>
            </FormItem>
          </div>
        </Col>
        <Col span="8">
          <FormItem label="手机类型" prop="sjlx">
            <Select v-model="formItem.sjlx">
              <Option v-for="item in sjlxList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="被骗时操作终端" prop="bpsczzd">
            <Select v-model="formItem.bpsczzd">
              <Option v-for="item in czzdList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="曾经是否有此类经历" prop="cjsfycljl">
            <RadioGroup v-model="formItem.cjsfycljl">
              <Radio label="是"></Radio>
              <Radio label="否"></Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="曾经成功获得返利体现" prop="sfcghdfltx">
            <RadioGroup v-model="formItem.sfcghdfltx">
              <Radio label="是"></Radio>
              <Radio label="否"></Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="是否有金融类账户" prop="sfyjrlzh">
            <Select v-model="formItem.sfyjrlzh">
              <Option v-for="item in sfyjrlzhList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
        </Col>
        <Col v-if="formItem.sfyjrlzh == 5">
          <FormItem label="其他金融账户">
            <Input v-model="formItem.sfyjrlzhQt"></Input>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="是否接受过反诈宣传" prop="sfjsgfzxc">
            <RadioGroup v-model="formItem.sfjsgfzxc">
              <Radio label="是"></Radio>
              <Radio label="否"></Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span="8">
          <FormItem label="接受的宣传类型" prop="jsdxclx">
            <Select v-model="formItem.jsdxclx">
              <Option v-for="item in jsdxclxList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </Select>
          </FormItem>
          <div v-if="formItem.jsdxclx == 4">
            <FormItem label="其他宣传类型">
              <Input v-model="formItem.jsdxclxQt"></Input>
            </FormItem>
          </div>
        </Col>
      </Row>
      <Row>
        <Col span="24">
          <FormItem label="与嫌疑人结识全过程" prop="yxyrjsqgc">
            <Input v-model="formItem.yxyrjsqgc" type="textarea"></Input>
          </FormItem>
        </Col>
        <Col span="24">
          <FormItem label="对于防范的建议" prop="dyffjy">
            <Input v-model="formItem.dyffjy" type="textarea"></Input>
          </FormItem>
        </Col>
      </Row>
      <!--        <Row>-->
      <!--          <Col>-->
      <!--            <FormItem label="信息确认">-->
      <!--              <CheckboxGroup v-model="formItem.xxqr">-->
      <!--                <Checkbox :label="item.label"  v-for="item in xxqrList"></Checkbox>-->
      <!--              </CheckboxGroup>-->
      <!--            </FormItem>-->
      <!--          </Col>-->
      <!--        </Row>-->
      <FormItem>
        <div style="text-align: right">
          <Button style="margin-right: .2rem" @click="emits('closeBD')">取消</Button>
          <Button type="primary" @click="save">保存</Button>
        </div>
      </FormItem>
    </Form>
  </card>
</template>
<style scoped>

</style>

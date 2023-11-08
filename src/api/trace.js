import request from "@/libs/request.js";
import qs from 'qs'

// 添加线索 apk
export const insertApk = (data) => request.post('iiApk/insertApk', qs.stringify(data))

// 添加线索 url
export const insertUrl = (data) => request.post('iiUrl/insertUrl', qs.stringify(data))

// 添加线索 ip
export const insertIp = (data) => request.post('iiIp/insertIp', qs.stringify(data))

// 添加线索 idcard
export const insertIdcard = (data) => request.post('iiZj/insertZj', qs.stringify(data))

// 添加线索 ewallet
export const insertEwallet = (data) => request.post('/ewallet/insertEwallet', qs.stringify(data))

// 添加线索 phone
export const insertPhone = (data) => request.post('iiPhone/insertPhone', qs.stringify(data))

// 添加线索 wifi
export const insertWifi = (data) => request.post('iiWifi/insertWifi', qs.stringify(data))

// 添加线索 virtualId
export const insertVirtualId = (data) => request.post('iiVirtualId/saveIiVirtualId', qs.stringify(data))

// 添加线索 bankCard
export const insertBankcard = (data) => request.post('iiKl/insertKl', qs.stringify(data))

// 批量任务
export const createPlTask = (data) => request.postJson('/iiTask/createPlTask', JSON.stringify(data))


// iiTrace/iiTraceListAll
export const getTraceList = (data) => request.post('/iiTrace/iiTraceListAll', qs.stringify(data))
// /iiTrace/findTraceById
export const getTraceById = (data) => request.get('/iiTrace/findTraceById', data)


// 删除线索
export const deleteTrace = (data) => request.post('/iiTrace/deleteTrace',qs.stringify(data))

// ip详情
export const getIpDetail = (data) => request.post('/iiIp/iiIpDetail', qs.stringify(data))
// 修改ip
// export const saveIp = (data) => request.post('/iiIp/saveIp', qs.stringify(data))
// wifi详情
export const getWifiDetail = (data) => request.post('/iiWifi/iiWifiDetail', qs.stringify(data))
// 修改wifi

// 卡类详情
export const getklDetail = (data) => request.post('/iiKl/iiKlDetail', qs.stringify(data))

// 修改卡类
// export const saveKl = (data) => request.post('/iiKl/saveKl', qs.stringify(data))

//url详情
export const getUrlDetail = (data) => request.post('/iiUrl/iiUrlDetail', qs.stringify(data))

// 电子钱包详情
export const getEwalletDetail = (data) => request.post('/ewallet/ewalletDetail', qs.stringify(data))

// 证件详情
export const getZjDetail = (data) => request.post('/iiZj/iiZjDetail', qs.stringify(data))

// 虚拟身份详情
export const getVirtualDetail = (data) => request.post('/iiVirtualId/getIiVirtualIdById', qs.stringify(data))

// 手机号码详情
export const getPhoneDetail = (data) => request.post('/iiPhone/iiPhoneDetail', qs.stringify(data))

// apk详情
export const getApkDetail = (data) => request.post('/iiApk/iiApkDetail', qs.stringify(data))

//其他线索
export const getOtherDetail = (data) => request.get('/other/otherDetail?id='+data)
export const addOther = (data) => request.post('/other', qs.stringify(data))
export const delOther = (data) => request.delete('/other/'+data)
export const updateOther = (data) => request.delete('/other/upload',qs.stringify(data))
// 更新线索备注
export const updateTraceRemark = (data) => request.post('/iiTrace/updateMindDataMsg', data)
// 二维码
export const getQrcodeData = (data) => request.post('/iiTask/getQrcodeByTaskChannelId', data)

//父线索列表iiTrace/getAllTraceByCaseId
export const getAllTraceByCaseId = (data) => request.get('iiTrace/getAllTraceByCaseId?caseId='+data)

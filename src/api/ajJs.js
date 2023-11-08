import request from "@/libs/request.js";
import qs from 'qs'

export const detectCaseList = (data) =>
    request.post('detectCase/detectCaseList', qs.stringify(data))

export const insertCase = (data) =>
    request.post('detectCase/insertCase', qs.stringify(data))


// 案件详情
export const detectCaseDetail = (data) =>
    request.post('detectCase/detectCaseDetail', qs.stringify(data))
//删除案件
export const deleteCase = (data) =>
    request.post('detectCase/deleteCase', qs.stringify(data))
// 线索类型
export const getAllTrackTypeNum = (data) =>
    request.post('trackType/getAllTrackTypeNum', qs.stringify(data))
// 线索类型
export const getAllTrackType = (data) =>
    request.post('trackType/getAllTrackType', qs.stringify(data))
// 添加笔记
export const insertNote = (data) =>
    request.postJson('detectNote/insertNote', JSON.stringify(data))


//受理案件
export const acceptCase = (data) => request.post('detectCase/acceptanceDetectCase', qs.stringify(data))

//案间碰撞详情/jdetect/iiTrace/getTraceCollisionDetail
export const getTraceCollisionDetail = (data) => request.get('/iiTrace/getTraceCollisionDetail',data)

//标定结果数量
export const getTabNums = (data) => request.post('people/getTabNums',qs.stringify(data))
//标定人列表
export const addPeople = (data) => request.post('/people/insertPeople',qs.stringify(data))
export const peopleList = (data) => request.post('people/peopleList',qs.stringify(data))
export const updatePeople = (data) => request.postJson('/iiTrace/save',JSON.stringify(data))
//物
export const addObject = (data) => request.post('object/insertObject',qs.stringify(data))
export const objectList = (data) => request.post('object/objectList',qs.stringify(data))
export const updateObject = (data) => request.postJson('object/updateObject',JSON.stringify(data))
//组织
export const addOrg = (data) => request.post('/org/insertOrg',qs.stringify(data))
export const orgList = (data) => request.post('org/orgList',qs.stringify(data))
export const updateOrg = (data) => request.postJson('org/updateOrg',JSON.stringify(data))
//地址
export const addAddress = (data) => request.post('address/insertAddress',qs.stringify(data))
export const addressList = (data) => request.post('address/addressList',qs.stringify(data))
export const updateAddress = (data) => request.postJson('address/updateAddress',JSON.stringify(data))




// 深入侦查——互联网侦查
export const doInternetDetect = (data) => request.postJson('/iiTask/doInternetDetect',JSON.stringify(data))
//能力列表
export const listIiChannelSolution = (data) => request.post('detectChannelSolution/listIiChannelSolution',qs.stringify(data))
// 深入侦查 保存线下侦查任务
export const saveOfflineTask = (data) => request.postJson( '/iiTask/doDeepDetect',JSON.stringify(data))

// 批量深入侦查（加入碰撞池）
export const deepDetectCart = (data) => request.postJson('/iiShoppingCart/batchMultiIpOrMac', JSON.stringify(data))
// 添加购物车
export const addIntoCart = (data) => request.postJson('/iiShoppingCart/addShopingCart', JSON.stringify(data))
// 删除
export const removeFromCart = (data) => request.get('/iiShoppingCart/deleteById', data)
// 查询
export const selectCart = (data) => request.postJson('/iiShoppingCart/getShopingCartList', JSON.stringify(data))
export const getCartSolution = (data) => request.postForm('/detectChannelSolution/listIiChannelSolution', data)





//更新日志

export const findNewMessage = (data) => request.get('/a/sys/version/findNewMessage',data)
export const saveReadVersionLog = (data) => request.get('/a/sys/version/saveReadVersionLog?versionId='+data)

//退出案件
export const exitCase = (data) => request.get('detectCase/exitCase?caseId='+data)
//获取所有用户/sys/user/getUserListBySn
export const getUserListBySn = () => request.get('/a/sys/user/getUserListBySn')
//保存detectCase/batchInsertCaseUser
export  const batchInsertCaseUser = (data) => request.post('detectCase/batchInsertCaseUser',data)
//主办人移交案件 detectCase/caseTurnOver   post
export  const caseTurnOver = (data) => request.post('detectCase/caseTurnOver',data)


// 下载案件zip包
// export const exportCaseZip = (data) => request.getBlob('/detectCase/download/caseFile', data)
export const exportCaseZip = (data) => request.get('/detectCase/download/caseFile', data)
// 导入案件zip包
export const importCaseZip = (data) => request.post('/detectCase/resolveCaseZipFile', data)

//提取案件信息
export const extractingCaseInfo = (data) => request.get('/takeDownResolve/extractingCaseInfo', data)

//detectCase/detectCaseListNum
export const detectCaseListNum = (data) => request.get('/detectCase/detectCaseListNum', data)


//带数字的分类类别/detectCase/caseTypeNum
export const caseTypeNum = (data) => request.get('/detectCase/caseTypeNum', data)

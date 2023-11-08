import request from "@/libs/request.js";
import qs from 'qs'


//获取线索详情（能力，是玄武能力还是调证能力或者线下能力
export const getTaskChannelGroupAbility = (data) => request.postJson('/IiTaskChannel/selectTaskChannelGroup', JSON
  .stringify(data))

//      traceId     taskChannelId
export const getOfflineAbility = (data) => request.get('/iiTask/getOffLintTaskSubTypeList', data)

// 附件详情
export const getAttachmentDetail = (data) => request.post('/iiTask/selectPlTaskAttachmentListMongo', data)

// 上传附件时
export const insertAttachment = (data) => request.postJson('/iiTask/insertPlTaskAttachmentNew', JSON.stringify(data))

// 互联网数据详情
// export const internetTableData = (data) => request.post('/detect/internet/list', qs.stringify(data))
export const internetTableData = (data) => request.post('/detect/internet/listNew', qs.stringify(data))

// 上传excel返回json
export const getAttachmentJsonAfterUpload = (data) => request.get('/iiTask/getPlTaskAttachmentJsonNew', data)

// 上传excel返回json分页
export const getAttachmentJson = (data) => request.post('/iiTask/selectPlTaskAttachmentListMongo', data)
// 删除文件
export const delAttachment = (data) => request.post('/iiTask/deletePlTaskAttachment', qs.stringify(data))

// 获取调证详情
export const getDrawproofField = (data) => request.post('/taskChannelField/selectFieldValueBySolutionId', qs.stringify(data))
// 获取调证详情新
export const getDrawproofDetail = (data) => request.post('/taskChannelField/selectFieldValueByDrawProofId', qs.stringify(data))
// 创建调证函
export const createDrawproof = (data) => request.postJson('/iiTask/createDrawProofTask', JSON.stringify(data))
// 保存调证函
export const saveDrawProof = (data) => request.postJson('/iiTask/saveDrawProofTask', JSON.stringify(data))
// 互联网数据（安数）
// export const internetTableDataAnShu = (data) => request.post('/asPhoneReturn/getAsReturnAppList', qs.stringify(data))
export const internetTableDataAnShu = (data) => request.post('/detect/internet/listNew', qs.stringify(data))


//ip关联查询
export const getIpDeviceList = (data) => request.post('/iiChannelReturnIp/getIpDeviceListNew', qs.stringify(data))

// 获取app分类
// export const getAppCategory = (data) => request.post('/iiReturnStatistics/getAllLabelByTaskChannelId', data)
// 获取app分类
export const getAppCategory = (data) => request.post('/iiReturnStatistics/getAllLabelByTaskChannelIdNew', qs.stringify(data))
// 指引
export const companyGuide = (data) => request.get('/companyInfo/getCompanyInfoGuid', data)

// 搜索公司名称
export const searchCompany = (data) => request.get('/companyInfo/getCompanyInfoGuidSearch', data)

// 二次标定插入
export const insertAttachmentBd = (data) => request.postJson('/iiTask/insertPlTaskAttachmentCollisionColumn', JSON.stringify(data))

// 调证列表
export const getDrawProofTypes = (data) => request.get('/iiTask/getDrawProofListByTaskChannelId', data)

// ipc端碰撞
export const ipCollision = (data) => request.post('/iiDataCollision/getIpDataCollisionC', data)

// 更新线下附件 attachmentIdList channelSolutionExtendId
export const updateOfflineFile = (data) => request.postJson('/iiTask/updateOfflineTaskSubType', JSON.stringify(data))

// 批量上传线下附件
export const insertplAttachment = (data) => request.post('/iiTask/batchUploadFile', data)

// 批量上传线下附件
export const batchUploadAddExcel = (data) => request.post('/iiTask/batchUploadAddExcel', data)
// 调证图片四张
export const getDrawproofImages = (data) => request.get('/companyInfo/getDrawProofImgListById', data)



// 内部功能
// 四码iiYsReturn/findIdMappingByTaskChannelId
export const findIdMappingByTaskChannelId  = (data) => request.get('/iiYsReturn/findIdMappingByTaskChannelId', data)
//人员画像iiYsReturn/findUserTagByTaskChannelId
export const findUserTagByTaskChannelId  = (data) => request.get('/iiYsReturn/findUserTagByTaskChannelId', data)
//常用WIFIiiYsReturn/findWifiConnectByTaskChannelId
export const findWifiConnectByTaskChannelId  = (data) => request.postJson('/iiYsReturn/findWifiConnectByTaskChannelId', data)

//轨迹列表iiYsReturn/findLocationByTaskChannelId
// export const findLocationByTaskChannelId  = (data) => request.postJson('/iiYsReturn/findLocationByTaskChannelId', data)

//  最新位置iiYsReturn/findLocationsRtByTaskChannelId
export const findLocationsRtByTaskChannelId  = (data) => request.get('/iiYsReturn/findLocationsRtByTaskChannelId', data)


///ys/getYunshenApiData  relationMaps
export const getYunshenApiData  = (data) => request.get('/ys/getYunshenApiData', data)
export const relationMaps  = (data) => request.get('/ys/relationMaps', data)
//
export const findLocationByTaskChannelId  = (data) => request.post('/ys/locations', data)

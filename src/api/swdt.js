import request from '@/libs/request.js';
import qs from 'qs';

export const getSwdtData = params => request.get('/iiTrace/getMindData', params)
export const getCollectionDetail = params => request.get('/iiTrace/getCollectionDetail', params)
export const v2GetCollectionDetail = params => request.get('/v2/dataCollision/listInternalCollisionCountStat', params)


// 获取标签列表
export const getTagsList = () => request.get('/channelRoute/listRoute')

// 添加标签
export const saveTags = params => request.post('/channelRoute/batchAddRouteResult', params)

// 删除标签
export const delTag = params => request.post('/objTag/deleteObjTag', params)
// 批量修改
export const updateSwdtList = data => request.post('iiTrace/batchUpdateTrace', data)
// 循环查找
// IiTaskChannel/updateTaskChannelTime
export const updateTaskChannelTime = data => request.post('IiTaskChannel/updateTaskChannelTime', data)


// 碰撞详情 v2/dataCollision/listCollisionTraceDetailVO   v2/dataCollision/getCollisionDetail
export const getCollision = data => request.post('/iiDataCollision/getTrackTypeByTraceId', qs.stringify(data))
export const getCollisionTables = data => request.post('/iiDataCollision/getCollisionListByTraceId', qs.stringify(data))
export const getCollisionDetail = (data) => request.get('v2/dataCollision/listCollisionTraceDetailVO', data)
export const getCollisionInfo = (data) => request.get('v2/dataCollision/getCollisionDetail', data)

// 获取碰撞数据
/*
 * tableName 数据表名称     targetId 源数据表id,excel时使用      virtualId  文件类型数据虚拟id */
export const getCollisionList = (data) => request.post('/iiDataCollision/findDataCollisionListNew', data)

//iiDataCollision/findDataCollisionListTitle
export const findDataCollisionListTitle = (data) => request.post('/iiDataCollision/findDataCollisionListTitle', data)
//iiDataCollision/findDataCollisionListDetail\
export const findDataCollisionListDetail = (data) => request.post('/iiDataCollision/findDataCollisionListDetail', data)

//下载解析/jdetect/takeDownResolve/takeDownTextDoc/download

export const download = (data) => request.getFile('/takeDownResolve/takeDownTextDoc/download/?imageFilePathList=' + data)

///jdetect/iTrace/getCluePeoplelnfo

export const getCluePeopleInfo = params => request.get('/iiTrace/getCluePeopleInfo', params)
export const savePeople = params => request.post('/iiTrace/save', params)

//线索标定people/unMarkPeople
export const markPeople = params => request.post('/people/markPeopleByTraceId/?traceId=' + params)

//取消线索标定
export const unMarkPeople = params => request.post('/people/unMarkPeople/?traceId=' + params)
//点击获取碰撞连线v2/dataCollision/listCollisionMindLineVO
export const getCollisionMindLineList = params => request.get('/v2/dataCollision/listCollisionMindLineVO', params)

//多线索连线iiTrace/getSameTrace
export const getSameTrace = params => request.get('/iiTrace/getSameTrace', params)
//下载Xmind /detectCase/exportXmind

export const exportXmind = params => request.get('/detectCase/exportXmind', params)

//记战法/iiTrace/phoneClueAnalysis
export const phoneClueAnalysis = params => request.get('/iiTrace/collisionClueAnalysis', params)

//是否cdn/detect/internet/updateUrlCDN
export const updateUrlCDN = params => request.postJson('detect/internet/updateUrlCDN', params)


//留言板
//回复/caseComment/save
export const saveCaseComment = params => request.post('/caseComment/save', params)

//获取留言用户//caseComment/listCommentUser
export const listCommentUser = params => request.get('/caseComment/listCommentUser?caseId='+ params)

//获取留言列表 //caseComment/listComment
export const listComment = params => request.get('/caseComment/listComment?caseId='+ params)

//删除留言
export const deleteById = params => request.get('/caseComment/deleteById?id=' + params)

//未回复数字countUnReply
export const countUnReply = params => request.get('/caseComment/countUnReply?caseId=' + params)

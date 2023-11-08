import request from "@/libs/request.js";
import qs from "qs";
//查询
export const getPage = (param) => request.post('objectSource/page', qs.stringify(param))
//回访iiReturnVisit/insertReturnVisit/jdetect/objectSource/page
export const insertReturnVisit = (data) => request.post('iiReturnVisit/insertReturnVisit', data)
//删除iiReturnVisit/delReturnVisit    get
export const delReturnVisit = (data) => request.get('iiReturnVisit/delReturnVisit?id='+data)

//批量布控iiDeploy/findDeployCompanyList

export const findDeployCompanyList = (data) => request.post('iiDeploy/findDeployCompanyList', data)
//人员列表iiDeploy/findDeployUserList
export const findDeployUserList = (data) => request.post('/iiDeploy/findDeployUserList', data)
//保存接口iiDeploy/saveDeployUserList
export const saveDeployUserList = (data) => request.post('/iiDeploy/saveDeployUserList', data)
//历史布控iiDeploy/findDeployHistoryList
export const findDeployHistoryList = (data) => request.post('/iiDeploy/findDeployHistoryList',  qs.stringify(data))
//布控含下载iiTask/downloadBkExcel   get请求   batchNo
export const downloadBkExcel = (data) => request.get('iiTask/downloadBkExcel?batchNo='+data)
//删除/person/deletePeople
export const deletePeople = (data) => request.postForm('/people/deletePeople', data)
export const deleteObject = (data) => request.get('/object/deleteById', data)
//取消objectSource/finishDeploy
export const finishDeploy = (data) => request.get('objectSource/finishDeploy?id='+data)

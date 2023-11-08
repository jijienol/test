import request from "@/libs/request.js";
import qs from 'qs'


// 列表
export const getQrtzList = (param) => request.post( '/job/getQrtzList',param)
export const getDetail = (param) => request.get( '/job/info',param)
export const saveTask = (param) => request.post( '/job/save',param)
export const pLStop = (param) => request.post( '/job/stop',param)
export const operate = (param) => request.post( '/job/operate',qs.stringify(param))
export const plExecute = (param) => request.get( '/job/executeOnce',param)
export const pLStart = (param) => request.get( '/job/batchResumeJob',param)
export const del = (param) => request.get( '/job/delete',param)

// 详情 get


// 批量暂停 get ids

// 单个暂停、恢复、执行一次 formData

/* 批量执行计划任务(手动执行)
/job/executeOnce	get	传ids，逗号拼接 */


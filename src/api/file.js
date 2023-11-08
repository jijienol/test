import request from "@/libs/request.js";
import qs from 'qs'
// 获取现堪Index。html /mnt/data/upload/detectXk/xkUnZip/
export const getXkFile = (data) => request.get('file/uploadFile/getXkByCaseId', data)
// 获取笔录
export const getWordUrl = (data) => request.get('/file/getWordUrl', data)
// 导出内网zip
export const exportZip = (data) => request.get('/file/downloadZip', data)
export const exportDeepZip = (data) => request.get('/mobile/task/batchDownloadInternetZip', data)
// 导出内网zip

export const uploadAndResolve = (data) => request.post('/takeDownResolve/generatorDocAndExtractingTrace', data)
export const docPath = (data) => request.post('/takeDownResolve/extractingTrace/docPath', data)

// 导出失败请求 caseId
export const downloadRequest = (data) => request.get('/iiTask/downladRepeatReqZipByCaseId', data)

export const batchCreateTrace = (data) => request.post('/iiTrace/batchCreateTrace', data)

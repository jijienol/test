import request from "@/libs/request.js";
import qs from 'qs'

// 获取报告积分
// export const getReportScore = (data) => request.postForm('report/reportScore', data)

// 获取apk报告
export const getReport = (data) => request.post('report/getReport', qs.stringify(data))

export const getReportSummary = (data) => request.postForm('report/reportSummary', data)

export const delReportAttach = (data) => request.get('caseFile/deleteCaseFileByFileId', data)

//detectCase/getInvestigationReport
export const getReportScore = (data) => request.get('/detectCase/getInvestigationReport', data)

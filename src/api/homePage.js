import request from "@/libs/request.js";


export const getE1 = (param) => request.post( '/homeStat/statCaseCategory',param)
export const getE2 = (param) => request.post('/homeStat/statCaseTrend', param)
export const getE3 = (param) => request.post('/homeStat/statEachDeptDetail', param)
export const getE4 = (param) => request.post('/homeStat/statCaseClaimNum', param)
export const getE5= (param) => request.post('/homeStat/statTaskInfo', param)
export const getE6= (param) => request.post('/homeStat/export', param)

export const getE1New = (param) => request.post( '/homeStat/statTotalCaseInfoNew',param)
export const getE2New = (param) => request.post('/homeStat/statCaseTypeTop5', param)
export const getE3New = (param) => request.post('/homeStat/statCaseClueTaskSuspect', param)
export const getE5New = (param) => request.post('/homeStat/statCaseByMonth', param)
export const getE4New= (param) => request.post('/homeStat/statCaseByDay', param)
export const getE6New= (param) => request.post('/homeStat/caseInvestigationRanking', param)
export const getE7New= (param) => request.post('/homeStat/deptRanking', param)
export const getE8New= (param) => request.post('/homeStat/recipientRanking', param)

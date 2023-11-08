import request from "@/libs/request.js";
import qs from "qs";

export const mobileTaskLogList = (param) => request.post('mobile/task/mobileTaskLogList', qs.stringify(param))
export const mobileTaskReturnUploadLogList = (param) => request.post('mobile/task/mobileTaskReturnUploadLogList', qs.stringify(param))
//回访iiReturnVisit/insertReturnVisit
export const mobileTaskNum = (param) => request.post('mobile/task/mobileQrcodeDownloadAbleNum', param)

export const mobileTaskLogInfo = (param) => request.get('/mobile/task/mobileTaskLogInfo', param)


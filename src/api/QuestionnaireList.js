import request from "@/libs/request.js";
import qs from "qs";

export const getReturnVisitList = (param) => request.post('iiReturnVisit/returnVisitList', qs.stringify(param))
//回访iiReturnVisit/insertReturnVisit
export const insertReturnVisit = (data) => request.post('iiReturnVisit/insertReturnVisit', data)
//删除iiReturnVisit/delReturnVisit    get
export const delReturnVisit = (data) => request.get('iiReturnVisit/delReturnVisit?id='+data)


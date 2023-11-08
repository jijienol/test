import request from "@/libs/request.js";
import qs from "qs";

export const officeList = (data) => request.post('a/sys/office/list',qs.stringify(data))
export const getAreaList = (data) => request.get('a/sys/area/list',data)
export const saveOffice = (data) => request.post('a/sys/office/save',qs.stringify(data))
export const deleteOffice = (data) => request.post('/a/sys/office/delete',qs.stringify(data))


//导出/sys/office/exportOfficeSql
export const exportOfficeSql = (data) => request.get('a/sys/office/exportOfficeSql',data)
//同步api/a/sys/office/syncOffice
export const syncOffice = (data) => request.get('a/sys/office/syncOffice',data)
//api/a/sys/office/syncUser
export const syncUser = (data) => request.get('a/sys/office/syncUser',data)

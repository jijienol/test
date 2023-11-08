import request from "@/libs/request.js";


export const getAreaList = (data) => request.get('/a/sys/area/list', data)
export const getAreaTree = (data) => request.get('/a/sys/area/tree', data)
export const saveArea = (data) => request.post('/a/sys/area/save', data)
export const delArea = (id) => request.delete('/a/sys/area?id='+id)

import request from "@/libs/request.js";
import qs from 'qs'
export const getList = (data) => request.get('/iiChannelSolutionExtend/page', data)
export const save = (data) => request.post('/iiChannelSolutionExtend', data)
export const del = (id) => request.delete('/iiChannelSolutionExtend/'+id)
///v2/companyInfo/selectChildByParentId?parentId=14

export const selectChildByParentId = (data) => request.get('/v2/companyInfo/selectChildByParentId?parentId='+data)

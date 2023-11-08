import request from "@/libs/request.js";
import qs from 'qs'
// 根据type获取字典
export const dictList = (data) => request.post('a/sys/dict/list', qs.stringify(data))
export const getTypeList = (data) => request.post('a/sys/dict/typelist', qs.stringify(data))
export const saveDict = (data) => request.post('a/sys/dict/save', qs.stringify(data))
export const deleteDict = (data) => request.post('a/sys/dict/delete', qs.stringify(data))
export const selectDictList = (data) => request.get('a/sys/dict/selectDictList', data)

// 虚拟身份
export const getVirtualType = (data) => request.post('v2/companyInfo/getList', data)


export const selectListByType = (data) => request.post('a/sys/dict/selectlistbytype', qs.stringify(data))
export const selectOfficeList = (data) => request.post('a/sys/office/selectOfficeList', qs.stringify(data))


export const insertPlTag = (data) => request.post('objTag/insertObjTagBatch',data)
export const getGreenCompany = (data) => request.post('companyInfo/getCompanyDrawproofListNoPage', data)

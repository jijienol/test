import request from "@/libs/request.js";


// 列表
export const getList = (param) => request.post('/companyInfo/getVirtualCompanyList',param)
// 保存

export const save = (param) => request.post('/companyInfo/saveVirtualCompany',param)


// 详情 companyInfo/getVirtualCompanyInfo
export const getDetail = (param) => request.post('/companyInfo/getVirtualCompanyInfo',param)


export const del = (param) => request.post('/companyInfo/deleteVirtualCompany',param)

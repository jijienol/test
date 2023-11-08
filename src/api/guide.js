import request from "@/libs/request.js";



export const getCompanyDrawproofList = (param) => request.post('companyInfo/getCompanyDrawproofList', param)
export const saveCompanyDrawproof = (param) => request.post('companyInfo/saveCompanyDrawproof', param)
export const deleteCompanyDrawproof = (param) => request.get('companyInfo/deleteCompanyDrawproof', param)

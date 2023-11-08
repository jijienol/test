import request from "@/libs/request.js";

import qs from 'qs'
export const selectListByOfficeSn = (data) => request.post('/a/sys/user/selectListByOfficeSn',qs.stringify(data))

export const saveUser = (data) => request.post('/a/sys/user/save',qs.stringify(data))

export const officeList = (data) => request.post('/a/sys/office/selectOfficeList',qs.stringify(data))

export const deleteUser = (data) => request.post('/a/sys/user/delete',qs.stringify(data))

export const getUserRoleList = (data) => request.post('a/sys/userRole/list',qs.stringify(data))

export const getRoleList = (data) => request.post('a/sys/role/list',qs.stringify(data))

export const userRoleUpdate = (data) => request.post('a/sys/userRole/update',qs.stringify(data))

export const resetPassword = (data) => request.post('a/sys/user/resetPassword',qs.stringify(data))
export const getUser = (data) => request.post('/a/sys/user/get',qs.stringify(data))
export const getFzPollice = (data) => request.get('/a/sys/user/getUserList',data)





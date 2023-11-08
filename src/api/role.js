import request from "@/libs/request.js";
import qs from "qs";

export const updateRoleId = (data) => request.post('a/sys/role/updateroleid',qs.stringify(data))

export const roleList = (data) => request.post('a/sys/role/list',qs.stringify(data))

export const insertRole = (data) => request.post('a/sys/role/insert',qs.stringify(data))

export const deleteRole = (data) => request.post('a/sys/role/delete',qs.stringify(data))
export const dictList = (data) => request.post('a/sys/dict/list',qs.stringify(data))
export const menuList = (data) => request.post( 'a/sys/menu/list',qs.stringify(data))
export const roleOfficeList = (data) => request.post( 'a/sys/roleOffice/list',qs.stringify(data))
export const roleMenuList = (data) => request.post( 'a/sys/roleMenu/list',qs.stringify(data))


export const addRoleMenuAndOffice = (data) => request.postJson('a/sys/roleMenu/saveRoleMenuAndOffice',JSON.stringify(data))

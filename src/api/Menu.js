import request from "@/libs/request.js";
import qs from "qs";


export const menuList = (data) => request.post('a/sys/menu/list')
export const deleteMenu = (data) => request.post('a/sys/menu/delete',qs.stringify(data))
export const saveMenu = (data) => request.post('a/sys/menu/save',qs.stringify(data))


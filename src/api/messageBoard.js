import request from "@/libs/request.js";


//创建留言 leaveWord/create
export const create = (data) => request.post('leaveWord/create', data)

//创建留言内容 leaveWord/createContent
export const createContent = (data) => request.post('leaveWord/createContent', data)

//删除留言 leaveWord/delete
export const del = (data) => request.postForm('leaveWord/delete', data)

//通过留言ID获取所有的留言内容 leaveWord/listContent
export const listContent = (data) => request.postForm('leaveWord/listContent', data)

//分页获取留言列表 leaveWord/page
export const page = (data) => request.get('leaveWord/page', data)

//分页获取我参与的留言列表 leaveWord/pageMyPart
export const pageMyPart = (data) => request.get('leaveWord/pageMyPart', data)

export const uploadFile = (data) => request.post('leaveWord/uploadFile', data)
//@用户/jdetect/a/sys/user/listUser
export const listUser = (data) => request.get('a/sys/user/listUser', data)

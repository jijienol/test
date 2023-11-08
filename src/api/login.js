import request from "@/libs/request.js";
import qs from 'qs'

export const login = (data) => request.post('/auth/login', qs.stringify(data))

// { token: '', type: '' }
export const loginByToken = (data) => request.post('/auth/loginByToken', data)

export const accessByToken = (data) => request.get('/oauth/getTokenByAccessToken', data)

// 判断网络环境
export const networkEnv = (data) => request.post('/auth/isOpenInternet', data)

//未读信息
export const messageList = (data) => request.postJson('/sysMessage/messageList', data)
//去除未读信息sysMessage/updateStatus
export const updateStatus = (data) => request.postJson('/sysMessage/updateStatus', data)
//4A登录/auth/4a/login
export const login4a = (data) => request.post('/auth/4a/login', qs.stringify(data))

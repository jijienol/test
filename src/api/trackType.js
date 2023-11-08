import request from "@/libs/request.js";
import qs from 'qs'

// 获取线索 apk
export const listDetectChannelSolution = (data) => request.post('detectChannelSolution/listDetectChannelSolution', qs.stringify(data))
// 添加
export const insertChannelSolution = (data) => request.post('detectChannelSolution/insertChannelSolution', qs.stringify(data))
export const updateChannelSolution = (data) => request.post('detectChannelSolution/updateChannelSolution', qs.stringify(data))
export const deleteChannelSolution = (data) => request.post('detectChannelSolution/deleteChannelSolution', qs.stringify(data))




export const getInFields = (data) => request.post('detectChannelSolution/getInFields', qs.stringify(data))
export const getOutFields = (data) => request.post('detectChannelSolution/getOutFields', qs.stringify(data))
export const saveChannelSolutionField = (data) => request.post('detectChannelSolution/saveChannelSolutionField', qs.stringify(data))
export const deleteChannelSolutionField = (data) => request.post('detectChannelSolution/deleteChannelSolutionField', qs.stringify(data))
export const getDataTypeList = (data) => request.post('dataType/dataTypeList', qs.stringify(data))
export const saveDataType = (data) => request.post('dataType/saveDataType', qs.stringify(data))
export const deleteData = (data) => request.post('dataType/deleteDataType', qs.stringify(data))




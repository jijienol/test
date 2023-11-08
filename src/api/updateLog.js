import request from "@/libs/request.js";
import qs from "qs";


export const getVersionList = (param) => request.post('a/sys/version/versionList', qs.stringify(param))
export const saveVersion = (param) => request.post('a/sys/version/save', param)
export const delVersion = (param) => request.get('a/sys/version/deleteVersionById?id='+ param)

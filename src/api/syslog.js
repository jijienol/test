import request from "@/libs/request.js";
import qs from 'qs'
export const getFindLogListByPage = (data) => request.post('a/sys/log/findLogListByPage',qs.stringify(data))


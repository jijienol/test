import request from "@/libs/request.js";
import qs from 'qs'


export const findNoteListByCaseId = (data) => request.post('detectNote/findNoteListByCaseId',qs.stringify(data))


export const getNoteById = (id) => {
    return axios.request({
        url: 'detectNote/getNoteById',
        method: 'get',
        params: { id }
    })
}

export const findTraceBySourceType = (sourceType, sourceId) => {
    return axios.request({
        url: 'detectNote/findTraceBySourceType',
        method: 'get',
        params: { sourceType, sourceId }
    })
}

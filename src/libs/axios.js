import axios from 'axios';
import {permissionStore} from "@/store/modules/permission.js";

axios.interceptors.request.use((config) => {
    // console.log(config)
    const permission = permissionStore()
    const token = permission.token
    config.baseURL = '/api'
    // config.timeout = 25000
    config.headers["Authorization"] = token
    return config
},(error) => {
    return error
})
axios.interceptors.response.use((response) => {
    const permission = permissionStore()
    const { data, status } = response
    if(status === 200 && data.code == 403 || (status === 200 && data.code == 401)) {
        return Promise.reject(response);
    } else if(status === 200) {
            if (data.code === 205) {
                // 没有凭证跳转登录
                permission.logout(data)
                return Promise.reject(response);
            } else if(data.code == 500) {
                return Promise.reject(response);
            } else if(data.code == 200){
                return Promise.resolve(response);
            } else {
                return Promise.reject(response);
            }
        // }

    } else{
        permission.logout(data)
    }
}, error => {
    const permission = permissionStore()
    let errorInfo = error.response
    if(!errorInfo) {
        return Promise.reject({code: 500, data: '', message: '请求超时'})
    }
    let {data} = errorInfo;
    if(data.code == 205) {
        permission.logout(data)
    }
    return Promise.reject(errorInfo)
})

export default axios

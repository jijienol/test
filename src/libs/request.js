import axios from './axios.js'

const request = {
    get: (url, params) => {
        return axios.get(url, {
            params: params
        })
    },
    getBlob: (url, params) => {
      return axios.get(url, {
          responseType: 'blob',
          params: params
      })
    },
    post: (url, params) => {
        return axios.post(url, params)
    },
    postJson: (url, params) => {
        return axios.post(url, params, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    },
    postForm: (url, params) => {
        const formData = new FormData();
        Object.keys(params).map((key) => {
            formData.append(key, params[key]);
        });
        return axios.post(url, formData)
    },
    postFile: (url, params) => {
        return axios({
            method: "POST",
            url: url,
            data: params,
            responseType: "blob",
        })
    },
   getFile: (url, params) => {
        return axios({
            method: "GET",
            url: url,
            params: params,
            responseType:'blob'
        })
    },
    put: (url, params) => {
        return axios.put(url, params)
    },
    delete: (url, params) => {
        return axios.delete(url, {
                data: params
            })
    }
}
export default request

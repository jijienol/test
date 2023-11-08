import {defineStore} from 'pinia';
import message from '@/utils/message.js'
import {useRouter} from "vue-router";

const router = useRouter()
export const permissionStore = defineStore('$XWperm', {
    state: () => ({
        token: '',
        userInfo: {
            jtiid: '',
            username: '',
            officeSn: '',
            roleList: '',
            isFormal: 0,
            logo:''
        },
        network: '', // 0 内网 1 外网
        NewMessage:null,
        messageList:[],
        messageListTotal:0
    }),
    getters: {
        isAdmin: (state) => {
            if(state.userInfo.roleList.includes('admin')) {
                return true
            } else {
                return false
            }
        },
        isCnfj: (state) => {

            // return true
            if(state.userInfo.officeSn == null) {
                return false
            }
            if(state.userInfo.roleList.includes('admin')) {
                return true
            } else {
                if(state.userInfo.officeSn.slice(0, 3) == '102') {
                    return true
                } else {
                    return false
                }
            }

        },
        sfCaseFLag: (state) => { // 是否测试案例只有左奇一个人能用
            return state.userInfo.username == '左奇'
        },
        userId: (state) => {
            return state.userInfo.jtiid
        },
        networkType(state) {// 内网0外网1
            return state.network == 0 ? true : false
        },
       cantDeep(state) { //内网帐号无法进深入侦查页
           if(state.userInfo.roleList.includes('admin')) {
                    return false
                } else {
                    if(state.network == 1) {
                        if(state.userInfo.isFormal == 1 ) {
                            return true
                        } else {
                            return false
                        }
                    }else {
                        return false
                    }

                }


        }
    },
    persist: {
        enabled: true,
        strategies: [
            {storage: localStorage, paths: ['token', 'userInfo', 'network','NewMessage']}
        ]
    },
    actions: {
        init() {
            let local = localStorage.getItem('$XWperm')
            if(local) {
                let data = JSON.parse(local)
                if(data.token && data.userInfo) {
                    for(let k in data) {
                        this[k] = data[k]
                    }
                    return true
                } else {
                    return false
                }

            } else {
                return false
            }
        },
        setUserPermission(data) {
            this.token = data.token;
            this.userInfo = {
                jtiid: data.jtiid,
                username: data.username,
                officeSn: data.officeSn,
                roleList: data.roleList,
                isFormal: data.isFormal,
                logo:data.logo
            }
        },
        setNetwork(val) {
            this.network = val
        },
        removeToken() {
            this.token = undefined
        },
        logout(data) {
            if(data) {
                if(data.code == 205) {
                    message.error(data.message)
                    window.location.replace('/login')

                } else {
                    window.location.replace('/login')
                }

            } else {
                window.location.replace('/login')
            }

        }
    }
})

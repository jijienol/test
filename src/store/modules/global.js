import {defineStore} from 'pinia';
// 全局状态存储，如主题、侧边栏展开状态、drawer和弹窗高度、位置等
export const globalStore = defineStore('$XWGlobal', {
  state: () => ({
    popupHeight: 0,
    popupVisible: false,// 任务卡片详情drawer
    detectSideCollapse: false,// 侦查页左侧边栏
    isDetect: false,// 是否在侦查页
    blDrawer: false, // 笔录Drawer
    bl: false
  }),
  getters: {
    // env: (state) => {
    // 	return process.env
    // }
    
    env: (state) => {
      let address = window.location.hostname
      //本地打开
      if (address == '192.168.2.24') {
        
        address = '39.101.70.40'
      }
      console.log({
        api: address == '39.101.70.40' ? `http://${address}:6888/jdetect` : `http://${address}:8089/jdetect`,
        fileUrl: `http://${address}:6888/upload`,
        zipUrl: `http://${address}:6888/zip`,
        undozipUrl: `http://${address}:6888/undozip`,
        preview: `http://${address}:8012`
      })
      return {
        api: address == '39.101.70.40' ? `http://${address}:6888/jdetect` : `http://${address}:8089/jdetect`,
        fileUrl: `http://${address}:6888/upload`,
        zipUrl: `http://${address}:6888/zip`,
        undozipUrl: `http://${address}:6888/undozip`,
        preview: `http://${address}:8012`
      }
    }
    
  },
  persist: {
    enabled: true,
    strategies: [{
      storage: sessionStorage,
      paths: ['popupHeight', 'detectSideCollapse', 'isDetect']
    }]
  },
  actions: {
    setBlShow (flag) { // 笔录显示隐藏
      this.blDrawer = flag
    },
    setPopupHeight (height) {
      this.popupHeight = height
    },
    setDetectState () {
      this.isDetect = true
    },
    
  }
})

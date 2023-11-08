// 在线预览文件如.docx .xls等


import {Base64} from 'js-base64'


let address = window.location.hostname
if (address == '192.168.2.24') {
  address = '39.101.1.212'
}
export default {
  src (fileSrc) { // fileLink文件地址
    const online = `http://${address}:8012` + '/onlinePreview?url='
    // console.log(online);
    // const online = 'http://39.101.70.40:8012/onlinePreview?url='
    // const online = 'onlinePreview?url='
    if (fileSrc) {
      // console.log(fileSrc)
      return online + encodeURIComponent(Base64.encode(fileSrc))
    } else {
      return ''
    }
  }
}

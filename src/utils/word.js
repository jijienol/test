// 基于docx、doc文件模板的导出
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import JSZipUtils from 'jszip-utils'

import ImageModule from 'docxtemplater-image-module-free'
// const ImageModule = require('docxtemplater-image-module-free')
// const ImageModule = import.meta.glob('docxtemplater-image-module-free')
export default {
  loadImage (url) {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement('canvas')
      let ctx = canvas.getContext('2d')
      let img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        canvas.height = img.height
        canvas.width = img.width
        ctx.drawImage(img, 0, 0)
        let dataURL = canvas.toDataURL('image/png')
        resolve(dataURL)
        canvas = null
      }
      img.onerror = reject
      img.src = url
    })
  },
  base64DataURLToArrayBuffer(dataURL) {
    const base64Regex = /^data:image\/(png|jpg|svg|svg\+xml);base64,/;
    if (!base64Regex.test(dataURL)) {
      return false;
    }
    const stringBase64 = dataURL.replace(base64Regex, "");
    let binaryString;
    if (typeof window !== "undefined") {
      binaryString = window.atob(stringBase64);
    } else {
      binaryString = new Buffer(stringBase64, "base64").toString("binary");
    }
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      const ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes.buffer;
  },
  exportWord (filePath, docContent, fileName, successCallback, errorCallback) {

    let _this = this
    const imageOpts = {
      centered: false,
      getImage: function (tagValue, tagName) {
        /*return new Promise(function (resolve, reject) {
          resolve(_this.base64DataURLToArrayBuffer(tagValue))
        });*/

        // console.log(fs.readFileSync(tagValue));
        // return fs.readFileSync(tagValue);

        /* _this.loadImage(tagValue).then(res => {
          return res
        }) */
        // return _this.loadImage(tagValue)
          return _this.base64DataURLToArrayBuffer(tagValue);

      },
      getSize: function (img, tagValue, tagName) {
        // it also is possible to return a size in centimeters, like this : return [ "2cm", "3cm" ];
        // return [40, 40]
        if(tagName == 'image') {
          return [40, 40]
        } else if(tagName == 'src') {
          return [200, 360]
        } else {
          return [40, 40]
        }
      }
    }
    const tagParser = function(tag){
      // tag = tag.replace(/^\.$/,"this").replace(/('|')/g, "'").replace(/(“|")/g,'"')
      // const expr = expressions .compile(tag);

    }
    JSZipUtils.getBinaryContent(filePath, (error, content) => {
      // console.log(content);
      if(!content) return false
      if (error) {
        if (errorCallback) errorCallback()
        throw error
      }
      let zip = new JSZip(content)// 必须传入content否则会报错
      // let doc = new Docxtemplater().attachModule(new ImageModule(imageOpts)).loadZip
      let imageModule = new ImageModule(imageOpts);
      let doc = new Docxtemplater().loadZip(zip).setOptions({
        nullGetter: function () { //去除未定义值所显示的undefined
          return "";
        },
        /*parser: function(tag) { // 格式化tag
          return tag
        }*/
      }).attachModule(imageModule).setData(docContent)
      /*const doc = new Docxtemplater(zip, {
        modules: [new ImageModule(imageOpts)]// 这种写法不起作用，module没加上去,还是要用方法attachModule
      }).setData(docContent)*/
      // console.log(doc);
      try {
        // 用模板变量的值替换所有模板变量
        doc.render({})
      } catch (error) {

        // 抛出异常
        let e = {
          message: error.message,
          name: error.name,
          stack: error.stack,
          properties: error.properties
        }
        console.log('createWord error', JSON.stringify({ error: e }))
        if (errorCallback) errorCallback()
        throw error
      }
      // 生成一个代表docxtemplater对象的zip文件（不是一个真实的文件，而是在内存中的表示）
      let out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      // 将目标文件对象保存为目标类型的文件，并命名
      saveAs(out, fileName)
      if (successCallback) successCallback()
    })
  }
}

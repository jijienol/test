import JSZip from 'jszip3'
import { saveAs } from 'file-saver'
export default {
    initZip() {
        return new JSZip()
    },
    zipFile(zip, fileName, data) { // fileName需加上后缀 .json
        zip.file(fileName, data, { binary: false })
    },
    zipFolder(zip, folderName) {
        return zip.folder(folderName)
    },
    zipFolderBlob(folder,fileName, blob) {
        folder.file(fileName, blob, { binary: false })
    },
    zipGenerateAsync(zip, fileName, okCall, errCall) { //fileName需加上后缀 .zip
        zip.generateAsync({ type: 'blob' }).then((content) => {
            // 生成二进制流
            saveAs.saveAs(content, fileName) // 利用file-saver保存文件
            if(okCall) okCall()
        }).catch(() => {
            if(errCall) errCall()
        })
    },
    loadZip(file) {
        const zipO = this.initZip()
        const blob = new Blob([file], {type: 'application/zip'});
        return new Promise((resolve, reject) => {
            zipO.loadAsync(blob).then(function (zip) {
                // console.log('Zip file loaded successfully!');
                // 你的代码可以在这里访问Zip文件中的内容
                resolve(zip.files)
                /* 在loadAsync方法的回调函数中，可以使用JSZip实例提供的API来访问Zip文件中的内容。例如，你可以使用file方法获取指定文件的内容
                * const fileContent = await zip.file('filename.txt').async('string');
                * */
            }).catch(function (error) {
                reject(error)
                    // console.log('Error while loading zip file:', error);
                });
        })
    },
    async loadZipSync(file) {
        const zipO = this.initZip()
        const blob = new Blob([file], {type: 'application/zip'});
        const fileContent = await zipO.loadAsync(blob).then(function (zip) {
            return zip.files
        }).catch(function (error) {
            return ''
        })
        return fileContent
    }
}
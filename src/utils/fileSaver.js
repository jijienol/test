import {saveAs} from 'file-saver'

export const save = (fileName, url) => {
  console.log(fileName)
  saveAs.saveAs(url, fileName)
}
export const saveBlob = (fileStream, fileName) => {
  const blob = new Blob([fileStream])		// fileStream 是文件流，一般从后台获取
  saveAs.saveAs(blob, fileName)					// fileName 保存文件的名称，需要带后缀
}
export const download = (fileName, url) => {
  // 创建一个XMLHttpRequest对象
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  
  // 当下载完成时，创建一个临时链接并模拟点击以下载该文件
  xhr.onload = function () {
    if (xhr.status === 200) {
      const blob = xhr.response;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.dispatchEvent(new MouseEvent('click'));
    }
  };
  // 发送请求以开始下载文件
  xhr.send();
}

function downloadTxtFile (url, name) {
  fetch(url)
    .then(response => response.text())
    .then(data => {
      var element = document.createElement('a');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.href = URL.createObjectURL(new Blob([data], {type: 'text/plain'}));
      element.download = name;
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    })
    .catch(error => {
      console.error('下载文件时出错:', error);
    });
}

export default {
  save,
  download,
  saveBlob,
  downloadTxtFile
}

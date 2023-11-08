export function urlToBlob(url, callback) {
    // 创建一个XMLHttpRequest对象
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';

    // 当下载完成时，创建一个临时链接并模拟点击以下载该文件
    xhr.onload = function() {
        if (xhr.status === 200) {
            const blob = xhr.response;
            console.log(blob);
            const blob2 = new Blob([blob], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
            console.log(blob2);
            if(callback) callback(blob)
        }
    };

    // 发送请求以开始下载文件
    xhr.send();
}
export function urlToBlob2(url, callback) { // useless
    fetch(url)
        .then(response => {
            // callback(response.blob())
            return response.blob();
            // console.log(response.blob())
        })
        .then(blob => {
            // 处理Blob对象
            console.log('blob:', blob);

        })
        .catch(error => {
            // 处理错误
        });
}
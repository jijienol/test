export const formatUrl = (str) => { // 格式化url去掉参数和前缀
    let index = str.indexOf('//')
    let noPre;
    if (index > -1) {
        noPre = str.slice(index + 2)
    } else {
        noPre = str
    }
    if(noPre.indexOf('?')!= -1) {
        noPre = noPre.split("?")[0]
    }
    let lastIndex = noPre.lastIndexOf('/')
    if(lastIndex!= -1) {
        // console.log(lastIndex);
        noPre = noPre.slice(0, lastIndex)
    }
    return noPre
}
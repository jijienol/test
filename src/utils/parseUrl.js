export const getUrlData = (str) => {
    let row = str.split('?')[1]
    let param = row.split('&')
    let obj = {}
    for (let i = 0; i < param.length; i++) {
        let g = param[i].split('=')
        obj[g[0]] = g[1]
    }
    console.log(obj)
    return obj
}

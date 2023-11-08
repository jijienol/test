export const reg_ip = (val) => {
    const re = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[0-9])\.((1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.){2}(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/
    return re.test(val)
}
export const reg_mac = (val) => {
    const re = /(([a-f0-9]{2}:)|([a-f0-9]{2}-)){5}[a-f0-9]{2}/gi
    return re.test(val)
}

export const reg_url = (val) => {
    // const re = /^((?:(?:https?|ftp):\/\/)|(?:www\.|(?:\S+\.)+\S+\/))(?:\S+(?::\S*)?@)?(?:\S+(?:\.\S+)+(?:\:\d+)?)(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?$/
    const re = /^((https?|ftp):\/\/)?(([0-9]{1,3}\.){3}[0-9]{1,3}|[^\s\/$.?#].[^\s]*)?(:\d+)?(\/[^\s]*)?(\/)?([?][^\s]*)?$/i
    return re.test(val)
}
export const reg_phone = (val) => {
    if(val.length == 11 && !isNaN(val)) {
        return true
    } else {
        return false
    }
}
// 非中文和特殊字符
export const reg_caseno = (val) => {
    const regex = /^[0-9a-zA-Z]+$/
    return regex.test(val);
}

// 金额
export const reg_money = (val) => {
    const reg = /^([1-9]\d{0,9}|0)(\.\d{1,2})?$/
    return reg.test(val)
}
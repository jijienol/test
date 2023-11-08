import { Message } from 'view-ui-plus'
const success = (text, duration) => {
    Message.success({
        content: text || '成功',
        duration: duration || 5,
        background: true,
        closable: true
    });
}
const error = (text, duration) => {
    Message.error({
        content: text || '错误',
        duration: duration || 5,
        background: true,
        closable: true
    });
}
const info = (text, duration) => {
    Message.info({
        content: text || '提示',
        duration: duration || 5,
        background: true,
        closable: true
    });
}
const warning = (text, duration) => {
    Message.warning({
        content: text || '警告',
        duration: duration || 5,
        background: true,
        closable: true
    });
}

export default {
    success,
    error,
    info,
    warning
}


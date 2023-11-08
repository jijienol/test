//时间戳转换

import moment from "moment";
export const $moment = {
    formatTimestampToDate(timestamp, format) { // timestamp 毫秒级时间戳
        format = format || 'YYYY-MM-DD'
        if(timestamp) {
            return moment(timestamp).format(format)
        } else {
            return ''
        }
    },
    getCurrentTimestamp () {
        return moment.valueOf()
    },
    formatDateToTimestamp(ymdstr) {
        ymdstr = ymdstr || '2022-03-27 00:00:00'
        return {
            unix: moment(ymdstr).unix(),
            stamp: moment(ymdstr).valueOf()
        }
    },
    getDateByDays(dayCount, format) { // 获取几天之前的日期
        dayCount = dayCount || 0;
        format = format || 'YYYY-MM-DD'
        return moment().subtract(dayCount, 'days').format(format)
    },
    diffDaysByStamp(startStamp, endStamp) { // 两个日期相差的天数
        let _end = moment(endStamp);
        let _start = moment(startStamp)
        let years = _end.diff(_start, 'years')
        let months = _end.diff(_start, 'months')
        let days = _end.diff(_start, 'days')
        let hours = _end.diff(_start, 'hours')
        return { year: years, month: months, day: days ,hours: hours}
    }

}

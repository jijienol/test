function noteTableInfo (contextLine, tableColumn, tableInfoMapObj) {
  const arr = []
  arr.push({ id: contextLine.id ? contextLine.id : contextLine.ID }, { key: '表名', value: tableInfoMapObj[tableColumn[0].targetTable] ? tableInfoMapObj[tableColumn[0].targetTable] : tableInfoMapObj })
  tableColumn.forEach(item => {
    let key = item.title
    let value = contextLine[item.key]
    if (value) {
      if (value.length > 0) {
        arr.push({ key: key, value: value })
      }
    }
  })
  return arr
}

//手机号码正则
function validatePhoneNumber(phoneNumber) {
  const regExp = /^1[3-9]\d{9}$/;
  return regExp.test(phoneNumber);
}

//身份证正则
function validateIdNumber(idNumber) {
  const regExp = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]$/;
  return regExp.test(idNumber);
}
export {
  noteTableInfo,validatePhoneNumber,validateIdNumber
}

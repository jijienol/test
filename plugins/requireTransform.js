// 参数：需要处理的第三方插件文件名或者项目内某文件名
export const transformRequireDynamic = (includes = []) => {
    return {
        name: 'transformRequireDynamic',
        apply: 'serve',
        transform(code, id) {
            let result = code
            if (includes.some(item => id.includes(item))) {
                result = transform__require_function(code, id)
            }

            return {
                code: result,
                map: null,
                warnings: null
            }
        }
    }
}

/**
 * 替换第三方插件里面的 __require() 方法
 * @param {*} code
 * @param {*} id
 * @returns
 */
const transform__require_function = function(code, id) {
    if (!/\/node_modules\//g.test(id)) return code

    const requireRegex = /_{2}require*\(\s*(["'].*["'])\s*\)/g
    const IMPORT_STRING_PREFIX = '__require_for_vite'
    const requireMatches = code.matchAll(requireRegex)
    let importsString = ''
    let packageName = ''
    let replaced = false
    for (const item of requireMatches) {
        if (!isString(item[1])) {
            console.warn(`Not supported dynamic import, file:${id}`)
            continue
        }
        replaced = true
        packageName = `${IMPORT_STRING_PREFIX}_${randomString(6)}`
        importsString += `import ${packageName} from ${item[1]};\n`
        code = code.replace(item[0], `${packageName}`)
    }
    if (replaced) {
        code = importsString + code
    }
    return code
}

/**
 *
 * @param {必填，数字} length
 * @returns hash串
 */
function randomString(length) {
    const code = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    let result = ''
    for (let index = 0; index < length; index++) {
        result += code[Math.floor(Math.random() * code.length)]
    }
    return result
}
function isString(text) {
    try {
        // return typeof eval(text) === 'string'
        return typeof text === 'string'
    } catch (err) {
        return false
    }
}
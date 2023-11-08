import CryptoJS from 'crypto-js'
// 定义密钥
const KEY_0 = '1234123412ABCDEF'
const ENC_KEY_HEX_LOGIN = 'Axs5T1lhIB8='
const ENC_IV_HEX_LOGIN = 'XBsfGUJhISo='
const LATIN_KEY_HEX = 'lw-admin'
const LATIN_IV_HEX = '1qaz@wsx+-9873245'

export default {
    encrypt(data) {
        let key = CryptoJS.enc.Base64.parse(ENC_KEY_HEX_LOGIN)
        let iv = CryptoJS.enc.Base64.parse(ENC_IV_HEX_LOGIN)
        let encJson = CryptoJS.DES.encrypt(data, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        })
        return encJson.toString()
    },
    decrypt(data) {
        var keyHex = CryptoJS.enc.Base64.parse(ENC_KEY_HEX_LOGIN)
        var ivHex = CryptoJS.enc.Base64.parse(ENC_IV_HEX_LOGIN)
        var decrypted = CryptoJS.DES.decrypt({
            ciphertext: CryptoJS.enc.Base64.parse(data)
        }, keyHex, {
            iv: ivHex,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        })
        return decrypted.toString(CryptoJS.enc.Utf8)
    },
    encrypt_aes(data) {
        let key = CryptoJS.enc.Latin1.parse(LATIN_KEY_HEX)
        let iv = CryptoJS.enc.Latin1.parse(LATIN_IV_HEX)
        const srcs = CryptoJS.enc.Utf8.parse(data);
        const encrypted = CryptoJS.AES.encrypt(srcs, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        });
        return encrypted.toString();
    },
    decrypt_aes(encrypted) {
        let key = CryptoJS.enc.Latin1.parse(LATIN_KEY_HEX)
        let iv = CryptoJS.enc.Latin1.parse(LATIN_IV_HEX)
        const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    },
    encryptBase64(data) {
        let key = CryptoJS.enc.Latin1.parse(LATIN_KEY_HEX)
        let iv = CryptoJS.enc.Latin1.parse(LATIN_IV_HEX)
        let encJson = CryptoJS.AES.encrypt(JSON.stringify(data), key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        }).toString();
        return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
    },
    decryptBase64(data) {
        let key = CryptoJS.enc.Latin1.parse(LATIN_KEY_HEX)
        let iv = CryptoJS.enc.Latin1.parse(LATIN_IV_HEX)
        let decData = CryptoJS.enc.Base64.parse(data).toString(CryptoJS.enc.Utf8);
        //解密数据
        return CryptoJS.AES.decrypt(decData, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        }).toString(CryptoJS.enc.Utf8);
    }
}
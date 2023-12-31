// 16进制转rgba
export function hexToRgba(hex, alpha) {
    var color = hex.toLowerCase();

    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (reg.test(color)) {
        // 如果只有三位的值，需变成六位，如：#fff => #ffffff
        if (color.length === 4) {
            var colorNew = "#";
            for (var i = 1; i < 4; i += 1) {
                colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
            }
            color = colorNew;
        }
        // 处理六位的颜色值，转为RGB
        var colorChange = [];
        for (var i = 1; i < 7; i += 2) {
            colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
        }
        if(alpha!=null && alpha != undefined) {
            return "rgba(" + colorChange.join(",") + ',' + alpha + ")";
        } else {
            return "rgb(" + colorChange.join(",") + ")";

        }
    } else {
        return color;
    }
}

export function rgbToHex() {

}
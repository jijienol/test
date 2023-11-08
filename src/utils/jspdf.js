import JsPDF from "jspdf";
// import html2canvas from "html2canvas";
// page的boxsizing设为content-box

//初侦报告导出pdf

export function exportPdf(dpi, ele, fileName, callback) {

  html2canvas((ele), {
    height: ele.scrollHeight,//
    width: ele.clientWidth,//scrollWidth
    scale: 2,// pixel ratio
    dpi: dpi || '96',
    useCORS: true,
    allowTaint: false,
    // backgroundColor: null,
    // logging: true
  }).then(function(canvas) {
    // canvas.style.width = canvas.width * 2 + 'px'
    // canvas.style.height = canvas.height * 2 + 'px'
    var contentWidth = canvas.width;
    var contentHeight = canvas.height;
    // console.log(contentWidth);
    // console.log(contentHeight);
    //一页pdf显示html页面生成的canvas高度;
    var pageHeight = contentWidth / 592.28 * 841.89;
    //未生成pdf的html页面高度
    var leftHeight = contentHeight;
    //页面偏移
    var position = 0;
    //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
    var imgWidth = 595.28;
    var imgHeight = 592.28/contentWidth * contentHeight;
    // canvas.getContext('2d').scale(0.5,0.5)
    //  canvas.getContext("2d").font = "40px Arial"
    var pageData = canvas.toDataURL('image/jpeg', 1.0);

    var pdf = new JsPDF('', 'pt', 'a4');

    //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
    //当内容未超过pdf一页显示的范围，无需分页
    if (leftHeight < pageHeight) {
      pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight );
    } else {
      while(leftHeight > 0) {
        pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
        leftHeight -= pageHeight;
        position -= 841.89;
        //避免添加空白页
        if(leftHeight > 0) {
          pdf.addPage();
        }
      }
    }

    pdf.save(fileName + '.pdf');
    if(callback) {
      setTimeout(() => {
        callback()
      }, 500)
    }

  })
}

export function exportImage(ele, fileName, callback) {

  html2canvas((ele), {
    height: ele.scrollHeight,//
    width: ele.clientWidth,//scrollWidth
    scale: 2,// pixel ratio
    dpi: '96',
    useCORS: true,
    allowTaint: false,
    // backgroundColor: null,
    // logging: true
  }).then(function(canvas){
    var imgUrl = canvas.toDataURL('image/jpeg', 1.0);
    // console.log(imgUrl);
    // const image = document.createElement('img')
    /*const a = document.createElement('a')
    a.href = imgUrl
    // a.download 后面的内容为自定义图片的名称
    a.download = fileName + '.jpeg'
    a.click()*/
    if(callback) callback(imgUrl)
  })
}


/**

 * 将svg导出成图片

 * @param node svg节点 => document.querySelector('svg')

 * @param name 生成的图片名称

 * @param width 生成的图片宽度

 * @param height 生成的图片高度

 * @param type 生成的图片类型

 */

export const covertSVG2Image = (node, name, width, height, type = 'png') => {

  let serializer = new XMLSerializer()

  let source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(node)

  let image = new Image()

  image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)

  let canvas = document.createElement('canvas')

  canvas.width = width

  canvas.height = height

  let context = canvas.getContext('2d')

  context.fillStyle = '#fff'

  context.fillRect(0, 0, 10000, 10000)

  image.onload = function () {

    context.drawImage(image, 0, 0)

    let a = document.createElement('a')

    a.download = `${name}.${type}`

    a.href = canvas.toDataURL(`image/${type}`)

    a.click()

  }

}




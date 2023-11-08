export default {
    mounted (my_el) {
        // console.log(my_el);
        let el = my_el.querySelector('div.ivu-table-body')
        el.style.cursor = 'grab'
        el.onmousedown = function (event) {
            // console.log(event);
            let gapX = event.clientX
            let startX = el.scrollLeft
            document.onmousemove = function (e) {
                let x = e.clientX - gapX
                el.scrollLeft = startX - x
                return false
            }
            document.onmouseup = function (e) {
                e.stopPropagation()
                document.onmousemove = null
                document.onmouseup = null
            }
        }
    }
}
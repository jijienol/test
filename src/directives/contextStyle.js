export default { // 修改iview dropdown的样式
    mounted(el){
        let parentEl = el.parentNode.parentNode
        if(parentEl && parentEl.classList.contains('ivu-select-dropdown')) {
            parentEl.style.maxHeight = 'initial'
            parentEl.style.overflow = 'visible'
        }
    }
}
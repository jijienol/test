import { globalStore } from '@/store/modules/global.js';
import {clientH} from "@/utils/vueuse.js";
let g = globalStore();
let Height;
export default {
    mounted(el, binding){
        let current = el; //当前元素
        let targetDiv = document.querySelector(binding.value.name)
        current.onmousedown = function(e){
            //鼠标按下
            document.onmousemove = function(e){
                let th = document.body.clientHeight - e.clientY
                if(th ==0 || th < 10) {
                    targetDiv.style.height = 10 + "px";
                    return false
                } else if (th >= clientH.value){
                    th = clientH.value
                }
                /*if(th < 100){
                    th = 100
                } else if(th >= clientH.value) {
                    th = clientH.value
                }*/
                targetDiv.style.height = th + "px";
                Height = th

            }
            document.onmouseup = function(e){
                document.onmousemove = null;
                document.onmouseup = null;
                g.setPopupHeight(Height) // 移动距离大于50，避免双击触发

            };
            return false;
        };
    }
}




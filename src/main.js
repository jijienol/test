import { createApp } from 'vue'
import '@/style.css'
import App from '@/App.vue'
import router from "@/router";
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'
import "@/assets/icon/iconfont.css"
import _ from 'lodash'
// 对view-ui-plus的message进行二次封装
import messagebox from '@/utils/message'
import piniaStore from "./store/index.js";
import eventBus from 'vue3-eventbus'
import attachmentModule from '@wangeditor/plugin-upload-attachment'
import {Boot} from '@wangeditor/editor'

//修改logo
export function changeIconTitle(src) {
    const changeFavicon = link => {
        let $favicon = document.querySelector('link[rel="icon"]');
        if ($favicon !== null) {
            $favicon.href = link;
        } else {
            $favicon = document.createElement("link");
            $favicon.rel = "icon";
            $favicon.href = link;
            document.head.appendChild($favicon);
        }
    };
    let iconUrl = src; // 图片地址
    changeFavicon(iconUrl); // 动态修改网站图标
    // let title = "123"; // 网站标题
    // document.title = title; // 动态修改网站标题
}

Boot.registerModule(attachmentModule)
const app = createApp(App)





app.config.globalProperties.$Message = messagebox
app.config.globalProperties.$lodash = _
app.use(piniaStore).use(router).use(eventBus).use(ViewUIPlus).mount('#app')

<script setup>
import {onMounted} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader"
import { shallowRef } from '@vue/reactivity'
const map = shallowRef(null);
function ininMap(){
  AMapLoader.load({
    key:'2785cd94e6be15ea7e11d4a6232a1269',  //设置您的key
    version:"2.0",
    plugins:['AMap.ToolBar','AMap.Driving'],
    AMapUI:{
      version:"1.1",
      plugins:[],

    },
    Loca:{
      version:"2.0.0"
    },
  }).then((AMap)=>{
    map.value = new AMap.Map("container",{
      viewMode:"3D",
      zoom:5,
      zooms:[2,22],
      center:[105.602725,37.076636],
    });
    let positionArr = [
      [113.357224,34.977186],
      [114.555528,37.727903],
      [112.106257,36.962733],
      [109.830097,31.859027],
      [116.449181,39.98614],
    ];
    for(let item of positionArr){
      let marker = new AMap.Marker({
        position:[item[0],item[1]],
      });
      console.log(map.value);
      // this.map.add(marker);
    }


  }).catch(e=>{
    console.log(e);
  })
}

onMounted(() => {
  // ininMap()
})
</script>
<template>
<div class="main">
  <div id="container"></div>
</div>
</template>
<style scoped lang="less">
.main{
  height: 100%;
  width: 100%;
  padding: 0px;
  margin: 0px;
  position: relative;
}
#container {
  height: 100%;
  width: 100%;
  padding: 0px;
  margin: 0px;
}
</style>
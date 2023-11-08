<script setup>
import {ref, reactive, computed, watch} from "vue";
import moment from 'moment'
const props = defineProps ({
  info: {},
  columns: []
})
// 需要展示的字段
const virKeys = {
  title:'虚拟身份',
  keys: ['age', 'name', 'job', 'gender']
}
const userKeys = {
  title:'人员画像',
  keys: ['workAddress', 'homeAddress', 'country', 'country', 'country', 'country', 'country', 'village', 'road', 'address']
  
}
const phoneKeys = {
  title:'手机信息',
  keys: ['terminalType', 'deviceModel', 'version', 'deviceTag', 'phone', 'imei', 'imsi', 'mac', 'coordinate', 'gdcoordinate', 'createdTime'] // BRAND
}
const IpKeys = {
  title:'IP信息',
  keys:['ip', 'qcell', 'itime']
}
const userInfo = reactive({
  columns: props.columns,
  info: props.info,
  
})
/*watch(() => userInfo, (n) => {
 console.log(n);
 }, {immediate: true})*/

function setUserInfo (k) {
  let data = props.info
  if (!data) {
    return ''
  } else {
    // console.log(Object.keys(this.userInfoData).length);
    if (k === 'createdTime') {
      data[k] = moment(data[k]).format('YYYY-MM-DD hh:MM:ss')
      return data[k]
    } else if (k === 'itime') {
      data[k] = moment(data[k]).format('YYYY-MM-DD hh:MM:ss')
      return data[k]
    } else if(k == 'deviceTag') {
      
      return data[k] ? data[k].split(',') : null
    } else {
      return data[k] ? data[k] : ''
      // return data[k]
    }
  }
}
</script>
<template>
  <!--      <p class="title-label">人员画像</p>-->
  <div class="person-info-con">
    <Card dis-hover :bordered="false">
      <div class="icon-card"><Icon type="md-contact" size="18" color="#999"/>{{userKeys.title}}</div>
      <div v-for="(col, i) in props.columns" :key="i">
        <template v-if="userKeys.keys.includes(col.key)">
          <span class="label">{{ col.title }}：</span>
          <span class="value">{{ setUserInfo(col.key) }}</span>
          <div class="tags__wrapper" v-if="'deviceTag' == col.key">
            <Tag v-for="(tag, index) in setUserInfo(col.key)" :key="index">{{ tag }}</Tag>
          </div>
          <span v-else-if="col.key == 'deviceModel'" class="value">
                <template>{{ setUserInfo('brand') }}&nbsp;&nbsp;{{
                    setUserInfo('deviceModel')
                  }}</template></span>
          <span v-else-if="col.key == 'homeAddress'">
                <template
                  v-if="setUserInfo('homeAddress')">
                </template>
              </span>
          <span v-else-if="col.key == 'workAddress'">
                <template
                  v-if="setUserInfo('workAddress')">
                  </template>
              </span>
        </template>
        
      </div>
      <div class="icon-card"><Icon type="md-phone-portrait" size="18" color="#999"/>{{phoneKeys.title}}</div>
      <div v-for="(col, i) in props.columns" :key="i">
        <template v-if="phoneKeys.keys.includes(col.key)">
          <span class="label">{{ col.title }}：</span>
          <span class="value">{{ setUserInfo(col.key) }}</span>
        
        </template>
      </div>
      <div class="icon-card"><Icon type="md-chatboxes" size="18" color="#999"/>{{virKeys.title}}</div>
      <div v-for="(col, i) in props.columns" :key="i">
        <template v-if="virKeys.keys.includes(col.key)">
          <span class="label">{{ col.title }}：</span>
          <span class="value">{{ setUserInfo(col.key) }}</span>
        
        </template>
      </div>
      <div class="icon-card"><Icon type="md-pin" size="18" color="#999"/>{{IpKeys.title}}</div>
      <div v-for="(col, i) in props.columns" :key="i">
        <template v-if="IpKeys.keys.includes(col.key)">
          <span class="label">{{ col.title }}：</span>
          <span class="value">{{ setUserInfo(col.key) }}</span>
        </template>
      </div>
    </Card>
  </div>
</template>
<style scoped lang="less">
.person-info-con {
}
.icon-card {
  color: #999;
  .ivu-icon {
    margin-right: 4px;
  }
}
</style>

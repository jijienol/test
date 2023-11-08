<script setup>

import {computed, defineProps} from 'vue'

const a = defineProps(['url'])

const url = computed(()=>a.url)
console.log(url.value)
</script>

<template>
  <div v-if="url" class="box zym">
    <div class="title1">
      <span style="font-size: 20px;color: #515A6E;font-weight: 600;">主域名服务器</span>
    </div>
    <div class="BG">
      <p>备案信息</p>
      <Row>
        <Col span="3" class="zymBG th">主域名</Col>
        <Col span="9" class="zymBG tb">{{url.webUrl}}</Col>
        <Col span="3" class="zymBG th">负责人</Col>
        <Col span="9" class="zymBG tb">{{url.owner}}</Col>
        <Col span="3" class="zymBG th">备案号</Col>
        <Col span="9" class="zymBG tb">{{url.siteLicense}}</Col>
        <Col span="3" class="zymBG th">网站名称</Col>
        <Col span="9" class="zymBG tb">{{url.createdName}}</Col>
        <Col span="3" class="zymBG th">公司名称</Col>
        <Col span="21" class="zymBG tb">{{url.companyName}}</Col>
      </Row>
    </div>
    <div class="BG">
      <p>注册域名信息</p>
      <Row>
        <Col span="3" class="zymBG th">主域名</Col>
        <Col span="21" class="zymBG tb">{{url.webUrl}}</Col>
        <Col span="3" class="zymBG th">创建时间</Col>
        <Col span="9" class="zymBG tb">{{url.creationDate}}</Col>
        <Col span="3" class="zymBG th">过期时间</Col>
        <Col span="9" class="zymBG tb">{{url.expirationDate}}</Col>
        <Col span="3" class="zymBG th">域名状态</Col>
        <Col span="9" class="zymBG tb">{{url.domainStatus}}</Col>
        <Col span="3" class="zymBG th">whois服务器</Col>
        <Col span="9" class="zymBG tb">{{url.whoisServer}}</Col>
        <Col span="3" class="zymBG th">联系人邮箱</Col>
        <Col span="9" class="zymBG tb">{{url.email}}</Col>
        <Col span="3" class="zymBG th">联系人电话</Col>
        <Col span="9" class="zymBG tb">{{url.phone}}</Col>
        <Col span="3" class="zymBG th">注册地</Col>
        <Col span="9" class="zymBG tb">{{url.ipCountry }}&nbsp;&nbsp;{{url.ipProvince}}&nbsp;&nbsp;{{ url.ipCity }}&nbsp;&nbsp;{{url.ipDistrict}}</Col>
        <Col span="3" class="zymBG th">注册商</Col>
        <Col span="9" class="zymBG tb">{{url.registrar}}</Col>
        <Col span="3" class="zymBG th">DNS服务器</Col>
        <Col span="9" class="zymBG tb">{{url.dnsServer}}</Col>
        <Col span="3" class="zymBG th">DNS公司名</Col>
        <Col span="9" class="zymBG tb"></Col>
        <Col span="3" class="zymBG thRed">调证指南</Col>
        <Col span="21" class="zymBG tb" style="color: red"><span>根据主域名向注册商公司调取该城名的用户注册信息、支付信息。</span><br/>
          <span>根据主域名向DNS解析服务公司调取该城名的用户注册信息、支付信息。</span>
        </Col>
      </Row>
    </div>
    <div class="BG">
      <p>域名IP解析信息</p>
      <Row>
        <Col span="3" class="zymBG th">域名</Col>
        <Col span="9" class="zymBG tb">{{url.ipOrg}}</Col>
        <Col span="3" class="zymBG th">加速域名</Col>
        <Col span="9" class="zymBG tb"></Col>
        <Col span="3" class="zymBG th">是否加速</Col>
        <Col span="9" class="zymBG tb"></Col>
        <Col span="3" class="zymBG th">CDN加速商</Col>
        <Col span="9" class="zymBG tb"></Col>
        <Col span="3" class="zymBG th">跳转域名列表</Col>
        <Col span="21" class="zymBG tb"></Col>
        <Col span="3" class="zymBG th">ip地址列表</Col>
        <Col span="21" class="zymBG tb"></Col>
        <Col span="3" class="zymBG thRed">调证指南</Col>
        <Col span="21" class="zymBG tb" style="color: red"><span>根据CDN加速别名向加速服务商调取该别名的用户注册信息、支付信息。</span><br/>
        </Col>
      </Row>
    </div>
    <div class="BG">
      <p>IP基本信息</p>
      <Row>
        <Col span="3" class="zymBG th">IP地址</Col>
        <Col span="9" class="zymBG tb">{{url.ip}}</Col>
        <Col span="3" class="zymBG th blue">IP属性</Col>
        <Col span="9" class="zymBG tb">{{url.ipType}}</Col>
        <Col span="3" class="zymBG th ">IP归属地</Col>
        <Col span="9" class="zymBG tb"> {{url.ipCountry}}</Col>
        <Col span="3" class="zymBG th blue">IP是否境内</Col>
        <Col span="9" class="zymBG tb">{{url.ipChinaFlag?url.ipChinaFlag==1?'是':'否':'未知'}}</Col>

        <Col span="3" class="zymBG th">存活状态</Col>
        <Col span="9" class="zymBG tb">{{url.activeStatus?url.activeStatus==1?'是':'否':'未知'}}</Col>
        <Col span="3" class="zymBG th blue">二级代理商在国内</Col>
        <Col span="9" class="zymBG tb">{{url.orgChinaFlag?url.orgChinaFlag==1?'是':'否':'未知'}}</Col>
        <Col span="3" class="zymBG th">更新时间</Col>
        <Col span="9" class="zymBG tb">{{url.updateTime}}</Col>
        <Col span="3" class="zymBG th blue">是否主控域名</Col>
        <Col span="9" class="zymBG tb">{{url.masterFlag?url.masterFlag==1?'是':'否':'未知'}}</Col>
        <Col span="3" class="zymBG th">邮政编码</Col>
        <Col span="9" class="zymBG tb">{{url.ipZipCode}}</Col>
        <Col span="3" class="zymBG th">区号</Col>
        <Col span="9" class="zymBG tb">{{url.ipAreaCode}}</Col>
        <Col span="3" class="zymBG th">URL来源</Col>
        <Col span="9" class="zymBG tb">{{url.urlSource}}</Col>
        <Col span="3" class="zymBG th">URL类型</Col>
        <Col span="9" class="zymBG tb">{{url.urlType}}</Col>
        <Col span="3" class="zymBG th">IP服务商</Col>
        <Col span="9" class="zymBG tb">{{url.ipOrg}}</Col>
        <Col span="3" class="zymBG th">IP服务商是否境内</Col>
        <Col span="9" class="zymBG tb">{{url.ipChinaFlag?url.ipChinaFlag==1?'是':'否':'未知'}}</Col>
        <Col span="3" class="zymBG th">运营商</Col>
        <Col span="9" class="zymBG tb">{{url.ipIsp}}</Col>
        <Col span="3" class="zymBG th">所属机构</Col>
        <Col span="9" class="zymBG tb"></Col>
        <Col span="3" class="zymBG thRed">调证指南</Col>
        <Col span="21" class="zymBG tb" style="color: red"><span>根据ip服务商是否境内，向对应的服务商调取用户注册信息和支付信息</span><br/></Col>
      </Row>
    </div>
  </div >
</template>
<style scoped lang="less">
.box {
  padding: 40px;
  background: #F8F8F8;
  margin-bottom: 36px;
  border-radius: 10px;
  //white-space: nowrap;
  //overflow: hidden;
  //text-overflow: ellipsis;
  
  .title1 {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 20px;
  }
  
  .table1 {
    display: flex;
    align-content: center;
    justify-items: center;
    font-size: 18px;
    
    .col1 {
      display: flex;
      align-items: center;
      background: #EEEEEE;
      padding: 15px;
      border: 1px solid #D3D3D3;
      vertical-align: middle;
    }
    
    .col2 {
      display: flex;
      flex-direction: column;
      padding: 15px;
      border: 1px solid #D3D3D3;
      vertical-align: middle;
      background: #FFFFFF;
      
      .bt {
        color: rgba(0, 0, 0, 0.4);
        font-weight: 400;
      }
    }
    
    .col3 {
      display: flex;
      align-items: center;
      background: #EEEEEE;
      padding: 15px;
      border: 1px solid #D3D3D3;
      vertical-align: middle;
      justify-content: center;
    }
  }
}
.zym {
  
  font-size: 18px;
  
  .BG {
    p {
      padding-top: 20px;
      margin: 20px 0;
      font-weight: 600;
      color: #515A6E;
      line-height: 21px;
    }
    
    .zymBG {
      padding: 20px;
      border: 1px solid #D3D3D3;
      font-weight: 400;
      color: #515A6E;
      line-height: 21px;
      overflow: hidden;

    }
    
    .th {
    
    }
    .blue{
      background: #AED4FF;
    }
    .thRed{
      font-weight: 500;
      color: #FFFFFF;
      background: #D34242;
      display: flex;
      align-items: center;
    }
    .tb {
      background: #FFFFFF;
    }
  }
}
</style>

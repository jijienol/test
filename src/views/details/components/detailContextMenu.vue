<script setup>
import {computed, onMounted, reactive} from "vue";
import vContextStyle from "@/directives/contextStyle.js";
  const props = defineProps({
    type: '',// 传入线索类型
  })
  const emit = defineEmits(['callback'])
  const isIpc = computed(()=> {
    if(props.type) {
      return props.type.toLowerCase() === 'ip' ? true : false
    } else {
      return false
    }
  })
  const Data = reactive({
    bd: [
      { label: '人', value: 'people', divided: false },
      { label: '物', value: 'object', divided: false },
      // { label: '地', value: 'address', divided: false },
      // { label: '组织', value: 'org', divided: false },
    ],
    others: [
      { label: '添加笔记', value: 'note', divided: true },
      { label: '深入侦查', value: 'deep', divided: true },
      // { label: 'ipC段碰撞', value: 'ipc', divided: true }
      // { label: '碰撞池', value: 'collision', divided: true},
    ],
    collision: [{label: 'IP同环境', value: 'collision_ip',},{label: 'MAC同环境', value: 'collision_wifi',}]
  })
  const list = reactive([

    // { label: 'ipC段碰撞', value: 'ipc', divided: true },
  ])
//
function itemClick(val) {

  emit('callback', val)
}
onMounted(() => {
  /*let dom = document.querySelector('.ivu-select-dropdown.ivu-dropdown-transfer')
  console.log(dom.classList);
  dom.classList.remove(['ivu-select-dropdown'])
  dom.classList.add(['detail-context-dropdown'])*/
  // dom.className = 'ivu-select-dropdown ivu-dropdown-transferdetail-context-dropdown'
})
</script>
<template>
  <Dropdown v-context-style="" transfer>
    <DropdownMenu class="custom-menu">
      <DropdownItem v-for="(bdItem) in Data.bd" :key="'drop-' + bdItem.value" :name="bdItem.value" @click.native="itemClick(bdItem.value)">{{bdItem.label}}
        <template #list>
          <DropdownMenu>
            <DropdownItem v-for="sub in Data.collision" @click.native="itemClick(sub.value)">{{sub.label}}</DropdownItem>
          </DropdownMenu>
        </template>
      </DropdownItem>
      <DropdownItem v-for="(item) in Data.others" :key="'drop-' + item.value" :name="item.value" :divided="item.divided" @click.native="itemClick(item.value)">{{item.label}}</DropdownItem>
      <Dropdown placement="right-start">
        <DropdownItem>
          碰撞池
          <Icon type="ios-arrow-forward"></Icon>
        </DropdownItem>
        <template #list>
          <DropdownMenu>
            <DropdownItem v-for="sub in Data.collision" @click.native="itemClick(sub.value)">{{sub.label}}</DropdownItem>
          </DropdownMenu>
        </template>
      </Dropdown>
      <DropdownItem v-show="isIpc" :name="'ipc'" divided>ipC段碰撞</DropdownItem>
    </DropdownMenu>
  </Dropdown>

</template>
<style scoped lang="less">

 .custom-menu {
   background-color: #fff;
   box-shadow: 1px 1px 1px 1px rgba(211,211,211,0.3), -1px -1px 1px 1px rgba(211,211,211,0.3);
 }
</style>

<script setup>
import { onMounted, ref} from "vue";
import _ from "lodash";
const props = defineProps(['item'])


const highList = ref([])
const midList = ref([])
const lowList = ref([])
function filter() {
  let highNum = 0
  let midNum = 0
  let lowNum = 0
  // console.log(props.item);
  let highList = _.filter(props.item, o => {
    return o.level == '高'
  })
  if (highList.length) {
    highList.forEach(item => {
      if (item.hit === 1) {
        //item.hit_cn = '是'
        highNum += 1
      } else {
        //item.hit_cn = '否'
        item.hitDetail = '否'
      }
    })
  }
  highList.value = highList
  let midList = _.filter(props.item, o => {
    return o.level == '中'
  })
  if (midList.length) {
    midList.forEach(item => {
      if (item.hit === 1) {
        //item.hit_cn = '是'
        midNum += 1
      } else {
        // item.hit_cn = '否'
        item.hitDetail = '否'
      }
    })
  }
  midList.value = midList
  let lowList = _.filter(props.item, o => {
    return o.level == '低'
  })
  if (lowList.length) {
    lowList.forEach(item => {
      if (item.hit === 1) {
        // item.hit_cn = '是'
        lowNum += 1
      } else {
        // item.hit_cn = '否'
        item.hitDetail = '否'
      }
    })
  }
  lowList.value = lowList
}
onMounted(()=>{
  filter()
})
</script>
<script>
export default {
  name:"scoreTip"
}

</script>
  <template >
    <ul class="content-ul">
      <li style="font-weight: bold;"><div class="grade">等级</div> <div class="score-item">积分项</div> <div class="hit">命中</div></li>
      <li v-for="item in props.item">
        <div class="grade">
          {{item.level}}
        </div>
        <div class="score-item">
          {{item.scoreCnname}}
        </div>
        <div class="hit" :class="{'highlight': item.hit === 1}">
          {{item.hitDetail || '否'}}
        </div>
      </li>
      <li v-for="item in midList">
        <div class="grade">
          {{item.level}}
        </div>
        <div class="score-item">
          {{item.scoreCnname}}
        </div>
        <div class="hit" :class="{'highlight': item.hit === 1}">
          {{item.hitDetail || '否'}}
        </div>
      </li>
      <li v-for="item in lowList">
        <div class="grade">
          {{item.level}}
        </div>
        <div class="score-item">
          {{item.scoreCnname}}
        </div>
        <div class="hit" :class="{'highlight': item.hit === 1}">
          {{item.hitDetail || '否'}}
        </div>
      </li>
    </ul>
  </template>
<style scoped lang="less">
.main {
}
ul {
  li {
    list-style: none;
  }
}
.content-ul {
  width: 800px;
  
  li {
    display: flex;
    font-size: 14px;
    
    justify-content: space-between;
    text-align: center;
    margin-bottom: 1px;
    .grade {
      flex: 0 0 30px;
    }
    .score-item {
      flex: 0 0 200px;
    }
    .hit {
      flex: 1;
      &.highlight {
        color: red;
      }
    }
  }
}
</style>

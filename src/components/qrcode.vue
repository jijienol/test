<script setup="">
import {computed, nextTick, ref, watch} from 'vue'
  import QRCode from 'qrcodejs2-fix'

  const props = defineProps({
    id: '',
    str: '',
    text: '',
    visible: false,
    width: 46,
    height: 46,
    textStyle: {}
  })
  const Qref = ref(null)
  const id = ref('myqr')
  const instance = ref('')
  const text = computed(() => {
    return props.text
  })
const textStyle = computed(() => {
  return props.textStyle || ''
})
/*watch(() => props.id, (n) => {
  console.log(n);
})*/
  watch(() => props.str, (n, o) => {
    if(n) {
      if(n != o) {
        nextTick(() => {

            create()
            instance.value.makeCode(props.str)


        })
      }

      } else {
      if(instance.value) {
          instance.value.clear();
        }
      }
    }, {immediate: true})
  function create() {
    if(instance.value) return

    instance.value = new QRCode(Qref.value, {
        text:'',// props.str
        width: props.width || 256,
        height:props.height || 256,
        colorDark: '#111',
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      })
    instance.value.makeCode(props.str)
  }

</script>
<template>
  <div class="main">
    <div class="qrcon" :id="id" ref="Qref">

    </div>
    <div class="text" :style="textStyle">{{text}}</div>
  </div>
</template>
<style scoped>
.main {
  text-align: center;
  /*padding-top: 24px;*/
}
.qrcon {
  display: inline-block;
  border: 2px solid rgba(242, 242, 242, 0.85);
}
.text{
  text-align: center;
  margin-top: 15px;
}
</style>
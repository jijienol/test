<script setup>
import { onMounted, ref} from "vue";
import {noteStore} from "@/store/modules/note.js";
import {dictStore} from "@/store/modules/dictionary.js";
const dict = dictStore()
const note = noteStore()
// const typeList = ref(dict.dict.addressType.list)
const emits = defineEmits(['save'])
const addressForm = ref()
const addressType = ref([])
function save(){
  
  addressForm.value.validate((valid) => {
    if (valid) {
      emits('save')
    }
  })
}
let remarkValidator = (rule, value, callback) => {
  if (value === '') {
    callback();
    // rule.message = '不能为空！'
    // callback(new Error('不能为空！'));
  } else if (value.length > 500) {
    rule.message = '内容不能超过500个字!'
    callback(new Error('内容不能超过500个字!'));
  } else {
    callback();
  }
};
const formRules = ref({
  name: [{required: true, message: '名称不能为空', trigger: 'blur'}],
  remark: [{required: false, message: '名称不能为空', trigger: 'blur', validator: remarkValidator}]

})
onMounted(() => {
  dict.getDict('addressType').then(res => {
    addressType.value = res
  })
})
/*if(typeList.value.length < 1) {
  dict.getDict('addressType')
}*/

</script>
<script>
export default {
  name:"addSignAddress"
}

</script>
<template>
  <div>
    <Row>
      <Col :span="24">
        <Form
          ref="addressForm"
          :label-width="120"
          :model="note.addressForm"
          :rules="formRules"
        >
          <Row>
            <Col span="10">
              <FormItem label="名称" prop="name">
                <Input v-model="note.addressForm.name"></Input>
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="类别" prop="type">
                <Select v-model="note.addressForm.type" style="width: 200px">
                  <Option
                    v-for="item in addressType"
                    :key="item.value"
                    :value="item.value">{{ item.label }}
                  </Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="10">
              <FormItem label="经度" prop="lat">
                <Input v-model="note.addressForm.lat"></Input>
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="纬度" prop="lon">
                <Input v-model="note.addressForm.lon"></Input>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="20">
              <FormItem label="备注" prop="remark">
                <Input
                  v-model="note.addressForm.remark"
                  :rows="4"
                  type="textarea"></Input>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
    <div style="display: flex;justify-content: right" slot="footer">
      <Button
        :loading="note.addSign.loading"
        type="primary"
        @click="save()"
      >保存
      </Button>
      <Button   type="primary" style="margin-left: 8px" @click="note.addSign.addSignVisible = false">取消</Button>
    </div>

  </div>
</template>
<style scoped>

</style>

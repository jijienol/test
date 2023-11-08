<script setup>
import {onMounted, ref} from "vue";
import {noteStore} from "@/store/modules/note.js";
import {dictStore} from "@/store/modules/dictionary.js";
const dict = dictStore()
const note = noteStore()
// const typeList = ref(dict.dict.objectType.list)
const objectType = ref([])
const emits = defineEmits(['save'])
const objectForm = ref()
function save(){
  objectForm.value.validate((valid) => {
    if (valid) {
      emits('save')
    }
  })
}

const formRules = ref({
  name: [{required: true, message: '名称不能为空', trigger: 'blur'}]
})
/*if(typeList.value.length < 1) {
  dict.getDict('objectType')
}*/
onMounted(() => {
  dict.getDict('objectType').then(res => {
    objectType.value = res
  })
})
</script>
<script>
export default {
  name:"addSignObject"
}

</script>
<template>
  <div>
    <Row>
      <Col :span="24">
        <Form
          :model="note.objectForm"
          :label-width="120"
          ref="objectForm"
          :rules="formRules">
          <Row>
            <Col span="10">
              <FormItem label="名称" prop="name">
                <Input v-model="note.objectForm.name"></Input>
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="类别" prop="type">
                <Select v-model="note.objectForm.type" style="width: 200px">
                  <Option
                    v-for="item in objectType"
                    :value="item.value"
                    :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="20">
              <FormItem label="备注" prop="remark">
                <Input
                  type="textarea"
                  :rows="4"
                  v-model="note.objectForm.remark"
                ></Input>
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
      <Button style="margin-left: 8px" @click="note.addSign.addSignVisible = false">取消</Button>
    </div>
  </div>

</template>
<style scoped>

</style>

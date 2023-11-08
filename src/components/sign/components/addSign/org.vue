<script setup>
import {onMounted, ref} from "vue";
import {noteStore} from "@/store/modules/note.js";
import {dictStore} from "@/store/modules/dictionary.js";
const dict = dictStore()
const note = noteStore()
// const typeList = ref(dict.dict.orgType.list)
const orgType = ref([])
const emits = defineEmits(['save'])
const orgForm = ref()
function save(){
  
  orgForm.value.validate((valid) => {
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
/*if(typeList.value.length < 1) {
  dict.getDict('orgType')
}*/
onMounted(() => {
  dict.getDict('orgType').then(res => {
    orgType.value = res
  })
})
</script>
<script>
export default {
  name:"addSignOrg"
}

</script>
<template>
  <div>
    <Row>
      <Col :span="24">
        <Form
          :model="note.orgForm"
          :label-width="120"
          ref="orgForm"
          :rules="formRules">
          <Row>
            <Col span="10">
              <FormItem label="组织名称" prop="name">
                <Input v-model="note.orgForm.name"></Input>
                <!-- <Select v-model="form.name">
                  <Option v-for="(item, key) in rows" :key="key" :value="item">
                    {{item}}
                  </Option>
                </Select> -->
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="类别" prop="type">
                <Select v-model="note.orgForm.type" style="width: 200px">
                  <Option
                    v-for="item in orgType"
                    :value="item.value"
                    :key="item.value">{{ item.label }}</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="10">
              <FormItem label="负责人" prop="master">
                <Input v-model="note.orgForm.master"></Input>
                <!-- <Select v-model="form.master">
                  <Option v-for="(item, key) in rows" :key="key" :value="item">
                    {{item}}
                  </Option>
                </Select> -->
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="组织代码" prop="code">
                <Input v-model="note.orgForm.code"></Input>
                <!-- <Select v-model="form.code">
                  <Option v-for="(item, key) in row" :key="key" :value="item">
                    {{item}}
                  </Option>
                </Select> -->
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="10">
              <FormItem label="工商注册号" prop="registeNum">
                <Input v-model="note.orgForm.registeNum"></Input>
                <!-- <Select v-model="form.registeNum">
                  <Option v-for="(item, key) in rows" :key="key" :value="item">
                    {{item}}
                  </Option>
                </Select> -->
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="地址" prop="address">
                <Input v-model="note.orgForm.address"></Input>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="10">
              <FormItem label="成立时间" prop="beginDate">
                <DatePicker
                  v-model="note.orgForm.beginDate"
                  type="date"
                  placeholder="请选择成立时间"
                  style="width: 200px"></DatePicker>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span="20">
              <FormItem label="备注" prop="remark">
                <Input
                  type="textarea"
                  :rows="4"
                  v-model="note.orgForm.remark"></Input>
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

<script setup>
import {onMounted, ref, watch} from "vue";
import {dictStore} from "@/store/modules/dictionary.js";
import {noteStore} from "@/store/modules/note.js";
import Message from "../../../../utils/message.js";

const emits = defineEmits(['save'])
const note = noteStore()
const dict = dictStore()
const formRules = ref({
  // name: [{required: true, message: "请输入姓名", trigger: "blur"}],
  // remark: [{max: 500, message: "备注不能超过500个字", trigger: "blur"}],
})

const peopleForm = ref()
const save = () => {
  // 调用表单组件的 validate 方法进行校验
  // peopleForm.value.validate(valid => {
  //   if (valid) {
  //     if(note.peopleForm.idcard  && !(/^\d{17}[\dX]$/.test(note.peopleForm.idcard))){
  //     Message.error("请输入正确的身份证号码")
  //       return;
  //     }else if(note.peopleForm.phone && !(/^1[3-9]\d{9}$/.test(note.peopleForm.phone))){
  //       Message.error("请输入正确的手机号码")
  //       return
  //     }
  emits('save')
  //   }
  // });
};
const peopleType = ref([])
const genderList = ref([])


onMounted(() => {
  dict.getDict('peopleType').then(res => {
    peopleType.value = res
  })
  dict.getDict('sexual').then(res => {
    genderList.value = res
  })
})
</script>
<script>
export default {
  name: "addSignPeople"
}

</script>
<template>
  <div>
    <Row>
      <Col :span="24">
        <Form :model="note.peopleForm"
              :label-width="200"
              ref="peopleForm"
        >
          <Row>
            <!--            <Col span="10">-->
            <!--              <FormItem label="姓名" prop="name">-->
            <!--                <Input v-model="note.peopleForm.name"></Input>-->
            <!--              </FormItem>-->
            <!--            </Col>-->
            <!--            <Col span="10">-->
            <!--              <FormItem label="类别" prop="type">-->
            <!--                <Select v-model="note.peopleForm.type" style="width: 200px">-->
            <!--                  <Option-->
            <!--                    v-for="item in peopleType"-->
            <!--                    :value="item.value"-->
            <!--                    :key="item.value"-->
            <!--                  >{{ item.label }}-->
            <!--                  </Option>-->
            <!--                </Select>-->
            <!--              </FormItem>-->
            <!--            </Col>-->
            
            <Col span="10">
              <FormItem label="请确认证件号是否正确？" prop="idcard">
                <Input v-model="note.peopleForm.idcard"></Input>
              </FormItem>
            </Col>
            
            <!--            <Col span="10">-->
            <!--              <FormItem label="手机号" prop="phone">-->
            <!--                <Input v-model="note.peopleForm.phone"></Input>-->
            <!--              </FormItem>-->
            <!--            </Col>-->
            <!--            <Col span="10">-->
            <!--              <FormItem label="性别" prop="gender">-->
            <!--                <RadioGroup v-model="note.peopleForm.gender">-->
            <!--                  <Radio-->
            <!--                    v-for="item in genderList"-->
            <!--                    :key="item.value"-->
            <!--                    :label="item.value">-->
            <!--                    {{ item.label }}-->
            <!--                  </Radio>-->
            <!--                </RadioGroup>-->
            <!--              </FormItem>-->
            <!--            </Col>-->
            <!--            <Col span="6">-->
            <!--              <FormItem label="年龄" prop="age">-->
            <!--                <Input-->
            <!--                  v-model="note.peopleForm.age"-->
            <!--                  :readonly="false"-->
            <!--                  type="number"-->
            <!--                ></Input>-->
            <!--              </FormItem>-->
            <!--            </Col>-->
            <!--            -->
            <!--            <Col span="20">-->
            <!--              <FormItem label="备注" prop="remark">-->
            <!--                <Input-->
            <!--                  type="textarea"-->
            <!--                  :rows="4"-->
            <!--                  v-model="note.peopleForm.remark"-->
            <!--                ></Input>-->
            <!--              </FormItem>-->
            <!--            </Col>-->
          </Row>
        </Form>
      </Col>
    </Row>
    <div style="display: flex;justify-content: right" slot="footer">
      <Button
        :loading="note.addSign.loading"
        type="primary"
        @click="save()"
      >确认
      </Button>
      <Button style="margin-left: 8px" @click="note.addSign.addSignVisible = false">取消</Button>
    </div>
  </div>
</template>
<style scoped>

</style>

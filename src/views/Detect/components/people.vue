<script setup>
import {onMounted, ref} from "vue";
import {dictStore} from "@/store/modules/dictionary.js";
import {noteStore} from "@/store/modules/note.js";
import {swdtStore} from "@/store/modules/swdt.js";
import {savePeople} from "@/api/swdt.js";
import {Message} from "view-ui-plus";
import {updatePeople} from "../../../api/ajJs.js";


const note = noteStore()
const dict = dictStore()
const swdt = swdtStore()
const formRules = ref({

  // phone: [
  //   {
  //     validator: (rule, value, callback) => {
  //       if (/^1[3-9]\d{9}$/.test(value)) {
  //         callback();
  //       } else {
  //         callback(new Error("请输入正确的手机号码"));
  //       }
  //     },
  //   },
  // ],
  // idCard: [
  //   {
  //     validator: (rule, value, callback) => {
  //       if (/^\d{17}[\dX]$/.test(value)) {
  //         callback();
  //       } else {
  //         callback(new Error("请输入正确的身份证号码"));
  //       }
  //     },
  //   },
  // ]
})

const peopleForm = ref()

const save =  () => {
  // 调用表单组件的 validate 方法进行校验
  try{
    peopleForm.value.validate( async(valid) => {
      if (valid) {
        const {data} = await updatePeople(swdt.people.peopleForm)
        if(data.code ==200){
          Message.success('保存成功')
          swdt.people.visible = false
        }
      }
    });
 
  }catch (err){
    console.log(err)
  }
};
const peopleType = ref([])
const genderList = ref([])


onMounted(async () => {
  // const res = await getCluePeopleInfo({traceId: props.id})
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
  name: "People"
}

</script>
<template>
  <div>
    <Row>
      <Col :span="24">
        <Form :model="swdt.people.peopleForm"
              :label-width="130"
              ref="peopleForm"
              :rules="formRules">
          <Row>
            <Col span="10">
              <FormItem label="姓名">
                <Input v-model="swdt.people.peopleForm.name"></Input>
              </FormItem>
            </Col>
  
            <Col span="10">
              <FormItem label="性别">
                <RadioGroup v-model="swdt.people.peopleForm.gender">
                  <Radio
                    v-for="item in genderList"
                    :key="item.value"
                    :label="item.value">
                    {{ item.label }}
                  </Radio>
                </RadioGroup>
              </FormItem>
            </Col>
            <Col span="10">
              <FormItem label="身份证" prop="idCard">
                <Input v-model="swdt.people.peopleForm.idCard"></Input>
              </FormItem>
            </Col>
            
            <Col span="10">
              <FormItem label="手机号" prop="phone">
                <Input v-model="swdt.people.peopleForm.phone"></Input>
              </FormItem>
            </Col>
          
            <Col span="6">
              <FormItem label="年龄">
                <Input
                  v-model="swdt.people.peopleForm.age"
                  :readonly="false"
                  type="number"
                ></Input>
              </FormItem>
            </Col>
            
            <Col span="20">
              <FormItem label="备注">
                <Input
                  type="textarea"
                  :rows="4"
                  v-model="swdt.people.peopleForm.remark"
                ></Input>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
    <div style="display: flex;justify-content: right" slot="footer">
      <Button
        type="primary"
        @click="save()"
      >保存
      </Button>
      <Button style="margin-left: 8px" @click="swdt.people.visible = false">取消</Button>
    </div>
  </div>
</template>
<style scoped>

</style>

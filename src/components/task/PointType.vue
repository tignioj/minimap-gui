<script setup>
import {defineProps, onMounted, onUpdated, ref} from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  // selectedPoint: {
  //   type: Object,
  // }
})

import {faBullseye, faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";

// 注意区分 v-model="xxx"和 v-model:hello="xxx"的区别
// 前者只需要defineModel()就可以访问xxx，而后者需要defineModel('hello')
const selectedPoint = defineModel()
// const selectedPoint = defineModel('selectedPoint')
let pointType=ref(null);
onMounted(()=> { })
onUpdated(()=> {
  console.log('update', selectedPoint)
  if (selectedPoint) {
    pointType.value = selectedPoint.value.type
  }
})
</script>

<template>
  <fieldset>
    <legend>点位类型</legend>
    <input type="radio" :name="name" value="path"  :checked="pointType ==='path'"/>
    <label for="typePath">路径</label>
    <font-awesome-icon :icon="faMapMarkerAlt"/>
    <input type="radio" :name="name" value="target" :checked="pointType==='target'"/>
    <label for="typeTarget">目标</label> <font-awesome-icon :icon="faBullseye"/>
  </fieldset>
</template>

<style scoped>

</style>
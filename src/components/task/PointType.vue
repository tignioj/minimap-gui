<script setup>
import {defineProps, onMounted, onUpdated, ref} from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  pointType: {
    type:String
  }
})

import {faBullseye, faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";

// 注意区分 v-model="xxx"和 v-model:hello="xxx"的区别
// 前者只需要defineModel()就可以访问xxx，而后者需要defineModel('hello')
// const pointType = defineModel()

</script>

<template>
  <fieldset>
    <legend>点位类型</legend>
<!--    传参官方教程-->
<!--    https://cn.vuejs.org/guide/essentials/component-basics.html-->
<!--    带参数-->
<!--    https://cn.vuejs.org/guide/components/events.html-->
    <input type="radio" :name="name" value="path"  :checked="pointType ==='path'" @click="$emit('pointTypeChange', 'path')"/>
    <label for="typePath">路径</label>
    <font-awesome-icon :icon="faMapMarkerAlt"/>
    <input type="radio" :name="name" value="target" :checked="pointType==='target'" @click="$emit('pointTypeChange', 'target')"/>
    <label for="typeTarget">目标</label> <font-awesome-icon :icon="faBullseye"/>
  </fieldset>
</template>

<style scoped>

</style>
<script setup>
import {faBullseye, faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";
import {inject} from "vue";
import {injectKeyCNTextMap, injectKeyIconMap, injectKeyPointTypes} from "@/keys.js";

// 注意区分 v-model="xxx"和 v-model:hello="xxx"的区别
// 前者只需要defineModel()就可以访问xxx，而后者需要defineModel('hello')
const pointType = defineModel('pointType', {
  default: 'path'
})
const iconMap = inject(injectKeyIconMap)
const cnTextMap = inject(injectKeyCNTextMap)
const pointTypes = inject(injectKeyPointTypes)

</script>
<template>
  <fieldset>
    <legend>点位类型</legend>
<!--    传参官方教程-->
<!--    https://cn.vuejs.org/guide/essentials/component-basics.html-->
<!--    带参数-->
<!--    https://cn.vuejs.org/guide/components/events.html-->
<!--    <input type="radio" value="path"  :checked="pointType ==='path'" @click="$emit('update:pointType', 'path')"/>-->
<!--    <label for="typePath">路径</label>-->
<!--    <font-awesome-icon :icon="iconMap[pointType]"/>-->
<!--    <input type="radio" :name="name" value="target" :checked="pointType==='target'" @click="$emit('pointTypeChange', 'target')"/>-->
<!--    <input type="radio" value="target" :checked="pointType==='target'" @click="$emit('update:pointType', 'target')"/>-->
<!--    <label for="typeTarget">目标</label> <font-awesome-icon :icon="faBullseye"/>-->

    <div class="container">
      <div v-for="(pt, index) in pointTypes" :key="pt" class="item">
        <input type="radio" :value="pt" :checked="pointType==='target'" @click="$emit('update:pointType', pt)"/>
        <label for="typeTarget">{{ cnTextMap[pt] }}</label>
        <font-awesome-icon :icon="iconMap[pt]"/>
      </div>
    </div>
  </fieldset>
</template>
<style scoped>
.container {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
}
.item {
  margin-right: 5px; /* 间距，可以根据需要调整 */
}
</style>
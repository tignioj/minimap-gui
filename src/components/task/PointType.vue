
<script setup>
import {faBullseye, faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";
import {inject} from "vue";
import {injectKeyCNTextMap, injectKeyIconMap, injectKeyPointTypes} from "@/keys.js";

// 注意区分 v-model="xxx"和 v-model:hello="xxx"的区别
// 前者只需要defineModel()就可以访问xxx，而后者需要defineModel('hello')
const iconMap = inject(injectKeyIconMap)
const cnTextMap = inject(injectKeyCNTextMap)
const pointTypes = inject(injectKeyPointTypes)
// const pointType = defineModel('pointType',
//     {default: pointTypes[0]} ) // 报错: 不允许使用变量；
const pointType = defineModel('pointType')
// 这里不用default属性，而是手动设置value好处很多
// 1. 假设父模板没有设置默认参数，而子组件用了default设置默认值，此时他们的数据就是不一致的。
// 2. 通过.value赋值的方法手动设置一次，这样就能保持同步
pointType.value = pointTypes[0]

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
        <input type="radio" :value="pt" :checked="pointType===pt" @click="$emit('update:pointType', pt)"/>
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
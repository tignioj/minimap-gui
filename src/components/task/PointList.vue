<script setup>
// 定义可接收的 props
import {onMounted, ref} from "vue";

const props = defineProps({
  iconMapping: {
    type: Object,
    required: true
  },
  points: {
    type: Array,
    required: true
  }
});

const model = defineModel('selectedPointIndex')
const emit = defineEmits(['update:selectedPointIndex']);  // 定义用于通知父组件更新值的事件
function radioButtonClick(value) {
  emit('update:selectedPointIndex', value);  // 触发事件，通知父组件更新 modelValue
}
onMounted(()=> {
})
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
</script>

<template>
  <div class="container">
    <h1 id="name"></h1>
    <p id="country"></p>
    <ol id="positions">
      <li v-for="(point, index) in points" :key="index"
          :class="{'first-point': index === 0,
            'type-path': point.type === 'path',
            'type-target': point.type === 'target'}"
          class="position">
      <input type="radio" name="position"
             :value="index"
             class="radio-btn"
             @click="radioButtonClick(index)"
             :checked="model === index" />

<!--        模板中可以直接使用 $emit()，而在js里面则需要definedEmit(['xx','xxx', ...]) -->
<!--        <input type="radio" name="position"-->
<!--               :value="index"-->
<!--               class="radio-btn"-->
<!--               @click="$emit('update:selectedPointIndex', index)"-->
<!--               :checked="model === index" />-->

<!--        <input type="radio" name="position"-->
<!--               :value="index"-->
<!--               class="radio-btn"-->
<!--               @click="pointRadioButtonClick"-->
<!--               :checked="model === index" />-->
        <font-awesome-icon :icon="iconMapping[point.type]"/>
        <font-awesome-icon :icon="iconMapping[point.move_mode]" v-if="point.move_mode"/>
        <font-awesome-icon :icon="iconMapping[point.action]" v-if="point.action"/>
        {{ point.x.toFixed(2) }},{{ point.y.toFixed(2) }}
      </li>
    </ol>
  </div>
</template>

<style scoped>
.type-path { color: blue; }
.type-target { color: green; }
.first-point { color: red; }
</style>
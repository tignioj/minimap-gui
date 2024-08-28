<script setup>
// 定义可接收的 props
import {ref} from "vue";

const props = defineProps({
  iconMapping: {
    type: Object,
    required: true
  },
  pointRadioButtonClick: {
    type: Function,
    required: true
  },
  points: {
    type: Array,
    required: true
  }
});

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
        <input type="radio" name="position" :value="index" class="radio-btn" @click="pointRadioButtonClick"/>
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
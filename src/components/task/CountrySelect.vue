<script setup>
import { defineProps } from 'vue';

// 定义接收的 props
const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

// 定义选项数组
const regions = ["蒙德", "璃月", "须弥", "稻妻", "枫丹"];
</script>

<template>
  <select :id="id">
    <option v-for="(region, index) in regions" :key="index" :value="region">
      {{ region }}
    </option>
  </select>
</template>

<style scoped>
</style>

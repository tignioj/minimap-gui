<script setup>
// 定义选项数组

import {inject} from "vue";
import {injectKeyRegions} from "@/keys.js";

const regions = inject(injectKeyRegions)
const countrySelect = defineModel()
</script>
<template>
  <select v-model="countrySelect">
    <option v-for="(region, index) in regions" :key="index" :value="region">
      {{ region }}
    </option>
  </select>
</template>

<style scoped>
</style>

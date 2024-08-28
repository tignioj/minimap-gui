<script setup>
import {defineProps} from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true
  }})

import {faBullseye, faMapMarkerAlt} from "@fortawesome/free-solid-svg-icons";
</script>

<template>
  <fieldset>
    <legend>点位类型</legend>
    <input type="radio" :name="name" value="path" checked />
    <label for="typePath">路径</label>
    <font-awesome-icon :icon="faMapMarkerAlt"/>
    <input type="radio" :name="name" value="target" checked />
    <label for="typeTarget">目标</label> <font-awesome-icon :icon="faBullseye"/>
  </fieldset>
</template>

<style scoped>

</style>
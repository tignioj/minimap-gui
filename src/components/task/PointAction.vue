<script setup>
import { defineProps } from 'vue';
import {faPlaneArrival} from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  name: {
    type: String,
    required: true
  }
});
</script>

<template>
  <fieldset>
    <legend>动作</legend>
    <input type="radio"  :name="name" value="" checked />
    <label for="actionNone">无动作</label>
    <input type="radio" :name="name" value="stop_flying"/>
    <label for="actionStopFlying">下落攻击</label> <font-awesome-icon :icon="faPlaneArrival"></font-awesome-icon>
  </fieldset>
</template>

<style scoped>

</style>
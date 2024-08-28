<script setup>

import MoveMode from "@/components/task/MoveMode.vue";
import PointAction from "@/components/task/PointAction.vue";
import PointType from "@/components/task/PointType.vue";
import {defineProps} from "vue";
const props = defineProps({
  moveModes: {
    type: Array,
    required: true
  },
  actions: {
    type: Array,
    required: true
  }
});
// const moveModes = ["normal", "fly", "jump", "swim"]
const name = "userMoveMode"
</script>

<template>
  <fieldset>
    <legend>编辑用户点位预设信息</legend>
    <label for="userX">X: </label><input type="number" id="userX" /> <label for="userY">Y: </label><input type="number" id="userY" />
    <MoveMode :name="name" :move-modes="moveModes"/>
    <PointType name="userType"/>
    <PointAction name="userAction" :actions="actions"/>

  </fieldset>
</template>

<style scoped>

</style>
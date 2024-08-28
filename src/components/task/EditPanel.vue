<script setup>
import {ref} from "vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import MoveMode from "@/components/task/MoveMode.vue";
import {faPlaneArrival, faMapMarkerAlt, faBullseye} from "@fortawesome/free-solid-svg-icons";
import PointAction from "@/components/task/PointAction.vue";
import PointType from "@/components/task/PointType.vue";

// const moveModes = ["普通", "飞行", "跳跃", "游泳"]
const moveModes = ["normal", "fly", "jump", "swim"]
const name = "moveMode"

</script>
<template>
  <div id="editPanel">
    <label for="x">X: </label><input type="number" id="x" /><br />
    <label for="y">Y: </label><input type="number" id="y" /><br />
    <PointType :name="'type'" />
    <MoveMode :name="name" :move-modes="moveModes"/>
    <PointAction :name="'action'" />
    <button id="saveButton">保存</button>
    <button id="deleteButton">删除</button>
    <button id="cancelButton">取消</button>
    <button id="newButton">插入</button>
    <button id="playBackFromHereButton">从这里开始回放</button>
  </div>
</template>

<style scoped>

</style>
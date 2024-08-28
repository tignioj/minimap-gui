<script setup>
import {defineProps, onMounted, onUpdated, ref} from "vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import MoveMode from "@/components/task/MoveMode.vue";
import {faPlaneArrival, faMapMarkerAlt, faBullseye} from "@fortawesome/free-solid-svg-icons";
import PointAction from "@/components/task/PointAction.vue";
import PointType from "@/components/task/PointType.vue";

// const moveModes = ["normal", "fly", "jump", "swim"]
const props = defineProps({
  moveModes: {
    type: Array,
    required: true
  },
  actions: {
    type: Array,
    required: true,
  },
  // selectedPoint: {
  //   type: Object,
  //   required: true
  // }
});
const name = "moveMode"
const selectedPoint = defineModel('selectedPoint', { default: null, })
const selectedPointIndex = defineModel('selectedPointIndex', { default: null, })

const pointType = ref(null)
const pointMoveMode = ref(null)
const pointAction = ref(null)

onUpdated(()=> {
  if (selectedPoint) {
    pointType.value = selectedPoint.value.type;
    pointMoveMode.value = selectedPoint.value.move_mode;
    pointAction.value = selectedPoint.value.action
  }
})

</script>
<template>
  <div id="editPanel">
    <label for="x">X: </label><input type="number" id="x" /><br />
    <label for="y">Y: </label><input type="number" id="y" /><br />
    <PointType v-model="selectedPoint" :name="'type'" />
    <MoveMode v-model="pointMoveMode" :name="name" :move-modes="moveModes"/>
    <PointAction v-model="pointAction" name="'action'" :actions="actions" />
    <button id="saveButton">保存</button>
    <button id="deleteButton">删除</button>
    <button id="cancelButton">取消</button>
    <button id="newButton">插入</button>
    <button id="playBackFromHereButton">从这里开始回放</button>
  </div>
</template>

<style scoped>
#editPanel {
  display: none;
  position: absolute;
  background: white;
  border: 1px solid black;
  padding: 10px;
  z-index: 10;
}
</style>
<script setup>
import {defineProps, onMounted, onUpdated, ref, watch} from "vue";
import MoveMode from "@/components/task/MoveMode.vue";
import PointAction from "@/components/task/PointAction.vue";
import PointType from "@/components/task/PointType.vue";
import MyCanvas from "@/components/task/MyCanvas.vue";
// const moveModes = ["normal", "fly", "jump", "swim"]
const props = defineProps({
  moveModes: {
    type: Array,
    required: true
  },
  actions: {
    type: Array,
    required: true,
  }
});
const editPanel=ref(null)

const xInput = ref(null)
const yInput = ref(null)
const pointType = ref(null)
const pointMoveMode = ref(null)
const pointAction = ref(null)

const selectedPoint = defineModel('selectedPoint', { default: null, })

const emit = defineEmits(
    ['updateSelectedPoint',
      'deleteSelectedPoint',
      'newSelectedPoint',
        'playBackFromHere'
    ]);

function saveButton() {
  // const obj = selectedPoint.value  仍然是引用同一个对象
    // 或者构建一个新的对象
    // const obj = {
    //   x: parseFloat(xInput.value),
    //   y: parseFloat(yInput.value),
    //   type: pointType.value,
    //   action: pointAction.value,
    //   move_mode: pointMoveMode.value
    // }
  const newPoint = JSON.parse(JSON.stringify(selectedPoint.value))
  newPoint.x = parseFloat(xInput.value)
  newPoint.y = parseFloat(yInput.value)
  newPoint.type = pointType.value
  newPoint.action = pointAction.value
  newPoint.move_mode = pointMoveMode.value
  emit('updateSelectedPoint',newPoint)
}
function deleteButton() {
  emit('deleteSelectedPoint')
  editPanel.value.style.display = 'none'
}
function cancelButton() { editPanel.value.style.display = 'none' }
function newButton() { emit('newSelectedPoint') }
function playBackFromHereButton() { emit('playBackFromHere') }
watch(selectedPoint, async (nv,ov)=> {
  if (selectedPoint) {
    xInput.value = nv.x
    yInput.value = nv.y
    pointType.value = nv.type;
    pointMoveMode.value = nv.move_mode;
    pointAction.value = nv.action
  }
})

</script>
<template>
  <div ref="editPanel" id="editPanel">
    <label for="x">X: </label><input type="number" v-model="xInput" /><br />
    <label for="y">Y: </label><input type="number" v-model="yInput" /><br />
    <!--可以用v-mode，也可以用:custom-param, 前者可以在子模板使用defineModel()读取-->
    <!-- 如果v-model:hello="world" 则用defineModel('hello')读取word的数据-->
    <PointType :point-type="pointType" @pointTypeChange="(val)=> pointType=val" :name="'type'" />
<!--    <PointType :point-type="pointType" @pointTypeChange="pointTypeChange" :name="'type'" />-->
    <MoveMode :point-move-mode="pointMoveMode" @moveModeChange="(val)=>pointMoveMode=val" :name="'moveMode'" :move-modes="moveModes"/>
    <PointAction :point-action="pointAction" @actionChange="(val)=>pointAction=val" :name="'action'" :actions="actions" />
    <button @click="saveButton">保存</button>
    <button @click="deleteButton">删除</button>
    <button @click="cancelButton">取消</button>
    <button @click="newButton">插入</button>
    <button @click="playBackFromHereButton">从这里开始回放</button>
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
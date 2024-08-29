<script setup>
import {defineProps, onMounted, onUpdated, ref, watch} from "vue";
import MoveMode from "@/components/task/MoveMode.vue";
import PointAction from "@/components/task/PointAction.vue";
import PointType from "@/components/task/PointType.vue";
import {copyObject} from "../../../utils/objutils.js";
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
const isPlaying = defineModel('isPlaying', { default: false, })

defineExpose({
  hideEditPanel,
  showEditPanel
})
import {useMouse} from "../../../utils/mouse.js";
// 自定义组合函数：响应式鼠标坐标，可以通过mouseClientX.value访问
const {mousePageX, mousePageY} = useMouse()
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
  // 虽然可以直接用下标操作props的引用传递对象，但是Vue官方并不推荐子组件修改props的内容，否则可能会让页面数据变得难以理解
  // 推荐的做法是通知父组件更新
  // props单向数据流: https://cn.vuejs.org/guide/components/props.html#one-way-data-flow
  // 如何自定义事件？ https://cn.vuejs.org/api/sfc-script-setup#defineprops-defineemits
  // 如何emit？ https://cn.vuejs.org/guide/components/events.html
  // const newPoint = JSON.parse(JSON.stringify(selectedPoint.value))
  const newPoint = copyObject(selectedPoint.value)
  newPoint.x = parseFloat(xInput.value)
  newPoint.y = parseFloat(yInput.value)
  newPoint.type = pointType.value
  newPoint.action = pointAction.value
  newPoint.move_mode = pointMoveMode.value
  emit('updateSelectedPoint',newPoint)
  hideEditPanel()
}

function showEditPanel() {
  editPanel.value.style.left = `${mousePageX.value}px`;
  editPanel.value.style.top = `${mousePageY.value}px`;
  editPanel.value.style.display = 'block';
}
function hideEditPanel() {
  editPanel.value.style.display = 'none'
}
function deleteButton() {
  emit('deleteSelectedPoint')
  hideEditPanel()
}
function cancelButton() {
  editPanel.value.style.display = 'none'
  hideEditPanel()
}
function newButton() {
  emit('newSelectedPoint')
  hideEditPanel()
}
function playBackFromHereButton() {
  emit('playBackFromHere')
  hideEditPanel()
}
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
  <div ref="editPanel" class="editPanel">
    <label for="x">X: </label><input type="number" v-model="xInput" /><br />
    <label for="y">Y: </label><input type="number" v-model="yInput" /><br />
    <!--可以用v-mode，也可以用:custom-param, 前者可以在子模板使用defineModel()读取-->
    <!-- 如果v-model:hello="world" 则用defineModel('hello')读取word的数据-->
    <PointType v-model:point-type="pointType" :name="'type'" />
    <MoveMode v-model:point-move-mode="pointMoveMode" :name="'moveMode'" :move-modes="moveModes"/>
    <PointAction v-model:point-action="pointAction" :name="'action'" :actions="actions" />
    <button @click="saveButton">保存</button>
    <button @click="deleteButton">删除</button>
    <button @click="cancelButton">取消</button>
    <button @click="newButton">插入</button>
    <button @click="playBackFromHereButton" :disabled="isPlaying">从这里开始回放</button>
  </div>
</template>

<style scoped>
.editPanel {
  display: none;
  position: absolute;
  background: white;
  border: 1px solid black;
  padding: 10px;
  z-index: 10;
}
</style>
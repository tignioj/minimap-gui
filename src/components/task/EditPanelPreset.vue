<script setup>

import MoveMode from "@/components/task/MoveMode.vue";
import PointAction from "@/components/task/PointAction.vue";
import PointType from "@/components/task/PointType.vue";
import {defineProps, ref, watch} from "vue";
const props = defineProps({
  moveModes: {
    type: Array,
    required: true
  },
  actions: {
    type: Array,
    required: true
  },
  isRecording: {
    type: Boolean,
    required: true
  }
});
defineExpose({
  insertNewNode
})

// const moveModes = ["normal", "fly", "jump", "swim"]
const name = "userMoveMode"

const xInput = defineModel('xInput', { default: 0})
const yInput = defineModel('yInput', {default: 0})

const pointType = ref('path')  // 这里不设置初始值，子模版接收到会使用自己的defineModel(xx, {default: value})的value
const pointMoveMode = ref('normal')  // 如果是ref(null)，则会覆盖defineModel的默认值
const pointAction = ref('')

const emit = defineEmits(['appendNewNode'])
function getUserCustomNode() {
  return {
    x: xInput.value,
    y: yInput.value,
    type: pointType.value,
    move_mode: pointMoveMode.value,
    action: pointAction.value
  }
}
function insertNewNode() {
  // if (!props.isRecording) {
    // errorMsg('请先开始追踪再插入用户点位')
    // return
  // }
  const node = getUserCustomNode()
  // info(`插入点位(${node.x},${node.y})`)
  // points.value.push(node)
  emit('appendNewNode', node)
}
</script>

<template>
  <fieldset>
    <legend>编辑点位预设信息</legend>
    <label for="userX">X: </label><input type="number" v-model="xInput"  />
    <label for="userY">Y: </label><input type="number" v-model="yInput" />
    <MoveMode  v-model:point-move-mode="pointMoveMode" :name="name" :move-modes="moveModes"/>
    <PointType v-model:point-type="pointType" name="userType"/>
    <PointAction v-model:point-action="pointAction" name="userAction" :actions="actions"/>
    <button @click="insertNewNode" >插入点位</button>
  </fieldset>
</template>

<style scoped>

</style>
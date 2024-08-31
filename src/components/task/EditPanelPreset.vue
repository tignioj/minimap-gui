<script setup>

import MoveMode from "@/components/task/MoveMode.vue";
import PointAction from "@/components/task/PointAction.vue";
import PointType from "@/components/task/PointType.vue";
import {defineProps, inject, ref, watch} from "vue";
import {injectKeyPointMoveModes} from "@/keys.js";
const props = defineProps({
  isRecording: {
    type: Boolean,
    required: true
  }
});
defineExpose({
  insertNewNode
})

const xInput = defineModel('xInput', { default: 0})
const yInput = defineModel('yInput', {default: 0})

const pointType = ref(null)
const pointMoveMode = ref(null)
const pointAction = ref(null)

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
    <MoveMode  v-model:point-move-mode="pointMoveMode" />
    <PointType v-model:point-type="pointType"/>
    <PointAction v-model:point-action="pointAction"/>
    <button @click="insertNewNode" >插入点位</button>
  </fieldset>
</template>

<style scoped>

</style>
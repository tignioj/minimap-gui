<script setup>

import NewTaskPage from "@/components/NewTaskPage.vue";
import {
  faArrowTrendUp, faBan, faBullseye,
  faClover, faExpand,
  faMapMarkerAlt,
  faPlane,
  faPlaneArrival, faQuestion,
  faWalking,
  faWater
} from "@fortawesome/free-solid-svg-icons";
import Manual from "@/components/task/Manual.vue";
// https://fontawesome.com/search
const iconMapping = {
  'normal': faWalking,
  'fly': faPlane,
  'jump': faArrowTrendUp,
  'swim': faWater,
  'up_down_grab_leaf': faClover,
  'stop_flying': faPlaneArrival,
  'path': faMapMarkerAlt,
  'target': faBullseye,
  'nahida_collect': faExpand,
  '': faBan,
  undefined: faQuestion,
  null: faQuestion,
};
const cnTextMap = {
  'normal': '普通',
  'fly': '飞行',
  'jump': '跳跃',
  'swim': '游泳',
  'up_down_grab_leaf': '四叶印',
  'path':'路径',
  'target': '目标',
  'nahida_collect':'纳西妲采集',
  '': '无',
  'stop_flying': '下落攻击'
}

const actions=["", "stop_flying"];
const pointTypes=["path", "target"];
const moveModes = ["normal", "fly", "jump", "swim", "up_down_grab_leaf"]
const regions = ["蒙德", "璃月", "须弥", "稻妻", "枫丹", "纳塔"];
const executor = 'GouLiangPathExecutor'
</script>
<template>
<NewTaskPage :executor="executor"
             :move-modes="moveModes"
             :point-types="pointTypes"
             :actions="actions"
             :cn-text-map="cnTextMap"
             :icon-mapping="iconMapping"
             :regions="regions"
             />

<!--  <Manual/>-->
</template>
<style scoped>

</style>
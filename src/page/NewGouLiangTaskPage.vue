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
const actions=["", "stop_flying", "nahida_collect", 'shield']
const executor = 'GouLiangPathExecutor'
</script>
<template>
<NewTaskPage :executor="executor"
             :actions="actions"
             />

<!--  <Manual/>-->
</template>
<style scoped>

</style>
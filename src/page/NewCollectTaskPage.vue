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

const executor = 'CollectPathExecutor'
</script>
<template>
  <NewTaskPage :executor="executor" />
    <Manual/>
</template>
<style scoped>

</style>
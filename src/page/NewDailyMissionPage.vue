<script setup>

import NewTaskPage from "@/components/NewTaskPage.vue";

import Manual from "@/components/task/Manual.vue";
// https://fontawesome.com/search

const executor = 'DailyMissionPathExecutor'
</script>
<template>
  <NewTaskPage :executor="executor" />
    <Manual/>
</template>
<style scoped>

</style>
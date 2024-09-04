<script setup>
// 定义选项数组

import {getFightTeamListURL} from "@/api.js";
import {ref} from "vue";

const teams = ref([])
fetch(getFightTeamListURL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(json => {
      if (json.success === true) {
        teams.value.length = 0
        teams.value.push(...json.data)
      }
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });

const fightTeamSelectModel = defineModel({
  default: null
})
</script>
<template>
  <select v-model="fightTeamSelectModel">
    <option :value="null" selected >使用默认队伍(请在配置中设置)</option>
    <option v-for="(team, index) in teams" :key="index" :value="team">
      {{ team }}
    </option>
  </select>
</template>

<style scoped>
</style>

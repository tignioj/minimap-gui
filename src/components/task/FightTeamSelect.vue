<script setup>
// 定义选项数组

import {getFightTeamListURL} from "@/api.js";
import {ref} from "vue";

const teams = ref([])
const defaultFightTeam = ref('')
fetch(getFightTeamListURL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(json => {
      if (json.success === true) {
        const result = json.data
        defaultFightTeam.value = result.default
        teams.value.length = 0
        teams.value.push(...result.files)
      }
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });

const fightTeamSelectModel = defineModel({
  default: ""
})
</script>
<template>
  <select v-model="fightTeamSelectModel">
    <option value="" selected >使用默认队伍({{ defaultFightTeam }})</option>
    <option v-for="(team, index) in teams" :key="index" :value="team">
      {{ team }}
    </option>
  </select>
</template>

<style scoped>
</style>

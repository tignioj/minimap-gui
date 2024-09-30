<script setup>
// 定义选项数组
import {store} from "@/store.js";

const teams = store.teams
const defaultFightTeam = store.defaultFightTeam

const fightTeamSelectModel = defineModel("fightTeamSelect", {
  default: ""
})
const teamEnable = defineModel('teamEnable', {
  default: true
})

</script>
<template>
  <select :disabled="!teamEnable" v-model="fightTeamSelectModel">
    <option value="" selected >使用默认队伍({{ defaultFightTeam }})</option>
    <option v-for="(team, index) in teams" :key="index" :value="team">
      {{ team }}
    </option>
  </select>
</template>

<style scoped>
</style>

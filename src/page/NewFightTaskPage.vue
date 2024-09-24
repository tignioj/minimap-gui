<script setup>

import NewTaskPage from "@/components/NewTaskPage.vue";
import Manual from "@/components/task/Manual.vue";
import FightTeamSelect from "@/components/task/FightTeamSelect.vue";
import {ref} from "vue";
import {getFightTeamListURL} from "@/api.js";
// https://fontawesome.com/search
const actions=["", "stop_flying", 'shield']
const executor = 'FightPathExecutor'

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
function hasWanYe() {
  return defaultFightTeam.value.indexOf("枫原万叶") > -1
}

</script>
<template>
  <div> 注意：战斗队伍必须包含'枫原万叶',否则无法拾取材料</div>
  <div :class="hasWanYe() ? 'has-wanye' : 'no-wanye'">
    当前默认队伍是: {{defaultFightTeam}}
    <div v-if="!hasWanYe()">
      不包含枫原万叶，请前往<RouterLink to="/team">战斗队伍管理</RouterLink>中创建或者选择有枫原万叶的队伍
    </div>
  </div>
<NewTaskPage :executor="executor"
             :actions="actions"
             >
</NewTaskPage>
</template>
<style scoped>
.has-wanye {
  color: green;
}
.no-wanye {
  color: red
}
</style>
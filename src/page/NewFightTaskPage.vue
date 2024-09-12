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
import FightTeamSelect from "@/components/task/FightTeamSelect.vue";
import CountrySelect from "@/components/task/CountrySelect.vue";
import {ref} from "vue";
// https://fontawesome.com/search
const actions=["", "stop_flying"];
const executor = 'FightPathExecutor'
const fightTeamSelectModel = ref(null)
const pathObjectExtend = ref( {
  'fight_team': fightTeamSelectModel
})
const afterDataLoaded = (data) => { }
</script>
<template>
<NewTaskPage :executor="executor"
             :actions="actions"
             :path-object-extend="pathObjectExtend"
             @after-data-loaded="afterDataLoaded"
             >
  <div>
    请选择含有“枫原万叶”的战斗队伍:
    <FightTeamSelect v-model="fightTeamSelectModel"/>
    <br/>
    游戏内队伍顺序必须<b>按照文件名顺序</b>
  </div>
</NewTaskPage>

  <p>为什么要万叶：因为只有他能吸材料；后续会考虑加入图像识别掉落物品。</p>
</template>
<style scoped>

</style>
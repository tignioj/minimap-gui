<script setup>
import {defineProps, inject} from 'vue';
import {
  faBan,
  faExpand,
  faPlaneArrival, faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {injectKeyCNTextMap, injectKeyPointActions} from "@/keys.js";
const iconMapping = {
  'stop_flying': faPlaneArrival,
  '': faBan,
  'nahida_collect': faExpand,
  undefined: faQuestion,
};
const pointAction = defineModel('pointAction', {
  default: ""
})
const actions = inject(injectKeyPointActions)
const cnTextMap = inject(injectKeyCNTextMap)

// 处理传入的 moveModes，生成每个模式的配置
const actions1 = actions.map((mode, index) => ({
  value: mode.toLowerCase(), // 生成 value
  label: mode, // 使用传入的标签
  text: cnTextMap[mode],
  icon: iconMapping[mode], // 获取对应的图标
  checked: index === 0 // 默认选中第一个
}));
</script>
<template>
  <fieldset>
    <legend>动作</legend>
    <div class="container">
      <div v-for="(action, index) in actions1" :key="index" class="item">
        <input
            type="radio"
            :value="action.value"
            :checked="action.value === pointAction"
            @click="$emit('update:pointAction', action.value)"
        />
        <label :for="action.id">{{ action.text }}</label>
        <font-awesome-icon :icon="action.icon"/>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
}
.item {
  margin-right: 5px; /* 间距，可以根据需要调整 */
}
</style>
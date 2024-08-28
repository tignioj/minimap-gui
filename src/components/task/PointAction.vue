<script setup>
import { defineProps } from 'vue';
import {
  faBan,
  faExpand,
  faPlaneArrival, faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
const iconMapping = {
  'stop_flying': faPlaneArrival,
  '': faBan,
  'nahida_collect': faExpand,
  undefined: faQuestion,
};

const props = defineProps({
  actions: {
    type: Array,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  pointAction: {
    type: String
  }
});
// const pointAction = defineModel()

const cnMap = {
  'nahida_collect':'纳西妲采集',
  'stop_flying': '下落攻击',
  '': '无'
}
// 处理传入的 moveModes，生成每个模式的配置
const actions1 = props.actions.map((mode, index) => ({
  value: mode.toLowerCase(), // 生成 value
  label: mode, // 使用传入的标签
  text: cnMap[mode],
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
            :name="name"
            :value="action.value"
            :checked="action.value === pointAction"
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
<script setup>
import { defineProps } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faWalking, faPlane, faArrowTrendUp, faWater } from '@fortawesome/free-solid-svg-icons';

// 定义可接收的 props
const props = defineProps({
  moveModes: {
    type: Array,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

// 定义图标映射
const iconMapping = {
  'normal': faWalking,
  'fly': faPlane,
  'jump': faArrowTrendUp,
  'swim': faWater
};

const cnMap = {
  'normal': '普通',
  'fly': '飞行',
  'jump': '跳跃',
  'swim': '游泳',
}

// 处理传入的 moveModes，生成每个模式的配置
const modes = props.moveModes.map((mode, index) => ({
  value: mode.toLowerCase(), // 生成 value
  label: mode, // 使用传入的标签
  icon: iconMapping[mode], // 获取对应的图标
  checked: index === 0 // 默认选中第一个
}));
</script>

<template>
  <fieldset>
    <legend>行走方式</legend>
    <div class="container">
      <div v-for="(mode, index) in modes" :key="index" class="item">
        <input
            type="radio"
            :name="name"
            :value="mode.value"
            :checked="mode.checked"
        />
        <label :for="mode.id">{{ cnMap[mode.label] }}</label>
        <font-awesome-icon :icon="mode.icon"/>
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
  //margin-bottom: 10px; /* 垂直间距 */
}
</style>

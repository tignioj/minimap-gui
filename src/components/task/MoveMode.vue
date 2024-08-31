<script setup>
import {defineProps, inject, onUpdated} from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {injectKeyCNTextMap, injectKeyIconMap, injectKeyPointMoveModes} from "@/keys.js";

const moveModes = inject(injectKeyPointMoveModes)
const iconMapping = inject(injectKeyIconMap)
const cnTextMap = inject(injectKeyCNTextMap)
const pointMoveMode = defineModel('pointMoveMode')
pointMoveMode.value = moveModes[0]

// 处理传入的 moveModes，生成每个模式的配置
const modes = moveModes.map((mode, index) => ({
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
<!--        是否有更简洁的方式添加Node？-->
        <input
            type="radio"
            :value="mode.value"
            :checked="pointMoveMode === mode.value"
            @click="$emit('update:pointMoveMode', mode.value)"
        />
        <label :for="mode.id">{{ cnTextMap[mode.label] }}</label>
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
}
</style>

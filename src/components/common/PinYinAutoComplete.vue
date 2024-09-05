
<script setup>
import { ref } from 'vue';
import { pinyin } from 'pinyin-pro'
import {store} from "@/store.js";

// 模拟数据，可以根据实际需求更换为动态数据
// const dataList = ['你好', '世界', '开发', '程序员', '拼音', '自动补全'];
const dataList = store.charactersName

// const inputValue = ref('');
const inputValue = defineModel({
  default: ''
})

const showDropdown = ref(false);
const filteredSuggestions = ref([]);

const onInputChange = () => {
  const input = inputValue.value.trim().toLowerCase();

  if (input === '') {
    filteredSuggestions.value = [];
    return;
  }

  // 将数据中的每个词条转换为拼音
  const suggestions = dataList.filter((item) => {
    const itemPinyin = pinyin(item, { toneType: 'none'})
    return item.includes(input) || itemPinyin.includes(input);
  });

  filteredSuggestions.value = suggestions;
};

const selectSuggestion = (suggestion) => {
  inputValue.value = suggestion;
  filteredSuggestions.value = [];
  showDropdown.value = false;
};

const hideSuggestions = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200); // 延时隐藏，避免点击建议项时不触发
};

const showSuggestions = () => {
  showDropdown.value = true;
};
</script>
<template>
  <div>
    <slot></slot>
    <input
        v-model="inputValue"
        @input="onInputChange"
        @blur="hideSuggestions"
        @focus="showSuggestions"
        placeholder="输入汉字或拼音"
    />
    <ul v-if="showDropdown && filteredSuggestions.length > 0" class="suggestions">
      <li v-for="(suggestion, index) in filteredSuggestions" :key="index" @click="selectSuggestion(suggestion)">
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>


<style scoped>
.suggestions {
  border: 1px solid #ddd;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}

/*
.suggestions li {
  padding: 8px;
  cursor: pointer;
}

 */

.suggestions li:hover {
  background-color: #f0f0f0;
}
</style>

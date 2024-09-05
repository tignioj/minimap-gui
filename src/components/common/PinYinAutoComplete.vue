
<script setup>
import { ref } from 'vue';
import {pinyin} from 'pinyin-pro';
import {store} from "@/store.js";

const dataList = store.charactersName

// const inputValue = ref('');
const inputValue = defineModel({
  default: ''
})

const showDropdown = ref(false);
const filteredSuggestions = ref([]);
const highlightedIndex = ref(-1); // 当前高亮的建议项索引

const onInputChange = () => {
  const input = inputValue.value.trim().toLowerCase();

  if (input === '') {
    filteredSuggestions.value = [];
    highlightedIndex.value = -1;
    return;
  }

  const suggestions = dataList.filter((item) => {
    const itemPinyin = pinyin(item, {toneType: 'none', separator: ""})
    return item.includes(input) || itemPinyin.includes(input);
  });

  filteredSuggestions.value = suggestions;
  highlightedIndex.value = 0; // 每次输入时重置高亮
};

// 监听Tab、ArrowDown和ArrowUp键，自动选择和移动高亮建议
const onKeyDown = (event) => {
  if (event.key === 'Tab' && filteredSuggestions.value.length > 0) {
    event.preventDefault(); // 防止默认Tab行为
    // selectSuggestion(filteredSuggestions.value[0]);
    selectSuggestion(filteredSuggestions.value[highlightedIndex.value]);
  } else if (event.key === 'ArrowDown') {
    // 向下移动高亮
    event.preventDefault();
    if (highlightedIndex.value < filteredSuggestions.value.length - 1) {
      highlightedIndex.value++;
    } else {
      highlightedIndex.value = 0; // 回到第一个
    }
  } else if (event.key === 'ArrowUp') {
    // 向上移动高亮
    event.preventDefault();
    if (highlightedIndex.value > 0) {
      highlightedIndex.value--;
    } else {
      highlightedIndex.value = filteredSuggestions.value.length - 1; // 移动到最后一个
    }
  } else if (event.key === 'Enter' && highlightedIndex.value >= 0) {
    // 按 Enter 键时选中高亮项
    event.preventDefault();
    selectSuggestion(filteredSuggestions.value[highlightedIndex.value]);
  }
};

// 选择建议项
const selectSuggestion = (suggestion) => {
  inputValue.value = suggestion;
  filteredSuggestions.value = [];
  highlightedIndex.value = -1;
  showDropdown.value = false;
};

const hideSuggestions = () => {
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);
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
        @keydown="onKeyDown"
        @blur="hideSuggestions"
        @focus="showSuggestions"
        placeholder="输入汉字或拼音"
    />
    <ul v-if="showDropdown && filteredSuggestions.length > 0" class="suggestions">
      <li
          v-for="(suggestion, index) in filteredSuggestions"
          :key="index"
          @click="selectSuggestion(suggestion)"
          :class="{ 'highlighted': index === highlightedIndex }"
      >
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

.suggestions li {
  cursor: pointer;
}

.suggestions li.highlighted {
  background-color: #f0f0f0;
}
</style>

<script setup>
import {ref} from "vue";
import {store} from "@/store.js";

const logText = ref('');
const loggerStyle = ref('');

function log(level, text) {
  logText.value = text;
  loggerStyle.value = level;
  store[`${level}Log`](text);
}

function info(text) {
  log('info', text);
}

function error(text) {
  log('error', text);
}

function warning(text) {
  log('warning', text);
}

defineExpose({
  info,
  error,
  warning
});
</script>

<template>
  <p ref="msgEle" :class="loggerStyle"> {{ logText }} </p>
</template>

<style scoped>
.info {
  color: green;
}

.error {
  color: red;
}

.warning {
  color: yellow;
}
</style>
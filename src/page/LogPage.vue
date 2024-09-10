<script setup>
import {store} from "@/store.js";

store.appendLogs("你好")

</script>

<template>
  <textarea rows="60" readonly class="log">{{store.logs}}</textarea>
</template>

<style scoped>

.log {
  width: 100%;
}

.ace_editor .custom-color-red {
  color: red;
}

</style>
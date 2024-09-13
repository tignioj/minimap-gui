<script setup>
import { ref } from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-yaml'; // Load the language definition file used below
import 'ace-builds/src-noconflict/theme-monokai'; // Load the theme definition file used below
import {getConfigURL, saveConfigURL} from '@/api.js';
import {store} from "@/store.js";

const content = ref(''); // 初始化为一个空字符串
const msgEle = ref(null)

function errorMsg(msg) {
  store.errorLog(msg)
  if (msgEle.value) {
    msgEle.value.innerText = msg;
  }
}
function info(msg) {
  store.infoLog(msg)
  if (msgEle.value) {
    msgEle.value.innerText = msg;
  }
}

function saveConfig() {
  const yamlContent = content.value
  fetch(saveConfigURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',  // 使用纯文本格式上传
    },
    body: yamlContent,  // 直接发送 YAML 文本
  }).then(response => response.json())
      .then(data => {
        info(data.message);
      })
      .catch(error => {
        errorMsg(error)
      });
}
fetch(getConfigURL)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(json => {
      if (json.success === true) {
        // content.value = JSON.stringify(json.data, null, 2); // 更新 content 的值，并格式化 JSON 数据
        content.value = json.data
      }
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });

</script>
<template>
  <button @click="saveConfig()">保存</button>
  <p ref="msgEle"></p>
  <v-ace-editor
      v-model:value="content"
      lang="yaml"
      theme="monokai"
      style="height: 800px;" />
</template>

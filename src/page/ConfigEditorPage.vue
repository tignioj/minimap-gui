<script setup>
import { ref } from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-yaml'; // Load the language definition file used below
import 'ace-builds/src-noconflict/theme-monokai'; // Load the theme definition file used below
import {getConfigURL, saveConfigURL} from '@/api.js';

const content = ref(''); // 初始化为一个空字符串

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
        alert(data.message);
      })
      .catch(error => {
        console.error('Error:', error);
        alert('保存失败' + String(error))
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
  <v-ace-editor
      v-model:value="content"
      lang="yaml"
      theme="monokai"
      style="height: 800px" />
  <button @click="saveConfig()">保存</button>
</template>

<script setup>
import {computed, provide, ref} from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-yaml'; // Load the language definition file used below
import 'ace-builds/src-noconflict/theme-monokai'; // Load the theme definition file used below
import {
  getConfigURL,
  saveConfigURL,
  createInstanceConfigURL, saveInstancesConfigURL, loginConfigInstance
} from '@/api.js';
import MessageComponent from "@/components/common/MessageComponent.vue";
import {isUndefinedNullOrEmpty} from "@/utils/objutils.js";
import InstancesConfig from "@/components/onedragon/InstancesConfig.vue";

const content = ref(''); // 初始化为一个空字符串
const msgEle = ref(null)
const instanceConfigRef = ref(null)

function errorMsg(msg) {
  msgEle.value.error(msg)
}
function info(msg) {
  msgEle.value.info(msg)
}
provide('info', info)
provide('error', errorMsg)

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
function loadConfig() {
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
}
loadConfig()

</script>
<template>
  <InstancesConfig ref="instanceConfigRef" @onSetInstance="loadConfig" @onDeleteInstance="loadConfig" />
  <h3>
    实例设置
  </h3>
  <button @click="saveConfig()">保存编辑器内容</button>
  <MessageComponent ref="msgEle"/>
  <v-ace-editor
      v-model:value="content"
      lang="yaml"
      theme="monokai"
      style="height: 800px;" />
</template>

<style scoped>

</style>
<script setup>
import {computed, ref} from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-yaml'; // Load the language definition file used below
import 'ace-builds/src-noconflict/theme-monokai'; // Load the theme definition file used below
import {getConfigURL, getConfigInstances, setConfigInstance, saveConfigURL, deleteConfigInstance} from '@/api.js';
import {store} from "@/store.js";
import MessageComponent from "@/components/common/MessageComponent.vue";

const content = ref(''); // 初始化为一个空字符串
const msgEle = ref(null)

function errorMsg(msg) {
  msgEle.value.error(msg)
}
function info(msg) {
  msgEle.value.info(msg)
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


const instances = ref([
  {name: 'default', server:'official', account: '', password: '', enable: true},
  {name: 'instance1', server:'bilibili', account: '', password: '', enable: false},
])
// 实例拖动
const dragItemInstance = ref(null);
function dragStartInstance(item) { dragItemInstance.value = item; }
function dragOverInstance(e) { e.preventDefault(); }
const checkedInstancesItems = computed(() => {
  return instances.value.filter(item => item.enable);
});
function logInstancesCheckedItems() {
  console.log('选中的项目：', checkedInstancesItems.value);
}
function dropInstances(item) {
  const fromIndex = instances.value.indexOf(dragItemInstance.value);
  const toIndex = instances.value.indexOf(item);
  instances.value.splice(fromIndex, 1);
  instances.value.splice(toIndex, 0, dragItemInstance.value);
}

function getInstances() {
  fetch(getConfigInstances).then(response => {
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json(); // 解析响应为 JSON
  })
      .then(data => {
        if (data.success === true) {
          const result = data.data
          console.log(result)
          instances.value = result['instances']
          currentInstance.value = result['current_instance']
          console.log(data.data)
        } else {
          errorMsg(data.message)
        }
      }).catch(error => {
    console.error('Error:', error); // 处理错误
    errorMsg(error)
  });
}
getInstances()

function setInstance(name) {
  fetch(`${setConfigInstance}/${name}`,{
    method: 'PUT'
  }).then(response => response.json())
      .then(data => {
        if (data.success) {
          info(data.message);
          currentInstance.value = name
          // 切换实例后，重新加载对应实例的配置文件
          loadConfig()
          // 默认队伍刷新
          store.updateFightTeamList()
          // TodoList刷新
          store.updateTodoList()
        } else {
          errorMsg(data.message);
        }
      })
      .catch(error => {
        errorMsg(error)
      });
}
const currentInstance = ref('')

function login(name) {
  errorMsg('尚未实现该功能')
}

function deleteInstance(name) {
  const ok = confirm("确认删除实例'" + name  + "'?")
  if (ok) {
    fetch(`${deleteConfigInstance}/${name}`).then(response => response.json())
        .then(data => {
          if (data.success) {
            info(data.message);
            currentInstance.value = name
            // 删除实例后，重新加载对应实例的配置文件
            loadConfig()
            // 默认队伍刷新
            store.updateFightTeamList()
            // TodoList刷新
            store.updateTodoList()
            getInstances()
          } else {
            errorMsg(data.message);
          }
        })
        .catch(error => {
          errorMsg(error)
        });
  }
}
// 检查名称是否重复
const isDuplicate = (name) => {
  return instances.value.filter(item => item.name === name).length > 1;
};

</script>
<template>
  <h2>实例设置</h2>
  <div>
    <table>
      <thead>
      <tr>
        <th class="narrow-column">启用</th>
        <th class="narrow-column">名称</th>
        <th class="narrow-column">服务器</th>
        <th>账户</th>
        <th>密码</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, index) in instances" :key="index"
          draggable="true"
          @dragstart="dragStartInstance(item)"
          @dragover="dragOverInstance"
          @drop="dropInstances(item)">

<!--        <td class="narrow-column">-->
<!--          <input name="instance" type="radio" v-model="currentInstance"-->
<!--                 @change="setInstance(item.name)"-->
<!--                 :checked="currentInstance===item.name">-->
<!--        </td>-->
        <td class="narrow-column"> <input type="checkbox" v-model="item.enable"> </td>
        <td class="narrow-column">
          <!-- 动态设置输入框的class，当name重复时变红 -->
          <input type="text" v-model="item.name" :class="{'duplicate': isDuplicate(item.name)}">
        </td>
        <td class="narrow-column"> <input type="text" v-model="item.server"> </td>
        <td> <input v-model="item.account" type="text" /> </td>
        <td> <input v-model="item.password" type="password"/> </td>
        <td>
          <button :disabled="currentInstance===item.name" @click="setInstance(item.name)">
            {{ currentInstance === item.name ? "当前选中": "切换实例" }}
          </button>
          <button @click="deleteInstance(item.name)">删除实例</button>
          <button @click="login(item.name)">登录</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>



  <button @click="saveConfig()">保存</button>
  <MessageComponent ref="msgEle"/>
  <v-ace-editor
      v-model:value="content"
      lang="yaml"
      theme="monokai"
      style="height: 800px;" />
</template>

<style scoped>
.duplicate {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
</style>
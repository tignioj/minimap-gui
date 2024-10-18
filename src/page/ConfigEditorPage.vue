<script setup>
import {computed, ref} from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-yaml'; // Load the language definition file used below
import 'ace-builds/src-noconflict/theme-monokai'; // Load the theme definition file used below
import {
  getConfigURL,
  getConfigInstancesURL,
  setConfigInstanceURL,
  saveConfigURL,
  deleteConfigInstanceURL,
  createInstanceConfigURL, saveInstancesConfigURL
} from '@/api.js';
import {store} from "@/store.js";
import MessageComponent from "@/components/common/MessageComponent.vue";
import {isUndefinedNullOrEmpty} from "@/utils/objutils.js";

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
  fetch(getConfigInstancesURL).then(response => {
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
  fetch(`${setConfigInstanceURL}/${name}`,{
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
    fetch(`${deleteConfigInstanceURL}/${name}`).then(response => response.json())
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

// 新建的实例名称是否重复
const isDuplicateNew = (name) => {
  return instances.value.filter(item => item.name === name).length > 0
};


const newEnable = ref(true)
const newName = ref('instance')
const newServer = ref('official')
const newAccount = ref('')
const newPassword = ref('')

function trimStr(str) {
  if (isUndefinedNullOrEmpty(str)) return ""
  return String(str).trim()
}

function createInstance() {
  const data = {
    enable: newEnable.value,
    name: trimStr(newName.value),
    server: trimStr(newServer.value),
    account: trimStr(newAccount.value),
    password: trimStr(newPassword.value)
  }
  const jsonString = JSON.stringify(data)
  fetch(createInstanceConfigURL, {
    method: 'POST', // 请求方法
    headers: {
      'Content-Type': 'application/json' // 指定发送的数据格式为 JSON
    },
    body: jsonString // 将 JavaScript 对象转换为 JSON 字符串
  }).then(response => response.json())
      .then(data => {
        info(data.message);
        getInstances()
      })
      .catch(error => {
        errorMsg(error)
      });
}

function saveInstancesConfig() {
  const jsonString = JSON.stringify(instances.value)
  fetch(saveInstancesConfigURL, {
    method: 'POST', // 请求方法
    headers: {
      'Content-Type': 'application/json' // 指定发送的数据格式为 JSON
    },
    body: jsonString // 将 JavaScript 对象转换为 JSON 字符串
  }).then(response => response.json())
      .then(data => {
        info(data.message);
        getInstances()
      })
      .catch(error => {
        errorMsg(error)
      });
}
</script>
<template>
  <h3>新建实例</h3>
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
      <tr>
        <td class="narrow-column"> <input type="checkbox" v-model="newEnable"> </td>
        <td class="narrow-column">
          <!-- 动态设置输入框的class，当name重复时变红 -->
          <input type="text" v-model="newName" :class="{'duplicate': isDuplicateNew(newName)}">
        </td>
        <td class="narrow-column">
          <select v-model="newServer">
            <option value="bilibili">b服</option>
            <option value="official">官服</option>
          </select>
        </td>
        <td> <input v-model="newAccount" type="text" /> </td>
        <td> <input v-model="newPassword" type="password"/> </td>
        <td>
          <button  @click="createInstance()">新建实例</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <h3>已有实例(切勿将服务器暴露到公网，否则密码泄露)</h3>
  <p>每个实例都有单独的清单、队伍文件、配置文件</p>
  <div>
    <button @click="saveInstancesConfig()">保存实例配置</button>
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

        <td class="narrow-column"> <input type="checkbox" v-model="item.enable"> </td>
        <td class="narrow-column">
          <!-- 动态设置输入框的class，当name重复时变红 -->
          <input readonly type="text" v-model="item.name" :class="{'duplicate': isDuplicate(item.name)}">
        </td>
<!--        <td class="narrow-column"> <input type="text" v-model="item.server"> </td>-->
        <td class="narrow-column">
          <select v-model="item.server">
            <option value="bilibili">b服</option>
            <option value="official">官服</option>
          </select>
        </td>
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
.duplicate {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
</style>
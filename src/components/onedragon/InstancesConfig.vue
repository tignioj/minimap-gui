<script setup>

import {isUndefinedNullOrEmpty} from "@/utils/objutils.js";
import {computed, inject, ref} from "vue";
import {
  createInstanceConfigURL,
  deleteConfigInstanceURL,
  getConfigInstancesURL,
  loginConfigInstance,
  saveInstancesConfigURL,
  setConfigInstanceURL
} from "@/api.js";
import {store} from "@/store.js";
const info = inject('info')
const errorMsg = inject('error')
const emit = defineEmits(["onSetInstance", "onDeleteInstance"])
defineExpose({
  updateInstances
})

const currentInstance = ref('')
function setInstance(name) {
  fetch(`${setConfigInstanceURL}/${name}`,{
    method: 'PUT'
  }).then(response => response.json())
      .then(data => {
        if (data.success) {
          info(data.message);
          currentInstance.value = name
          // 切换实例后，重新加载对应实例的配置文件
          // getOneDragonList()
          emit('onSetInstance', name)
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
const instances = ref([
  {name: 'default', server:'official', account: '', password: '', enable: true},
  {name: 'instance1', server:'bilibili', account: '', password: '', enable: false},
])
function updateInstances() {
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
updateInstances()
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
        updateInstances()
      })
      .catch(error => {
        errorMsg(error)
      });
}
// 检查名称是否重复
const isDuplicate = (name) => {
  return instances.value.filter(item => item.name === name.trim()).length > 1;
};
function dropInstances(item) {
  const fromIndex = instances.value.indexOf(dragItemInstance.value);
  const toIndex = instances.value.indexOf(item);
  instances.value.splice(fromIndex, 1);
  instances.value.splice(toIndex, 0, dragItemInstance.value);
}

const dragItemInstance = ref(null);
function dragStartInstance(item) { dragItemInstance.value = item; }
function dragOverInstance(e) { e.preventDefault(); }
const checkedInstancesItems = computed(() => {
  return instances.value.filter(item => item.enable);
});

function deleteInstance(name) {
  const ok = confirm("确认删除实例'" + name  + "'?")
  if (ok) {
    fetch(`${deleteConfigInstanceURL}/${name}`).then(response => response.json())
        .then(data => {
          if (data.success) {
            info(data.message);
            currentInstance.value = name
            // 删除实例后，重新加载对应实例的配置文件
            emit('onDeleteInstance', name)
            // 默认队伍刷新
            store.updateFightTeamList()
            // TodoList刷新
            store.updateTodoList()
            updateInstances()
          } else {
            errorMsg(data.message);
          }
        })
        .catch(error => {
          errorMsg(error)
        });
  }
}


function login(account, password, server) {
  const data = {
    account: account,
    password: password,
    server: server
  }
  info('开始登录')
  const jsonString = JSON.stringify(data)
  fetch(loginConfigInstance, {
    method: 'POST', // 请求方法
    headers: {
      'Content-Type': 'application/json' // 指定发送的数据格式为 JSON
    },
    body: jsonString // 将 JavaScript 对象转换为 JSON 字符串
  }).then(response => response.json())
      .then(data => {
        if (data.success) {
          info(data.message);
        } else {
          errorMsg(data.message);
        }
        getInstances()
      })
      .catch(error => {
        errorMsg(error)
      });
}


// 新建的实例名称是否重复
const isDuplicateNew = (name) => {
  return instances.value.filter(item => item.name === trimStr(name)).length > 0
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
        updateInstances()
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
        <th class="narrow-column">名称(不可重复)</th>
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
<!--            <option value="bilibili">b服</option>-->
            <option value="official">官服</option>
          </select>
        </td>
        <td> <input v-model="newAccount" type="text" /> </td>
        <td> <input v-model="newPassword" type="password"/> </td>
        <td>
          <button  @click="createInstance()" :disabled="isDuplicateNew(newName)">新建实例</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <h3>已有实例</h3>
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

        <td class="narrow-column"> <input type="checkbox" v-model="item.enable"> </td>
        <td class="narrow-column">
          <!-- 动态设置输入框的class，当name重复时变红 -->
          <input style="cursor: move" readonly type="text" v-model="item.name" :class="{'duplicate': isDuplicate(item.name)}">
        </td>
        <td class="narrow-column">
          <select v-model="item.server">
<!--            <option value="bilibili">b服</option>-->
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
          <button @click="login(item.account, item.password, item.server)" :disabled="isUndefinedNullOrEmpty(item.account) || isUndefinedNullOrEmpty(item.password) " >登录</button>
        </td>
      </tr>
      </tbody>
    </table>
    <button @click="saveInstancesConfig()">保存实例配置</button>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ccc;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.narrow-column {
  width: 50px;
  text-align: center;
}

tbody tr {
  cursor: move;
}

tbody tr:nth-child(even) {
  background-color: #f8f8f8;
}

tbody tr:hover {
  background-color: #e8e8e8;
}
.duplicate {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
</style>
<script setup>
import {computed, inject, ref} from 'vue';
import {oneDragonRunURL} from "@/api.js";
import {store} from "@/store.js";


function info(msg) {
  store.infoLog(msg)
}
function errorMsg(msg) {
  store.errorLog(msg)
}

const todoList = ref([
  { name: '清单', value: 'todo' , checked: false },
  { name: '战斗委托', value: 'dailyMission' , checked: false},
  { name: '地脉', value: 'leyLine' , checked: false},
  { name: '领取奖励', value: 'claimReward' , checked: false}
]);

const dragItem = ref(null);

function dragStart(item) {
  dragItem.value = item;
}

function dragOver(e) {
  e.preventDefault();
}

function drop(item) {
  const fromIndex = todoList.value.indexOf(dragItem.value);
  const toIndex = todoList.value.indexOf(item);
  todoList.value.splice(fromIndex, 1);
  todoList.value.splice(toIndex, 0, dragItem.value);
}

const checkedItems = computed(() => {
  return todoList.value.filter(item => item.checked);
});

function logCheckedItems() {
  console.log('选中的项目：', checkedItems.value);
}
function runAll() {
  logCheckedItems()
  const jsonString = JSON.stringify(todoList.value)
  const count = todoList.value.filter(item => item.checked).length;
  if(count === 0) {
    errorMsg('未勾选任何清单，无法执行')
    return
  }
  fetch(oneDragonRunURL, {
    method: 'POST', // 请求方法
    headers: {
      'Content-Type': 'application/json' // 指定发送的数据格式为 JSON
    },
    body: jsonString // 将 JavaScript 对象转换为 JSON 字符串
  }).then(response => {
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json(); // 解析响应为 JSON
  })
    .then(data => {
      if (data.success === true) {
        info(data.message)
      } else {
        errorMsg(data.message)
      }
      }).catch(error => {
    console.error('Error:', error); // 处理错误
    errorMsg(error)
  });
}
function stop() {

}
</script>

<template>
  <table>
    <thead>
    <tr>
      <th class="narrow-column">选择</th>
      <th>操作</th>
      <th>任务名称</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="item in todoList" :key="item.value"
        draggable="true"
        @dragstart="dragStart(item)"
        @dragover="dragOver"
        @drop="drop(item)">
      <td class="narrow-column">
        <input type="checkbox" v-model="item.checked">
      </td>
      <td><button>执行</button></td>
      <td>{{ item.name }}</td>
    </tr>
    </tbody>
  </table>
  <br/>
  <button @click="runAll" :disabled="checkedItems.length < 1">一键运行</button>
  <button @click="stop" >停止运行</button>
  <div>
    <h2>运行设置</h2>
    结束后:
    <select>
      <option value="">无</option>
      <option value="close">关闭游戏</option>
      <option value="shutdown">关机</option>
    </select>
  </div>
</template>
<style scoped>
table {
  width: 100%;
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

input[type="checkbox"] {
  margin: 0;
}
</style>
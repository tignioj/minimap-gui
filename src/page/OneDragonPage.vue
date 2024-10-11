<script setup>
import {computed, inject, onMounted, ref} from 'vue';
import {
  oneDragonGetURL,
  oneDragonRunURL,
  oneDragonSaveURL,
  oneDragonStopURL,
  socketURL
} from "@/api.js";
import {store} from "@/store.js";
import {
  SOCKET_EVENT_DAILY_MISSION_END,
  SOCKET_EVENT_DAILY_MISSION_EXCEPTION,
  SOCKET_EVENT_DAILY_MISSION_START,
  SOCKET_EVENT_DAILY_MISSION_UPDATE,
  SOCKET_EVENT_LEYLINE_OUTCROP_END,
  SOCKET_EVENT_LEYLINE_OUTCROP_EXCEPTION,
  SOCKET_EVENT_LEYLINE_OUTCROP_START,
  SOCKET_EVENT_LEYLINE_OUTCROP_UPDATE,
  SOCKET_EVENT_ONE_DRAGON_END,
  SOCKET_EVENT_ONE_DRAGON_EXCEPTION,
  SOCKET_EVENT_ONE_DRAGON_START,
  SOCKET_EVENT_ONE_DRAGON_UPDATE,
  SOCKET_EVENT_PLAYBACK_END,
  SOCKET_EVENT_PLAYBACK_EXCEPTION,
  SOCKET_EVENT_PLAYBACK_START,
  SOCKET_EVENT_PLAYBACK_UPDATE,
  useWebSocket
} from "@/utils/websocket_listener_utils.js";


function info(msg) {
  store.infoLog(msg)
}
function errorMsg(msg) {
  store.errorLog(msg)
}



const oneDragonList = ref([
  { name: '清单', value: 'todo' , checked: false },
  { name: '战斗委托', value: 'dailyMission' , checked: true},
  { name: '地脉', value: 'leyLine' , checked: true},
  { name: '领取奖励', value: 'claimReward' , checked: true}
]);


const afterOneDragon = ref('')


// 清单拖动
const dragItem = ref(null);
function dragStart(item) { dragItem.value = item; }
function dragOver(e) { e.preventDefault(); }

function drop(item) {
  const fromIndex = oneDragonList.value.indexOf(dragItem.value);
  const toIndex = oneDragonList.value.indexOf(item);
  oneDragonList.value.splice(fromIndex, 1);
  oneDragonList.value.splice(toIndex, 0, dragItem.value);
}

const checkedItems = computed(() => {
  return oneDragonList.value.filter(item => item.checked);
});

function logCheckedItems() {
  console.log('选中的项目：', checkedItems.value);
}

function runAll() {
  logCheckedItems()
  const jsonString = JSON.stringify(oneDragonList.value)
  const count = oneDragonList.value.filter(item => item.checked).length;
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
  fetch(oneDragonStopURL).then(response=> {
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json(); // 解析响应为 JSON
  }).then(data => {
    if (data.success === true) { info(data.message)
    } else { errorMsg(data.message) }
  }).catch(error => { console.error('Error:', error)}); // 处理错误 errorMsg(error)
}
const { socket} = useWebSocket(socketURL, {});
onMounted(()=> {
  socket.value.on(SOCKET_EVENT_ONE_DRAGON_START, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_ONE_DRAGON_END, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_ONE_DRAGON_UPDATE, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_ONE_DRAGON_EXCEPTION, (data)=> { errorMsg(data) })

  socket.value.on(SOCKET_EVENT_PLAYBACK_START, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_PLAYBACK_END, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_PLAYBACK_EXCEPTION, (data)=> { errorMsg(data) })
  socket.value.on(SOCKET_EVENT_PLAYBACK_UPDATE, (data)=> { info(data) })


  socket.value.on(SOCKET_EVENT_DAILY_MISSION_START, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_DAILY_MISSION_UPDATE, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_DAILY_MISSION_EXCEPTION, (data)=> { errorMsg(data) })
  socket.value.on(SOCKET_EVENT_DAILY_MISSION_END, (data)=> { info(data) })

  socket.value.on(SOCKET_EVENT_LEYLINE_OUTCROP_START, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_LEYLINE_OUTCROP_UPDATE, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_LEYLINE_OUTCROP_EXCEPTION, (data)=> { errorMsg(data) })
  socket.value.on(SOCKET_EVENT_LEYLINE_OUTCROP_END, (data)=> { info(data) })
})

const gameFolder = ref('');

function save() {
  logCheckedItems()
  const jsonString = JSON.stringify(oneDragonList.value)

  fetch(oneDragonSaveURL, {
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


function getOneDragonList() {
  fetch(oneDragonGetURL).then(response => {
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json(); // 解析响应为 JSON
  })
      .then(data => {
        if (data.success === true) {
          const result = data.data
          console.log(result)
          oneDragonList.value = result
        } else {
          errorMsg(data.message)
        }
      }).catch(error => {
    console.error('Error:', error); // 处理错误
    errorMsg(error)
  });
}
getOneDragonList();
</script>


<template>

  <h2>一条龙清单</h2>
  <table>
    <thead>
    <tr>
      <th class="narrow-column">选择</th>
<!--      <th>操作</th>-->
      <th>任务名称</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="item in oneDragonList" :key="item.value"
        draggable="true"
        @dragstart="dragStart(item)"
        @dragover="dragOver"
        @drop="drop(item)">
      <td class="narrow-column">
        <input type="checkbox" v-model="item.checked">
      </td>
<!--      <td><button>执行</button></td>-->
      <td>{{ item.name }}</td>
    </tr>
    </tbody>
  </table>
  <br/>
  <button @click="save">保存设置</button>
  <button @click="runAll" :disabled="checkedItems.length < 1">一键运行</button>
  <button @click="stop" >停止运行</button>
  <div>
    <h2>一条龙设置（保存后生效）</h2>
<!--    <div>-->
<!--      游戏目录:-->
<!--      <input type="text" v-model="gameFolder" />-->
<!--      <p v-if="gameFolder">{{ gameFolder }}</p>-->
<!--    </div>    -->
    结束后:
    <select v-model="afterOneDragon">
      <option value="">无</option>
      <option value="close">关闭游戏</option>
      <option value="sleep">休眠</option>
      <option value="shutdown">关机</option>
    </select>
    <br/>
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
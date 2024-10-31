<script setup>
import {computed, onMounted, provide, ref} from 'vue';
import {
  getConfigInstancesURL,
  oneDragonGetURL, oneDragonRunAllInstanceURL,
  oneDragonRunURL,
  oneDragonSaveURL,
  oneDragonStopURL, saveInstancesConfigURL, setConfigInstanceURL,
  socketURL
} from "@/api.js";
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

  SOCKET_EVENT_DOMAIN_UPDATE,
  SOCKET_EVENT_DOMAIN_EXCEPTION,
  SOCKET_EVENT_DOMAIN_END,
  SOCKET_EVENT_DOMAIN_START,
  SOCKET_EVENT_KEY_EVENT,
  useWebSocket
} from "@/utils/websocket_listener_utils.js";
import MessageComponent from "@/components/common/MessageComponent.vue";
import {isUndefinedNullOrEmpty} from "@/utils/objutils.js";
import {store} from "@/store.js";
import InstancesConfig from "@/components/onedragon/InstancesConfig.vue";
const msgComponentRef = ref(null)


function info(msg) {
  msgComponentRef.value.info(msg)
}
function errorMsg(msg) {
  msgComponentRef.value.error(msg)
}
provide('info', info)
provide('error', errorMsg)

const oneDragonList = ref([
  { name: '登录', value: 'login' , checked: false},
  { name: '战斗委托', value: 'dailyMission' , checked: true},
  { name: '秘境', value: 'domain', checked: true},
  { name: '地脉', value: 'leyLine' , checked: true},
  { name: '领取奖励', value: 'claimReward' , checked: true},
  { name: '清单', value: 'todo' , checked: false},
  { name: '系统命令', value: 'sleepSys' , checked: true}
]);
// sleepSys: 睡眠， closeGame: 关闭游戏， shutdownSys:关机


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

function runCurrentInstance() {
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

  socket.value.on(SOCKET_EVENT_DOMAIN_START, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_DOMAIN_UPDATE, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_DOMAIN_EXCEPTION, (data)=> { errorMsg(data) })
  socket.value.on(SOCKET_EVENT_DOMAIN_END, (data)=> { info(data) })
})

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

const instanceConfigRef = ref(null)
function runAllInstance() {
  info("开始执行所有实例的一条龙")
  fetch(oneDragonRunAllInstanceURL).then(response => {
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json(); // 解析响应为 JSON
  })
      .then(data => {
        if (data.success === true) {
          getOneDragonList()
          instanceConfigRef.value.updateInstances()
        } else {
          errorMsg(data.message)
        }
      }).catch(error => {
    console.error('Error:', error); // 处理错误
    errorMsg(error)
  });
}

</script>

<template>
  <MessageComponent ref="msgComponentRef" />
  <h2>一条龙清单</h2>
  <table>
    <thead>
    <tr>
      <th class="narrow-column">选择</th>
<!--      <th>操作</th>-->
      <th>任务名称</th>
      <th>选项</th>
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

      <td v-if="item.name === '系统命令'">
        <select v-model="item.value">
          <option value="">无</option>
          <option value="closeGame">关闭游戏</option>
          <option value="sleepSys">休眠</option>
          <option value="shutdownSys">关机</option>
        </select>
      </td>
      <td v-else></td>
    </tr>
    </tbody>
  </table>
  <br/>
  <button @click="save">保存设置</button>
  <button @click="runCurrentInstance" :disabled="checkedItems.length < 1">一键运行当前实例</button>
  <button @click="stop" >停止运行</button>

  <InstancesConfig ref="instanceConfigRef" @on-set-instance="getOneDragonList" @on-delete-instance="getOneDragonList"/>
  <hr/>
  <button @click="runAllInstance()">一键运行所有实例</button>

  <h2>说明</h2>
  <p>若要登录，前往<RouterLink to="/config/editor">配置</RouterLink>界面设置game_path为游戏目录, 每个实例都要配置一次</p>
  <p>每个实例都是独立的清单、战斗文件、配置文件</p>
  <p>一条龙配置将保存到 _internal/resources/user-实例名称/one_dragon.json </p>
  <p>账号密码配置将保存到 _internal/account.yaml </p>
  <p>切勿将服务器暴露到公网，否则密码泄露</p>

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

input[type="checkbox"] {
  margin: 0;
}
</style>
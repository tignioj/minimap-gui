<script setup>
import {runDailyMissionTaskURL, socketURL, stopDailyMissionTaskURL} from "@/api.js";
import {onMounted, ref} from "vue";
import {useWebSocket,
  SOCKET_EVENT_DAILY_MISSION_EXCEPTION,
  SOCKET_EVENT_DAILY_MISSION_END,SOCKET_EVENT_DAILY_MISSION_START,
  SOCKET_EVENT_DAILY_MISSION_UPDATE
} from "@/utils/websocket_listener_utils.js";
const msgRef = ref(null)
function info(msg) {
  if (msgRef.value) {
    msgRef.value.innerText = msg
    msgRef.value.classList.remove("error-msg")
  }
  console.log(msg)
}
function errorMsg(msg) {
  if (msgRef.value) {
    msgRef.value.innerText = msg
    msgRef.value.classList.add("error-msg")
  }
  console.error(msg)
}

function  dailyMissionRun() {
  fetch(runDailyMissionTaskURL).then(response => {
    if (!response.ok) { throw new Error('Network response was not ok ' + response.statusText); }
    return response.json(); // 解析响应为 JSON
  })
      .then(data => {
        console.log('Success:', data); // 处理成功的响应
        if(data.success) {
          info(data.message)
        } else {
          errorMsg(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error); // 处理错误
        errorMsg(error)
      });
}
function  dailyMissionStop() {
  fetch(stopDailyMissionTaskURL).then(response => {
    if (!response.ok) { throw new Error('Network response was not ok ' + response.statusText); }
    return response.json(); // 解析响应为 JSON
  })
      .then(data => {
        console.log('Success:', data); // 处理成功的响应
        if(data.success) {
          info(data.message)
        } else {
          errorMsg(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error); // 处理错误
        errorMsg(error)
      });
}
const {socket} = useWebSocket(socketURL,{})

onMounted(()=> {
  socket.value.on(SOCKET_EVENT_DAILY_MISSION_START, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_DAILY_MISSION_UPDATE, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_DAILY_MISSION_END, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_DAILY_MISSION_EXCEPTION, (data)=> { errorMsg(data) })
})

const executeTotalTime = ref(400)
const fightDuration = ref(50)

</script>
<template>

  <p ref="msgRef"></p>
  <button @click="dailyMissionRun">执行每日委托</button>
  <button @click="dailyMissionStop">停止执行</button>
  <h3>说明</h3>
  <p>只能做蒙德的战斗委托，委托相关配置请在<RouterLink to="/config/editor">配置</RouterLink>中找到'委托配置',
    战斗队伍请到<RouterLink to="/team">战斗队伍管理</RouterLink> 中设置默认队伍</p>

</template>

<style scoped>
.error-msg {
  color: red;
}

</style>
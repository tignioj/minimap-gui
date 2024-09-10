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


</script>
<template>

  <p ref="msgRef"></p>
  <button @click="dailyMissionRun">执行每日委托</button>
  <button @click="dailyMissionStop">停止执行</button>
  <h3>使用手册</h3>
  <p>1. 将委托地点调整到蒙德，等委托更新后才可以使用，仅能完成战斗委托。</p>
  <p>2. 前往<RouterLink to="/team">战斗队伍管理</RouterLink> 中设置或者添加您的默认队伍,怪物可能包含各种元素盾,确保您的队伍有足够的伤害完成委托。</p>
  <p>3. 建议队伍中配备风c以应对各种元素盾。 </p>
  <p>4. 根据战斗委托的特性: '按数量消灭怪物时，若第一次没打完全部怪物，第二次再去, 仅需要打剩下未死亡的怪物', 因此无需担心首次没做完，本程序会一直检测直到超时。</p>
  <p>5. 超时时间以及其他委托相关配置请在<RouterLink to="/config/editor">配置</RouterLink>中找到'委托配置'。 </p>

</template>

<style scoped>
.error-msg {
  color: red;
}

</style>
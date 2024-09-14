<script setup>
import {socketURL, runLeyLineOutcropURL, stopLeyLineOutcropURL} from "@/api.js";
import {onMounted, ref} from "vue";
import {useWebSocket,
  SOCKET_EVENT_LEYLINE_OUTCROP_EXCEPTION,
  SOCKET_EVENT_LEYLINE_OUTCROP_END,SOCKET_EVENT_LEYLINE_OUTCROP_START,
  SOCKET_EVENT_LEYLINE_OUTCROP_UPDATE
} from "@/utils/websocket_listener_utils.js";
import {store} from "@/store.js";
const msgRef = ref(null)
function info(msg) {
  store.infoLog(msg)
  if (msgRef.value) {
    msgRef.value.innerText = msg
    msgRef.value.classList.remove("error-msg")
  }
  console.log(msg)
}
function errorMsg(msg) {
  store.errorLog(msg)
  if (msgRef.value) {
    msgRef.value.innerText = msg
    msgRef.value.classList.add("error-msg")
  }
  console.error(msg)
}

function  leyLineRun(leyLineType) {
  const url = `${runLeyLineOutcropURL}/${leyLineType}`
  fetch(url).then(response => {
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
function  leyLineStop() {
  fetch(stopLeyLineOutcropURL).then(response => {
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
  socket.value.on(SOCKET_EVENT_LEYLINE_OUTCROP_START, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_LEYLINE_OUTCROP_UPDATE, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_LEYLINE_OUTCROP_END, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_LEYLINE_OUTCROP_EXCEPTION, (data)=> { errorMsg(data) })
})


</script>
<template>

  <p ref="msgRef"></p>
  <button @click="leyLineRun('experience')">执行地脉-经验</button>
  <button @click="leyLineRun('money')">执行地脉-摩拉</button>
  <button @click="leyLineStop">停止执行</button>
  <h3>使用手册</h3>
  <p>1. 前往<RouterLink to="/team">战斗队伍管理</RouterLink> 中设置或者添加您的默认队伍,怪物可能包含各种元素盾,确保您的队伍有足够的伤害完成地脉任务。</p>
  <p>2. 建议队伍中配备风c以应对各种元素盾。 </p>
  <p>3. 根据战斗委托的特性: '按数量消灭怪物时，若第一次没打完全部怪物，第二次再去, 仅需要打剩下未死亡的怪物', 因此无需担心首次没做完，本程序会一直检测直到超时。</p>
  <p>4. 如果树脂还尚未耗尽但是程序结束，可以适当延长超时时间。相关配置请在<RouterLink to="/config/editor">配置</RouterLink>中找到'地脉配置'。 </p>
  <p>5. 角色死亡会自动使用道具复活(但是不会吃鸡回血)，如需关掉请在配置的'路径执行器配置'中找到'enable_food_revive: 1', 将其设置为'enable_food_revive: 0'。</p>
  <p>6. 复活后，若是120秒内再次死亡导致无法使用道具复活，则会自动回璃月荻花洲七天神像，接着继续搜索蒙德地脉直到超时或者树脂完全消耗</p>

  <h3>已知问题</h3>
  <p>1. 委托图标可能会挡住地脉图标</p>


</template>

<style scoped>
.error-msg {
  color: red;
}

</style>
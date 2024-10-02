<script setup>
import {
  runDailyMissionTaskURL,
  socketURL,
  stopDailyMissionTaskURL,
  dailyMissionSetConfigURL,
  dailyMissionGetConfigURL,
    claimRewardURL,
} from "@/api.js";
import {onMounted, ref, watch} from "vue";
import {useWebSocket,
  SOCKET_EVENT_DAILY_MISSION_EXCEPTION,
  SOCKET_EVENT_DAILY_MISSION_END,SOCKET_EVENT_DAILY_MISSION_START,
  SOCKET_EVENT_DAILY_MISSION_UPDATE
} from "@/utils/websocket_listener_utils.js";
import {store} from "@/store.js";
import FightTeamSelect from "@/components/task/FightTeamSelect.vue";
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

function saveConfig() {
    const data = {
      daily_task_execute_timeout: daily_task_execute_timeout.value,
      daily_task_fight_timeout: daily_task_fight_timeout.value,
      daily_task_destroy_timeout: daily_task_destroy_timeout.value,
      daily_task_fight_team: daily_task_fight_team.value,
  }
  // // 序列化为 JSON 字符串
  const jsonString = JSON.stringify(data);
  fetch(dailyMissionSetConfigURL, {
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
          info("保存委托设置成功")
        } else {
          errorMsg(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error); // 处理错误
        errorMsg(error)
      });

}


// # 每日委托总计最长执行时间，允许范围(60~3600)秒
const daily_task_execute_timeout = ref(1000)
// # 每日委托单次战斗最长执行时间，允许范围(10~400)秒
const daily_task_fight_timeout = ref(40)
// # 每日委托破坏单个柱子(攀高危险)最长执行时间，允许范围(10~400)秒
const daily_task_destroy_timeout = ref(20)


const limitDailyTaskExecuteTimeout = () => {
  daily_task_execute_timeout.value = Math.max(60, Math.min(3600, daily_task_execute_timeout.value))
}

const limitDailyTaskFightTimeout = () => {
  daily_task_fight_timeout.value = Math.max(10, Math.min(400, daily_task_fight_timeout.value))
}

const limitDailyTaskDestroyTimeout = () => {
  daily_task_destroy_timeout.value = Math.max(10, Math.min(400, daily_task_destroy_timeout.value))
}

const daily_task_fight_team = ref('')

function getConfig() {
  fetch(dailyMissionGetConfigURL).then(response => {
    if (!response.ok) { throw new Error('Network response was not ok ' + response.statusText); }
    return response.json(); // 解析响应为 JSON
  }).then(data => {
    console.log('Success:', data); // 处理成功的响应
    if(data.success) {
      info(data.message)
      const result = data.data
      // # 每日委托总计最长执行时间，允许范围(60~3600)秒
      daily_task_execute_timeout.value = result.daily_task_execute_timeout
      daily_task_fight_timeout.value = result.daily_task_fight_timeout
      daily_task_destroy_timeout.value = result.daily_task_destroy_timeout
      daily_task_fight_team.value = result.daily_task_fight_team
    } else {
      errorMsg(data.message)
    }
  })
      .catch(error => {
        console.error('Error:', error); // 处理错误
        errorMsg(error)
      });
}
getConfig()

function claimReward() {
  fetch(claimRewardURL).then(response => {
    if (!response.ok) { throw new Error('Network response was not ok ' + response.statusText); }
    return response.json(); // 解析响应为 JSON
  }).then(data => {
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

</script>
<template>
  <p ref="msgRef"></p>
  <button @click="dailyMissionRun">执行每日委托</button> <button @click="dailyMissionStop">停止执行</button>
  <br/>
  <br/>
  <button @click="claimReward">领取今日奖励(枫丹凯瑟琳)</button>
  <h2>委托设置(保存后生效)</h2>
  战斗队伍: <FightTeamSelect v-model:fightTeamSelect="daily_task_fight_team"/> <br/>
  每日委托总计最长执行时间，允许范围(60~3600)秒
  <input type="number" v-model="daily_task_execute_timeout" @blur="limitDailyTaskExecuteTimeout"/> <br/>

  每日委托单次战斗最长执行时间，允许范围(10~400)秒
  <input type="number" v-model="daily_task_fight_timeout" @blur="limitDailyTaskFightTimeout"/> <br/>

  每日委托破坏单个柱子(攀高危险)最长执行时间，允许范围(10~400)秒
  <input type="number" v-model="daily_task_destroy_timeout" @blur="limitDailyTaskDestroyTimeout"/> <br/>
  <button @click="saveConfig()">保存设置</button>
  <h3>使用手册</h3>
  <p>1. 在游戏中将委托地点调整到蒙德，等第二天委托更新后才可以使用。注：仅能完成战斗委托。</p>
  <p>2. 前往<RouterLink to="/team">战斗队伍管理</RouterLink> 中设置或者添加您的默认队伍,怪物可能包含各种元素盾,确保您的队伍有足够的伤害完成委托。</p>
  <p>3. 建议队伍中配备风c以应对各种元素盾。 </p>
  <p>4. 根据战斗委托的特性: '按数量消灭怪物时，若第一次没打完全部怪物，第二次再去, 仅需要打剩下未死亡的怪物', 因此无需担心首次没做完，本程序会一直检测直到超时。</p>
  <p>5. 角色死亡会自动使用道具复活(但是不会吃鸡回血)，如需关掉请在配置的'路径执行器配置'中找到'enable_food_revive: 1', 将其设置为'enable_food_revive: 0'</p>

</template>

<style scoped>
.error-msg {
  color: red;
}

</style>
<script setup>
import {
  socketURL,
  runLeyLineOutcropURL,
  stopLeyLineOutcropURL,
  leyLineOutcropSetConfigURL, leyLineOutcropGetConfigURL
} from "@/api.js";
import {onMounted, ref} from "vue";
import {useWebSocket,
  SOCKET_EVENT_LEYLINE_OUTCROP_EXCEPTION,
  SOCKET_EVENT_LEYLINE_OUTCROP_END,SOCKET_EVENT_LEYLINE_OUTCROP_START,
  SOCKET_EVENT_LEYLINE_OUTCROP_UPDATE
} from "@/utils/websocket_listener_utils.js";
import FightTeamSelect from "@/components/task/FightTeamSelect.vue";
import MessageComponent from "@/components/common/MessageComponent.vue";
const msgComponentRef = ref(null)
function info(msg) {
  msgComponentRef.value.info(msg)
}
function errorMsg(msg) {
  msgComponentRef.value.error(msg)
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
// # 地脉总计最长执行时间，允许范围(60~3600)秒
const leyline_outcrop_task_execute_timeout = ref(1000)
// # 地脉单次战斗最长执行时间，允许范围(10~400)秒
const leyline_outcrop_task_fight_timeout = ref(40)
// # 领取地脉奖励后，是否使用万叶拾取材料（需要队伍中有万叶）true表示开启，false表示关闭
const leyline_enable_wanye_pickup_after_reward = ref(true)
// # 地脉指定队伍, 空白则使用默认队伍
const leyline_fight_team = ref('')
const leyline_type = ref('money')

const limitLeyLineTaskExecuteTimeout = () => {
  leyline_outcrop_task_execute_timeout.value = Math.max(60, Math.min(3600, leyline_outcrop_task_execute_timeout.value))
}

const limitLeyLineTaskFightTimeout = () => {
  leyline_outcrop_task_fight_timeout.value = Math.max(10, Math.min(400, leyline_outcrop_task_fight_timeout.value))
}


function saveConfig() {
  const data = {
    leyline_outcrop_task_execute_timeout: leyline_outcrop_task_execute_timeout.value,
    leyline_outcrop_task_fight_timeout: leyline_outcrop_task_fight_timeout.value,
    leyline_enable_wanye_pickup_after_reward: leyline_enable_wanye_pickup_after_reward.value,
    leyline_fight_team: leyline_fight_team.value,
    leyline_type: leyline_type.value
  }
  // // 序列化为 JSON 字符串
  const jsonString = JSON.stringify(data);
  fetch(leyLineOutcropSetConfigURL, {
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
          info("保存地脉设置成功")
        } else {
          errorMsg(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error); // 处理错误
        errorMsg(error)
      });
}
function getConfig() {
  fetch(leyLineOutcropGetConfigURL).then(response => {
    if (!response.ok) { throw new Error('Network response was not ok ' + response.statusText); }
    return response.json(); // 解析响应为 JSON
  }).then(data => {
    if(data.success) {
      const result = data.data
      leyline_outcrop_task_execute_timeout.value = result.leyline_outcrop_task_execute_timeout
      leyline_outcrop_task_fight_timeout.value = result.leyline_outcrop_task_fight_timeout
      leyline_enable_wanye_pickup_after_reward.value = result.leyline_enable_wanye_pickup_after_reward
      leyline_fight_team.value = result.leyline_fight_team
      leyline_type.value = result.leyline_type
    } else {
      errorMsg("无法加载地脉配置:" + data.message)
    }
  })
      .catch(error => {
        console.error('Error:', error); // 处理错误
        errorMsg(error)
      });
}
getConfig()
</script>
<template>

  <MessageComponent ref="msgComponentRef" />
  <button @click="leyLineRun('experience')">执行地脉-经验</button>
  <button @click="leyLineRun('money')">执行地脉-摩拉</button>
  <button @click="leyLineStop">停止执行</button>

  <h2>地脉设置(保存后生效)</h2>
  地脉类型:
  <input name="leyLineType" type="radio" value="money" v-model="leyline_type" :checked="leyline_type === 'money'">摩拉
  <input name="leyLineType" type="radio" value="exp" v-model="leyline_type" :checked="leyline_type === 'exp'">经验
  <br/>

  战斗队伍: <FightTeamSelect v-model:fightTeamSelect="leyline_fight_team"/> <br/>
  地脉总计最长执行时间，允许范围(60~3600)秒
  <input type="number" v-model="leyline_outcrop_task_execute_timeout" @blur="limitLeyLineTaskExecuteTimeout"/> <br/>

  地脉单次战斗最长执行时间，允许范围(10~400)秒
  <input type="number" v-model="leyline_outcrop_task_fight_timeout" @blur="limitLeyLineTaskFightTimeout"/> <br/>

  领取地脉奖励后，是否使用万叶拾取材料（需要队伍中有万叶）
  开启<input name="pickup" type="radio" :value="true" v-model="leyline_enable_wanye_pickup_after_reward"/>
  关闭<input name="pickup" type="radio" :value="false" v-model="leyline_enable_wanye_pickup_after_reward"/>
  <br/>

<!--  <input v-model="selectedFightTeam" type="radio" name="team" :value="team" /> {{ team }}-->

  <button @click="saveConfig()">保存设置</button>
  <h3>使用手册</h3>
  <p>1. 前往<RouterLink to="/team">战斗队伍管理</RouterLink> 中设置或者添加您的默认队伍,怪物可能包含各种元素盾,确保您的队伍有足够的伤害完成地脉任务。</p>
  <p>2. 建议队伍中配备风c以应对各种元素盾。 </p>
  <p>3. 根据战斗委托的特性: '按数量消灭怪物时，若第一次没打完全部怪物，第二次再去, 仅需要打剩下未死亡的怪物', 因此无需担心首次没做完，本程序会一直检测直到超时。</p>
  <p>4. 如果树脂还尚未耗尽但是程序结束，可以适当延长超时时间。相关配置也可以在<RouterLink to="/config/editor">配置</RouterLink>中找到'地脉配置'。 </p>
  <p>5. 角色死亡会自动使用道具复活(但是不会吃鸡回血)，如需关掉请在配置的'路径执行器配置'中找到'enable_food_revive: 1', 将其设置为'enable_food_revive: 0'。</p>
  <p>6. 复活后，若是120秒内再次死亡导致无法使用道具复活，则会自动回璃月荻花洲七天神像，接着继续搜索蒙德地脉直到超时或者树脂完全消耗</p>

  <h3>注意事项</h3>
  <p>1. 委托图标可能会挡住地脉图标, 如果存在遮挡则先把遮挡的委托做完再做地脉</p>
  <p>2. 领取奖励时，是通过判断'宝箱小图标'判断，如果地脉附近存在未领取的宝箱并且屏幕中显示该小图标时, 可能会导致无法进入战斗, 此种情况请先开启宝箱</p>


</template>

<style scoped>
</style>
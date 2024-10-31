<script setup>
import FightTeamSelect from "@/components/task/FightTeamSelect.vue";
import {ref} from "vue";
import {domainConfigGet, domainConfigSet, domainListURL, domainRunURL, domainStopURL} from "@/api.js";
import MessageComponent from "@/components/common/MessageComponent.vue";
import {isUndefinedNullOrEmpty} from "@/utils/objutils.js";

const msgEle = ref(null)
function errorMsg(msg) {
  msgEle.value.error(msg)
}
function info(msg) {
  msgEle.value.info(msg)
}

const domainList = ref([
  {
    "name": "仲夏庭园",
    "country": "蒙德",
    "type": "圣遗物",
    "position": [
      3908.1562,
      -6226.022
    ]
  },
  {
    "name": "塞西莉亚苗圃",
    "country": "蒙德",
    "type": "武器突破素材",
    "position": [
      1266.0,
      -5753.0
    ]
  },
  {
    "name": "震雷连山密宫",
    "country": "蒙德",
    "type": "武器突破素材",
    "position": [
      1622.3379,
      -2708.6192
    ]
  },
  {
    "name": "铭记之谷",
    "country": "蒙德",
    "type": "圣遗物",
    "position": [
      2115.8008,
      -4643.8292
    ]
  },
  {
    "name": "孤云凌霄之处",
    "country": "璃月",
    "type": "圣遗物",
    "position": [
      2720.9785199999997,
      -656.53028
    ]
  },
  {
    "name": "无妄引咎密宫",
    "country": "蒙德",
    "type": "圣遗物",
    "position": [
      4.990239999999972,
      -4625.9698
    ]
  },
  {
    "name": "华池岩岫",
    "country": "璃月",
    "type": "圣遗物",
    "position": [
      -2068.0,
      -3821.0
    ]
  },
  {
    "name": "忘却之峡",
    "country": "蒙德",
    "type": "天赋培养素材",
    "position": [
      2573.7949200000003,
      -4599.8194
    ]
  },
  {
    "name": "太山府",
    "country": "璃月",
    "type": "天赋培养素材",
    "position": [
      -1546.0,
      -2557.0
    ]
  },
  {
    "name": "芬德尼尔之顶",
    "country": "蒙德",
    "type": "圣遗物",
    "position": [
      2437.42968,
      -3319.3398
    ]
  },
  {
    "name": "山脊守望",
    "country": "蒙德",
    "type": "圣遗物",
    "position": [
      1433.4531200000001,
      -4181.544
    ]
  },
  {
    "name": "砂流之庭",
    "country": "稻妻",
    "type": "武器突破素材",
    "position": [
      9602.854,
      3558.7266
    ]
  },
  {
    "name": "菫色之庭",
    "country": "稻妻",
    "type": "天赋培养素材",
    "position": [
      8657.9414,
      5168.1406
    ]
  },
  {
    "name": "椛染之庭",
    "country": "稻妻",
    "type": "圣遗物",
    "position": [
      5524.5312,
      6304.164
    ]
  },
  {
    "name": "沉眠之庭",
    "country": "稻妻",
    "type": "圣遗物",
    "position": [
      9213.293,
      7356.5740000000005
    ]
  },
  {
    "name": "岩中幽谷",
    "country": "璃月",
    "type": "圣遗物",
    "position": [
      -3004.246,
      -287.3994
    ]
  },
  {
    "name": "昏识塔",
    "country": "璃月",
    "type": "天赋培养素材",
    "position": [
      -5240.92,
      -1053.66
    ]
  },
  {
    "name": "缘觉塔",
    "country": "璃月",
    "type": "圣遗物",
    "position": [
      -3632.9424,
      -112.4423999999999
    ]
  },
  {
    "name": "有顶塔",
    "country": "须弥",
    "type": "武器突破素材",
    "position": [
      -6153.04,
      2253.7676
    ]
  },
  {
    "name": "赤金的城墟",
    "country": "须弥",
    "type": "圣遗物",
    "position": [
      -7793.165999999999,
      1574.6992
    ]
  },
  {
    "name": "熔铁的孤塞",
    "country": "须弥",
    "type": "圣遗物",
    "position": [
      -11316.8594,
      -1092.03222
    ]
  },
  {
    "name": "苍白的遗荣",
    "country": "枫丹",
    "type": "天赋培养素材",
    "position": [
      -7587.623046000001,
      -7217.315918
    ]
  },
  {
    "name": "深潮的余响",
    "country": "枫丹",
    "type": "武器突破素材",
    "position": [
      -8615.60254,
      -9153.028808
    ]
  },
  {
    "name": "罪祸的终末",
    "country": "枫丹",
    "type": "圣遗物",
    "position": [
      -8663.15039,
      -4946.6479500000005
    ]
  },
  {
    "name": "临瀑之城",
    "country": "枫丹",
    "type": "圣遗物",
    "position": [
      -7099.6748,
      -6179.831
    ]
  },
  {
    "name": "褪色的剧场",
    "country": "须弥",
    "type": "圣遗物",
    "position": [
      -7615.6006,
      -3816.0772
    ]
  },
  {
    "name": "蕴火的幽墟",
    "country": "纳塔",
    "type": "天赋培养素材",
    "position": [
      -14797.3740234376,
      2494.4523925782
    ]
  },
  {
    "name": "深古瞭望所",
    "country": "纳塔",
    "type": "武器突破素材",
    "position": [
      -15560.0693359376,
      2501.7631835938
    ]
  },
  {
    "name": "虹灵的净土",
    "country": "纳塔",
    "type": "圣遗物",
    "position": [
      -17292.578125,
      3601.9599609376
    ]
  }
])
const domainWeekPlan = ref([
  "仲夏庭园",
  "仲夏庭园",
  "仲夏庭园",
  "仲夏庭园",
  "仲夏庭园",
  "仲夏庭园",
  "仲夏庭园"
])

// 为每个秘境设置单独的队伍
const domainTeamMapper = ref({
  "仲夏庭园": "纳西妲_芙宁娜_钟离_那维莱特_(草龙芙中).txt",
  "塞西莉亚苗圃": "",
  "震雷连山密宫": "",
  "铭记之谷": "",
  "孤云凌霄之处": "",
  "无妄引咎密宫": "",
  "华池岩岫": "",
  "忘却之峡": "",
  "太山府": "",
  "芬德尼尔之顶": "",
  "山脊守望": "",
  "砂流之庭": "",
  "菫色之庭": "",
  "椛染之庭": "",
  "沉眠之庭": "",
  "岩中幽谷": "",
  "昏识塔": "",
  "缘觉塔": "",
  "有顶塔": "",
  "赤金的城墟": "",
  "熔铁的孤塞": "",
  "苍白的遗荣": "",
  "深潮的余响": "",
  "罪祸的终末": "",
  "临瀑之城": "",
  "褪色的剧场": "",
  "蕴火的幽墟": "",
  "深古瞭望所": "",
  "虹灵的净土": ""
})

function toggle(index,name) {
  console.log(domainWeekPlan.value[index], name)
  if (domainWeekPlan.value[index] !== name) return

  if (domainWeekPlan.value[index].length > 0) {
    console.log("设置为空")
    domainWeekPlan.value[index] = ''
  } else {
    domainWeekPlan.value[index] = name
  }
}

function loadDomainList() {
  fetch(domainListURL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(json => {
        if (json.success === true) {
          domainList.value = json.data
        } else {
          errorMsg(json.message)
        }
      })
      .catch(error => { console.error('There was a problem with the fetch operation:', error); });
}
loadDomainList()
function loadDomainConfig() {
  fetch(domainConfigGet)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(json => {
        if (json.success === true) {
          const result = json.data
          domainLoopTimeout.value = result['domain_loop_timeout']
          domainWeekPlan.value = result['domain_week_plain']
          domainTeamMapper.value = result['domain_team_mapper']
        } else {
          errorMsg(json.message)
        }
      })
      .catch(error => { console.error('There was a problem with the fetch operation:', error); });
}
loadDomainConfig()

function saveDomainConfig() {
  if (isUndefinedNullOrEmpty(domainLoopTimeout.value))  {
    errorMsg("超时时间不能为空")
    return
  }
  if (domainWeekPlan.value.length !== 7) {
    errorMsg("秘境计划长度必须是7")
  }
  const data = {
    'domain_week_plain': domainWeekPlan.value,
    'domain_loop_timeout': domainLoopTimeout.value,
    'domain_team_mapper': domainTeamMapper.value
  }
  const jsonString = JSON.stringify(data);

  fetch(domainConfigSet, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',  // 使用纯文本格式上传
    },
    body: jsonString,  // 直接发送 YAML 文本
  }).then(response => {
    if (!response.ok)  throw new Error('Network response was not ok ' + response.statusText);
    return response.json()
  }).then(data => {
    if (data.success === true) {
      info(data.message);
      loadDomainConfig()
    } else {
      errorMsg(data.message);
    }
  }).catch(error => { errorMsg(error) });
}

const domainLoopTimeout = ref(20)
function runNow(domainName, fightTeam) {
  isRunningDomain.value = true
  fetch(`${domainRunURL}?domain_name=${domainName}&fight_team=${fightTeam}&time_out=${domainLoopTimeout.value}`)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(json => {
        if (json.success === true) {
          info(json.message)
        } else {
          errorMsg(json.message)
        }
      })
      .catch(error => { console.error('There was a problem with the fetch operation:', error); });
}

function stopRunning() {
  info("正在停止秘境中...")
  fetch(domainStopURL)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(json => {
        if (json.success === true) {
          info(json.message)
          isRunningDomain.value = false
        } else {
          errorMsg(json.message)
        }
      })
      .catch(error => { console.error('There was a problem with the fetch operation:', error); });
}
const isRunningDomain = ref(false)
</script>

<template>
  <MessageComponent ref="msgEle"/>
  <h2>秘境设置(保存后生效)</h2>
  当前秘境计划: {{ domainWeekPlan }} <br/>
  限制总执行时长(单位/分钟)：<input type="number" min="1" max="600" v-model="domainLoopTimeout" />
  <button @click="saveDomainConfig" :disabled="domainLoopTimeout<1 || domainLoopTimeout > 600">保存设置</button>
  <button @click="stopRunning">停止运行</button>
  <div>
    <table>
      <thead>
      <tr>
        <th>名称</th>
        <th>国家</th>
        <th>类型</th>
<!--        <th>Position (x, y)</th>-->
        <th>执行日期(周一至周日)</th>
        <th>战斗队伍(<RouterLink to="/team">创建队伍</RouterLink>)</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, index) in domainList" :key="index">
        <td>{{ item.name }}</td>
        <td>{{ item.country }}</td>
        <td>{{ item.type }}</td>
<!--        <td>{{ item.position[0] }}, {{ item.position[1] }}</td>-->
        <td>
          <input type="radio" name="1" @click="toggle(0,item.name)" :value="item.name" v-model="domainWeekPlan[0]" :checked="domainWeekPlan[0] === item.name"/>
          <input type="radio" name="2" @click="toggle(1,item.name)"  :value="item.name" v-model="domainWeekPlan[1]" :checked="domainWeekPlan[1] === item.name"/>
          <input type="radio" name="3" @click="toggle(2,item.name)"  :value="item.name" v-model="domainWeekPlan[2]" :checked="domainWeekPlan[2] === item.name"/>
          <input type="radio" name="4" @click="toggle(3,item.name)"  :value="item.name" v-model="domainWeekPlan[3]" :checked="domainWeekPlan[3] === item.name"/>
          <input type="radio" name="5" @click="toggle(4,item.name)"  :value="item.name" v-model="domainWeekPlan[4]" :checked="domainWeekPlan[4] === item.name" />
          <input type="radio" name="6" @click="toggle(5,item.name)"  :value="item.name" v-model="domainWeekPlan[5]" :checked="domainWeekPlan[5] === item.name"/>
          <input type="radio" name="7" @click="toggle(6,item.name)"  :value="item.name" v-model="domainWeekPlan[6]" :checked="domainWeekPlan[6] === item.name"/>
        </td>
        <td><FightTeamSelect v-model:fight-team-select="domainTeamMapper[item.name]"/> </td>
        <td> <button @click="runNow(item.name, domainTeamMapper[item.name])" :disabled="isRunningDomain">立刻执行</button> </td>
      </tr>
      </tbody>
    </table>
  </div>
  <div>
    <h3>使用手册</h3>
    <h4>功能说明</h4>
    <ul>
      <li>1. 先选择<RouterLink to="/team">战斗队伍</RouterLink>，再点击立即执行按钮，会自动传送到该秘境，然后开启秘境战斗直到体力耗尽。</li>
      <li>2. 战斗期间角色死亡会吃鸡蛋复活， 若鸡蛋冷却未结束, 又再次死亡则会自动<b>传送到璃月狄花洲七天神像</b>复活，<b>接着返回秘境继续战斗</b>直到体力耗尽</li>
      <li>3. 为了防止死循环，你可以限制秘境总执行时间, 超过这个时间后会自动退出秘境</li>
    </ul>
    <h4>如何规划日期</h4>
    <ul>
      <li>1. 执行日期从左到右分别是周一至周日，点击指定日期可以启用该任务</li>
      <li>2. 再次点击选中的日期时，可以取消选中</li>
    </ul>
  </div>
</template>

<style scoped>
table {
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  text-align: left;
}
th {
  background-color: #f4f4f4;
  font-weight: bold;
}
</style>
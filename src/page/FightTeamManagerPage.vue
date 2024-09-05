<script setup>

import FightTeamSelect from "@/components/task/FightTeamSelect.vue";
import {onMounted, reactive, ref, watch} from "vue";
import {
  createFightTeamListURL, deleteFightTeamListURL,
  getFightTeamContentURL,
  getFightTeamListURL, runFightTeamListURL,
  setDefaultFightTeamURL, stopFightTeamListURL,
  updateFightTeamListURL,
} from "@/api.js";
import { pinyin } from "pinyin-pro";
import ace, {edit} from 'ace-builds'
// ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.13/')
ace.config.set('basePath', '/node_modules/ace-builds/src-min-noconflict');
import 'ace-builds/src-noconflict/ext-language_tools';
import {store} from "@/store.js";
import PinYinAutoComplete from "@/components/common/PinYinAutoComplete.vue";
const teams = ref([])
const selectedFightTeam = ref('')
const character1 = ref('', { type: String })
const character2 = ref('', { type: String })
const character3 = ref('', { type: String })
const character4 = ref('', { type: String })
const teamAlias = ref('', { type: String })

const msgElement = ref('')
const fightTeamContent = ref('')


function info(msg) {
  msgElement.value.classList.remove("error-msg")
  msgElement.value.innerText = msg
}
function errorMsg(msg) {
  msgElement.value.classList.add("error-msg")
  msgElement.value.innerText = msg
}

// function trim(txt) {
//   return txt.replace(/[\s*?:"|<>\\\/\[\]\(\)_\.（）。]+/g, '');
// }
// watch(character1, (nv,ov)=> {
//   if(nv!==ov) {
//     character1.value = trim(nv);
//   }
// })
// watch(character2, (nv,ov)=> {
//   if(nv!==ov) { character2.value = trim(nv); }
// })
// watch(character3, (nv,ov)=> {
//   if(nv!==ov) { character3.value = trim(nv); }
// })
// watch(character4, (nv,ov)=> {
//   if(nv!==ov) { character4.value = trim(nv); }
// })
// watch(teamAlias, (nv,ov)=> {
//   if(nv!==ov) { teamAlias.value = trim(nv); }
// })
const defaultTeam = ref('')
function updateFightTeamList() {
  fetch(getFightTeamListURL)
      .then(response => {
        if (!response.ok) { throw new Error('Network response was not ok'); }
        return response.json();
      })
      .then(json => {
        if (json.success === true) {
          const result = json.data
          teams.value.length = 0
          teams.value.push(...result.files)
          defaultTeam.value = result.default

          if(teams.value.length > 0) {
            if (selectedFightTeam.value === '') {
              selectedFightTeam.value = teams.value[0]
            }
          }
        }
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
}
updateFightTeamList()

function showFightTeam(team_name) {
  selectedFightTeam.value = team_name
      fetch(getFightTeamContentURL + '/' + team_name)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(json => {
        if (json.success === true) {
          fightTeamContent.value = json.data
          const teamStr = team_name.substring(0, team_name.indexOf("("))
          const teamAliasStr = team_name.substring(team_name.indexOf("(")+1, team_name.lastIndexOf(")"))
          const teams = teamStr.split("_")
          character1.value = teams[0]
          character2.value = teams[1]
          character3.value = teams[2]
          character4.value = teams[3]
          teamAlias.value = teamAliasStr
        }
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
}
watch(selectedFightTeam, (nv, ov)=> {
  if (nv && nv.length > 0 && (nv!==ov)) {
    showFightTeam(nv)
  }
})
function saveFightTeam() {
  const textContent = fightTeamContent.value
  if (character1.value.length === 0 || character2.value.length === 0 || character3.value.length === 0)  {
    errorMsg("名字不允许为空")
    return
  }

  const newTeamName = `${character1.value}_${character2.value}_${character3.value}_${character4.value}_(${teamAlias.value}).txt`;
  let url;
  let method;
  if (selectedFightTeam.value.length > 0) {
    url = `${updateFightTeamListURL}/${selectedFightTeam.value}?new_team_name=${newTeamName}`
    method = 'PUT'
  }else {
    url = `${createFightTeamListURL}/${newTeamName}`
    method = 'POST'
  }
  // const editor = ace.edit(aceRef.value);
  // const content = editor.getValue();
  fetch(url,
      {
    method: method,
    headers: {
      'Content-Type': 'text/plain',  // 使用纯文本格式上传
    },
    body: textContent,  // 直接发送 YAML 文本
  }).then(response => response.json())
      .then(data => {
        if (data.success) {
          info(data.message);
          selectedFightTeam.value = newTeamName
          updateFightTeamList()
        } else {
          errorMsg(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error);
        errorMsg('保存失败' + String(error))
      });
}
function newFightTeam() {
  // 清空数据
  cleanContent()
}

function cleanContent() {
  selectedFightTeam.value = ''
  fightTeamContent.value = ''
  character1.value = ''
  character2.value = ''
  character3.value = ''
  character4.value = ''
  teamAlias.value = ''
}


function generateCompletions () {
  const character_arr = [ character1.value, character2.value, character3.value, character4.value ]
  const character_pinyin_map_arr = []
  character_arr.forEach(item=> {
    character_pinyin_map_arr.push(
        {caption: pinyin(item, {toneType:'none', separator: ""}), value: item, meta: item}
    )
  })
  return character_pinyin_map_arr
}
// https://github.com/zh-lx/pinyin-pro
const customCompleter = reactive({
  getCompletions: function(editor, session, pos, prefix, callback) {
    const completions = generateCompletions()
    callback(null, completions);
  }
});
const aceRef = ref(null)

function runFightTeam() {
  const url = `${runFightTeamListURL}/${selectedFightTeam.value}`
  fetch(url)
      .then(response => {
        if (!response.ok) { throw new Error('Network response was not ok'); }
        return response.json(); })
      .then(json => {
        if (json.success === true)  info(json.message)
        else errorMsg(json.message)
      })
      .catch(error => { errorMsg(error) });
}
function stopFightTeam() {
  fetch(stopFightTeamListURL).then(response => {
        if (!response.ok) { throw new Error('Network response was not ok'); }
        return response.json();
      })
      .then(json => {
        if (json.success === true)  info(json.message)
        else errorMsg(json.message)
      })
      .catch(error => { errorMsg(error) });
}
function deleteFightTeam(item) {
  if(!confirm(`确认删除${item}`)) return
  const url = `${deleteFightTeamListURL}/${item}`
  fetch(url, {
    method: 'DELETE',
  }).then(response => {
      if (!response.ok) { throw new Error('Network response was not ok'); }
      return response.json();
    })
    .then(json => {
      if (json.success === true)  {
        info(json.message)
        cleanContent()
        updateFightTeamList()
      }
      else errorMsg(json.message)
    })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
      });
}

function setAsDefaultFightTeam(file_name) {
  const url = `${setDefaultFightTeamURL}/${file_name}`
  fetch(url, {
    method: 'PUT',
  }).then(response => {
    if (!response.ok) { throw new Error('Network response was not ok'); }
    return response.json();
  }).then(json => {
    if (json.success === true)  {
        info(json.message)
        defaultTeam.value = file_name
        // updateFightTeamList()
      }
      else errorMsg(json.message)
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

onMounted(()=> {
  // const editor = ace.edit("editor10")
  const editor = ace.edit(aceRef.value)
  editor.session.setMode("ace/mode/c_cpp");
  editor.setTheme('ace/theme/monokai');
  editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
      });
  editor.completers = [customCompleter]
  // watch(()=>editor.getValue(), (nv, ov)=> {
  //   console.log('编辑器内容改变:', nv)
  // })

  // 监听 Ace 编辑器内容变化，并同步到 fightTeamContent
  editor.session.on('change', () => {
    fightTeamContent.value = editor.getValue();
  });

  // 监听 fightTeamContent 变化，并同步更新到编辑器
  watch(fightTeamContent, (newValue) => {
    if (editor.getValue() !== newValue) {
      editor.setValue(newValue, 1); // 第二个参数 1 用于保持光标位置
    }
  });

  // const langTools = ace.require('ace/ext/language_tools');
  // langTools.addCompleter(customCompleter)
})
</script>
<template>
  <ul>
    <li v-for="team in teams" :key="team">
      <input v-model="selectedFightTeam" type="radio" name="team" :value="team" /> {{ team }}
      <button @click="deleteFightTeam(team)">删除</button>
      <button @click="setAsDefaultFightTeam(team)" :disabled="team===defaultTeam"> {{ team === defaultTeam?'当前默认':'设为默认' }}</button>
    </li>
  </ul>
  <div>
  </div>
  <div>
      <div>
        <PinYinAutoComplete v-model="character1" >1号:</PinYinAutoComplete>
        <PinYinAutoComplete v-model="character2" >2号:</PinYinAutoComplete>
        <PinYinAutoComplete v-model="character3" >3号:</PinYinAutoComplete>
        <PinYinAutoComplete v-model="character4" >4号:</PinYinAutoComplete>
      </div>
      <div>
        队伍简称:<input v-model="teamAlias" type="text" /> <br/>
      </div>
  </div>

  <div>
    <button @click="newFightTeam">新建</button>
    <button @click="saveFightTeam">保存</button>
    <button @click="runFightTeam" v-if="selectedFightTeam">运行战斗测试</button>
    <button @click="stopFightTeam" v-if="selectedFightTeam">停止运行战斗测试</button>
    <div ref="msgElement"> </div>
<!--    <div id="editor10" style="width: 100%; height: 200px"></div>-->
    <div ref="aceRef" style="width: 100%; height: 200px"></div>
  </div>
</template>

<style scoped>

.error-msg {
  color: red;
}

</style>
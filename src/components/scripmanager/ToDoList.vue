<script setup>
import {computed, inject, onActivated, onMounted, ref, watch} from "vue";
import router from "@/router.js";
import {pathListFileURL, todoGetURL, todoRunURL, todoSaveURL, todoStopURL} from "@/api.js";
import {isUndefinedNullOrEmpty} from "@/utils/objutils.js";
import {store} from "@/store.js";
import FightTeamSelect from "@/components/task/FightTeamSelect.vue";
import dayjs from "dayjs";
const openTodos =ref([])
const todoList = store.todoList
const todoRunning = ref(false)
defineExpose({
  todoList,
  // todoSelect,
  addFilesToList,
  setTodoRunning,
  updateTodoList
})
const info = inject('info')
const errorMsg = inject('errorMsg')

// 统计打勾的清单中一共有多少个文件
const totalEnabledFiles = computed(() => {
  return todoList.value
      .filter(item => item.enable)
      .reduce((total, item) => total + item.files.length, 0);
});

function addFilesToList(todoItem, files) {
  if(!files || isUndefinedNullOrEmpty(todoItem)) return;
  if(files.length < 1) return
  let count = 0;
  console.log(`ToDo组件往${todoItem}, 添加${files}`)
  todoList.value.forEach(item => {
    if(item.name === todoItem) {
      files.forEach(file=> {
        if(!item.files.includes(file)) {
          item.files.push(file);
          count++;
        }
      })
    }
  })
  info(`从选中的${files.length}个文件中,成功添加${count}个文件到${todoItem}`)
}
  updateTodoList()

function updateTodoList() {
  store.updateTodoList()
}

// 添加数据到响应数组,禁止重复数据
function append(array, value) {
  if (array.value.includes(value)) { return false }
  array.value.push(value)
  return true
}
function remove(array, valueToRemove) {
  // 不要用这种方式删除，这会创建一个新的数组，使得原数组丢失！
  // array.value = array.value.filter(name => name !== value)
  const index = array.value.indexOf(valueToRemove);
  if (index !== -1) {
    array.value.splice(index, 1);
  }
}

function toggleTodo(todoName) {
  if(!append(openTodos, todoName)) { remove(openTodos, todoName) }
  console.log(openTodos.value)
}

const removeFileFromTodo = (todoItem, fileName) => {
  todoList.value.forEach(item => {
    if(item.name === todoItem) {
      item.files = item.files.filter(file => file !== fileName)
    }
  })
}

function createTodo() {
  let listName = prompt('请输入清单名称:');
  if(!listName) { return; }
  listName = listName.trim()

  let success = true
  todoList.value.forEach(item => {
    if (listName === item.name) {
      errorMsg('创建失败!,已经存在同名称的清单:', listName)
      success = false
    }
  })
  if (!success) {return}

  const todo = {
    enable: true,
    fight_duration: 20,
    team_enable: false,
    fight_team: '',
    name: listName,
    files: [],
    lastExecutionDate: dayjs().format('YYYY-MM-DD'),
    frequency: 1
  }
  todoList.value.push(todo)
}

function setTodoRunning(bool) {
  todoRunning.value = bool
  // if (todoRunning) {
  //   todoRunButton.innerText = "停止执行"
  // } else {
  //   todoRunButton.innerText = "执行清单"
  // }
}

function deleteTodo() {
  if(!confirm("确认删除？")){ return }
  info("确认删除")
  // 注意filter这种删除方式会丢失原来的对象。如果其他组件中监听了旧对象，数据将不同步。
  // 除非其他组件使用watch监听了todoList.value每次更换对象的状态
  // todoList.value = todoList.value.filter(item => !item.enable)

  // splice不会丢失原来的对象
  for(let i=0; i< todoList.value.length; i++) {
    const item = todoList.value[i]
    if(item.enable) {
      todoList.value.splice(i, 1)
      i--;
    }
  }
}
function stopTodo() {
  fetch(todoStopURL) .then(response => {
    if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
    return response.json(); // 解析响应为 JSON
  }).then(data => {
    if (data.success === true) {
        info(data.data)
        setTodoRunning(false)
      } else {
        errorMsg(data.message)
      }
    })
    .catch(error => {
      console.error('Error:', error); // 处理错误
      errorMsg(error)
    });
  setTodoRunning(false)
}

function runAllTodo() {
  const jsonString = JSON.stringify(todoList.value)
  const count = todoList.value.filter(item => item.enable).length;
  if(count === 0) {
    // TODO 不要用alert，而是统一信息渠道
    errorMsg('未勾选任何清单，无法执行')
    return
  }
  todoList.value.filter(item => item.files)
  setTodoRunning(true)
  fetch(todoRunURL, {
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
      // info(data.data)
      if(data.status === 'playback_already_running') {
        setTodoRunning(true)
      }
    } else {
      errorMsg(data.message)
    }
  }).catch(error => {
    console.error('Error:', error); // 处理错误
    errorMsg(error)
  });
}

function runOneTodo(todo) {
  todo.enable = true
  const jsonString = JSON.stringify([todo])
  const count = todoList.value.filter(item => item.enable).length;
  if(count === 0) {
    // TODO 不要用alert，而是统一信息渠道
    errorMsg('未勾选任何清单，无法执行')
    return
  }
  todoList.value.filter(item => item.files)
  setTodoRunning(true)
  fetch(todoRunURL, {
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
          // info(data.data)
          if(data.status === 'playback_already_running') {
            setTodoRunning(true)
          }
        } else {
          errorMsg(data.message)
        }
      }).catch(error => {
    console.error('Error:', error); // 处理错误
    errorMsg(error)
  });
}

function saveTodo() {
  // // 序列化为 JSON 字符串
    const jsonString = JSON.stringify(todoList.value);

    fetch(todoSaveURL, {
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
        info("保存清单成功")
      } else {
        errorMsg(data.data)
      }
    })
    .catch(error => {
      console.error('Error:', error); // 处理错误
      errorMsg(error)
    });
}


function editJson(fileName) {
  // TODO 只有文件名，如何知道应该跳转到哪个路由？
  router.push('/task/collect/edit/' + fileName)
}
// const fightTeamSelector = ref()

// fightTeamSelector.value.updateFightTeamList()
// const correctDuration = (item) => {
//   if (item.fight_duration < 1) {
//     item.fight_duration = 1
//   } else if (item.fight_duration > 600) {
//     item.fight_duration = 600
//   } else {
//     // 确保值为整数
//     item.fight_duration = Math.round(item.fight_duration)
//   }
// }

const correctDuration = (item) => {
  if (item.fight_duration === '' || item.fight_duration === null) {
    item.fight_duration = 20
  } else {
    let duration = Number(item.fight_duration)
    if (isNaN(duration) || duration < 1) {
      item.fight_duration = 1
    } else if (duration > 600) {
      item.fight_duration = 600
    } else {
      item.fight_duration = Math.round(duration)
    }
  }
}
const draggedItemIndex = ref(null);
const dragStart = (index) => {
  draggedItemIndex.value = index;
};

const drop = (index) => {
  const itemToMove = todoList.value.splice(draggedItemIndex.value, 1)[0];
  todoList.value.splice(index, 0, itemToMove);
  draggedItemIndex.value = null;
};

// 计算下次执行日期的函数
const getNextExecutionDate = (lastDate, frequency) => {
  return dayjs(lastDate).add(frequency, 'day').format('YYYY-MM-DD');
}

// 格式化日期的函数
const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY-MM-DD');
}
</script>
<template>
  <div class="list-management">
    <!-- 清单管理功能 -->
    <button @click="createTodo">新建清单</button>
    <button @click="deleteTodo">删除清单</button>
    <button :disabled="!totalEnabledFiles" @click="todoRunning?stopTodo():runAllTodo()">{{ todoRunning ? '停止执行': '执行清单' }}</button>
    <button @click="saveTodo">保存清单</button>

    <table id="listContainer">
      <thead>
      <tr>
        <th>拖拽</th>
        <th>启用</th>
        <th>名称</th>
        <th>切换队伍</th>
        <th>战斗超时(秒)</th>
        <th>执行频率(几天/1次)</th>
        <th>上次执行时间</th>
        <th>下次执行时间</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <template v-for="(item, index) in todoList" :key="item.name">
        <tr
            draggable="true"
            @dragstart="dragStart(index)"
            @dragover.prevent
            @drop="drop(index)"
        >
          <td><span class="drag-handle">☰</span></td>
          <td><input type="checkbox" v-model="item.enable"></td>
          <td>{{ item.name }}</td>
          <td>
            <input type="checkbox" v-model="item.team_enable" />
            <FightTeamSelect ref="fightTeamSelector" v-model:teamEnable="item.team_enable" v-model:fightTeamSelect="item.fight_team" />
          </td>
          <td>
            <input :disabled="!item.team_enable" type="number" min="1" max="600" v-model="item.fight_duration" style="width: 60px" @blur="correctDuration(item)" />
          </td>
          <td>
            <input :name="item.name" v-model="item.frequency" :value="1"  type="radio" :checked="item.frequency===1">1
            <input :name="item.name" v-model="item.frequency" :value="2"  type="radio" :checked="item.frequency===2">2
            <input :name="item.name" v-model="item.frequency" :value="3"  type="radio" :checked="item.frequency===3">3
            <input :name="item.name" v-model="item.frequency" :value="7"  type="radio" :checked="item.frequency===7">7
          </td>
          <td>{{ formatDate(item.lastExecutionDate) }}</td>
          <td>{{ formatDate(getNextExecutionDate(item.lastExecutionDate, item.frequency)) }}</td>
          <td>
            <button :disabled="item.files.length < 1 || todoRunning" @click="runOneTodo(item)">立刻执行</button>
            <button @click="toggleTodo(item.name)">展示清单</button>
          </td>
        </tr>
        <tr v-if="openTodos.includes(item.name)">
          <td colspan="6">
            <table>
              <tbody>
              <tr v-for="file in item.files" :key="file">
                <td>{{ file }}</td>
                <td>
                  <button @click="editJson(file)">编辑</button>
                  <button @click="removeFileFromTodo(item.name, file)">移出清单</button>
                </td>
              </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </template>
      </tbody>
    </table>

<!--    <ul id="listContainer">-->
<!--      <li v-for="item in todoList">-->
<!--        <input type="checkbox" v-model="item.enable">-->
<!--        {{item.name}}-->

<!--        <FightTeamSelect v-model="item.fight_team" />-->
<!--        战斗超时: <input type="number" min=1 max=600 v-model="item.fight_duration"  style="width: 40px"/>秒,-->

<!--        <button @click="toggleTodo(item.name)">展示清单</button>-->
<!--        <ul v-if="openTodos.includes(item.name)">-->
<!--          <li v-for="file in item.files" :key="file">-->
<!--            {{file}}-->
<!--            <button @click="editJson(file)">编辑</button>-->
<!--            <button @click="removeFileFromTodo(item.name, file)">移出清单</button>-->
<!--          </li>-->
<!--        </ul>-->
<!--      </li>-->
<!--    </ul>-->
  </div>
</template>

<style scoped>
.list-management {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 5px;
}
.drag-handle {
  cursor: move;
}
</style>
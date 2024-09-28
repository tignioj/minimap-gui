<script setup>
import {computed, inject, onActivated, onMounted, ref, watch} from "vue";
import router from "@/router.js";
import {pathListFileURL, todoGetURL, todoRunURL, todoSaveURL, todoStopURL} from "@/api.js";
import {isUndefinedNullOrEmpty} from "@/utils/objutils.js";
import {store} from "@/store.js";
import FightTeamSelect from "@/components/task/FightTeamSelect.vue";
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
    name: listName,
    files: []
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

function runTodo() {
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
</script>
<template>
  <div class="list-management">
    <!-- 清单管理功能 -->
    <button @click="createTodo">新建清单</button>
    <button @click="deleteTodo">删除清单</button>
    <button :disabled="!totalEnabledFiles" @click="todoRunning?stopTodo():runTodo()">{{ todoRunning ? '停止执行': '执行清单' }}</button>
    <button @click="saveTodo">保存清单</button>
    <ul id="listContainer">
      <li v-for="item in todoList">
        <input type="checkbox" v-model="item.enable">
        {{item.name}}

        <FightTeamSelect v-model="item.fight_team" />
        战斗超时: <input type="number" min=1 max=600 v-model="item.fight_duration"  style="width: 40px"/>秒,

        <button @click="toggleTodo(item.name)">展示清单</button>
        <ul v-if="openTodos.includes(item.name)">
          <li v-for="file in item.files" :key="file">
            {{file}}
            <button @click="editJson(file)">编辑</button>
            <button @click="removeFileFromTodo(item.name, file)">移出清单</button>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.list-management {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 5px;
}
</style>
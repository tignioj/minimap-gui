<script setup>
import {onMounted, ref, watch} from "vue";
import router from "@/router.js";
import {todoGetURL, todoRunURL, todoSaveURL, todoStopURL} from "@/api.js";
const openTodos =ref([])
// const todoList = defineModel('todoList')
const todoSelect = ref('')
const todoList = ref([])
const todoRunning = ref(false)
defineExpose({
  todoList,
  todoSelect,
  addToList
})

function addToList(todoItem, files) {
  console.log(`ToDo组件往${todoItem}, 添加${files}`)
  todoList.value.forEach(item => {
    if(item.name === todoItem) {
      files.forEach(file=> {
        item.files.push(file)
      })
    }
  })
}
fetch(todoGetURL).then(res => {
  // 如果是net::ERR_CONNECTION_REFUSED网络异常，则不会走这里
  if(!res.ok) {
    throw new Error("网络异常");
  }
  return res.json()
}).then(data=> {
  if(data.success) {
    for (let todo of data.data) {
      todoList.value.push(todo)
      // 设置默认值
      if (!todoSelect.value) todoSelect.value = todo.name
    }
    console.log(todoList.value)
  } else {
    // errorMsg('获取失败:' + data.data)
  }
}).catch(err => errorMsg(err));


// 添加数据到响应数组,禁止重复数据
function append(array, value) {
  if (array.value.includes(value)) { return false }
  array.value.push(value)
  return true
}
function remove(array, value) {
  array.value = array.value.filter(name => name !== value)
}

function toggleTodo(todoName) {
  if(!append(openTodos, todoName)) { remove(openTodos, todoName) }
  console.log(openTodos.value)
}

const removeFileFromTodo = (todoItem, fileName) => {
  todoList.value.forEach(item => {
    if(item.name === item.name) {
      item.files = item.files.filter(file => file !== fileName)
    }
  })
}

function createTodo() {
  const listName = prompt('请输入清单名称:');
  let success = true
  todoList.value.forEach(item => {
    if (listName === item.name) {
      console.log('创建失败!,已经存在同名称的清单:', listName)
      success = false
    }
  })
  if (!success) {return}

  const todo = {
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
  todoList.value = todoList.value.filter(item => !item.enable)
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
        errorMsg(data.data)
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
      errorMsg(data.data)
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
function info(msg) {
  console.log(msg)
}
function errorMsg(msg) {
  console.error(msg)
}

</script>
<template>
  <div class="list-management">
    <!-- 清单管理功能 -->
    <button @click="createTodo">新建清单</button>
    <button @click="deleteTodo">删除清单</button>
    <button @click="todoRunning?stopTodo():runTodo()">{{ todoRunning ? '停止执行': '执行清单' }}</button>
    <button @click="saveTodo">保存清单</button>
    <ul id="listContainer">
      <li v-for="item in todoList">
        <input type="checkbox" v-model="item.enable">
        {{item.name}}
        <button @click="toggleTodo(item.name)">展示清单</button>
        <ul v-if="openTodos.includes(item.name)">
          <li v-for="file in item.files" :key="file">
            {{file}}
            <button @click="router.push('/test')">编辑</button>
            <button @click="removeFileFromTodo(item.name, file)">删除</button>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>

</style>
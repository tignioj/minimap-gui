<script setup>


import {onMounted, ref, watch} from "vue";
import {useRoute,useRouter} from "vue-router";
import {pathListListURL,pathListEditURL, socketURL, todoGetURL, todoRunURL, todoSaveURL, todoStopURL} from "@/api.js";
import {io} from "socket.io-client";
import FileManager from "@/components/scripmanager/FileManager.vue";
import ToDoList from "@/components/scripmanager/ToDoList.vue";
const router = useRouter()
const todoList = ref([])
const todoSelect = ref()


onMounted(()=> {
  // 清单管理
// 新建清单

  const todoRunButton = document.getElementById('runListBtn')

  let todoRunning = false
  function setTodoRunning(bool) {
    todoRunning = bool
    if (todoRunning) {
      todoRunButton.innerText = "停止执行"
    } else {
      todoRunButton.innerText = "执行清单"
    }
  }

  document.addEventListener("DOMContentLoaded", function() {
    const socket = io(socketURL);
    socket.on('connect', function() {
      // drawMap(0,0)
      console.log('WebSocket connection established');
    });
    socket.on('disconnect', function() {
      errorMsg('已断开服务器')
      console.log('WebSocket connection closed');
    });
    socket.on('playback_event', function (data) {
      if (data && data.result)  {
        info(data.msg)
        if (data.msg === "结束执行清单了") {
          setTodoRunning(false)
        }
      }
      else errorMsg(data.msg)
    })
  });

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
      errorMsg('获取失败:' + data.data)
    }
  }).catch(err => errorMsg(err));

  const msgElement = document.getElementById('msg')
  function info(text) {
    msgElement.classList.remove('error-msg')
    msgElement.innerText = text;
    console.log(text)
  }
  function errorMsg(text) {
    console.log('异常:', text)
    msgElement.innerText = text;
    msgElement.classList.add('error-msg')

  }
  function isUndefinedNullOrEmpty(value) {
    return value === undefined || value === null || value === "";
  }
// 删除清单
//   document.getElementById('deleteListBtn').addEventListener('click', function() {
//     const checkedLists = document.querySelectorAll('.list-item-checkbox:checked');
//     if (checkedLists.length < 1) return;
//     const ok = confirm("确认删除？")
//     if (!ok) {
//       info("取消删除")
//       return
//     }
//     info("确认删除")
//     checkedLists.forEach(item => {
//       item.parentElement.remove()
//       todoMap.delete(item.value)
//     });
//   });

  function getSerializableMap() {
    return Object.fromEntries(
        Array.from(todoMap.entries()).map(([key, value]) => [
          key,
          { ...value, files: Array.from(value.files) }
        ])
    )
  }

  document.getElementById('saveListBtn').addEventListener('click', function() {

// 序列化为 JSON 字符串
    const obj = getSerializableMap()
    const jsonString = JSON.stringify(obj);

    fetch(todoSaveURL, {
      method: 'POST', // 请求方法
      headers: {
        'Content-Type': 'application/json' // 指定发送的数据格式为 JSON
      },
      body: jsonString // 将 JavaScript 对象转换为 JSON 字符串
    })
        .then(response => {
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
  })

  function runTodo() {
    const jsonString = JSON.stringify(getSerializableMap())
    console.log(getSerializableMap())
    setTodoRunning(true)
    fetch(todoRunURL, {
      method: 'POST', // 请求方法
      headers: {
        'Content-Type': 'application/json' // 指定发送的数据格式为 JSON
      },
      body: jsonString // 将 JavaScript 对象转换为 JSON 字符串
    })
        .then(response => {
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
        })
        .catch(error => {
          console.error('Error:', error); // 处理错误
          errorMsg(error)
        });
  }
  function stopTodo() {
    console.log(getSerializableMap())
    setTodoRunning(true)
    fetch(todoStopURL) .then(response => {
      if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
      return response.json(); // 解析响应为 JSON
    })
        .then(data => {
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

  todoRunButton.addEventListener('click', ()=> {
    if(todoRunning) {
      stopTodo()
    } else {
      runTodo()
    }
  })

// 文件过滤功能
  document.getElementById('fileSearchInput').addEventListener('input', function(e) {
    const searchText = e.target.value.toLowerCase();
    document.querySelectorAll('.file-checkbox').forEach(file => {
      const fileName = file.parentElement.textContent.toLowerCase();
      if (fileName.includes(searchText)) {
        file.parentElement.style.display = 'block';
      } else {
        file.parentElement.style.display = 'none';
      }
    });
  });

})

const addToList = (todoItem, files) => {
  todoList.value.forEach(item => {
    if(item.name === todoItem) {
      files.forEach(file=> {
        item.files.push(file)
      })
    }
  })
}

const removeFileFromTodo = (todoItem, fileName) => {
  todoList.value.forEach(item => {
    if(item.name === item.name) {
      item.files = item.files.filter(file => file !== fileName)
    }
  })
}

const createTodo = (todoName)=> {
  const todo = {
    name: todoName,
    files: []
  }
  todoList.value.push(todo)
}
</script>

<template>
  <div class="container">
    <ToDoList
        @create-todo="createTodo"
        @removeFileFromTodo="removeFileFromTodo"
              v-model:todo-list="todoList"/>
    <FileManager
        @add-to-list="addToList"
        v-model:todoSelect="todoSelect" v-model:todoList="todoList" />
  </div>
  <div>
    <p id="msg"></p>
  </div>
  <div>
    <h2>使用手册</h2>
    <h3>新建清单</h3>
    <p>例如"打怪清单"、“采集清单", 用于存放将要执行的文件名称, 可以从右边的文件列表中添加文件到清单</p>
    <h3>执行清单</h3>
    <p>选中勾选框后，点击执行清单，则会执行清单下的所有json任务</p>
    <h3>保存清单</h3>
    <p>点击保存后，清单将被保存到_internal/resources/user/todo.json</p>
    <p>右边栏的文件目录在_internal/resources/pathlist</p>
  </div>
</template>

<style scoped>
.container {
  display: flex;
}
.file-info, .list-management, .file-management {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 5px;
}

.list-management {
  width: 50%;
}

.error-msg {
  color: red;
}
</style>
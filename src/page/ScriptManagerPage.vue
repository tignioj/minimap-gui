<script setup>

// TODO 提取socketio

import {onMounted, ref, watch} from "vue";
import {useRoute,useRouter} from "vue-router";
import {pathListListURL,pathListEditURL, socketURL, todoGetURL, todoRunURL, todoSaveURL, todoStopURL} from "@/api.js";
import {io} from "socket.io-client";
import FileManager from "@/components/scripmanager/FileManager.vue";
import ToDoList from "@/components/scripmanager/ToDoList.vue";
const router = useRouter()

const todoListRef = ref();  // 初始化为 null
const todoList = ref([]); // 初始化为空数组
// 监控 todoListRef.value.todoList 的变化
// 实际上只会检测到 todoListRef.value.todoList 初始化被赋值的时刻todoList对象发生变化)
// 后续对todoList对象内部的所有改动不加deep:true时是检测不到的，
// 因为todoListRef.value.todoList本身对象的地址没有发生
// https://cn.vuejs.org/guide/essentials/watchers.html
// watch(() => todoListRef.value, (nv, ov) => {
//     // console.log('父组件检测到子组件 todoList 修改', nv);
//   console.log('父组件检测到todoListRef被赋值', nv);
//   todoList.value = nv.todoList
// })

// watch(()=> todoListRef.value?.todoSelect, async (nv, ov)=> {
//   console.log('父组件检测到子组件todoSelect修改', nv)
//   todoSelect.value = nv
// })

onMounted(()=> {
  console.log('page mounted', todoList.value)

  // 此时与子组件监听同一个todoList
  todoList.value = todoListRef.value.todoList

  // 如果子组件调用了todoList.value = "xxx"的赋值，则会触发watch
  watch(()=> todoListRef.value.todoList, ()=> {
      todoList.value = todoListRef.value.todoList
  })

  console.log('page todoList updated')

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
        // setTodoRunning(false)
      }
    }
    else errorMsg(data.msg)
  })

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
  // 通知子组件更新
  console.log("通知子组件更新", todoItem)
  todoListRef.value?.addToList(todoItem, files);
}

</script>

<template>
  <div class="container">
    <ToDoList ref="todoListRef" />
    <FileManager
        @add-to-list="addToList"
        v-model:todoList="todoList" />

<!--    太香了吧，可以直接访问另一子组件暴露的方法-->
<!--    <FileManager-->
<!--        @add-to-list="todoListRef?.addToList"-->
<!--        v-model:todoSelect="todoSelect"-->
<!--        v-model:todoList="todoListRef?.todoList" />-->
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
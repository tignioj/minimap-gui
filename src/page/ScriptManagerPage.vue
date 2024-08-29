<script setup>


import {onMounted, ref, watch} from "vue";
import {useRoute,useRouter} from "vue-router";
import {pathListListURL,pathListEditURL, socketURL, todoGetURL, todoRunURL, todoSaveURL, todoStopURL} from "@/api.js";
import {io} from "socket.io-client";
import FileManager from "@/components/scripmanager/FileManager.vue";
import ToDoList from "@/components/scripmanager/ToDoList.vue";
const router = useRouter()
const todoListRef = ref()
const todoList = ref()
const todoSelect = ref()
watch(()=> {if(todoListRef.value) return todoListRef.value.todoList},
    async (nv, ov)=> {
      console.log(nv)
      todoList.value = nv
      console.log('父组件检测到子组件todoList修改', nv)
    })

watch(()=> {if(todoListRef.value) return todoListRef.value.todoSelect}, async (nv, ov)=> {
  console.log('父组件检测到子组件todoSelect修改', nv)
  todoSelect.value = nv
})

onMounted(()=> {
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
  // 这里通过引用对象直接修改了子组件的数据？
  todoList.value.forEach(item => {
    if(item.name === todoItem) {
      files.forEach(file=> {
        item.files.push(file)
      })
    }
  })
}

</script>

<template>
  <div class="container">
    <ToDoList ref="todoListRef" />
    <FileManager
        @add-to-list="addToList"
        v-model:todoSelect="todoSelect"
        v-model:todoList="todoList"
    />
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
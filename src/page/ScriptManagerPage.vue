<script setup>

// TODO 提取socketio

import {onActivated, onDeactivated, onMounted, provide, ref, watch} from "vue";
import {useRoute,useRouter} from "vue-router";
import {pathListListURL,pathListEditURL, socketURL, todoGetURL, todoRunURL, todoSaveURL, todoStopURL} from "@/api.js";
import {io} from "socket.io-client";
import FileManager from "@/components/scripmanager/FileManager.vue";
import ToDoList from "@/components/scripmanager/ToDoList.vue";
import {
  SOCKET_EVENT_PLAYBACK_END, SOCKET_EVENT_PLAYBACK_EXCEPTION,
  SOCKET_EVENT_PLAYBACK_START,
  SOCKET_EVENT_PLAYBACK_UPDATE,
  useWebSocket
} from "@/utils/websocket_listener_utils.js";
import MessageComponent from "@/components/common/MessageComponent.vue";
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

const msgElement = ref(null)
function info(text) {
  msgElement.value.info(text)
}
function errorMsg(text) {
  msgElement.value.error(text)
}
const {isConnected, socket, connectSocket,disconnectSocket} = useWebSocket(
    socketURL,
    ()=>{}
)
onMounted(()=> {
  // 此时与子组件监听同一个todoList
  todoList.value = todoListRef.value.todoList
  // 如果子组件调用了todoList.value = "xxx"的赋值，则会触发watch
  // watch(()=> todoListRef.value.todoList, ()=> {
  //     todoList.value = todoListRef.value.todoList
  // })

})

onActivated(()=> {
  connectSocket()
  console.log('activated')
  socket.value.on(SOCKET_EVENT_PLAYBACK_START, (data)=> {
    info(data)
    todoListRef.value.setTodoRunning(true)
  })
  socket.value.on(SOCKET_EVENT_PLAYBACK_UPDATE, (data)=> {
    info(data)
    todoListRef.value.setTodoRunning(true)
  })
  socket.value.on(SOCKET_EVENT_PLAYBACK_END, (data)=> {
    info(data)
    todoListRef.value.setTodoRunning(false)
  })
  socket.value.on(SOCKET_EVENT_PLAYBACK_EXCEPTION, (data)=> {
    errorMsg(data)
    todoListRef.value.setTodoRunning(false)
  })
})
onDeactivated(()=> {
  console.log("deactivated")
  disconnectSocket()
})

const addFilesToList = (todoItem, files) => {
  // 通知子组件更新
  console.log("调用子组件暴露的添加方法,添加到", todoItem)
  todoListRef.value?.addFilesToList(todoItem, files);
}
function updateAllData() {
  console.log('更新所有数据')
  todoListRef.value.updateTodoList()
}
provide('script-info', info)
provide('script-errorMsg', errorMsg)
</script>
<template>
  <div class="container">
    <MessageComponent ref="msgElement"/>
    <ToDoList ref="todoListRef" />
    <FileManager
        @filesChanged="updateAllData"
        @add-files-to-list="addFilesToList"
        v-model:todoList="todoList" />

<!--    太香了吧，可以直接访问另一子组件暴露的方法-->
<!--    <FileManager-->
<!--        @add-to-list="todoListRef?.addToList"-->
<!--        v-model:todoSelect="todoSelect"-->
<!--        v-model:todoList="todoListRef?.todoList" />-->
  </div>
  <div>
    <h2>运行须知</h2>
    <ul>
      <li>对于战斗脚本例如'丘丘萨满'请先到<RouterLink to="/team">战斗队伍管理</RouterLink> 中设置或者添加您的默认队伍 </li>
      <li>如果不启用队伍，则无法开启护盾动作, 一些需要纳西妲采集的点位(例如慕风蘑菇)也无法正常执行</li>
    </ul>
    <h2>使用手册</h2>
    <h3>新建清单</h3>
    <p>例如"打怪清单"、“采集清单", 用于存放将要执行的文件名称, 可以从文件列表中添加文件到清单</p>
    <h3>执行清单</h3>
    <p>选中勾选框后，点击执行清单，则会执行清单下的所有json任务</p>
    <h3>保存清单</h3>
    <p>点击保存后，清单将被保存到_internal/resources/user-实例名称/todo.json</p>
    <p>记录的json文件目录在_internal/resources/pathlist</p>
  </div>
</template>

<style scoped>
.container {
  display: block;
}
</style>
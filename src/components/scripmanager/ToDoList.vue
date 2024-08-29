<script setup>
import {ref} from "vue";
import router from "@/router.js";
const openTodos =ref([])
const todoList = defineModel('todoList')

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

const emit = defineEmits(['removeFileFromTodo', 'createTodo'])
function removeFileFromTodo(todoName, fileName) {
  emit('removeFileFromTodo', todoName, fileName)
}

function createTodo() {
  const listName = prompt('请输入清单名称:');
  todoList.value.forEach(item => {
    if (listName === item.name) {
      console.log('创建失败!,已经存在同名称的清单:', listName)
    }
  })
  emit('createTodo', listName)
}
function deleteTodo() {

}
function runTodo() {}
function saveTodo() {}

</script>
<template>
  <div class="list-management">
    <!-- 清单管理功能 -->
    <button @click="createTodo">新建清单</button>
    <button @click="deleteTodo">删除清单</button>
    <button @click="runTodo">执行清单</button>
    <button @click="saveTodo">保存清单</button>
    <ul id="listContainer">
      <li v-for="item in todoList">
        <input type="checkbox" :checked="item.enable">
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
<script setup>
// 展示文件树
import {onMounted, ref} from "vue";
import {pathListListURL} from "@/api.js";
import CountrySelect from "@/components/task/CountrySelect.vue";
const openFolders =ref([])
// const fileStructure = ref([])
const fileStructure = ref([
  {name: '甜甜花', 'files': ['1.json', '2.json']},
  {name: '风车菊', 'files': ['3.json', '4.json']},
])
onMounted(()=> {
  fetch(pathListListURL).then(res => {
    if(!res.ok) throw new Error("网络异常");
    return res.json()
  }).then((data)=> {
    if(data.success) {
      fileStructure.value = data.data
      console.log(fileStructure.value)
    } else {
      console.log('加载失败')
    }
  }).catch(err=> errorMsg(err))
})

function toggleFolder(folderName) {
  if (openFolders.value.includes(folderName)) {
    openFolders.value = openFolders.value.filter(name => name !== folderName);
  } else {
    openFolders.value.push(folderName);
  }
  console.log(openFolders.value)
}
function  editFile(fileName) {
  // 在这里添加文件编辑逻辑
  console.log('编辑文件:', fileName);
}
const todoSelect = defineModel('todoSelect')
const todoList = defineModel('todoList')
const selectedFolder = ref([])
const selectedFiles = ref([])

// 添加数据到响应数组,禁止重复数据
function append(array, value) {
  if (array.value.includes(value)) { return false }
  array.value.push(value)
  return true
}
function remove(array, value) {
  array.value = array.value.filter(name => name !== value)
}

function selectFolder(event, folder) {
  console.log(event.target.checked, folder)
  if(event.target.checked) {
    append(selectedFolder, folder.name)
    folder.files.forEach((file) => {
      append(selectedFiles, file)
    })
  } else{
    remove(selectedFolder, folder.name)
    folder.files.forEach((file) => {
      remove(selectedFiles, file)
    })
  }
}
function selectFile(event, file) {
  console.log(event.target.checked, file)
  if(event.target.checked) {
    append(selectedFiles, file)
  } else{
    remove(selectedFiles, file)
  }
}

const emit = defineEmits(['addToList'])
const addToListBtn = () => {
  const todoItem  = todoSelect.value
  emit('addToListBtn', todoItem, selectedFiles.value)
}
</script>

<template>

  <div class="file-management">
    <!-- 文件管理功能 -->
    <input type="text" id="fileSearchInput" placeholder="搜索文件">
    <label for="todoSelect">请选择清单</label>
    <select v-model="todoSelect">
      <option v-for="(todo, index) in todoList" :key="index" :value="todo" >
        {{ todo.name }}
      </option>
    </select>

    <button @click="addToListBtn">添加到清单</button>
    <div id="fileTreeContainer">
      <div v-for="(folder, index) in fileStructure" :key="index" class="folder">
        <div>
          <input type="checkbox" class="folder-checkbox" :value="folder.name" @change="selectFolder($event,folder)" />
          {{ folder.name }}, {{ selectedFolder.includes(folder.name) }}
          <button class="toggleFolderBtn" @click="toggleFolder(folder.name)"> 显示列表 </button>
        </div>
        <ul v-if="openFolders.includes(folder.name)">
          <li v-for="fileName in folder.files" :key="fileName">
            <input type="checkbox" class="file-checkbox"
                   :value="fileName"
                   @change="selectFile($event, fileName)"
                   :checked="selectedFiles.includes(fileName)"/>
            {{ fileName }}
            <button class="editBtn" @click="editFile(fileName)">编辑</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
  {{ selectedFiles }}
</template>

<style scoped>
.file-management {
  width: 50%;
}
.file-management ul {
  display: block;
}
</style>
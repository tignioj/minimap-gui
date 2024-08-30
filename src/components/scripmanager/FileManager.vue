<script setup>
// 展示文件树
import {inject, onMounted, ref, watch} from "vue";

import {pathListListURL} from "@/api.js";
const openFolders =ref([])
const fileStructure = ref([
  {name: '甜甜花', 'files': ['1.json', '2.json']},
  {name: '风车菊', 'files': ['3.json', '4.json']},
])
// 文件过滤功能
const fileSearchInput = ref('')
// 设置默认值为null以便于无清单时, 选中”暂无清单“选项
const todoSelect = ref(null)
// const todoList = defineModel('todoList', { default: [] })
const todoList = defineModel('todoList', { default: [] })
const selectedFolder = ref([])
const selectedFiles = ref([])

// 一旦检测到todoList长度发生变化，则选择默认的第一个
watch(()=> todoList.value?.length, (nv, ov)=> {
  if(nv!== ov) {
    if(todoList.value.length >0) {
      todoSelect.value = todoList.value[0].name
    }
    else { todoSelect.value = null }
  }
})
const filteredFiles = ref([]);

// 文件过滤
// watch(fileSearchInput, (nv, ov) => {
//   if (nv !== ov) {
//     filteredFiles.value = fileStructure.value
//         .map(category => ({
//           name: category.name,
//           files: category.files.filter(file => file.includes(nv))
//         }))
//         .filter(category => category.files.length > 0);
//   }
// });
watch(fileSearchInput, (nv, ov) => {
  if (nv !== ov) {
    if (nv.trim() === '') {
      // 如果输入为空字符串，显示全部文件
      filteredFiles.value = fileStructure.value;
    } else {
      // 过滤文件
      filteredFiles.value = fileStructure.value
          .map(category => ({
            name: category.name,
            files: category.files.filter(file => file.includes(nv))
          }))
          .filter(category => category.files.length > 0);
    }
  }
});

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

const emit = defineEmits(['addFilesToList'])
const addToListBtn = () => {
  const todoItem  = todoSelect.value
  if(!todoItem) { return}
  const files = selectedFiles.value
  if(files.length < 1) return;
  console.log(`FileManager组件往${todoItem}, 添加${files}`)
  emit('addFilesToList', todoItem, selectedFiles.value)

  // 不要直接操作不属于自己的数据源, 而是通过通知的方式
  // todoList.value.forEach(item => {
  //   if(item.name === todoItem) {
  //     files.forEach(file=> {
  //       item.files.push(file)
  //     })
  //   }
  // })
}
</script>

<template>
  <div class="file-management">
    <!-- 文件管理功能 -->
    <input type="text" v-model="fileSearchInput" placeholder="搜索文件">
    <br/>
    <label for="todoSelect">已选择{{ selectedFiles.length }}个文件</label>
    <select v-model="todoSelect" :disabled="todoList.length===0">
<!--      当数据为空的时候，如果要显示"暂无清单"选项，必须设置一个value, 否则v-mode可能无法选中该值-->
<!--      当设置为 :value="null"时，todoSelect=ref(null) 可以正常选择-->
<!--      当设置为 value=""时，todoSelect=ref("") -->
      <option :value="null" v-if="todoList.length===0" disabled>暂无清单</option>
      <option v-for="(todo, index) in todoList"
              :key="index"
              :value="todo.name" >
        {{ todo.name }}
      </option>
    </select>
    <button @click="addToListBtn">添加到清单</button>
      <div v-for="(folder, index) in (fileSearchInput.length >0?filteredFiles: fileStructure)" :key="index" class="folder">
        <div>
          <input type="checkbox" class="folder-checkbox" :value="folder.name" @change="selectFolder($event,folder)" />
<!--          {{ folder.name }}, {{ selectedFolder.includes(folder.name) }}-->
          {{ folder.name }} {{ folder.files.length  }}
          <button class="toggleFolderBtn" @click="toggleFolder(folder.name)">
            {{ openFolders.includes(folder.name) ? '收起列表': '显示列表'}}
          </button>
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
</template>

<style scoped>
.file-management {
  padding: 10px;
  border: 1px solid #ccc;
  margin: 5px;
}

.file-management {
}
.file-management ul {
  display: block;
}
</style>
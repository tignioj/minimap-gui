// store.js
import {reactive, ref} from 'vue'
import {pathListListURL, todoGetURL} from "@/api.js";

const fileStructure = ref([
    {name: '甜甜花', 'files': ['1.json', '2.json']},
    {name: '风车菊', 'files': ['3.json', '4.json']},
])
const updateFileStructure = (onSuccess, onError)=> {
    fetch(pathListListURL).then(res => {
        if(!res.ok) throw new Error("网络异常");
        return res.json()
    }).then((data)=> {
        if(data.success) {
            fileStructure.value.length = 0
            console.log('更新文件')
            fileStructure.value.push(...data.data)
            if(onSuccess) onSuccess(data)
        } else {
            if(onError) onError(data)
        }
    }).catch(err=> {
        console.error(err)
        if(onError) onError(err)
    })
}
const todoList = ref([
    // {"name":"test", "enable": false, "files": [ "月莲_卡扎莱宫_须弥_5个.json", "月莲_桓那兰那_须弥_4个_20240826_063626.json", ] }
])
const updateTodoList = (onSuccess, onError) => {
    fetch(todoGetURL).then(res => {
        // 如果是net::ERR_CONNECTION_REFUSED网络异常，则不会走这里
        if(!res.ok) { throw new Error("网络异常"); }
        return res.json()
    }).then(data=> {
        if(data.success) {
            todoList.value.length = 0
            console.log('更新todo')
            for (let todo of data.data) { todoList.value.push(todo) }
            console.log(todoList.value)
            if(onSuccess) onSuccess(data)
        } else {
            if(onError)onError(data);
        }
    }).catch(err => {
        console.error(err)
        if(onError)onError(err)
    });
}


export const store = {
    fileStructure,
    updateFileStructure,
    todoList,
    updateTodoList
}
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
import {formatDateTime} from "@/utils/timeutils.js";

const maxLength = 1000
// [{"from":"", "level": "INFO", msg: "" }]
const logs= ref([ ])

const infoLog = function (message) { appendLogs({type: 'info', message}) }
const errorLog = function (message) { appendLogs({type: 'error', message}) }
const warningLog = function (message) { appendLogs({type: 'warning', message}) }

const appendLogs = (text) => {
    const timeText = Object.assign({'datetime': formatDateTime('YYYY-MM-DD HH:mm:ss')}, text)
    logs.value.push(timeText)
    // 如果日志超过最大长度，删除最早的日志
    if (logs.value.length > maxLength) {
        logs.value.shift(); // 删除数组的第一个元素
    }
}
const cleanLogs = ()=> logs.value.length = 0

const charactersName = [
    "玛拉妮",
    "艾梅莉埃",
    "希格雯",
    "克洛琳德",
    "阿蕾奇诺",
    "千织",
    "闲云",
    "娜维娅",
    "芙宁娜",
    "莱欧斯利",
    "那维莱特",
    "林尼",
    "旅行者(水)",
    "白术",
    "迪希雅",
    "艾尔海森",
    "流浪者",
    "散兵",
    "纳西妲",
    "妮露",
    "赛诺",
    "提纳里",
    "旅行者(草)",
    "夜兰",
    "神里绫人",
    "八重神子",
    "申鹤",
    "荒泷一斗",
    "珊瑚宫心海",
    "埃洛伊",
    "雷电将军",
    "宵宫",
    "旅行者(雷)",
    "神里绫华",
    "枫原万叶",
    "优菈",
    "胡桃",
    "魈",
    "甘雨",
    "阿贝多",
    "钟离",
    "达达利亚",
    "可莉",
    "温迪",
    "旅行者(风)",
    "琴",
    "刻晴",
    "迪卢克",
    "莫娜",
    "旅行者(无)",
    "派蒙",
    "旅行者(岩)",
    "七七",
    "卡齐娜",
    "赛索斯",
    "嘉明",
    "夏沃蕾",
    "夏洛蒂",
    "菲米尼",
    "琳妮特",
    "绮良良",
    "卡维",
    "米卡",
    "瑶瑶",
    "珐露珊",
    "莱依拉",
    "坎蒂丝",
    "多莉",
    "柯莱",
    "鹿野院平藏",
    "久岐忍",
    "云堇",
    "五郎",
    "托马",
    "九条裟罗",
    "早柚",
    "烟绯",
    "罗莎莉亚",
    "辛焱",
    "迪奥娜",
    "砂糖",
    "北斗",
    "雷泽",
    "菲谢尔",
    "丽莎",
    "班尼特",
    "香菱",
    "安柏",
    "芭芭拉",
    "行秋",
    "诺艾尔",
    "凝光",
    "凯亚",
    "重云"
]

export const store = {
    fileStructure,
    updateFileStructure,
    todoList,
    updateTodoList,

    //日志操作
    logs,
    infoLog,
    errorLog,
    warningLog,

    // 补全
    charactersName,
    // supportSkills
}
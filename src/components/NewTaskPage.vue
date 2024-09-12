<script setup>
import {
  playBackStopURL,
  playBackURL,
  positionURL,
  socketURL,
  pathListFileURL, pathListSaveURL, deleteFightTeamListURL
} from '@/api';
import { io } from 'socket.io-client';
import {onMounted, ref, onUpdated, watch, onUnmounted, provide, onActivated} from "vue";
import EditPanel from "@/components/task/EditPanel.vue";
import EditPanelPreset from "@/components/task/EditPanelPreset.vue";
import Manual from "@/components/task/Manual.vue";
import PointList from "@/components/task/PointList.vue";
import CountrySelect from "@/components/task/CountrySelect.vue";
import 'ace-builds/src-noconflict/mode-json'; // Load the language definition file used below
import 'ace-builds/src-noconflict/theme-monokai';
import {isValidDirectoryName} from "@/utils/string_validation_utils.js"

import {
  injectKeyCNTextMap,
  injectKeyIconMap,
  injectKeyPointActions,
  injectKeyPointMoveModes,
  injectKeyPointTypes, injectKeyRegions
} from "../keys.js"
import {
  faArrowTrendUp, faBan, faBullseye,
  faClover, faExpand,
  faMapMarkerAlt,
  faPlane,
  faPlaneArrival, faQuestion,
  faWalking,
  faWater
} from "@fortawesome/free-solid-svg-icons";
import MyCanvas from "@/components/task/MyCanvas.vue";
import {useKeyBoardListener} from "@/utils/keyboard_listener_utils.js";
import {isUndefinedNullOrEmpty} from "@/utils/objutils.js";
import {
  SOCKET_EVENT_PLAYBACK_END, SOCKET_EVENT_PLAYBACK_EXCEPTION,
  SOCKET_EVENT_PLAYBACK_START,
  SOCKET_EVENT_PLAYBACK_UPDATE,
  useWebSocket
} from "@/utils/websocket_listener_utils.js";
import {useRoute} from "vue-router";
import router from "@/router.js";
import { store } from '@/store.js'
import {VAceEditor} from "vue3-ace-editor";
import PinYinAutoComplete from "@/components/common/PinYinAutoComplete.vue";
let intervalID;
let jsonContent = ref('')

// https://fontawesome.com/search
// const iconMapping =
// const cnTextMap =

// let actions=["", "stop_flying", "nahida_collect"];
// let pointTypes=["path", "target"];
// let moveModes = ["normal", "fly", "jump", "swim", "up_down_grab_leaf"]
// let regions = ["蒙德", "璃月", "须弥", "稻妻", "枫丹"];
// let executor = 'CollectPathExecutor'

const props = defineProps({
  iconMapping: {
    type: Object,
    default:  {
      'normal': faWalking,
      'fly': faPlane,
      'jump': faArrowTrendUp,
      'swim': faWater,
      'up_down_grab_leaf': faClover,
      'stop_flying': faPlaneArrival,
      'path': faMapMarkerAlt,
      'target': faBullseye,
      'nahida_collect': faExpand,
      '': faBan,
      undefined: faQuestion,
      null: faQuestion,
    }
  },
  cnTextMap: {
    type: Object,
    // default: cnTextMap, // eslint-disable-line vue/valid-define-props
    default: {
      'normal': '普通',
      'fly': '飞行',
      'jump': '跳跃',
      'swim': '游泳',
      'up_down_grab_leaf': '四叶印',
      'path':'路径',
      'target': '目标',
      'nahida_collect':'纳西妲采集',
      '': '无',
      'stop_flying': '下落攻击'
    }
  },
  actions: {
    type: Array,
    default: ["", "stop_flying", "nahida_collect"]
  },
  pointTypes: {
    type: Array,
    default: ["path", "target"]
  },
  moveModes: {
    type: Array,
    default: ["normal", "fly", "jump", "swim", "up_down_grab_leaf"]
  },
  regions: {
    type: Array,
    default: ["蒙德", "璃月", "须弥", "稻妻", "枫丹"]
  },
  executor: {
    type: String,
    required: true,
    default: 'CollectPathExecutor',
  },
  // 点击保存的时候，父组件有一些信息需要加进来
  pathObjectExtend: {
    type: Object,
    default: {}
  },
  // 文件数据从服务器加载成功后，将数据传递给父组件继续加载
  // loadExtendData: {
  //   type: Function,
  //   default: (data)=> {}
  // }
})

const emit = defineEmits({
  // 校验 submit 事件
  afterDataLoaded: (data) => {
    if (data) {
      return true
    } else {
      console.warn('Invalid submit event payload!')
      return false
    }
  }
})

provide(injectKeyPointMoveModes, props.moveModes);
provide(injectKeyPointTypes, props.pointTypes);
provide(injectKeyPointActions, props.actions)
provide(injectKeyRegions, props.regions)

provide(injectKeyCNTextMap, props.cnTextMap)
provide(injectKeyIconMap, props.iconMapping);

const playBackButton = ref(null)
// 加载数据
let points = ref([])
let selectedPointIndex = ref(null);
const refCanvas = ref(null)

const selectedPoint = ref(null)
const isPlaying = ref(false)
const isRecording = ref(false)
const nameInput = ref('')
const anchorNameInput = ref('传送锚点')
const msgElement = ref(null)
const userXInput = ref(0)
const userYInput = ref(0)
const countrySelect = ref(String(props.regions[0]))
const editPanel = ref(null)  // 引用组件
const editPanelPreset = ref(null)
const { isCtrlPressed } = useKeyBoardListener()

watch(selectedPointIndex, async (nv, ov) => {
  // 更新子模板
  if (points.value.length > 0) {
    selectedPoint.value = points.value[nv]
  }
  showEditPanel()
})

watch(points, async (nv, ov) => {
    console.log('父类检测到points更新')
  if(!nv) { return }
  if(nv.length>0) {
    refCanvas.value.refreshCanvas()
  }
  // else {
  //   refCanvas.value.updateCanvasCenter(nv[0])
  // }
},
  {deep: true})
// deep表示检测完整的对象

function showEditPanel() {
  if (!isCtrlPressed.value) { editPanel.value.showEditPanel() }
}
function hideEditPanel() { editPanel.value.hideEditPanel() }
function info(text) {
  try {
    msgElement?.value.classList.remove('error-msg')
    console.log(text)
    msgElement.value.innerText = text
  } catch (e) {
    debugger
  }
}
function errorMsg(text) {
  msgElement?.value.classList.add('error-msg')
  console.error(text)
  msgElement.value.innerText = text
}

function setPlayingRecord(playing) {
  isPlaying.value = playing;
}

function getPathObject() {
  let name = nameInput.value.trim()
  if (!isValidDirectoryName(name)){
    // throw new Error("名称不合法")
    name = "默认_标识"
  }


  const country = countrySelect.value.trim()
  const anchorName = anchorNameInput.value.trim()
  const poj =  {
    name: isUndefinedNullOrEmpty(name) ? 'undefined' : name,
    anchor_name: isUndefinedNullOrEmpty(anchorName) ? '传送锚点': anchorName,
    country: isUndefinedNullOrEmpty(country) ? country[0] : country,
    executor: props.executor,
    positions: points.value
  };
  return Object.assign(poj, props.pathObjectExtend)
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  // 读取文件内容
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const json = e.target.result;
      const obj = JSON.parse(json);
      console.log(obj); // 打印到控制台
      loadDataToPage(obj)
      editFileName = file.name;
      info('加载成功')
    } catch (error) {
      errorMsg('json解析错误:', error);
    }
  };
  reader.readAsText(file);
}
const route = useRoute()


// onActivated(()=> {
//   console.log(route.fullPath)
//   // 如果新的路径不是正在编辑的文件，则刷新数据
//   const editFileName = route.params.fileName
//   if(editFileName && editFileName.endsWith(".json")) {
//     loadFileFromServer(editFileName)
//   } else {
//     // 应当清空数据
//     console.log('请清空数据')
//   }
//   console.log('activated')
//   console.log('调用一次setInterval')
//   intervalID = setInterval(fetchNewPosition, 100); // 每100毫秒请求一次
// })
// onDeactivated(()=> {
//   console.log("deactivated")
//   console.log('清除interval')
//   window.clearInterval(intervalID)
// })



function loadFileFromServer(fileName) {
  const fileURL = `${pathListFileURL}/` + fileName
  fetch(fileURL).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json(); // 解析响应为 JSON
  })
      .then(data => {
        console.log('Success:', data); // 处理成功的响应
        if(data.success) {
          info("成功加载")
          const executor = data.data['executor']
          // TODO 跳转到对应的执行器编辑器
          console.log(executor)
          // 如果执行器是当前页面的执行器加载数据
          if(!executor || executor === props.executor) {
            loadDataToPage(data.data)
          } else {
            // 否则跳转到对应的执行器
            let target = executorRouterMap[executor]
            if(fileName) target = target + '/' + fileName
            console.log('跳转到', target)
            router.replace(target)
          }
        } else {
          errorMsg('加载错误！')
        }
      })
      .catch(error => {
        console.error('Error:', error); // 处理错误
        errorMsg(error)
      });
}

const executorRouterMap = {
  'CollectPathExecutor': '/task/collect/edit',
  'FightPathExecutor': '/task/fight/edit',

  // 暂时没想好怎么预览这些执行器，先用战斗执行器预览吧
  'LeyLineOutcropPathExecutor': '/task/leyline/edit',
  'DailyMissionPathExecutor': '/task/daily/edit',
  undefined: '/task/collect/edit',
  '': '/task/collect/edit',
  null: '/task/collect/edit',
}

function loadDataToPage(data) {
  const positions = data['positions']
  const name = data['name'];
  const country = data['country']
  const anchorName = data['anchor_name']

  countrySelect.value = isUndefinedNullOrEmpty(country)? '蒙德':country
  nameInput.value = isUndefinedNullOrEmpty(name) ? 'undefined': name
  anchorNameInput.value = isUndefinedNullOrEmpty(anchorName)?'传送锚点': anchorName
  points.value.length = 0
  if(positions && positions.length > 0) {
    points.value.push(...positions)
    refCanvas.value.updateCanvasCenter(positions[0]);
    selectedPointIndex.value = 0
  }
  emit('afterDataLoaded', data)
  // loadExtendData(data)
}


// 请求服务器获取新位置
function fetchNewPosition() {
  console.log('interval!')
  if(!isRecording.value) return
  fetch(positionURL)
      .then(response =>{
        if (!response.ok) { throw "网络错误!" }
        return response.json()
      })
      .then(data => {
        if (!data) {
          setPlayingRecord(false)
          throw "请求位置失败！请检查小地图是否在左上角"
        }
        const newPosition = { x: data[0], y: data[1] };
        refCanvas.value.updateCanvasCenter(newPosition);
        userXInput.value = newPosition.x
        userYInput.value = newPosition.y
        info(`成功获取位置${newPosition.x},${newPosition.y}`)
      })
      .catch(error => {
        console.error('Error fetching position:', error)
        errorMsg(error)
      });
}

const { socket } = useWebSocket(socketURL, {
  onKeyEvent: (data)=> {
    // 处理从服务器接收到的键盘事件数据
    if (data.key === 'esc') {
      if (isPlaying.value) {
        info('执行中断')
        setPlayingRecord(false)
      }
    } else if (data.key === 'insert') {
      editPanelPreset.value.insertNewNode()
    } else if (data.key === 'backspace') {
      if (!isRecording.value) {
        // errorMsg("请点击开始记录后再使用快捷键删除点位")
        return;
      }
      info('你按下了backspace,删除上一个点位')
      points.value.pop()
    } else if (data.key === 'delete') {
      // points = []
    }
  },
});
let editFileName;
onMounted(()=> {
  // watch(()=> (refCanvas.value.selectedPointIndex), async (nv, ov)=> {
  //   console.log('检测到canvas子组件数据selectedPointIndex变动', nv)
  //   selectedPointIndex.value = refCanvas.value.selectedPointIndex;
  // })

  socket.value.on(SOCKET_EVENT_PLAYBACK_START, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_PLAYBACK_UPDATE, (data)=> { info(data) })
  socket.value.on(SOCKET_EVENT_PLAYBACK_END, (data)=> {
    info(data)
    isPlaying.value = false
  })
  socket.value.on(SOCKET_EVENT_PLAYBACK_EXCEPTION, (data)=> {
    errorMsg(data)
    isPlaying.value = false
  })

  console.log(route.fullPath)
  // 如果新的路径不是正在编辑的文件，则刷新数据
  editFileName = route.params.fileName
  if(editFileName && editFileName.endsWith(".json")) { loadFileFromServer(editFileName) }
  console.log('activated')
  console.log('调用一次setInterval')
  intervalID = setInterval(fetchNewPosition, 100); // 每100毫秒请求一次
})
onUnmounted(()=> {
  console.log('清除interval')
  window.clearInterval(intervalID)
})
const updateSelectedPoint = (payLoad) => {
  console.log('接收到updateSelectedPoint事件', payLoad)
  points.value[selectedPointIndex.value] = payLoad
  selectedPoint.value = payLoad
}
const deleteSelectedPoint = () => {
    if (selectedPointIndex.value !== null) {
      points.value.splice(selectedPointIndex.value, 1);
    }
}
const newSelectedPoint = () => {
  const selectedPoint = points.value[selectedPointIndex.value]
  // const newPoint = copyObject(selectedPoint)
  const newPoint = {
    x: selectedPoint.x - 50,
    y: selectedPoint.y - 50,
    type: selectedPoint.type,
    action: selectedPoint.action,
    move_mode: selectedPoint.move_mode
  }
  points.value.splice(selectedPointIndex.value+1, 0, newPoint);
}

const playBackFromHere = () => {
  playBack(selectedPointIndex.value)
}

function playBack(fromIndex) {
  if(isPlaying.value) { return; }

  let data;
  try {
    data = getPathObject()
  } catch (error) {
    errorMsg(error)
    return;
  }

  if (points.value.length < 1)  {
    errorMsg('空路径，无法回放！')
    return
  }
  info('回放中, 已停止追踪')
  isRecording.value = false  // 停止记录

  setPlayingRecord(true)
  if (!isUndefinedNullOrEmpty(fromIndex)) {
    data['from_index'] = Number(fromIndex)
  }
  fetch(playBackURL, {
    method: 'POST', // 请求方法
    headers: {
      'Content-Type': 'application/json' // 指定发送的数据格式为 JSON
    },
    body: JSON.stringify(data) // 将 JavaScript 对象转换为 JSON 字符串
  })
      .then(response => {
        if (!response.ok) {
          setPlayingRecord(false)
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); // 解析响应为 JSON
      })
      .then(data => {
        console.log('Success:', data); // 处理成功的响应
        if (data.success === true) {
          info(data.message)
          setPlayingRecord(true)
        } else {
          if(data.status === 'playback_already_running') {
            setPlayingRecord(true)
          }
          errorMsg(data.message)
        }
      })
      .catch(error => {
        console.error('Error:', error); // 处理错误
        errorMsg(error)
        setPlayingRecord(false)
      });
}
function stopPlayBack() {
  fetch(playBackStopURL )
      .then(response => {
        if (!response.ok) {
          setPlayingRecord(false)
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json(); // 解析响应为 JSON
      })
      .then(data => {
        console.log('Success:', data); // 处理成功的响应
        if (data.success === true) {
          info(data.message)
          setPlayingRecord(false)
        } else {
          errorMsg(data.message)
          setPlayingRecord(true)
        }
      })
      .catch(error => {
        console.error('Error:', error); // 处理错误
        errorMsg(error)
        setPlayingRecord(false)
      });
}

const startRecordButtonClick = ()=> {
  info("正在追踪中, 按下insert插入预设点位。不要刷新网页，否则数据丢失")
  isRecording.value = true
}
const stopRecordButtonClick = ()=> {
  info("已停止追踪")
  isRecording.value = false
}

function formatDateTime() {
  let now = new Date();

  let year = now.getFullYear();
  let month = (now.getMonth() + 1).toString().padStart(2, '0');
  let day = now.getDate().toString().padStart(2, '0');
  let hours = now.getHours().toString().padStart(2, '0');
  let minutes = now.getMinutes().toString().padStart(2, '0');
  let seconds = now.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}
function saveDictAsJsonFile(dict, fileName) {
  // 将对象转换为 JSON 字符串
  const jsonString = JSON.stringify(dict, null, 2); // 格式化 JSON 字符串

  // 创建 Blob 对象
  const blob = new Blob([jsonString], { type: 'application/json' });

  // 创建一个临时的链接
  const url = URL.createObjectURL(blob);

  // 创建一个隐藏的 <a> 元素
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;

  // 触发下载
  a.click();

  // 清理
  URL.revokeObjectURL(url);
}

const downloadRecordButtonClick = () => {
  const obj = getPathObject()
  const count = obj.positions.filter(item => item.type === "target").length;
  saveDictAsJsonFile(obj, `${obj.name}_${obj.country}_${count}个_${formatDateTime()}.json`)
}
const playBackClick = ()=> {
  if (!isPlaying.value) playBack()
  else stopPlayBack();
}
const cursorWithinPointIndex = (index) => {
  console.log('接收到子组件cursorWithinPointIndex事件')
  selectedPointIndex.value = index
  showEditPanel()
}
const appendNewNode = (node) => {
  if(!isRecording.value) {
    errorMsg('请先点击开始记录再插入点位')
    return
  }
  info('插入新的点位' + JSON.stringify(node));
  points.value.push(node)
}


// 保存到服务器
function saveRecordButtonClick() {
  try{
    const data = getPathObject()
    if(data.positions.length < 1) {
      errorMsg("空路径，禁止保存！")
      return
    }
    const count = data.positions.filter(item => item.type === "target").length;
    const oldFileName = editFileName;
    const newFileName = `${data.name}_${data.country}_${count}个_${formatDateTime()}.json`

    fetch(`${pathListSaveURL}/${oldFileName}?new_filename=${newFileName}` , {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' // 指定发送的数据格式为 JSON
      },
      body: JSON.stringify(data) // 将 JavaScript 对象转换为 JSON 字符串
    }).then(response => {
      if (!response.ok) { throw new Error('Network response was not ok ' + response.statusText); } return response.json(); }) // 解析响应为 JSON
        .then(data => {
          console.log('Success:', data); // 处理成功的响应
          const result = data.data
          if (data.success === true) {
            info('保存到了' + result.full_path)
            const currentPath = route.fullPath
            let newPath;
            if(currentPath.includes(".json"))  // 说明正在编辑文件
              // 替换掉旧的文件名称
              newPath = currentPath.substring(0,currentPath.lastIndexOf("/")+1) + result.new_filename;
            else
              newPath = currentPath + '/' +  result.new_filename
            editFileName = result.new_filename

            store.updateFileStructure()
            store.updateTodoList()
            console.log('又跳转一次', newPath)
            router.replace(newPath)
            // router.push(newPath)
            // 通知ScripManager更新数据
          } else {
            errorMsg('保存失败' + data.message)
          }
        })
        .catch(error => {
          console.error('Error:', error); // 处理错误
          errorMsg(error)
        });
  } catch(err){
    errorMsg(err)
  }

}

onUpdated(()=> {
  if(isShowJSONContent.value) {
    try {
      const poj = getPathObject()
      jsonContent.value = JSON.stringify(poj, null, 2);
    } catch(e) {
      console.error(e)
    }
  }
})
const folderAutoComplete = ref([])
store.fileStructure.value.forEach((item) => {
  folderAutoComplete.value.push(item.name)
})

function validator(nv,ov) {
  if(nv) { return isValidDirectoryName(nv) }
}

const isShowJSONContent = ref(false)
</script>
<template>
  <div id="head">
    <MyCanvas ref="refCanvas"
              @updateSelectedPoint="updateSelectedPoint"
              @cursorWithinPointIndex="cursorWithinPointIndex"
              @hideEditPanel="hideEditPanel"
              @showEditPanel="showEditPanel"
              :isRecording="isRecording"
              :selected-point-index="selectedPointIndex"
              :points="points"/>
    <PointList v-model:selected-point-index="selectedPointIndex" :points="points"/>
  </div>
  <EditPanel
      ref="editPanel"
      @updateSelectedPoint="updateSelectedPoint"
      @deleteSelectedPoint="deleteSelectedPoint"
      @newSelectedPoint="newSelectedPoint"
      @playBackFromHere="playBackFromHere"
      v-model:selectedPoint="selectedPoint"
      v-model:isPlaing="isPlaying"
     />
  <div>
    <div ref="msgElement" >路径记录-回放</div>
    <button @click="startRecordButtonClick">开始记录</button>
    <button @click="stopRecordButtonClick">停止记录</button>
    <button @click="saveRecordButtonClick">保存到服务器</button>
    <button @click="downloadRecordButtonClick">下载记录</button>
    <div class="file-input-wrapper">
      <button class="file-input-button" id="loadRecordButton">加载记录</button>
      <!--   <button class="file-input-button">Choose JSON File</button>-->
      <input type="file" id="fileInput" @change="handleFileSelect"  class="file-input" accept=".json">
    </div>
    <button @click="isShowJSONContent=!isShowJSONContent">{{ isShowJSONContent?'关闭查看':'查看json'}}</button>
  </div>
  <hr/>
  <div v-if="isShowJSONContent" style="display: block;">
    <v-ace-editor
        readonly
        v-if="isShowJSONContent"
        :value="jsonContent"
        lang="json"
        theme="monokai"
        style="height: 500px;" />
  </div>
    <div>
<!--      <label>[必填]存储目录<input type="text" placeholder="名称" v-model="folderInput" /></label>-->
      <PinYinAutoComplete placeholder="名称_附近标识" :validator="validator" :data-list="folderAutoComplete" v-model="nameInput" >名称:</PinYinAutoComplete>
<!--      <label>附近地名:<input type="text" placeholder="璃月港口东北" v-model="nameInput" /></label> <br/>-->
      <label>传送点所在国家</label>
      <CountrySelect v-model="countrySelect" />
      <label>传送锚点名称<input type="text" placeholder="传送锚点" v-model="anchorNameInput"/></label>
      <button ref="playBackButton" @click="playBackClick" >{{ isPlaying?"停止":"回放" }}</button>
      <slot></slot>
    </div>
  <hr/>
  <div>
    <EditPanelPreset
        ref="editPanelPreset"
        @append-new-node="appendNewNode"
        :isRecording="isRecording"
        v-model:x-input="userXInput"
        v-model:y-input="userYInput"
        :move-modes="moveModes"
        :actions="actions"/>
  </div>
  <hr/>
</template>
<style scoped>

.file-input-wrapper {
  display: inline-block;
  position: relative;
}
.file-input-button {
  cursor: pointer;
  position: relative; /* Ensure button is positioned correctly */
}
.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  /*z-index: 1; !* Ensure file input is on top of other elements *!*/
}
.icon { margin-right: 10px; }
#head {
  display: flex;
  align-items: flex-start;
}
.error-msg {
  color:red;
}
</style>
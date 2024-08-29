<script setup>
import {key_event, playback_event, serverURL,playBackStopURL, playBackURL, positionURL, socketURL} from '@/api';
import { io } from 'socket.io-client';
import {onMounted, ref, onUpdated, watch, onUnmounted} from "vue";
import EditPanel from "@/components/task/EditPanel.vue";
import EditPanelPreset from "@/components/task/EditPanelPreset.vue";
import Manual from "@/components/task/Manual.vue";
import PointList from "@/components/task/PointList.vue";
import CountrySelect from "@/components/task/CountrySelect.vue";
import {
  faArrowTrendUp, faBullseye,
  faClover, faExpand,
  faMapMarkerAlt,
  faPlane,
  faPlaneArrival, faQuestion,
  faWalking,
  faWater
} from "@fortawesome/free-solid-svg-icons";
import MyCanvas from "@/components/task/MyCanvas.vue";
import {useKeyBoardListener} from "../../utils/keyboard_listener_utils.js";

// https://fontawesome.com/search
const iconMapping = {
  'normal': faWalking,
  'fly': faPlane,
  'jump': faArrowTrendUp,
  'swim': faWater,
  'up_down_grab_leaf': faClover,
  'stop_flying': faPlaneArrival,
  'path': faMapMarkerAlt,
  'target': faBullseye,
  'nahida_collect': faExpand,
  '': faQuestion,
  undefined: faQuestion,
};
const actions=["", "stop_flying", "nahida_collect"];
const playBackButton = ref(null)
// 加载数据
let points = ref([])
let selectedPointIndex = ref(null);
const refCanvas = ref(null)
const moveModes = ["normal", "fly", "jump", "swim", "up_down_grab_leaf"]
const selectedPoint = ref(null)
const isPlaying = ref(false)
const isRecording = ref(false)
const nameInput = ref('未定义')
const anchorNameInput = ref('传送锚点')
const msgElement = ref(null)

const userXInput = ref(0)
const userYInput = ref(0)
const countrySelect = ref(null)

const editPanel = ref(null)  // 引用组件
const { isCtrlPressed } = useKeyBoardListener()

// 接受editPanel的事件
watch(selectedPointIndex, async (nv, ov) => {
  // 更新子模板
  if (points.value.length > 0) {
    selectedPoint.value = points.value[nv]
  }
  showEditPanel()
})

watch(points, async (nv, ov) => {
    console.log('父类检测到points更新')
  if(nv.length>0) {
    refCanvas.value.refreshCanvas()
  } else {
    refCanvas.value.updateCanvasCenter(nv[0])
  }
  },
  {deep: true})  // deep表示检测完整的对象

function showEditPanel() {
  if (!isCtrlPressed.value) {
    editPanel.value.showEditPanel()
  }
}
function hideEditPanel() {
  editPanel.value.hideEditPanel()
}
function info(text) {
  msgElement.value.classList.remove('error-msg')
  console.log(text)
  msgElement.value.innerText = text
}
function errorMsg(text) {
  msgElement.value.classList.add('error-msg')
  console.error(text)
  msgElement.value.innerText = text
}

function isUndefinedNullOrEmpty(value) {
  return value === undefined || value === null || value === "";
}

function setPlayingRecord(playing) {
  if (playing) {
    isPlaying.value = true
    playBackButton.value.innerText = "停止"
    // playBackFromHereButton.disabled = true
  } else {
    isPlaying.value = false
    playBackButton.value.innerText = "回放"
    // playBackFromHereButton.disabled = false
  }
}
function getPathObject() {
  const name = nameInput.value
  const country = countrySelect.value.countrySelect
  const anchorName = anchorNameInput.value
  return {
    name: isUndefinedNullOrEmpty(name) ? 'undefined' : name,
    anchor_name: isUndefinedNullOrEmpty(anchorName) ? '传送锚点': anchorName,
    country: isUndefinedNullOrEmpty(countrySelect) ? '蒙德': country,
    executor: 'CollectPathExecutor',
    positions: points.value
  };
}
onMounted(()=> {
  // watch(()=> (refCanvas.value.selectedPointIndex), async (nv, ov)=> {
  //   console.log('检测到canvas子组件数据selectedPointIndex变动', nv)
  //   selectedPointIndex.value = refCanvas.value.selectedPointIndex;
  // })

// 记录按钮
  const saveRecordButton = document.getElementById('saveRecordButton');
// 请求服务器获取新位置
  function fetchNewPosition() {
    if(!isRecording.value) return
    fetch(positionURL) // 替换为实际的服务器地址
        .then(response =>{
          if (!response.ok) { throw "网络错误!" }
          return response.json()
        })
        .then(data => {
          if (!data) {throw "请求位置失败！请检查小地图是否在左上角"}
          const newPosition = { x: data[0], y: data[1] };
          refCanvas.value.updateCanvasCenter(newPosition);
          userXInput.value = newPosition.x
          userYInput.value = newPosition.y
          info('成功获取位置')
        })
        .catch(error => {
          console.error('Error fetching position:', error)
          errorMsg(error)
        });
  }
  console.log('调用一次setInterval')
  setInterval(fetchNewPosition, 100); // 每5秒请求一次

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
        nameInput.value = obj['name']
        points.value = obj['positions']
        countrySelect.value = obj['country']
        anchorNameInput.value = obj['anchor_name']
        // updateCanvasCenter(points.value[0])
        selectedPointIndex.value = 0
        info('加载成功')
      } catch (error) {
        errorMsg('json解析错误:', error);
      }
    };

    reader.readAsText(file);
  }
  document.getElementById('fileInput').addEventListener('change', handleFileSelect);



  // playBackFromHereButton.addEventListener('click', (event) => {
  //   if (isPlayingRecord) return
  //   if (!isUndefinedNullOrEmpty(selectedPointIndex.value)) {
  //     playBack(selectedPointIndex.value)
  //   }
  // })

  const socket = io(socketURL);
  socket.on('connect', function() {
    console.log('WebSocket connection established');
  });

  socket.on('disconnect', function() {
    errorMsg('已断开服务器')
    console.log('WebSocket connection closed');
  });

  socket.on(key_event, function(data) {
    // 处理从服务器接收到的键盘事件数据
    if (data.key === 'esc') {
      if (isPlaying.value) {
        info('执行中断')
        setPlayingRecord(false)
      }
    } else if (data.key === 'insert') {
      insertPosition()
    } else if (data.key === 'backspace')
      if (isRecording.value) {
        info('你按下了backspace,删除上一个点位')
        points.value.pop()
      }
      else if (data.key === 'delete') {
        // points = []
      }
  });
  socket.on(playback_event, function (data) {
    if(data.result) {
      info(data.msg)
      setPlayingRecord(false)
    }else {
      errorMsg(data.msg)
      setPlayingRecord(false)
    }
  })
})
const updateSelectedPoint = (payLoad) => {
  console.log('接收到updateSelectedPoint事件', payLoad)
  points.value[selectedPointIndex.value] = payLoad
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

const playBackFromHere = (fromIndex) => {
  playBack(fromIndex)
}

function playBack(fromIndex) {
  if(isPlaying.value) { return; }

  if (points.value.length < 1)  {
    errorMsg('空路径，无法回放！')
    return
  }
  info('回放中, 已停止追踪')
  isRecording.value = false  // 停止记录

  setPlayingRecord(true)
  const data = getPathObject()
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
        if (data.result === true) {
          info(data.msg)
          setPlayingRecord(true)
        } else {
          if(data.status === 'playback_already_running') {
            setPlayingRecord(true)
          }
          errorMsg(data.msg)
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
        if (data.result === true) {
          info(data.msg)
          setPlayingRecord(false)
        } else {
          errorMsg(data.msg)
          setPlayingRecord(true)
        }
      })
      .catch(error => {
        console.error('Error:', error); // 处理错误
        errorMsg(error)
        setPlayingRecord(false)
      });
}

const startRecordButton = ()=> {
  info("正在追踪中, 按下insert插入预设点位。不要刷新网页，否则数据丢失")
  isRecording.value = true
}
const stopRecordButton = ()=> {
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
const saveRecordButton = () => {
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
  info('插入新的点位' + node)
  points.value.push(node)
}

</script>
<template>
  <div id="head">
    <MyCanvas ref="refCanvas"
              @updateSelectedPoint="updateSelectedPoint"
              @cursorWithinPointIndex="cursorWithinPointIndex"
              @hideEditPanel="hideEditPanel"
              @showEditPanel="showEditPanel"
              :selected-point-index="selectedPointIndex"
              :points="points"/>
    <PointList v-model:selected-point-index="selectedPointIndex" :points="points" :iconMapping="iconMapping"/>
  </div>
  <EditPanel
      ref="editPanel"
      @updateSelectedPoint="updateSelectedPoint"
      @deleteSelectedPoint="deleteSelectedPoint"
      @newSelectedPoint="newSelectedPoint"
      @playBackFromHere="playBackFromHere"
      v-model:selectedPoint="selectedPoint"
      v-model:isPlaing="isPlaying"
      :move-modes="moveModes" :actions="actions"/>
  <div>
    <div ref="msgElement">路径记录-回放</div>
    <button @click="startRecordButton">开始追踪</button>
    <button @click="stopRecordButton">停止追踪</button>
    <button @click="saveRecordButton">保存记录</button>

    <div class="file-input-wrapper">
      <button class="file-input-button" id="loadRecordButton">加载记录</button>
      <!--   <button class="file-input-button">Choose JSON File</button>-->
      <input type="file" id="fileInput" class="file-input" accept=".json">
    </div>
  </div>
  <hr/>
  <div>
    <label>名称<input type="text" placeholder="未定义" v-model="nameInput" /></label>
    <label>传送点所在国家</label>
    <CountrySelect ref="countrySelect" />
    <label>传送锚点名称<input type="text" placeholder="传送锚点" v-model="anchorNameInput"/></label>
    <button ref="playBackButton" @click="playBackClick" >回放</button>
  </div>
  <hr/>
  <div>
    <EditPanelPreset
        @append-new-node="appendNewNode"
        :isRecording="isRecording"
        v-model:x-input="userXInput"
        v-model:y-input="userYInput"
        :move-modes="moveModes"
        :actions="actions"/>
  </div>
  <hr/>
  <Manual/>
</template>
<style scoped>
canvas {
  border: 1px solid black;
}
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
.position { display: flex; align-items: center; }
.icon { margin-right: 10px; }
.radio-btn { margin-right: 10px; }

#head {
  display: flex;
  align-items: flex-start;
}

.error-msg {
  color:red;
}
</style>
<script setup>
import {key_event, playback_event, serverURL,playBackStopURL, playBackURL, positionURL, socketURL} from '@/api';
import { io } from 'socket.io-client';
import {onMounted, ref, onUpdated, watch} from "vue";
import EditPanel from "@/components/task/EditPanel.vue";
import EditPanelPreset from "@/components/task/EditPanelPreset.vue";
import Manual from "@/components/task/Manual.vue";
import PointList from "@/components/task/PointList.vue";
import CountrySelect from "@/components/task/CountrySelect.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {
  faArrowTrendUp, faBullseye,
  faClover,
  faMapMarkerAlt,
  faPlane,
  faPlaneArrival, faQuestion,
  faWalking,
  faWater
} from "@fortawesome/free-solid-svg-icons";
import MyCanvas from "@/components/task/MyCanvas.vue";

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
  '': faQuestion,
  undefined: faQuestion,
};
const actions=["", "stop_flying", "nahida_collect"];
// 加载数据
let points = ref([])
let selectedPointIndex = ref(null);
const refCanvas = ref()
let pointRadioButtonClick = () => {};
const moveModes = ["normal", "fly", "jump", "swim", "up_down_grab_leaf"]
const selectedPoint = ref(null)

// 接受editPanel的事件
watch(selectedPointIndex, async (nv, ov) => {
  // 更新子模板
  if (points.value.length > 0) {
    selectedPoint.value = points.value[nv]
  }
})

watch(points, async (nv, ov) => {
    console.log('父类检测到points更新')
    refCanvas.value.refreshCanvas()
  },
  {deep: true})  // deep表示检测完整的对象

onMounted(()=> {
  let isStartRecord = false;
  let isPlayingRecord = false;

  watch(()=> (refCanvas.value.selectedPointIndex), async (nv, ov)=> {
    console.log('检测到子模板变动', nv)
    selectedPointIndex.value = refCanvas.value.selectedPointIndex;
  })

  const editPanel = document.getElementById('editPanel');
  // const xInput = document.getElementById('x');
  // const yInput = document.getElementById('y');
// const moveModeInput = document.getElementById('moveMode');
  const userXInput = document.getElementById('userX');
  const userYInput = document.getElementById('userY');
  const nameInput = document.getElementById('nameInput');
  const countrySelect = document.getElementById('countrySelect')
  const anchorNameInput = document.getElementById('anchorNameInput')

  const msgElement = document.getElementById("msg")

// 编辑框按钮
//   const saveButton = document.getElementById('saveButton');
//   const deleteButton = document.getElementById('deleteButton');
//   const cancelButton = document.getElementById('cancelButton');
//   const newButton = document.getElementById('newButton');
//   const playBackFromHereButton = document.getElementById('playBackFromHereButton')
//   const insertNodeButton = document.getElementById('insertNodeButton');

// 记录按钮
  const startRecordButton = document.getElementById('startRecordButton');
  const stopRecordButton = document.getElementById('stopRecordButton');
  const saveRecordButton = document.getElementById('saveRecordButton');
  const loadRecordButton = document.getElementById('loadRecordButton')
  const playBackButton = document.getElementById('playBackButton');


  function info(text) {
    msgElement.classList.remove('error-msg')
    console.log(text)
    msgElement.innerText = text
  }
  function errorMsg(text) {
    msgElement.classList.add('error-msg')
    console.error(text)
    msgElement.innerText = text
  }

// 更新画布中心
//   function updateCanvasCenter (newPoint) {
//     refCanvas.value.updateCanvasCenter(newPoint)
//   }

  pointRadioButtonClick = (event, pos) => {
    console.log(event, pos)
    selectedPointIndex.value = Number(event.target.value);
    // const p = points.value[selectedPointIndex.value];
    showEditPanel(event.clientX, event.clientY);
  }

// 请求服务器获取新位置
  function fetchNewPosition() {
    if(!isStartRecord) return
    fetch(positionURL) // 替换为实际的服务器地址
        .then(response => response.json())
        .then(data => {
          const newPosition = { x: data[0], y: data[1] };
          // updateCanvasCenter(newPosition);
          userXInput.value = newPosition.x
          userYInput.value = newPosition.y
          console.info('成功获取位置')
        })
        .catch(error => {
          console.error('Error fetching position:', error)
          errorMsg("获取位置失败!")
        });
  }

  setInterval(fetchNewPosition, 100); // 每5秒请求一次
  startRecordButton.addEventListener('click', ()=> {
    info("正在追踪中, 按下insert插入预设点位。不要刷新网页，否则数据丢失")
    isStartRecord = true
  })
  stopRecordButton.addEventListener('click', ()=> {
    info("已停止追踪")
    isStartRecord = false
  })
  function isUndefinedNullOrEmpty(value) {
    return value === undefined || value === null || value === "";
  }
  function getPathObject() {
    const name = nameInput.value
    const country = countrySelect.value
    const anchorName = anchorNameInput.value
    return {
      name: isUndefinedNullOrEmpty(name) ? 'undefined' : name,
      anchor_name: isUndefinedNullOrEmpty(anchorName) ? '传送锚点': anchorName,
      country: isUndefinedNullOrEmpty(countrySelect) ? '蒙德': country,
      positions: points
    };
  }
  function setPlayingRecord(playing) {
    if (playing) {
      isPlayingRecord = true
      playBackButton.innerText = "停止"
      playBackFromHereButton.disabled = true
    } else {
      isPlayingRecord = false
      playBackButton.innerText = "回放"
      playBackFromHereButton.disabled = false
    }
  }

  playBackButton.addEventListener('click',  ()=> {
    if (!isPlayingRecord) playBack()
    else stopPlayBack();
  })

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
  saveRecordButton.addEventListener('click', () => {
    const obj = getPathObject()
    const count = obj.positions.filter(item => item.type === "target").length;
    saveDictAsJsonFile(obj, `${obj.name}_${obj.country}_${count}个_${formatDateTime()}.json`)
  })

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
        // JSON.stringify(obj, null, 2);
        console.log(obj); // 打印到控制台
        nameInput.value = obj['name']
        // points = ref(obj['positions'])
        points.value = obj['positions']
        // pos = points.value[0]
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

  // saveButton.addEventListener('click', () => {
  //   const index = selectedPointIndex.value
  //   if (index !== null) {
  //     points.value[index].x = parseFloat(xInput.value);
  //     points.value[index].y = parseFloat(yInput.value);
  //     points.value[index].type = getSelectedValue('type');
  //     points.value[index].action = getSelectedValue('action')
  //     points.value[index].move_mode = getSelectedValue('moveMode');
  //     hideEditPanel();
  //   }
  // });

  // deleteButton.addEventListener('click', () => {
  //   if (selectedPointIndex.value !== null) {
  //     points.value.splice(selectedPointIndex.value, 1);
  //   }
  // });

  // cancelButton.addEventListener('click', () => {
  //   hideEditPanel();
  // });

  // newButton.addEventListener('click', (event) => {
  //   if (selectedPointIndex.value !== null) {
  //     const newX = parseFloat(xInput.value);
  //     const newY  = parseFloat(yInput.value);
  //     const newType = getSelectedValue('type')
  //     const newAction = getSelectedValue('action')
  //     const newMoveMode = getSelectedValue('moveMode')
  //     const point = { x: newX - 10, y: newY , type: newType, action: newAction, move_mode: newMoveMode }
  //     points.value.splice(selectedPointIndex.value+1, 0, point);
  //     hideEditPanel();
  //   }
  // })

  function playBack(fromIndex) {
    if(isPlayingRecord) { return; }
    if (points.length < 1)  {
      errorMsg('空路径，无法回放！')
      return
    }
    info('回放中, 已停止追踪')
    isStartRecord = false  // 停止记录

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
  // playBackFromHereButton.addEventListener('click', (event) => {
  //   if (isPlayingRecord) return
  //   if (!isUndefinedNullOrEmpty(selectedPointIndex.value)) {
  //     playBack(selectedPointIndex.value)
  //   }
  // })

  function getUserCustomNode() {
    return {
      x: Number(userXInput.value),
      y: Number(userYInput.value),
      type: getSelectedValue('userType'),
      move_mode: getSelectedValue('userMoveMode'),
      action: getSelectedValue('userAction')
    }
  }

  // function insertPosition() {
  //   if (!isStartRecord) {
  //     errorMsg('请先开始追踪再插入用户点位')
  //     return
  //   }
  //   const node = getUserCustomNode()
  //   info(`插入点位(${node.x},${node.y})`)
  //   points.value.push(node)
  // }
  // insertNodeButton.addEventListener('click', insertPosition)
  //
  function getSelectedValue(name) {
    // Get the selected radio button
    const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);

    // Check if a radio button is selected
    if (selectedRadio) {
      const selectedValue = selectedRadio.value;
      console.log('Selected mode:', selectedValue);
      // Optionally, do something with the selected value
      return selectedValue
    } else {
      console.log('No radio button selected');
      return ""
    }
  }


  function selectRadio(name,value) {
    // Deselect all radio buttons first
    document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
      radio.checked = false;
    });

    // Select the radio button with the specified value
    const radioToSelect = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radioToSelect) {
      radioToSelect.checked = true;
    }
  }

  function showEditPanel(clientX, clientY) {
    editPanel.style.left = `${clientX}px`;
    editPanel.style.top = `${clientY}px`;
    editPanel.style.display = 'block';
  }

  function hideEditPanel() {
    // editPanel.classList.add('hidden');
    editPanel.style.display = 'none'
  }

  const socket = io(socketURL);
  socket.on('connect', function() {
    console.log('WebSocket connection established');
  });

  socket.on('disconnect', function() {
    errorMsg('已断开服务器')
    console.log('WebSocket connection closed');
  });

  socket.on('key_event', function(data) {
    // 处理从服务器接收到的键盘事件数据
    if (data.key === 'esc') {
      if (isPlayingRecord) {
        info('执行中断')
        setPlayingRecord(false)
      }
    } else if (data.key === 'insert') {
      insertPosition()
    } else if (data.key === 'backspace')
      if (isStartRecord) {
        info('你按下了backspace,删除上一个点位')
        points.value.pop()
      }
      else if (data.key === 'delete') {
        // points = []
      }
  });
  socket.on('playback_event', function (data) {
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
  console.log('接收到更新payload事件', payLoad)
  points.value[selectedPointIndex.value] = payLoad
}
</script>
<template>
  <div id="head">
    <MyCanvas ref="refCanvas" :selected-point-index="selectedPointIndex" :points="points"/>
    <PointList v-model:selected-point-index="selectedPointIndex" :points="points" :pointRadioButtonClick="pointRadioButtonClick" :iconMapping="iconMapping"/>
  </div>
  <EditPanel
      @update-edit-panel="updateSelectedPoint"
      v-model:selectedPointIndex="selectedPointIndex"
      v-model:selectedPoint="selectedPoint"
      :points="points"
      :move-modes="moveModes" :actions="actions"/>
  <div>
    <span id="msg">请点击开始追踪获取用户位置</span> <br/>
    <button id="startRecordButton">开始追踪</button>
    <button id="stopRecordButton">停止追踪</button>
    <button id="saveRecordButton">保存记录</button>

    <div class="file-input-wrapper">
      <button class="file-input-button" id="loadRecordButton">加载记录</button>
      <!--   <button class="file-input-button">Choose JSON File</button>-->
      <input type="file" id="fileInput" class="file-input" accept=".json">
    </div>
  </div>
  <hr/>
  <div>
    <label for="nameInput">名称<input type="text" placeholder="未定义" id="nameInput"/></label>
    <label for="countrySelect">传送点所在国家</label>
    <CountrySelect id="countrySelect"/>
    <label for="anchorNameInput">传送锚点名称<input type="text" placeholder="传送锚点" id="anchorNameInput"/></label>
    <button id="playBackButton">回放</button>
  </div>
  <hr/>
  <div>
    <EditPanelPreset :move-modes="moveModes" :actions="actions"/>
    <button id="insertNodeButton">插入预设点位</button>
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
<script setup>
import {key_event, playback_event, serverURL,playBackStopURL, playBackURL, positionURL, socketURL} from '@/api';
import { io } from 'socket.io-client';
import {onMounted, ref, onUpdated} from "vue";
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

let startX = 0;
let startY =0;

// 加载数据
var pos = { x: 0, y: 0, type: 'start' }
var points = ref([])
var isDraggingMap = false

const pointRadius = 4;
let selectedPointIndex = null;
let selectedPointIndexRef = ref(0);
let draggingPointIndex = null;
let pointRadioButtonClick;


onMounted(()=> {
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let isCtrlPressed = false;
  let isAltPressed = false;
  let isStartRecord = false;
  let isPlayingRecord = false;

  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  const editPanel = document.getElementById('editPanel');
  const xInput = document.getElementById('x');
  const yInput = document.getElementById('y');
// const moveModeInput = document.getElementById('moveMode');
  const userXInput = document.getElementById('userX');
  const userYInput = document.getElementById('userY');
  const nameInput = document.getElementById('nameInput');
  const countrySelect = document.getElementById('countrySelect')
  const anchorNameInput = document.getElementById('anchorNameInput')

  const msgElement = document.getElementById("msg")

// 编辑框按钮
  const saveButton = document.getElementById('saveButton');
  const deleteButton = document.getElementById('deleteButton');
  const cancelButton = document.getElementById('cancelButton');
  const newButton = document.getElementById('newButton');
  const playBackFromHereButton = document.getElementById('playBackFromHereButton')
  const insertNodeButton = document.getElementById('insertNodeButton');

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
  function updateCanvasCenter (newPoint) {
    pos  = newPoint;
    // 设置缩放比例和偏移量
    scale = 1; // 可以根据需要调整缩放比例
    offsetX = canvas.width / 2 - newPoint.x;
    offsetY = canvas.height / 2 - newPoint.y;
    drawMap(newPoint.x, newPoint.y)
  }
  pointRadioButtonClick = (event, pos) => {
    console.log(event, pos)
    selectedPointIndex = Number(event.target.value);
    selectedPointIndexRef.value = Number(event.target.value);
    const p = points.value[selectedPointIndex];
    updateCanvasCenter(p);
    showEditPanel(event.clientX, event.clientY);
  }

  function drawMap(x,y) {
    // if (!isStartRecord) return
    const width = 500
    let imageUrl = `${serverURL}/minimap/get_region_map?x=${x}&y=${y}&width=${width}`
    // 创建一个 Image 对象
    const img = new Image();

    // 设置跨域属性（如果图片服务器允许跨域）
    img.crossOrigin = 'Anonymous';

    // 设定 image 对象的 src 属性为 HTTP 请求的 URL
    img.src = imageUrl;

    // 等待图片加载完成
    img.onload = function() {
      // 绘制图片到 canvas 上
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawPoints()
      drawUserPoint(x,y)
    };
  }

// 请求服务器获取新位置
  function fetchNewPosition() {
    if(!isStartRecord) return
    fetch(positionURL) // 替换为实际的服务器地址
        .then(response => response.json())
        .then(data => {
          const newPosition = {
            x: data[0],
            y: data[1]
          };
          updateCanvasCenter(newPosition);
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
  // https://fontawesome.com/search
  const iconMap = {
    "path": "<font-awesome-icon :icon='fa-map-marker-alt' />",
    "target": "<i class='fas fa-bullseye'></i>",
    "normal": "<i class='fas fa-walking'></i>",
    "fly": "<i class='fas fa-plane'></i>",
    "swim": "<i class='fas fa-water'></i>",
    "jump": '<i class="fa-solid fa-arrow-trend-up"></i>',
    "up_down_grab_leaf": '<i class="fa-solid fa-clover"></i>',
    "stop_flying": '<i class="fa-solid fa-plane-arrival"></i>'
  };
  function getIconHtml(name) {
    const icon = iconMap[name]
    if (isUndefinedNullOrEmpty(icon)) {
      return '<i class="fa-solid fa-circle-question"></i>'
    }
    return icon
  }
  function renderJSONObject() {
    return
    const data = getPathObject()
    const positionsList = document.getElementById('positions');
    positionsList.innerHTML = null
    data.positions.value.forEach((position, index) => {
      const li = document.createElement('li');
      li.classList.add('position')

      // Apply different classes based on position properties
      if (index === 0) li.classList.add('first-point');
      if (position.type === 'path') li.classList.add('type-path');
      if (position.type === 'target') li.classList.add('type-target');

      // Create radio button
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'position';
      radio.value = String(index);
      radio.className = 'radio-btn';

      radio.addEventListener('click', event=> {
        selectedPointIndex = Number(event.target.value);
        selectedPointIndexRef.value = Number(event.target.value);
        const p = points.value[selectedPointIndex];
        updateCanvasCenter(p);
        showEditPanel(event.clientX, event.clientY);
      })
      if (selectedPointIndex === index) {
        radio.checked = true
      }

      // Create a span for the icon
      const iconSpan = document.createElement('span');
      iconSpan.className = 'icon';
      iconSpan.innerHTML = getIconHtml(position.type)

      // Create a span for the position details
      const detailsSpan = document.createElement('span');
      // detailsSpan.innerHTML = `
      //     X: ${position.x}, Y: ${position.y}, ${iconMap[position.move_mode]} ${position.action ? iconMap[position.action] : ''}
      // `;
      const px = position.x.toFixed(2)
      const py = position.y.toFixed(2)
      detailsSpan.innerHTML = `
             ${getIconHtml(position.move_mode)} ${position.action ? iconMap[position.action] : ''} (${px},${py})
        `;
      // Append elements to the list item
      li.appendChild(radio);
      li.appendChild(iconSpan);
      li.appendChild(detailsSpan);

      // Append list item to the list
      positionsList.appendChild(li);
    });
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
  loadRecordButton.addEventListener('click', () => {
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
        pos = points.value[0]
        countrySelect.value = obj['country']
        anchorNameInput.value = obj['anchor_name']
        updateCanvasCenter(pos)
        renderJSONObject()
        info('加载成功')
      } catch (error) {
        errorMsg('json解析错误:', error);
      }
    };

    reader.readAsText(file);
  }
  document.getElementById('fileInput').addEventListener('change', handleFileSelect);

//################################## 快捷键
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
      isCtrlPressed = true;
      hideEditPanel()
    }
    if (event.altKey) {isAltPressed = true;}
    // console.log(event)
  });
  document.addEventListener('keyup', (event) => {
    if (!event.ctrlKey) { isCtrlPressed = false; }
    if (event.code) {isAltPressed = false;}
  });
  canvas.addEventListener('mousemove', (event) => {
    const canvasRect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - canvasRect.left;
    const mouseY = event.clientY - canvasRect.top;

    if (draggingPointIndex !== null) {
      const { x: newX, y: newY } = getWorldCoords(mouseX, mouseY);
      updatePointPosition(newX, newY);
      drawMap(pos.x,pos.y)
      return;
    } else if (isDraggingMap ) {
      const currentX = event.clientX - canvas.getBoundingClientRect().left;
      const currentY = event.clientY - canvas.getBoundingClientRect().top;

      const dx = currentX - startX;
      const dy = currentY - startY;

      offsetX += dx;
      offsetY += dy;

      startX = currentX;
      startY = currentY;
      drawPoints()
      // offsetX = canvasWidth / 2 - x
      // offsetY = canvasHeight / 2 -y;
      const nx = canvasWidth /2 - offsetX
      const ny = canvasHeight/2 - offsetY
      pos = {x:nx, y:ny}
      drawMap(nx,ny)
    }

    let isHovered = false;
    points.value.forEach((point, index) => {
      const { x: canvasX, y: canvasY } = getCanvasCoords(point.x, point.y);
      if (isPointWithin(mouseX, mouseY, canvasX, canvasY)) {
        canvas.style.cursor = 'pointer';
        isHovered = true;
        selectedPointIndex = index;
        selectedPointIndexRef.value = index;
        if(!isCtrlPressed) {
          // showEditPanel(point.x, point.y, point.type, point.move_mode, point.action);
          showEditPanel(event.clientX, event.clientY);
        }
        return;
      }
    });
    if (!isHovered) {
      canvas.style.cursor = 'default';
      selectedPointIndex = null;
      selectedPointIndexRef.value = null;
      hideEditPanel();
    }
  });
  canvas.addEventListener('mousedown', (event) => {
    isDraggingMap = true
    startX = event.clientX - canvas.getBoundingClientRect().left;
    startY = event.clientY - canvas.getBoundingClientRect().top;

    if (selectedPointIndex !== null) {
      draggingPointIndex = selectedPointIndex;
      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;
      const selectedPoint = points.value[selectedPointIndex]
      const { x: pointX, y: pointY } = getCanvasCoords(selectedPoint.x, selectedPoint.y);
      dragOffsetX = points.value[selectedPointIndex].x - getWorldCoords(mouseX, mouseY).x;
      dragOffsetY = points.value[selectedPointIndex].y - getWorldCoords(mouseX, mouseY).y;
      event.preventDefault(); // Prevent default behavior
    }
  });

  canvas.addEventListener('mouseup', () => {
    draggingPointIndex = null;
    isDraggingMap = false;
  });
  canvas.addEventListener('click', (event) => {
    if (draggingPointIndex === null) {
      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;

      points.value.forEach((point, index) => {
        const { x: canvasX, y: canvasY } = getCanvasCoords(point.x, point.y);
        if (isPointWithin(mouseX, mouseY, canvasX, canvasY)) {
          selectedPointIndex = index;
          selectedPointIndexRef.value = index
          // showEditPanel(point.x, point.y, point.type, point.move_mode, point.action);
          showEditPanel(event.clientX, event.clientY);
          return;
        }
      });
    }
  });

  saveButton.addEventListener('click', () => {
    if (selectedPointIndex !== null) {
      points.value[selectedPointIndex].x = parseFloat(xInput.value);
      points.value[selectedPointIndex].y = parseFloat(yInput.value);
      points.value[selectedPointIndex].type = getSelectedValue('type');
      points.value[selectedPointIndex].action = getSelectedValue('action')
      points.value[selectedPointIndex].move_mode = getSelectedValue('moveMode');
      hideEditPanel();
      drawPoints();
      renderJSONObject()
    }
  });

  deleteButton.addEventListener('click', () => {
    if (selectedPointIndex !== null) {
      points.value.splice(selectedPointIndex, 1);
      selectedPointIndex = null;
      selectedPointIndexRef.value = null;
      hideEditPanel();
      drawMap(pos.x, pos.y)
      // drawPoints();
    }
  });

  cancelButton.addEventListener('click', () => {
    hideEditPanel();
  });

  newButton.addEventListener('click', (event) => {
    if (selectedPointIndex !== null) {
      const newX = parseFloat(xInput.value);
      const newY  = parseFloat(yInput.value);
      const newType = getSelectedValue('type')
      const newAction = getSelectedValue('action')
      const newMoveMode = getSelectedValue('moveMode')
      const point = { x: newX - 10, y: newY , type: newType, action: newAction, move_mode: newMoveMode }
      points.value.splice(selectedPointIndex+1, 0, point);
      hideEditPanel();
      drawPoints();
      renderJSONObject();
    }
  })

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
  playBackFromHereButton.addEventListener('click', (event) => {
    if (isPlayingRecord) return
    if (!isUndefinedNullOrEmpty(selectedPointIndex)) {
      playBack(selectedPointIndex)
    }
  })

  function getUserCustomNode() {
    return {
      x: Number(userXInput.value),
      y: Number(userYInput.value),
      type: getSelectedValue('userType'),
      move_mode: getSelectedValue('userMoveMode'),
      action: getSelectedValue('userAction')
    }
  }

  function insertPosition() {
    if (!isStartRecord) {
      errorMsg('请先开始追踪再插入用户点位')
      return
    }
    const node = getUserCustomNode()
    info(`插入点位(${node.x},${node.y})`)
    points.value.push(node)
  }
  insertNodeButton.addEventListener('click', insertPosition)

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


// =================== 绘画
// Initialize drawing
// 获取画布的宽度和高度
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  const { x, y } = pos;
  offsetX = canvasWidth / 2 - x
  offsetY = canvasHeight / 2 -y;
  scale = 1;

  function drawPoints() {
    // Draw lines
    for (let i = 0; i < points.value.length - 1; i++) {
      drawLine(points.value[i], points.value[i + 1]);
    }

    // Draw points
    let color;
    points.value.forEach((point,i) => {
      if (i === 0) {
        color = 'red'
      } else if (point.type === 'path') {
        color = 'blue'
      } else {
        color = 'green'
      }
      drawPoint(point.x, point.y, color);
    });
  }

  function drawPoint(x, y, color) {
    const canvasX = x * scale + offsetX;
    const canvasY = y * scale + offsetY;

    ctx.beginPath();
    ctx.arc(canvasX, canvasY, pointRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawUserPoint(x,y) {
    if (!isStartRecord) return
    const canvasX = x * scale + offsetX;
    const canvasY = y * scale + offsetY;

    ctx.beginPath();
    ctx.arc(canvasX, canvasY, pointRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 2;
    ctx.stroke(); // 绘制圆圈
  }

  function drawLine(from, to) {
    const fromX = from.x * scale + offsetX;
    const fromY = from.y * scale + offsetY;
    const toX = to.x * scale + offsetX;
    const toY = to.y * scale + offsetY;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }

  function getCanvasCoords(x, y) {
    return {
      x: x * scale + offsetX,
      y: y * scale + offsetY
    };
  }

  function getWorldCoords(canvasX, canvasY) {
    return {
      x: (canvasX - offsetX) / scale,
      y: (canvasY - offsetY) / scale
    };
  }

  function isPointWithin(px, py, x, y, radius = pointRadius) {
    return Math.sqrt((px - x) ** 2 + (py - y) ** 2) < radius;
  }

  function showEditPanel(clientX, clientY) {
    const point = points.value[selectedPointIndex]
    selectRadio('position', selectedPointIndex)
    xInput.value = point.x;
    yInput.value = point.y;
    selectRadio('type',point.type)
    // moveModeInput.value = moveMode == null ? '': moveMode;
    selectRadio("moveMode",point.move_mode)
    selectRadio('action', point.action)
    editPanel.style.left = `${clientX}px`;
    editPanel.style.top = `${clientY}px`;
    editPanel.style.display = 'block';
    // editPanel.classList.remove('hidden');
  }

  function hideEditPanel() {
    // editPanel.classList.add('hidden');
    editPanel.style.display = 'none'
  }

  function updatePointPosition(newX, newY) {
    if (draggingPointIndex !== null) {
      const point = points.value[draggingPointIndex];
      point.x = newX + dragOffsetX;
      point.y = newY + dragOffsetY;
      drawPoints();
    }
  }
  const socket = io(socketURL);
  socket.on('connect', function() {
    drawMap(0,0)
    console.log('WebSocket connection established');
  });

  socket.on('disconnect', function() {
    errorMsg('已断开服务器')
    console.log('WebSocket connection closed');
  });

  socket.on('key_event', function(data) {
    console.log(data)
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
  drawPoints();
})

</script>
<template>
  <div id="head">
    <canvas id="myCanvas" width="500" height="500"></canvas>
<!--    <PointList/>-->
    <div class="container">
      <h1 id="name"></h1>
      <p id="country"></p>
      <ol id="positions">
        <li v-for="(point, index) in points" :key="index"
            :class="{'first-point': index === 0,
            'type-path': point.type === 'path',
            'type-target': point.type === 'target'}"
          class="position">
          <input type="radio" name="position" :value="index" class="radio-btn" @click="pointRadioButtonClick"/>
          <font-awesome-icon :icon="iconMapping[point.type]"/>
          <font-awesome-icon :icon="iconMapping[point.move_mode]" v-if="point.move_mode"/>
          <font-awesome-icon :icon="iconMapping[point.action]" v-if="point.action"/>
          {{ point.x.toFixed(2) }},{{ point.y.toFixed(2) }}

        </li>
      </ol>
    </div>

  </div>
  <EditPanel/>
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
    <EditPanelPreset/>
    <button id="insertNodeButton">插入预设点位</button>
  </div>
  <hr/>
  <Manual/>
</template>


<style scoped>
canvas {
  border: 1px solid black;
}
#editPanel {
  display: none;
  position: absolute;
  background: white;
  border: 1px solid black;
  padding: 10px;
  z-index: 10;
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
.type-path { color: blue; }
.type-target { color: green; }
.first-point { color: red; }
.radio-btn { margin-right: 10px; }

#head {
  display: flex;
  align-items: flex-start;
}
#myCanvas {

}
.error-msg {
  color:red;
}
</style>
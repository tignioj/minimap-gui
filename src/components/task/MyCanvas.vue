<script setup>
import { defineProps, onBeforeUnmount, onMounted, onUpdated, reactive, ref, watch} from "vue";
import {serverURL} from "@/api.js";
import {useKeyBoardListener} from "@/utils/keyboard_listener_utils.js";
const {isCtrlPressed} = useKeyBoardListener()

const props = defineProps({
  points: {
    type: Array,
    required: true,
    default: []
  },
  selectedPointIndex: {
    type: [Number, null],
    required: true,
    default: null
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  countrySelect: {
    type: String,
    required: true
  }
});

const emit = defineEmits(
    ['updateSelectedPoint',
      'cursorWithinPointIndex',
        'hideEditPanel',
        'showEditPanel',
    ]);

const pointRadius = 4
const canvasWidth = 500
const canvasHeight = 500

// const emit = defineEmits(['update:model']);  // 定义用于通知父组件更新值的事件
// function updateValue(value) {
//   emit('update:model', value);  // 触发事件，通知父组件更新 modelValue
// }

// 鼠标拖拽时，画板中心位置
const canvasCenter = reactive({x: 0, y: 0})

let startX = 0;  // 记录鼠标在画板按下时候的坐标
let startY =0;
let offsetX = canvasWidth / 2 - canvasCenter.x
let offsetY = canvasHeight / 2 -canvasCenter.y;
let isDragging = ref(false);
const myCanvas = ref(null)
let selectedPointIndex = ref(null)
let draggingPointIndex = null;

defineExpose({  // 暴露给父组件
  // selectedPointIndex,
  updateCanvasCenter,
  refreshCanvas,
})

watch(()=> props.selectedPointIndex, (nv, ov) => {
  console.log('子组件canvas检测到父组件selectedPointIndex变化', nv)
  if(nv === selectedPointIndex.value) return
  selectedPointIndex.value = nv
  const newCenter = props.points[nv]
  updateCanvasCenter(newCenter)
})

// 更新画布中心
function updateCanvasCenter(newPoint) {
  console.log(props.countrySelect)
  if(!newPoint) return
  canvasCenter.x = newPoint.x
  canvasCenter.y = newPoint.y
  // 设置缩放比例和偏移量
  offsetX = canvasWidth / 2 - newPoint.x;
  offsetY = canvasHeight / 2 - newPoint.y;
  drawMap(newPoint.x, newPoint.y)
}
function refreshCanvas() {
  updateCanvasCenter(canvasCenter)
}

function isPointWithin(px, py, x, y, radius = pointRadius) {
  return Math.sqrt((px - x) ** 2 + (py - y) ** 2) < radius;
}
function getCanvasCoords(x, y) {
  return {
    x: x + offsetX,
    y: y + offsetY
  };
}
function getWorldCoords(canvasX, canvasY) {
  return {
    x: (canvasX - offsetX),
    y: (canvasY - offsetY)
  };
}
function drawUserPoint(x,y) {
  if (!props.isRecording) return
  const canvas = myCanvas.value;
  const ctx = canvas.getContext('2d');
  const canvasX = x + offsetX;
  const canvasY = y + offsetY;

  ctx.beginPath();
  ctx.arc(canvasX, canvasY, pointRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'orange';
  ctx.lineWidth = 2;
  ctx.stroke(); // 绘制圆圈
}
function drawMap(x,y) {
  const canvas = myCanvas.value;
  const ctx = canvas.getContext('2d');
  const width = 500
  let imageUrl = `${serverURL}/minimap/get_region_map?region=${props.countrySelect}&x=${x}&y=${y}&width=${width}`
  console.log(props.countrySelect)
  // 创建一个 Image 对象
  const img = new Image();

  // 设置跨域属性（如果图片服务器允许跨域）
  img.crossOrigin = 'Anonymous';

  // 设定 image 对象的 src 属性为 HTTP 请求的 URL
  img.src = imageUrl;

  // 等待图片加载完成
  img.onload = function() {
    // 绘制图片到 canvas 上
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    if(myCanvas.value) {
      drawPoints()
      drawLines()
      drawUserPoint(x,y)
    }
  };
}
function drawLines() {
  const pointList = props.points
  for (let i = 0; i < pointList.length - 1; i++) {
    drawLine(pointList[i], pointList[i + 1]);
  }
}
function drawPoints() {
  // Draw points
  let color;
  props.points.forEach((point,i) => {
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
function drawLine(from, to) {
  const fromX = from.x + offsetX;
  const fromY = from.y + offsetY;
  const toX = to.x + offsetX;
  const toY = to.y + offsetY;
  const ctx = myCanvas.value.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.strokeStyle = 'black';
  ctx.stroke();
}
function drawPoint(x, y, color) {
  const canvasX = x + offsetX;
  const canvasY = y + offsetY;
  const ctx = myCanvas.value.getContext('2d');
  ctx.beginPath();
  ctx.arc(canvasX, canvasY, pointRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.fillStyle = color;
  ctx.fill();
}

const startDrag = (event) => {
  isDragging.value = true;
  // console.log('Drag started at:', getMousePos(event));
  const current = getMousePos(event);
  startX = current.x
  startY = current.y

  if (selectedPointIndex.value!==null) {
    // 确定要拖动的按钮下标
    draggingPointIndex = selectedPointIndex.value
  }
};
const dragging = (event) => {
  const canvas = myCanvas.value;
  const mousePos = getMousePos(event)
  canvas.style.cursor = 'default';

  if (draggingPointIndex !== null && isCtrlPressed.value) {
    const { x: newX, y: newY } = getWorldCoords(mousePos.x, mousePos.y)
    // 虽然可以直接用下标操作props的引用传递对象，但是Vue官方并不推荐子组件修改props的内容，否则可能会让页面数据变得难以理解
    // 推荐的做法是通知父组件更新
    // props单向数据流: https://cn.vuejs.org/guide/components/props.html#one-way-data-flow
    // 如何自定义事件？ https://cn.vuejs.org/api/sfc-script-setup#defineprops-defineemits
    // 如何emit？ https://cn.vuejs.org/guide/components/events.html
    // props.points[draggingPointIndex].x = newX;
    // props.points[draggingPointIndex].y = newY;
    // 只能复制数据结构不能复制方法, 还有一个structuredClone但是复制不了Proxy对象？
    const newPoint = JSON.parse(JSON.stringify(props.points[draggingPointIndex]))
    newPoint.x = newX
    newPoint.y = newY
    emit('updateSelectedPoint', newPoint)
    drawMap(canvasCenter.x, canvasCenter.y)
    return;
  }

  let pointWithin = false
  // 判断鼠标是否在点上面
  props.points.forEach((point, index) => {
    const { x: canvasX, y: canvasY } = getCanvasCoords(point.x, point.y);
    if (isPointWithin(mousePos.x, mousePos.y, canvasX, canvasY)) {
      canvas.style.cursor = 'pointer';
      pointWithin = true
      // if(index !== selectedPointIndex.value)  {  // 没变化的时候不用发送
      selectedPointIndex.value = index;  // 修改自身的值
      emit('cursorWithinPointIndex', index)  // 通知父模板修改
      // }
    }
  });

  if(!pointWithin) { emit('hideEditPanel') }

  // 下面是拖动地图
  if(isCtrlPressed.value) return;
  if (!isDragging.value) return;

  const currentX = mousePos.x
  const currentY = mousePos.y

  const dx = currentX - startX;
  const dy = currentY - startY;

  offsetX += dx;
  offsetY += dy;

  startX = currentX;
  startY = currentY;

  const nx = canvasWidth /2 - offsetX
  const ny = canvasHeight/2 - offsetY
  canvasCenter.x = nx
  canvasCenter.y = ny
  updateCanvasCenter(canvasCenter)
};

const endDrag = (event) => {
  draggingPointIndex = null
  if (isDragging.value) {
    isDragging.value = false;
    // console.log('Drag ended at:', getMousePos(event));
  }
};

const getMousePos = (event) => {
  const canvas = myCanvas.value;
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};


onMounted(()=> {
  drawMap(0,0)
})

</script>
<template>
  {{ countrySelect }}
  <!--默认情况下canvas无法获取焦点，tabindex=0使得canvas可以获取焦点从而监听键盘-->
  <canvas
      ref="myCanvas"
      tabindex="0"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousedown="startDrag"
      @mousemove="dragging"
      @mouseup="endDrag"
      @mouseleave="endDrag"
  ></canvas>
</template>


<style scoped>
canvas {
  border: 1px solid black;
}
</style>
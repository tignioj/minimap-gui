<script setup>
import {defineProps, onBeforeUnmount, onMounted, onUpdated, reactive, ref, watch} from "vue";
import {serverURL} from "@/api.js";

const props = defineProps({
  points: {
    type: Array,
    required: true
  }
});
const pointRadius = 4
const canvasWidth = 500
const canvasHeight = 500

// 鼠标拖拽时，画板中心位置
const canvasCenter = reactive({x: 0, y: 0})

let startX = 0;  // 记录鼠标在画板按下时候的坐标
let startY =0;
let offsetX = canvasWidth / 2 - canvasCenter.x
let offsetY = canvasHeight / 2 -canvasCenter.y;
let isDragging = ref(false);
const myCanvas = ref(null)

function drawMap(x,y) {
  const canvas = myCanvas.value;
  const ctx = canvas.getContext('2d');
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
    drawLines()
    // drawUserPoint(x,y)
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
  console.log('Drag started at:', getMousePos(event));
  const current =getMousePos(event);
  startX = current.x
  startY = current.y
};

// console.log('off', offsetX,offsetY)
const dragging = (event) => {
  if (!isDragging.value) return;

  const pos = getMousePos(event)
  const currentX = pos.x
  const currentY = pos.y

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
};

const endDrag = (event) => {
  if (isDragging.value) {
    isDragging.value = false;
    console.log('Drag ended at:', getMousePos(event));
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

// 为了防止内存泄漏，可以在组件卸载前移除事件监听器
onBeforeUnmount(() => {
  if (myCanvas.value) {
    myCanvas.value.removeEventListener('mousedown', startDrag);
    myCanvas.value.removeEventListener('mousemove', dragging);
    myCanvas.value.removeEventListener('mouseup', endDrag);
    myCanvas.value.removeEventListener('mouseleave', endDrag);
  }
});
onMounted(()=> {
  drawMap(0,0)
})
onUpdated(()=> {
  console.log('数据更新了', props.points)
  const firstPoint = props.points[0]

  offsetX = canvasWidth / 2 - firstPoint.x;
  offsetY = canvasHeight / 2 - firstPoint.y;

  canvasCenter.x = firstPoint.x
  canvasCenter.y = firstPoint.y
})

watch(canvasCenter, async (nx, ox)=> {
  drawMap(nx.x, nx.y)
})
// watch(props.points, (np, op) => {
//   console.log(np)
// })

</script>
<template>
  <canvas
      ref="myCanvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousedown="startDrag"
      @mousemove="dragging"
      @mouseup="endDrag"
      @mouseleave="endDrag"
  ></canvas>
</template>


<style scoped>

</style>
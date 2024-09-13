<script setup>
import {nextTick, ref, watch} from 'vue'
import {store} from "@/store.js";

const logBoxVisible = ref(false)
const logBoxWidth = ref(600) // 初始宽度
let isResizing = false // 标记是否正在调整大小

// 示例日志内容，包含不同的类型和信息
const logs = ref(store.logs)
watch(()=> logs.value.length, () => {
  // nextTick(() => {
  if(logBox.value)
    logBox.value.scrollTop = logBox.value.scrollHeight
  // })
})
const logBox = ref(null)
// 切换日志框的显示/隐藏
const toggleLogBox = () => {
  logBoxVisible.value = !logBoxVisible.value

  if (logBoxVisible.value) {
    // 在日志框显示后滚动到底部
    nextTick(() => {
      logBox.value.scrollTop = logBox.value.scrollHeight
    })
  }
}


// 根据日志类型返回不同的颜色
const getColor = (type) => {
  switch (type) {
    case 'info':
      return 'green'
    case 'warning':
      return 'orange'
    case 'error':
      return 'red'
    default:
      return 'black'
  }
}

// 初始化调整大小事件
const initResize = (e) => {
  isResizing = true
  window.addEventListener('mousemove', resize)
  window.addEventListener('mouseup', stopResize)
}

// 执行调整大小
const resize = (e) => {
  if (isResizing) {
    const boxRightEdge = document.querySelector('.log-box-wrapper').getBoundingClientRect().right
    logBoxWidth.value = boxRightEdge - e.clientX // 根据左边调整宽度
  }
}

// 停止调整大小
const stopResize = () => {
  isResizing = false
  window.removeEventListener('mousemove', resize)
  window.removeEventListener('mouseup', stopResize)
}

</script>

<template>
  <div>
    <!-- 控制日志框显示/隐藏的按钮 -->
    <button @click="toggleLogBox">{{ logBoxVisible ? '隐藏日志' : '显示日志' }}</button>

    <!-- 日志框 -->
<!--    <transition name="fade">-->
      <div
          v-if="logBoxVisible"
          class="log-box-wrapper"
          :style="{ width: logBoxWidth + 'px' }"
      >
        <!-- 左边框拖动条 -->
        <div class="resizer" @mousedown.stop.prevent="initResize"></div>

        <div class="log-box" ref="logBox">
          <h3>日志</h3>
          <div>
            <div v-for="(log, index) in logs" :key="index">
              <span :style="{ color: getColor(log.type) }">
                {{log.datetime}} - {{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
<!--    </transition>-->
  </div>
</template>



<style scoped>
/* 日志框外部容器，包含日志框和拖动条 */
.log-box-wrapper {
  position: fixed;
  top: 50px;
  right: 10px;
  height: 90%;
  background-color: #f1f1f1;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

/* 实际内容滚动的日志框 */
.log-box {
  height: 100%;
  padding: 10px;
  overflow-y: auto; /* 显示垂直滚动条 */
  overflow-x: hidden; /* 隐藏水平滚动条 */
  font-size: 0.8em;
}

/* 左边框用于拖动调整大小的条 */
.resizer {
  position: absolute;
  top: 0;
  left: 0; /* 始终在左边 */
  width: 10px;
  height: 100%;
  cursor: ew-resize;
  background-color: rgba(0, 0, 0, 0.1);
}

/* 显示/隐藏动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

// mouse.js
import { ref, onMounted, onUnmounted } from 'vue'

// 按照惯例，组合式函数名以“use”开头
// https://cn.vuejs.org/guide/reusability/composables
export function useMouse() {
    // 被组合式函数封装和管理的状态
    const mouseX = ref(0)
    const mouseY = ref(0)

    // 组合式函数可以随时更改其状态。
    function update(event) {
        mouseX.value = event.pageX
        mouseY.value = event.pageY
    }

    // 一个组合式函数也可以挂靠在所属组件的生命周期上
    // 来启动和卸载副作用
    onMounted(() => window.addEventListener('mousemove', update))
    onUnmounted(() => window.removeEventListener('mousemove', update))

    // 通过返回值暴露所管理的状态
    return { mouseX, mouseY }
}
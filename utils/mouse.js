// mouse.js
import { ref, onMounted, onUnmounted } from 'vue'

// 按照惯例，组合式函数名以“use”开头
// https://cn.vuejs.org/guide/reusability/composables
export function useMouse() {
    // 被组合式函数封装和管理的状态
    const mousePageX = ref(0)
    const mousePageY = ref(0)

    const mouseClientX= ref(0)
    const mouseClientY= ref(0)

    // 组合式函数可以随时更改其状态。
    function update(event) {
        mousePageX.value = event.pageX
        mousePageY.value = event.pageY

        mouseClientX.value = event.clientX
        mouseClientY.value = event.clientY
    }

    // 一个组合式函数也可以挂靠在所属组件的生命周期上
    // 来启动和卸载副作用
    onMounted(() => window.addEventListener('mousemove', update))
    onUnmounted(() => window.removeEventListener('mousemove', update))

    // 通过返回值暴露所管理的状态
    return { mousePageX, mousePageY ,mouseClientX, mouseClientY }
}
// mouse.js
import { ref, onMounted, onUnmounted } from 'vue'

// 按照惯例，组合式函数名以“use”开头
// https://cn.vuejs.org/guide/reusability/composables
export function useKeyBoardListener() {
    // 被组合式函数封装和管理的状态
    const isCtrlPressed = ref(false)

    // 组合式函数可以随时更改其状态。
    const onkeydown = (event)=> {
        if (event.ctrlKey) isCtrlPressed.value = true;
    }
    const onkeyup = ((event)=> {
        if (!event.ctrlKey)  isCtrlPressed.value = false;
    })

    onMounted(() => {
        window.addEventListener('keyup', onkeyup)
        window.addEventListener('keydown', onkeydown)
    })
    onUnmounted(() => {
        window.removeEventListener('keyup', onkeyup)
        window.removeEventListener('keydown', onkeydown)
    })

    // 通过返回值暴露所管理的状态
    return {isCtrlPressed}
}
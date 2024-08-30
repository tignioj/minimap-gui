
// 按照惯例，组合式函数名以“use”开头
// https://cn.vuejs.org/guide/reusability/composables
/**
 * 复制一个对象
 * 注意：无法复制函数
 * @param sourceObject
 * @returns {any}
 */
export function copyObject(sourceObject) {
    return JSON.parse(JSON.stringify(sourceObject))
}

export function isUndefinedNullOrEmpty(value) {
    return value === undefined || value === null || value === "";
}
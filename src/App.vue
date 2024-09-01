<style>
main {
  margin-top: 10px;
}
/* 定义高亮的样式 */
.active-link {
  font-weight: bold;
  color: red; /* 可以根据需要修改颜色 */
}
</style>
<script setup>
import router from "@/router.js";
import {useRoute} from "vue-router";
const route = useRoute()
const activateClass = (link) => {
  route.fullPath.includes(link)
}
</script>
<template>
  <p>
    <strong>Current route path:</strong> {{ $route.fullPath }}
  </p>
  <nav>
    <a @click="router.go(-1)" style="cursor: pointer">返回</a> |
    <RouterLink :class="{'active-link': route.fullPath === '/'}" to="/">清单管理</RouterLink> |
    <RouterLink :class="{'active-link': route.fullPath.includes('/task/collect/edit')}" to="/task/collect/edit">创建采集任务</RouterLink> |
    <RouterLink :class="{'active-link': route.fullPath.includes('/task/fight/edit')}"  to="/task/fight/edit">创建战斗任务</RouterLink> |
    <RouterLink :class="{'active-link': route.fullPath.includes('/task/gouliang/edit')}"  to="/task/gouliang/edit">创建狗粮任务</RouterLink> |
    <RouterLink :class="{'active-link': route.fullPath === '/config/editor'}"  to="/config/editor">配置</RouterLink> |
  </nav>
  <main>
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </main>
</template>
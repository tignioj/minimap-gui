<style>
main {
  margin-top: 10px;
}
</style>
<template>
  <p>
    <strong>Current route path:</strong> {{ $route.fullPath }}
  </p>
  <nav>
    <RouterLink to="/">清单管理</RouterLink> |
    <RouterLink to="/task/collect/edit">创建采集任务</RouterLink> |
    <RouterLink to="/task/fight/edit">创建战斗任务</RouterLink> |
    <RouterLink to="/task/gouliang/edit">创建狗粮任务</RouterLink> |
    <RouterLink to="/config/editor">配置</RouterLink> |
  </nav>
  <main>
    <RouterView />
  </main>
</template>
<script setup lang="ts">
</script>
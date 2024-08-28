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
    <RouterLink to="/config/editor">配置</RouterLink> |
    <RouterLink to="/task/new">创建任务</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>
<script setup lang="ts">
</script>
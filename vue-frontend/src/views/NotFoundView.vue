<script setup>
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <router-link to="/">返回首页</router-link>
  </div>
</template>

<style scoped>
.not-found { text-align: center; margin-top: 120px; color: #666; }
.not-found h1 { font-size: 72px; color: #ddd; margin-bottom: 8px; }
.not-found p { font-size: 16px; margin-bottom: 24px; }
.not-found a { color: #1a73e8; text-decoration: none; }
</style>

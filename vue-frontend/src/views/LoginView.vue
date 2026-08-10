<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    router.push('/problems')
  } catch (e) {
    error.value = e.response?.data?.message || '登录失败'
  }
}
</script>

<template>
  <div class="auth-page">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin" class="auth-form">
      <input v-model="username" placeholder="用户名" required />
      <input v-model="password" type="password" placeholder="密码" required />
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit">登录</button>
    </form>
    <p class="switch">还没有账号？<router-link to="/register">去注册</router-link></p>
  </div>
</template>

<style scoped>
.auth-page { max-width: 400px; margin: 60px auto; }
.auth-form { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; }
.auth-form input { padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
.auth-form button { padding: 10px; background: #1a73e8; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 15px; }
.error { color: #f44336; font-size: 13px; }
.switch { margin-top: 16px; font-size: 14px; text-align: center; }
</style>

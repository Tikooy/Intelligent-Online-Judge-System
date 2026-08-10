<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const nickname = ref('')
const error = ref('')

async function handleRegister() {
  error.value = ''
  try {
    await auth.register(username.value, password.value, nickname.value)
    router.push('/login')
  } catch (e) {
    error.value = e.response?.data?.message || '注册失败'
  }
}
</script>

<template>
  <div class="auth-page">
    <h2>注册</h2>
    <form @submit.prevent="handleRegister" class="auth-form">
      <input v-model="username" placeholder="用户名" required />
      <input v-model="nickname" placeholder="昵称（选填）" />
      <input v-model="password" type="password" placeholder="密码" required />
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit">注册</button>
    </form>
    <p class="switch">已有账号？<router-link to="/login">去登录</router-link></p>
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

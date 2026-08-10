import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  async function login(username, password) {
    const res = await api.post('/api/auth/login', { username, password })
    token.value = res.data.data.token
    localStorage.setItem('token', token.value)
    await fetchMe()
  }

  async function register(username, password, nickname) {
    await api.post('/api/auth/register', { username, password, nickname })
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await api.get('/api/auth/me')
      user.value = res.data.data
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return { token, user, isLoggedIn, isAdmin, login, register, fetchMe, logout }
})

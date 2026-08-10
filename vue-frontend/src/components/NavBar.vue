<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import UserAvatar from './UserAvatar.vue'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-left">
      <router-link to="/" class="logo">智能判题系统</router-link>
      <router-link to="/problems">题库</router-link>
      <router-link to="/ranking">排行榜</router-link>
    </div>
    <div class="nav-right">
      <template v-if="auth.isLoggedIn">
        <router-link to="/submissions">提交记录</router-link>
        <router-link v-if="auth.isAdmin" to="/admin/problems">管理</router-link>
        <router-link to="/profile" class="profile-link">
          <UserAvatar :name="auth.user?.nickname || auth.user?.username" :size="26" />
          <span>{{ auth.user?.nickname || auth.user?.username }}</span>
        </router-link>
        <button @click="handleLogout" class="btn-logout">退出</button>
      </template>
      <template v-else>
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 0 24px; height: 56px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.nav-left, .nav-right { display: flex; align-items: center; gap: 20px; }
.logo { font-weight: 700; font-size: 18px; color: #1a73e8; text-decoration: none; }
a { color: #333; text-decoration: none; font-size: 14px; }
a:hover { color: #1a73e8; }
.profile-link { display: flex; align-items: center; gap: 8px; }
.btn-logout { padding: 4px 12px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; font-size: 13px; }
.btn-logout:hover { background: #f5f5f5; }
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import api from '../api'
import AdminDashboard from '../components/AdminDashboard.vue'
import UserAvatar from '../components/UserAvatar.vue'

const auth = useAuthStore()
const router = useRouter()
const stats = ref(null)
const loading = ref(true)

const statusLabel = {
  ACCEPTED: '通过', WRONG_ANSWER: '答案错误', COMPILE_ERROR: '编译错误',
  RUNTIME_ERROR: '运行错误', TIME_LIMIT_EXCEEDED: '超时', MEMORY_LIMIT_EXCEEDED: '超内存',
  PENDING: '等待中',
}

const statusColor = {
  ACCEPTED: '#4caf50', WRONG_ANSWER: '#f44336', COMPILE_ERROR: '#ff9800',
  RUNTIME_ERROR: '#9c27b0', TIME_LIMIT_EXCEEDED: '#2196f3',
  MEMORY_LIMIT_EXCEEDED: '#2196f3', PENDING: '#999',
}

onMounted(async () => {
  if (!auth.user?.id) {
    await auth.fetchMe()
  }
  if (!auth.user?.id) {
    router.push('/login')
    return
  }
  // 管理员主页由 AdminDashboard 组件独立渲染
  if (auth.isAdmin) {
    loading.value = false
    return
  }
  await loadStats()
})

async function loadStats() {
  loading.value = true
  try {
    const res = await api.get(`/api/users/${auth.user.id}/stats`)
    stats.value = res.data.data
  } catch {
    // stats unavailable
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="profile">
    <h2>个人主页</h2>

    <!-- 管理员：平台运营仪表盘 -->
    <AdminDashboard v-if="auth.isAdmin" />

    <!-- 普通用户：个人统计 -->
    <template v-else>
      <div v-if="loading" class="loading">加载中...</div>

      <template v-if="stats">
      <!-- 用户信息 -->
      <div class="info-card">
        <UserAvatar :name="stats.nickname || stats.username" :size="56" />
        <div class="info-text">
          <p class="name">{{ stats.nickname || stats.username }}</p>
          <p class="username">@{{ stats.username }}</p>
          <p class="role">{{ stats.role === 'ADMIN' ? '管理员' : '用户' }}</p>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="num">{{ stats.rank || '-' }}</span>
          <span class="lbl">排名</span>
        </div>
        <div class="stat-card accent">
          <span class="num">{{ stats.acceptedCount }}</span>
          <span class="lbl">通过</span>
        </div>
        <div class="stat-card">
          <span class="num">{{ stats.totalSubmissions }}</span>
          <span class="lbl">总提交</span>
        </div>
        <div class="stat-card">
          <span class="num">{{ stats.acceptRate }}%</span>
          <span class="lbl">通过率</span>
        </div>
      </div>

      <!-- 最近提交 -->
      <div v-if="stats.recentSubmissions && stats.recentSubmissions.length" class="recent">
        <h3>最近提交</h3>
        <div v-for="s in stats.recentSubmissions" :key="s.id"
             class="recent-item"
             @click="$router.push(`/submissions/${s.id}`)">
          <div class="ri-left">
            <router-link :to="`/problems/${s.problemId}`" @click.stop>
              {{ s.problemTitle || `#${s.problemId}` }}
            </router-link>
          </div>
          <span class="ri-status" :style="{ color: statusColor[s.status] || '#999' }">
            {{ statusLabel[s.status] || s.status }}
          </span>
          <span class="ri-time">{{ new Date(s.createdAt).toLocaleString() }}</span>
        </div>
      </div>
      </template>

      <p v-else class="empty">暂无数据</p>
    </template>
  </div>
</template>

<style scoped>
.loading, .empty { text-align: center; color: #999; margin-top: 60px; }
.info-card { display: flex; align-items: center; gap: 16px; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
.name { font-size: 18px; font-weight: 600; }
.username { font-size: 13px; color: #999; }
.role { font-size: 12px; color: #1a73e8; margin-top: 2px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
.stat-card.accent { border-top: 3px solid #1a73e8; }
.stat-card .num { display: block; font-size: 28px; font-weight: 700; color: #333; }
.stat-card .lbl { font-size: 13px; color: #999; margin-top: 4px; }
.recent { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; }
.recent h3 { font-size: 16px; margin-bottom: 12px; }
.recent-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
.recent-item:last-child { border-bottom: none; }
.recent-item:hover { background: #fafafa; margin: 0 -20px; padding-left: 20px; padding-right: 20px; }
.ri-left { flex: 1; }
.ri-left a { color: #1a73e8; font-size: 14px; text-decoration: none; }
.ri-status { font-size: 13px; font-weight: 600; min-width: 100px; }
.ri-time { font-size: 12px; color: #999; }
</style>

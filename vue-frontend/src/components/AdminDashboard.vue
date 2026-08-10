<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api'

const auth = useAuthStore()
const dashboard = ref(null)
const loading = ref(true)

const difficultyLabel = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }
const difficultyOrder = ['EASY', 'MEDIUM', 'HARD']

const statusLabel = {
  ACCEPTED: '通过', WRONG_ANSWER: '答案错误', COMPILE_ERROR: '编译错误',
  RUNTIME_ERROR: '运行错误', TIME_LIMIT_EXCEEDED: '超时',
  MEMORY_LIMIT_EXCEEDED: '超内存', PENDING: '等待中', SYSTEM_ERROR: '系统错误',
}

// 语言分布转成数组方便渲染，保持稳定顺序
const languageList = computed(() => {
  if (!dashboard.value?.languageDist) return []
  const order = ['JAVA', 'CPP', 'PYTHON']
  return order
    .filter(l => dashboard.value.languageDist[l])
    .map(l => ({ lang: l, count: dashboard.value.languageDist[l] }))
})

const statusList = computed(() => {
  if (!dashboard.value?.statusDist) return []
  return Object.entries(dashboard.value.statusDist).map(([status, count]) => ({
    status, count,
    label: statusLabel[status] || status,
  }))
})

// 语言占比：占全部提交数的百分比
function pct(count) {
  const total = dashboard.value?.totalSubmissions || 0
  if (!total) return 0
  return Math.round((count / total) * 100)
}

onMounted(async () => {
  try {
    const res = await api.get('/api/admin/dashboard')
    dashboard.value = res.data.data
  } catch {
    dashboard.value = null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div v-if="loading" class="loading">加载中...</div>

    <template v-else-if="dashboard">
      <!-- 管理员信息 -->
      <div class="info-card">
        <div class="avatar">{{ (auth.user?.nickname || auth.user?.username || 'A').charAt(0).toUpperCase() }}</div>
        <div class="info-text">
          <p class="name">{{ auth.user?.nickname || auth.user?.username }}</p>
          <p class="username">@{{ auth.user?.username }}</p>
          <p class="role">平台管理员</p>
        </div>
      </div>

      <!-- 1. 平台运营概览 -->
      <h3 class="section-title">平台运营概览</h3>
      <div class="stats-row">
        <div class="stat-card"><span class="num">{{ dashboard.totalUsers }}</span><span class="lbl">用户数</span></div>
        <div class="stat-card accent"><span class="num">{{ dashboard.totalSubmissions }}</span><span class="lbl">总提交</span></div>
        <div class="stat-card"><span class="num">{{ dashboard.totalProblems }}</span><span class="lbl">题目数</span></div>
        <div class="stat-card"><span class="num">{{ dashboard.totalTestCases }}</span><span class="lbl">测试用例</span></div>
        <div class="stat-card"><span class="num">{{ dashboard.overallAcceptRate?.toFixed(1) }}%</span><span class="lbl">整体通过率</span></div>
        <div class="stat-card" :class="{ warn: dashboard.pendingSubmissions > 0 }">
          <span class="num">{{ dashboard.pendingSubmissions }}</span><span class="lbl">待判队列</span>
        </div>
      </div>

      <!-- 2. 题库质量 -->
      <h3 class="section-title">题库质量</h3>
      <div class="card-block">
        <div class="diff-row">
          <span
            v-for="d in difficultyOrder" :key="d"
            class="diff-chip"
            :class="d"
          >{{ difficultyLabel[d] }} {{ dashboard.difficultyDist?.[d] || 0 }}</span>
          <span v-if="dashboard.missingReferenceCode || dashboard.missingTestCases" class="warn-chip">
            待完善：无参考代码 {{ dashboard.missingReferenceCode }} 题 / 无测试用例 {{ dashboard.missingTestCases }} 题
          </span>
          <span v-else class="ok-chip">题库数据完整</span>
        </div>
      </div>

      <div class="two-col">
        <div class="card-block">
          <h4>最热门题目 Top 5</h4>
          <table v-if="dashboard.hottestProblems?.length" class="mini-table">
            <thead><tr><th>题目</th><th>难度</th><th>提交</th><th>通过率</th></tr></thead>
            <tbody>
              <tr v-for="p in dashboard.hottestProblems" :key="p.id">
                <td><router-link :to="`/problems/${p.id}`">{{ p.title }}</router-link></td>
                <td><span class="tag" :class="p.difficulty">{{ difficultyLabel[p.difficulty] || p.difficulty }}</span></td>
                <td>{{ p.totalSubmissions }}</td>
                <td>{{ p.acceptRate }}%</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-sm">暂无提交数据</p>
        </div>

        <div class="card-block">
          <h4>最易错题目 Top 5</h4>
          <table v-if="dashboard.weakestProblems?.length" class="mini-table">
            <thead><tr><th>题目</th><th>难度</th><th>提交</th><th>通过率</th></tr></thead>
            <tbody>
              <tr v-for="p in dashboard.weakestProblems" :key="p.id">
                <td><router-link :to="`/problems/${p.id}`">{{ p.title }}</router-link></td>
                <td><span class="tag" :class="p.difficulty">{{ difficultyLabel[p.difficulty] || p.difficulty }}</span></td>
                <td>{{ p.totalSubmissions }}</td>
                <td class="low-rate">{{ p.acceptRate }}%</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-sm">暂无提交数据</p>
        </div>
      </div>

      <!-- 3. 判题健康度 -->
      <h3 class="section-title">判题健康度</h3>
      <div class="two-col">
        <div class="card-block">
          <h4>语言分布</h4>
          <div class="bar-list">
            <div v-for="item in languageList" :key="item.lang" class="bar-row">
              <span class="bar-label">{{ item.lang === 'CPP' ? 'C++' : item.lang === 'JAVA' ? 'Java' : 'Python' }}</span>
              <div class="bar-track"><div class="bar-fill" :style="{ width: pct(item.count) + '%' }"></div></div>
              <span class="bar-num">{{ item.count }}</span>
            </div>
            <p v-if="!languageList.length" class="empty-sm">暂无提交</p>
          </div>
        </div>
        <div class="card-block">
          <h4>状态分布</h4>
          <div class="status-list">
            <span v-for="s in statusList" :key="s.status" class="status-chip">{{ s.label }} {{ s.count }}</span>
            <p v-if="!statusList.length" class="empty-sm">暂无提交</p>
          </div>
          <p class="avg-time" v-if="dashboard.avgJudgeTimeMs">平均判题耗时 <strong>{{ dashboard.avgJudgeTimeMs?.toFixed(0) }} ms</strong></p>
        </div>
      </div>

      <!-- 4. 快捷入口 + 最近新增 -->
      <h3 class="section-title">快捷操作</h3>
      <div class="quick-row">
        <router-link to="/admin/problems" class="quick-btn">管理题目</router-link>
        <router-link to="/admin/problems" class="quick-btn primary">+ 新建题目</router-link>
        <router-link to="/submissions" class="quick-btn">查看全部提交</router-link>
      </div>

      <h3 class="section-title">最近新增题目</h3>
      <div v-if="dashboard.recentProblems?.length" class="recent">
        <div v-for="p in dashboard.recentProblems" :key="p.id" class="recent-item">
          <router-link :to="`/problems/${p.id}`" class="ri-title">{{ p.title }}</router-link>
          <span class="tag" :class="p.difficulty">{{ difficultyLabel[p.difficulty] || p.difficulty }}</span>
          <span class="ri-time">{{ new Date(p.createdAt).toLocaleString() }}</span>
        </div>
      </div>
      <p v-else class="empty-sm">暂无题目</p>
    </template>

    <p v-else class="empty">仪表盘数据加载失败</p>
  </div>
</template>

<style scoped>
.loading, .empty { text-align: center; color: #999; margin-top: 60px; }
.empty-sm { color: #999; font-size: 13px; }
.info-card { display: flex; align-items: center; gap: 16px; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px; }
.avatar { width: 56px; height: 56px; border-radius: 50%; background: #1a73e8; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; flex-shrink: 0; }
.name { font-size: 18px; font-weight: 600; }
.username { font-size: 13px; color: #999; }
.role { font-size: 12px; color: #1a73e8; margin-top: 2px; }
.section-title { font-size: 16px; margin: 24px 0 12px; color: #333; }

.stats-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.stat-card { background: #fff; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
.stat-card.accent { border-top: 3px solid #1a73e8; }
.stat-card.warn { border-top: 3px solid #ff9800; }
.stat-card .num { display: block; font-size: 22px; font-weight: 700; color: #333; }
.stat-card .lbl { font-size: 12px; color: #999; margin-top: 4px; }

.card-block { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 16px; margin-bottom: 16px; }
.card-block h4 { font-size: 14px; margin: 0 0 10px; color: #555; }
.diff-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.diff-chip { padding: 6px 14px; border-radius: 4px; font-size: 13px; font-weight: 600; }
.diff-chip.EASY { background: #e8f5e9; color: #2e7d32; }
.diff-chip.MEDIUM { background: #fff3e0; color: #e65100; }
.diff-chip.HARD { background: #fbe9e7; color: #c62828; }
.warn-chip { font-size: 12px; color: #e65100; background: #fff3e0; padding: 6px 12px; border-radius: 4px; }
.ok-chip { font-size: 12px; color: #2e7d32; background: #e8f5e9; padding: 6px 12px; border-radius: 4px; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.mini-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.mini-table th { text-align: left; padding: 6px 8px; border-bottom: 1px solid #f0f0f0; color: #999; font-weight: 600; }
.mini-table td { padding: 6px 8px; border-bottom: 1px solid #f5f5f5; }
.mini-table a { color: #1a73e8; text-decoration: none; }
.mini-table a:hover { text-decoration: underline; }
.low-rate { color: #f44336; font-weight: 600; }
.tag { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
.tag.EASY { background: #e8f5e9; color: #2e7d32; }
.tag.MEDIUM { background: #fff3e0; color: #e65100; }
.tag.HARD { background: #fbe9e7; color: #c62828; }

.bar-list .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; }
.bar-label { width: 60px; color: #666; }
.bar-track { flex: 1; height: 14px; background: #f0f0f0; border-radius: 7px; overflow: hidden; }
.bar-fill { height: 100%; background: #1a73e8; border-radius: 7px; }
.bar-num { width: 40px; text-align: right; color: #333; font-weight: 600; }
.status-list { display: flex; flex-wrap: wrap; gap: 8px; }
.status-chip { padding: 4px 10px; border-radius: 12px; background: #f0f0f0; font-size: 12px; color: #555; }
.avg-time { margin-top: 12px; font-size: 13px; color: #666; }

.quick-row { display: flex; gap: 12px; flex-wrap: wrap; }
.quick-btn { padding: 10px 20px; border: 1px solid #ddd; border-radius: 6px; background: #fff; color: #555; text-decoration: none; font-size: 14px; }
.quick-btn:hover { background: #f5f5f5; }
.quick-btn.primary { background: #1a73e8; color: #fff; border-color: #1a73e8; }
.quick-btn.primary:hover { background: #1765cc; }

.recent { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 8px 16px; }
.recent-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.recent-item:last-child { border-bottom: none; }
.ri-title { flex: 1; color: #1a73e8; text-decoration: none; font-size: 14px; }
.ri-title:hover { text-decoration: underline; }
.ri-time { font-size: 12px; color: #999; }

@media (max-width: 900px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }
  .two-col { grid-template-columns: 1fr; }
}
</style>

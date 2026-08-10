<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const submissions = ref([])
const loading = ref(true)
const problemId = ref(route.query.problemId || '')
const page = ref(1)
const size = ref(20)
const total = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))

const statusMap = {
  PENDING:              { label: '等待中',  color: '#999' },
  ACCEPTED:             { label: '通过', color: '#4caf50' },
  WRONG_ANSWER:         { label: '答案错误', color: '#f44336' },
  COMPILE_ERROR:        { label: '编译错误', color: '#ff9800' },
  RUNTIME_ERROR:        { label: '运行错误', color: '#9c27b0' },
  TIME_LIMIT_EXCEEDED:  { label: '超时', color: '#2196f3' },
  MEMORY_LIMIT_EXCEEDED:{ label: '超内存', color: '#2196f3' },
  SYSTEM_ERROR:         { label: '系统错误', color: '#757575' },
}

async function fetchSubmissions() {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
    if (problemId.value) params.problemId = problemId.value
    const res = await api.get('/api/submissions', { params })
    const data = res.data.data || {}
    submissions.value = data.records || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function changePage(delta) {
  const next = page.value + delta
  if (next < 1 || next > totalPages.value) return
  page.value = next
  fetchSubmissions()
}

onMounted(fetchSubmissions)
</script>

<template>
  <div>
    <h2>提交记录</h2>

    <div v-if="loading" class="loading">加载中...</div>

    <table v-else-if="submissions.length" class="sub-table">
      <thead>
        <tr>
          <th>#</th>
          <th>题目</th>
          <th>语言</th>
          <th>状态</th>
          <th>耗时</th>
          <th>内存</th>
          <th>时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in submissions" :key="s.id"
            @click="$router.push(`/submissions/${s.id}`)"
            class="clickable-row">
          <td class="id-cell">{{ s.id }}</td>
          <td>{{ s.problemTitle || `#${s.problemId}` }}</td>
          <td><span class="lang-tag">{{ s.language }}</span></td>
          <td>
            <span class="status-badge" :style="{ background: (statusMap[s.status] || {}).color || '#999' }">
              {{ (statusMap[s.status] || {}).label || s.status }}
            </span>
          </td>
          <td>{{ s.totalTimeMs || '-' }}ms</td>
          <td>{{ s.totalMemoryKb ? (s.totalMemoryKb / 1024).toFixed(1) + 'MB' : '-' }}</td>
          <td class="time-cell">{{ new Date(s.createdAt).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="empty">暂无提交记录</p>

    <div v-if="submissions.length" class="pagination">
      <button :disabled="page <= 1" @click="changePage(-1)">上一页</button>
      <span>{{ page }} / {{ totalPages }}（共 {{ total }} 条）</span>
      <button :disabled="page >= totalPages" @click="changePage(1)">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.loading, .empty { text-align: center; color: #999; margin-top: 60px; }
.sub-table { width: 100%; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-collapse: collapse; }
.sub-table th { padding: 12px 16px; text-align: left; border-bottom: 2px solid #f0f0f0; font-size: 13px; color: #666; font-weight: 600; }
.sub-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
.clickable-row { cursor: pointer; }
.clickable-row:hover { background: #fafafa; }
.id-cell { color: #999; font-size: 12px; width: 50px; }
.time-cell { color: #999; font-size: 12px; }
.status-badge { padding: 2px 10px; border-radius: 12px; color: #fff; font-size: 12px; font-weight: 600; white-space: nowrap; }
.lang-tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; font-size: 13px; color: #666; }
.pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>

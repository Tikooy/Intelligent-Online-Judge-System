<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'

const problems = ref([])
const keyword = ref('')
const difficulty = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const difficultyLabel = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }

async function fetchProblems() {
  const res = await api.get('/api/problems', {
    params: { keyword: keyword.value, difficulty: difficulty.value, page: currentPage.value, size: pageSize.value }
  })
  problems.value = res.data.data.records || []
  total.value = res.data.data.total || 0
}

function search() {
  currentPage.value = 1
  fetchProblems()
}

function goPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchProblems()
}

onMounted(() => fetchProblems())
</script>

<template>
  <div class="problem-list">
    <div class="search-bar">
      <input v-model="keyword" placeholder="搜索题目..." @keyup.enter="search" />
      <select v-model="difficulty" @change="search">
        <option value="">全部难度</option>
        <option value="EASY">简单</option>
        <option value="MEDIUM">中等</option>
        <option value="HARD">困难</option>
      </select>
      <button @click="search">搜索</button>
    </div>

    <table v-if="problems.length" class="problem-table">
      <thead>
        <tr>
          <th style="width:60px">#</th>
          <th>标题</th>
          <th style="width:80px">难度</th>
          <th style="width:100px">通过率</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in problems" :key="p.id" @click="$router.push(`/problems/${p.id}`)">
          <td class="id-cell">{{ p.id }}</td>
          <td class="title-cell">{{ p.title }}</td>
          <td><span class="tag" :class="p.difficulty">{{ difficultyLabel[p.difficulty] || p.difficulty }}</span></td>
          <td class="stat-cell">
            <span v-if="p.totalSubmissions" class="accept-rate">
              {{ p.acceptedCount }}/{{ p.totalSubmissions }}
              <span class="rate-pct">({{ Math.round(p.acceptedCount / p.totalSubmissions * 100) }}%)</span>
            </span>
            <span v-else class="no-data">-</span>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">暂无题目，请管理员添加</p>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="currentPage === 1" @click="goPage(1)">首页</button>
      <button :disabled="currentPage === 1" @click="goPage(currentPage - 1)">上一页</button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)">下一页</button>
      <button :disabled="currentPage === totalPages" @click="goPage(totalPages)">末页</button>
      <span class="total-info">共 {{ total }} 题</span>
    </div>
  </div>
</template>

<style scoped>
.search-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.search-bar input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
.search-bar select, .search-bar button { padding: 10px 16px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; font-size: 14px; }
.search-bar button { background: #1a73e8; color: #fff; border-color: #1a73e8; }
.problem-table { width: 100%; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-collapse: collapse; }
.problem-table th { padding: 12px 16px; text-align: left; border-bottom: 2px solid #f0f0f0; font-size: 13px; color: #666; font-weight: 600; }
.problem-table td { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
.problem-table tr { cursor: pointer; }
.problem-table tr:hover { background: #fafafa; }
.id-cell { color: #999; font-size: 13px; }
.title-cell { color: #1a73e8; font-weight: 500; }
.stat-cell { font-size: 12px; color: #666; }
.accept-rate { white-space: nowrap; }
.rate-pct { color: #999; }
.no-data { color: #ccc; }
.tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.tag.EASY { background: #e8f5e9; color: #2e7d32; }
.tag.MEDIUM { background: #fff3e0; color: #e65100; }
.tag.HARD { background: #fbe9e7; color: #c62828; }
.empty { text-align: center; color: #999; margin-top: 60px; font-size: 14px; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 24px; }
.pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; font-size: 13px; }
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: #666; margin: 0 8px; }
.total-info { font-size: 12px; color: #999; margin-left: 12px; }
</style>

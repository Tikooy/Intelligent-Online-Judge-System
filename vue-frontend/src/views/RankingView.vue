<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import UserAvatar from '../components/UserAvatar.vue'

const rankings = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get('/api/ranking')
    rankings.value = res.data.data || []
  } finally {
    loading.value = false
  }
})

function rankClass(index) {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return ''
}
</script>

<template>
  <div class="ranking-page">
    <h2>排行榜</h2>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="rankings.length" class="rank-list">
      <div v-for="(r, i) in rankings" :key="r.userId"
           class="rank-item" :class="rankClass(i)">
        <div class="rank-num">
          <span v-if="i === 0">🥇</span>
          <span v-else-if="i === 1">🥈</span>
          <span v-else-if="i === 2">🥉</span>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <div class="rank-user">
          <UserAvatar :name="r.nickname || r.username" :size="32" />
          <span class="nickname">{{ r.nickname || r.username }}</span>
        </div>
        <div class="rank-stat">
          <span class="stat-value">{{ r.acceptedCount }}</span>
          <span class="stat-label">通过</span>
        </div>
        <div class="rank-stat">
          <span class="stat-value">{{ r.totalSubmissions }}</span>
          <span class="stat-label">提交</span>
        </div>
        <div class="rank-rate">
          <div class="rate-bar">
            <div class="rate-fill" :style="{ width: r.acceptRate + '%' }"
                 :class="{ high: r.acceptRate >= 70, mid: r.acceptRate >= 40 && r.acceptRate < 70, low: r.acceptRate < 40 }"></div>
          </div>
          <span class="rate-text">{{ r.acceptRate }}%</span>
        </div>
      </div>
    </div>

    <p v-else class="empty">暂无排行数据</p>
  </div>
</template>

<style scoped>
.loading, .empty { text-align: center; color: #999; margin-top: 60px; }
.rank-list { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
.rank-item { display: flex; align-items: center; gap: 16px; padding: 14px 20px; border-bottom: 1px solid #f0f0f0; }
.rank-item:last-child { border-bottom: none; }
.rank-item.gold { background: linear-gradient(90deg, #fff8e1, #fff); }
.rank-item.silver { background: linear-gradient(90deg, #f5f5f5, #fff); }
.rank-item.bronze { background: linear-gradient(90deg, #fbe9e7, #fff); }
.rank-num { width: 36px; text-align: center; font-size: 18px; font-weight: 700; color: #666; flex-shrink: 0; }
.rank-user { flex: 1; display: flex; align-items: center; gap: 10px; }
.nickname { font-size: 14px; font-weight: 500; }
.rank-stat { display: flex; flex-direction: column; align-items: center; width: 60px; }
.stat-value { font-size: 16px; font-weight: 700; color: #333; }
.stat-label { font-size: 11px; color: #999; }
.rank-rate { display: flex; align-items: center; gap: 8px; width: 160px; }
.rate-bar { flex: 1; height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.rate-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
.rate-fill.high { background: #4caf50; }
.rate-fill.mid { background: #ff9800; }
.rate-fill.low { background: #f44336; }
.rate-text { font-size: 13px; color: #666; width: 42px; text-align: right; }
</style>

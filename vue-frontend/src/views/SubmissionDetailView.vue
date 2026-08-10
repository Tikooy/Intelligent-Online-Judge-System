<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const submission = ref(null)
const loading = ref(true)

const statusMap = {
  PENDING:              { label: '等待中',  color: '#999' },
  ACCEPTED:             { label: '通过',    color: '#4caf50' },
  WRONG_ANSWER:         { label: '答案错误', color: '#f44336' },
  COMPILE_ERROR:        { label: '编译错误', color: '#ff9800' },
  RUNTIME_ERROR:        { label: '运行错误', color: '#9c27b0' },
  TIME_LIMIT_EXCEEDED:  { label: '超时',    color: '#2196f3' },
  MEMORY_LIMIT_EXCEEDED:{ label: '超内存',  color: '#2196f3' },
  SYSTEM_ERROR:         { label: '系统错误', color: '#757575' },
}

const detailStatusMap = {
  PASSED:               { label: '通过', color: '#4caf50' },
  WRONG_ANSWER:         { label: '答案错误', color: '#f44336' },
  RUNTIME_ERROR:        { label: '运行错误', color: '#9c27b0' },
  TIME_LIMIT_EXCEEDED:  { label: '超时',    color: '#2196f3' },
  MEMORY_LIMIT_EXCEEDED:{ label: '超内存',  color: '#2196f3' },
  SKIPPED:              { label: '已跳过',  color: '#bbb' },
}

onMounted(async () => {
  try {
    const res = await api.get(`/api/submissions/${route.params.id}`)
    submission.value = res.data.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="loading" class="loading">加载中...</div>

  <div v-else-if="submission" class="detail">
    <h2>提交详情 #{{ submission.id }}</h2>

    <div class="summary-card">
      <div class="summary-row">
        <span class="label">题目</span>
        <router-link :to="`/problems/${submission.problemId}`">{{ submission.problemTitle }}</router-link>
      </div>
      <div class="summary-row">
        <span class="label">语言</span>
        <span class="lang-tag">{{ submission.language }}</span>
      </div>
      <div class="summary-row">
        <span class="label">状态</span>
        <span class="status-badge" :style="{ background: (statusMap[submission.status] || {}).color || '#999' }">
          {{ (statusMap[submission.status] || {}).label || submission.status }}
        </span>
      </div>
      <div class="summary-row">
        <span class="label">提交时间</span>
        <span>{{ new Date(submission.createdAt).toLocaleString() }}</span>
      </div>
      <div class="summary-row" v-if="submission.totalTimeMs">
        <span class="label">总耗时</span>
        <span>{{ submission.totalTimeMs }}ms</span>
      </div>
      <div class="summary-row" v-if="submission.totalMemoryKb">
        <span class="label">最大内存</span>
        <span>{{ (submission.totalMemoryKb / 1024).toFixed(1) }}MB</span>
      </div>
    </div>

    <!-- 编译错误 -->
    <div v-if="submission.compileError" class="compile-error">
      <h3>编译错误</h3>
      <pre>{{ submission.compileError }}</pre>
    </div>

    <!-- 测试点详情 -->
    <div v-if="submission.details && submission.details.length" class="test-details">
      <h3>测试点结果</h3>
      <table class="tc-table">
        <thead>
          <tr>
            <th>#</th>
            <th>状态</th>
            <th>耗时</th>
            <th>内存</th>
            <th>输出</th>
            <th>错误</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tc in submission.details" :key="tc.testCaseIndex">
            <td>{{ tc.testCaseIndex }}</td>
            <td>
              <span class="tc-status" :style="{ color: (detailStatusMap[tc.status] || {}).color || '#999' }">
                {{ (detailStatusMap[tc.status] || {}).label || tc.status }}
              </span>
            </td>
            <td>{{ tc.timeMs }}ms</td>
            <td>{{ (tc.memoryKb / 1024).toFixed(1) }}MB</td>
            <td class="output-cell"><pre>{{ tc.actualOutput }}</pre></td>
            <td class="output-cell"><pre class="err">{{ tc.errorMsg }}</pre></td>
          </tr>
        </tbody>
      </table>
    </div>

    <router-link to="/submissions" class="back-link">← 返回提交列表</router-link>
  </div>

  <div v-else class="error-state">提交记录不存在</div>
</template>

<style scoped>
.loading, .error-state { text-align: center; margin-top: 80px; color: #999; }
.summary-card { background: #fff; border-radius: 8px; padding: 20px; border: 1px solid #e0e0e0; margin-bottom: 24px; }
.summary-row { display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px; }
.summary-row:last-child { border-bottom: none; }
.label { width: 80px; color: #666; flex-shrink: 0; }
.status-badge { padding: 2px 10px; border-radius: 12px; color: #fff; font-size: 13px; font-weight: 600; }
.lang-tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; font-size: 13px; }
.compile-error { background: #fff3e0; border: 1px solid #ffcc02; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
.compile-error h3 { color: #e65100; margin-bottom: 8px; }
.compile-error pre { white-space: pre-wrap; font-size: 13px; color: #333; }
.test-details { margin-bottom: 24px; }
.test-details h3 { margin-bottom: 12px; }
.tc-table { width: 100%; background: #fff; border-radius: 8px; border: 1px solid #e0e0e0; border-collapse: collapse; }
.tc-table th { padding: 10px 12px; text-align: left; background: #fafafa; border-bottom: 2px solid #e0e0e0; font-size: 13px; color: #666; }
.tc-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
.tc-status { font-weight: 600; }
.output-cell { max-width: 200px; }
.output-cell pre { margin: 0; padding: 4px; background: #f5f5f5; border-radius: 4px; font-size: 12px; white-space: pre-wrap; word-break: break-all; max-height: 80px; overflow-y: auto; }
.output-cell pre.err { color: #c62828; }
.back-link { display: inline-block; margin-top: 8px; color: #1a73e8; font-size: 14px; text-decoration: none; }
</style>

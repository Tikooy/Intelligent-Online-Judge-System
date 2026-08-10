<script setup>
import { useJudgeStore } from '../stores/judge'
import { computed } from 'vue'

const judge = useJudgeStore()

const statusLabel = computed(() => {
  switch (judge.finalResult?.status) {
    case 'ACCEPTED': return '通过'
    case 'WRONG_ANSWER': return '答案错误'
    case 'COMPILE_ERROR': return '编译错误'
    case 'RUNTIME_ERROR': return '运行错误'
    case 'TIME_LIMIT_EXCEEDED': return '超时'
    case 'MEMORY_LIMIT_EXCEEDED': return '超内存'
    case 'SYSTEM_ERROR': return '系统错误'
    default: return ''
  }
})

const statusColor = computed(() => {
  switch (judge.finalResult?.status) {
    case 'ACCEPTED': return '#4caf50'
    case 'WRONG_ANSWER': return '#f44336'
    case 'COMPILE_ERROR': return '#ff9800'
    case 'RUNTIME_ERROR': return '#9c27b0'
    case 'SYSTEM_ERROR': return '#757575'
    default: return '#2196f3'
  }
})

const progressPercent = computed(() => {
  if (!judge.totalCount) return 0
  return Math.round((judge.testResults.length / judge.totalCount) * 100)
})
</script>

<template>
  <div v-if="judge.judgeStatus" class="judge-panel">
    <div class="status-bar">
      <span class="status-label">{{ judge.judgeStatus }}</span>
      <span v-if="judge.finalResult" class="result-badge" :style="{ background: statusColor }">
        {{ statusLabel }}
      </span>
    </div>

    <!-- 进度条 -->
    <div v-if="judge.judgeStatus === '运行中...'" class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>

    <!-- 实时测试点 -->
    <div class="test-cases">
      <div v-for="(tc, i) in judge.testResults" :key="i"
           class="test-case" :class="tc.status">
        <span class="tc-index">#{{ tc.testCaseIndex }}</span>
        <span class="tc-status">{{ tc.status }}</span>
        <span class="tc-time">{{ tc.timeMs }}ms</span>
      </div>
    </div>

    <!-- 完成汇总 -->
    <div v-if="judge.finalResult" class="summary">
      <p>通过 <strong>{{ judge.finalResult.summary?.passedCount }}</strong> / {{ judge.finalResult.summary?.totalCount }} 个测试点</p>
      <p>总耗时 <strong>{{ judge.finalResult.summary?.totalTimeMs }}ms</strong></p>
      <router-link v-if="judge.submissionId"
                   :to="`/submissions/${judge.submissionId}`"
                   class="view-link">查看完整详情 →</router-link>
    </div>
  </div>
</template>

<style scoped>
.judge-panel { margin-top: 16px; padding: 16px; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; }
.status-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.status-label { font-size: 15px; font-weight: 600; }
.result-badge { padding: 3px 12px; border-radius: 12px; color: #fff; font-size: 13px; font-weight: 700; }
.progress-bar { height: 4px; background: #e0e0e0; border-radius: 2px; margin-bottom: 12px; overflow: hidden; }
.progress-fill { height: 100%; background: #1a73e8; transition: width 0.3s; border-radius: 2px; }
.summary { margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
.summary p { font-size: 14px; color: #333; margin: 4px 0; }
.view-link { display: inline-block; margin-top: 8px; color: #1a73e8; font-size: 14px; text-decoration: none; font-weight: 500; }
.view-link:hover { text-decoration: underline; }
.test-cases { display: flex; flex-wrap: wrap; gap: 8px; }
.test-case { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 4px; font-size: 13px; background: #f5f5f5; }
.test-case.PASSED { background: #e8f5e9; color: #2e7d32; }
.test-case.WRONG_ANSWER { background: #fbe9e7; color: #c62828; }
.test-case.TIME_LIMIT_EXCEEDED, .test-case.MEMORY_LIMIT_EXCEEDED { background: #e3f2fd; color: #1565c0; }
.test-case.RUNTIME_ERROR { background: #f3e5f5; color: #6a1b9a; }
.tc-time { color: #999; }
</style>

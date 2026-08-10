import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useJudgeStore = defineStore('judge', () => {
  const ws = ref(null)
  const submissionId = ref(null)
  const judgeStatus = ref('')
  const testResults = ref([])
  const totalCount = ref(0)
  const finalResult = ref(null)

  // 重连相关
  let reconnectAttempts = 0
  let reconnectTimer = null
  let savedSid = null
  let savedToken = null
  const MAX_RECONNECT_DELAY = 10000

  // REST 兜底轮询（WebSocket 重连耗尽后改用接口查询结果）
  let pollTimer = null
  let pollAttempts = 0
  const POLL_INTERVAL_MS = 2000
  const MAX_POLL_ATTEMPTS = 45

  // WebSocket 地址：优先环境变量，否则走当前站点（生产由 nginx 代理 /ws/ 到 judge-engine）
  function resolveWsBase() {
    const configured = import.meta.env.VITE_WS_URL
    if (configured) return configured
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    return `${proto}://${window.location.host}`
  }

  function connect(sid, token) {
    savedSid = sid
    savedToken = token
    submissionId.value = sid
    reconnectAttempts = 0
    // 立即给出初始状态，避免 WebSocket 尚未建立/消息未到达时判题结果区空白
    judgeStatus.value = '正在连接判题服务...'
    doConnect()
  }

  function doConnect() {
    if (ws.value) {
      ws.value.onclose = null
      ws.value.onerror = null
      ws.value.close()
      ws.value = null
    }

    const wsUrl = `${resolveWsBase()}/ws/judge?submissionId=${savedSid}&token=${savedToken}`
    ws.value = new WebSocket(wsUrl)

    ws.value.onmessage = (event) => {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case 'COMPILING':
          judgeStatus.value = '编译中...'
          break
        case 'RUNNING':
          judgeStatus.value = '运行中...'
          totalCount.value = data.totalCount
          break
        case 'TEST_CASE_RESULT':
          testResults.value.push(data)
          break
        case 'COMPLETED':
          judgeStatus.value = '判题完成'
          finalResult.value = data
          disconnect()
          break
      }
    }

    ws.value.onclose = () => {
      // 判题未完成时尝试重连；重连耗尽后改用 REST 轮询兜底
      if (judgeStatus.value && judgeStatus.value !== '判题完成' && judgeStatus.value !== '连接失败') {
        if (reconnectAttempts >= 5) {
          startPolling()
        } else {
          scheduleReconnect()
        }
      }
    }

    ws.value.onerror = () => {
      if (judgeStatus.value && judgeStatus.value !== '判题完成') {
        judgeStatus.value = '连接失败'
        if (reconnectAttempts >= 5) {
          startPolling()
        } else {
          scheduleReconnect()
        }
      }
    }
  }

  function scheduleReconnect() {
    if (reconnectAttempts >= 5) {
      startPolling()
      return
    }
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY)
    reconnectAttempts++
    reconnectTimer = setTimeout(() => {
      judgeStatus.value = '重新连接中...'
      doConnect()
    }, delay)
  }

  // WebSocket 不可用时的兜底：轮询 REST 接口获取判题结果
  function startPolling() {
    if (pollTimer) return
    pollAttempts = 0
    judgeStatus.value = '连接中断，正在查询结果...'

    pollTimer = setInterval(async () => {
      pollAttempts++
      if (!savedSid) {
        stopPolling()
        return
      }
      if (pollAttempts > MAX_POLL_ATTEMPTS) {
        stopPolling()
        judgeStatus.value = '结果查询超时，请刷新页面查看'
        return
      }
      try {
        const res = await api.get(`/api/submissions/${savedSid}`)
        const data = res.data.data
        if (data && data.status && data.status !== 'PENDING') {
          const details = data.details || []
          testResults.value = details.map(d => ({
            type: 'TEST_CASE_RESULT',
            testCaseIndex: d.testCaseIndex,
            totalCount: details.length,
            status: d.status,
            timeMs: d.timeMs || 0,
          }))
          totalCount.value = details.length
          finalResult.value = {
            type: 'COMPLETED',
            status: data.status,
            summary: {
              totalTimeMs: data.totalTimeMs || 0,
              totalMemoryKb: data.totalMemoryKb || 0,
              passedCount: details.filter(d => d.status === 'PASSED').length,
              totalCount: details.length,
            },
          }
          judgeStatus.value = '判题完成'
          disconnect()
        }
      } catch {
        // 网络或权限异常，继续轮询
      }
    }, POLL_INTERVAL_MS)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  function disconnect() {
    stopPolling()
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    reconnectAttempts = 0
    savedSid = null
    savedToken = null
    if (ws.value) {
      ws.value.onclose = null
      ws.value.onerror = null
      ws.value.close()
      ws.value = null
    }
  }

  function reset() {
    disconnect()
    submissionId.value = null
    judgeStatus.value = ''
    testResults.value = []
    totalCount.value = 0
    finalResult.value = null
  }

  return { ws, submissionId, judgeStatus, testResults, totalCount, finalResult, connect, disconnect, reset }
})

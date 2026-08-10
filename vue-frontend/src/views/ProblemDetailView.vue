<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useJudgeStore } from '../stores/judge'
import api from '../api'
import CodeEditor from '../components/CodeEditor.vue'
import JudgeStatus from '../components/JudgeStatus.vue'

const route = useRoute()
const auth = useAuthStore()
const judge = useJudgeStore()

const problem = ref(null)
const language = ref('JAVA')
const code = ref('')
const submitting = ref(false)
const activeTab = ref('sample')
const refLang = ref('JAVA')
const hasSubmitted = ref(false)

const difficultyLabel = { EASY: '简单', MEDIUM: '中等', HARD: '困难' }

const referenceCode = computed(() => {
  if (!problem.value?.referenceCode) return {}
  try {
    return JSON.parse(problem.value.referenceCode)
  } catch {
    return {}
  }
})

const BOILERPLATE = {
  JAVA: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // your code here\n    }\n}\n',
  CPP: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}\n',
  PYTHON: '# your code here\n',
}

// 切换语言时重新生成模板代码
watch(language, (lang) => {
  if (!judge.judgeStatus) {
    code.value = BOILERPLATE[lang]
  }
})

// 开始判题时自动切换到判题结果标签
watch(() => judge.judgeStatus, (status) => {
  if (status) activeTab.value = 'result'
})

onMounted(async () => {
  try {
    const res = await api.get(`/api/problems/${route.params.id}`)
    problem.value = res.data.data
    code.value = BOILERPLATE[language.value]
  } catch {
    problem.value = null
  }
})

// 离开页面时断开 WebSocket 并清理判题状态，避免后台残留连接与重连定时器
onUnmounted(() => {
  judge.reset()
})

async function submitCode() {
  if (!auth.isLoggedIn) {
    alert('请先登录')
    return
  }
  if (!code.value.trim()) {
    alert('请编写代码后再提交')
    return
  }
  submitting.value = true
  judge.reset()

  try {
    const res = await api.post('/api/submissions', {
      problemId: problem.value.id,
      language: language.value,
      codeText: code.value,
    })
    const { submissionId, wsToken } = res.data.data
    hasSubmitted.value = true
    // 提交后立即展示判题结果标签页（判题进度 + 结果），答案示例标签同时可用
    activeTab.value = 'result'
    judge.connect(submissionId, wsToken)
  } catch (e) {
    alert(e.response?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

const isJudging = computed(() => {
  const status = judge.judgeStatus
  return !!status && status !== '判题完成' && status !== '连接失败'
})
</script>

<template>
  <div v-if="problem" class="problem-detail">
    <div class="header">
      <h2>{{ problem.title }}</h2>
      <div class="meta">
        <span class="tag" :class="problem.difficulty">{{ difficultyLabel[problem.difficulty] || problem.difficulty }}</span>
        <span class="stats" v-if="problem.totalSubmissions">
          通过 {{ problem.acceptedCount }} / {{ problem.totalSubmissions }} 次提交
        </span>
      </div>
    </div>

    <div class="description">{{ problem.description }}</div>

    <div class="section">
      <h3>输入格式</h3>
      <pre>{{ problem.inputFormat }}</pre>
    </div>
    <div class="section">
      <h3>输出格式</h3>
      <pre>{{ problem.outputFormat }}</pre>
    </div>

    <div class="section">
      <h3>提交代码</h3>
      <div class="submit-bar">
        <select v-model="language">
          <option value="JAVA">Java</option>
          <option value="CPP">C++</option>
          <option value="PYTHON">Python 3</option>
        </select>
        <button @click="submitCode" :disabled="submitting || isJudging">
          {{ isJudging ? '判题中...' : submitting ? '提交中...' : '提交代码' }}
        </button>
      </div>
      <CodeEditor v-model="code" :language="language" />

      <!-- 标签页：判题结果 | 答案示例 -->
      <div class="tab-area">
        <div class="tab-bar">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'result' }"
            @click="activeTab = 'result'"
          >判题结果</button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'sample' }"
            @click="activeTab = 'sample'"
          >答案示例</button>
        </div>

        <div class="tab-content">
          <div v-show="activeTab === 'result'">
            <JudgeStatus />
            <div v-if="!judge.judgeStatus && !judge.finalResult" class="tab-placeholder">
              提交代码后将在此处显示判题结果
            </div>
          </div>

          <div v-show="activeTab === 'sample'">
            <div v-if="!hasSubmitted" class="tab-placeholder">
              提交代码后可查看参考代码
            </div>

            <div v-else-if="referenceCode.JAVA || referenceCode.CPP || referenceCode.PYTHON" class="ref-section" style="margin-top:0;padding-top:0;border-top:none">
              <div class="ref-lang-bar">
                <button
                  v-for="lang in ['JAVA', 'CPP', 'PYTHON']" :key="lang"
                  class="ref-lang-btn"
                  :class="{ active: refLang === lang }"
                  @click="refLang = lang"
                >{{ lang === 'CPP' ? 'C++' : lang === 'PYTHON' ? 'Python 3' : 'Java' }}</button>
              </div>
              <pre class="ref-code"><code>{{ referenceCode[refLang] || '暂无参考代码' }}</code></pre>
            </div>

            <div v-else class="tab-placeholder">暂无参考代码</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="error-state">
    <p>题目不存在或加载失败</p>
    <router-link to="/problems">返回题库</router-link>
  </div>
</template>

<style scoped>
.header { margin-bottom: 20px; }
.header h2 { font-size: 22px; margin-bottom: 8px; }
.meta { display: flex; align-items: center; gap: 16px; }
.stats { font-size: 13px; color: #666; }
.tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.tag.EASY { background: #e8f5e9; color: #2e7d32; }
.tag.MEDIUM { background: #fff3e0; color: #e65100; }
.tag.HARD { background: #fbe9e7; color: #c62828; }
.description { margin: 20px 0; line-height: 1.8; font-size: 15px; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; white-space: pre-wrap; word-break: break-word; }
.section { margin-bottom: 24px; }
.section h3 { font-size: 16px; margin-bottom: 10px; color: #333; }
pre { background: #f5f5f5; padding: 12px 16px; border-radius: 4px; font-size: 13px; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
.submit-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; }
.submit-bar select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; background: #fff; }
.submit-bar button { padding: 8px 24px; background: #1a73e8; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; }
.submit-bar button:disabled { opacity: 0.5; cursor: not-allowed; }

/* 标签页 */
.tab-area { margin-top: 12px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
.tab-bar { display: flex; border-bottom: 1px solid #e0e0e0; background: #fafafa; }
.tab-btn { flex: 1; padding: 10px 0; border: none; background: none; font-size: 14px; font-weight: 500; color: #666; cursor: pointer; transition: all 0.2s; }
.tab-btn.active { color: #1a73e8; background: #fff; box-shadow: inset 0 -2px 0 #1a73e8; }
.tab-btn:not(.active):hover { color: #333; background: #f0f0f0; }
.tab-content { padding: 16px; background: #fff; }
.tab-placeholder { text-align: center; color: #999; font-size: 14px; padding: 20px 0; }

/* 参考代码 */
.ref-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.ref-label { font-size: 13px; font-weight: 600; color: #666; margin-bottom: 8px; }
.ref-lang-bar { display: flex; gap: 0; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; width: fit-content; }
.ref-lang-btn { padding: 4px 14px; border: none; background: #fff; font-size: 12px; color: #666; cursor: pointer; border-right: 1px solid #ddd; }
.ref-lang-btn:last-child { border-right: none; }
.ref-lang-btn.active { background: #1a73e8; color: #fff; }
.ref-lang-btn:not(.active):hover { background: #f0f0f0; }
.ref-code { background: #1e1e1e; color: #d4d4d4; padding: 12px 16px; border-radius: 4px; font-size: 13px; overflow-x: auto; white-space: pre; font-family: 'Consolas', 'Monaco', monospace; max-height: 300px; overflow-y: auto; }

.error-state { text-align: center; margin-top: 80px; color: #999; }
.error-state a { color: #1a73e8; }
</style>

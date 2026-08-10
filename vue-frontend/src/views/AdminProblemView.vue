<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import api from '../api'

const auth = useAuthStore()
const router = useRouter()

const problems = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref(null)
const currentPage = ref(1)
const size = ref(20)
const total = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))

const form = ref({
  title: '',
  description: '',
  difficulty: 'EASY',
  inputFormat: '',
  outputFormat: '',
  sampleInput: '',
  sampleOutput: '',
  referenceCode: '{"JAVA":"","CPP":"","PYTHON":""}',
})

const testCaseText = ref('')
const testCases = ref([])

// 验证管理员身份
if (!auth.isAdmin) {
  router.replace('/')
}

async function fetchProblems() {
  loading.value = true
  try {
    const res = await api.get('/api/problems', { params: { page: currentPage.value, size: size.value } })
    problems.value = res.data.data.records || []
    total.value = res.data.data.total || 0
  } catch (e) {
    alert('加载题目失败: ' + (e.response?.data?.message || e.message))
  } finally {
    loading.value = false
  }
}

function changePage(delta) {
  const next = currentPage.value + delta
  if (next < 1 || next > totalPages.value) return
  currentPage.value = next
  fetchProblems()
}

function openCreate() {
  editingId.value = null
  form.value = {
    title: '',
    description: '',
    difficulty: 'EASY',
    inputFormat: '',
    outputFormat: '',
    sampleInput: '',
    sampleOutput: '',
    referenceCode: '{"JAVA":"","CPP":"","PYTHON":""}',
  }
  testCases.value = []
  testCaseText.value = ''
  showForm.value = true
}

function openEdit(p) {
  editingId.value = p.id
  form.value = {
    title: p.title || '',
    description: p.description || '',
    difficulty: p.difficulty || 'EASY',
    inputFormat: p.inputFormat || '',
    outputFormat: p.outputFormat || '',
    sampleInput: p.sampleInput || '',
    sampleOutput: p.sampleOutput || '',
    referenceCode: p.referenceCode || '{"JAVA":"","CPP":"","PYTHON":""}',
  }
  testCases.value = []
  testCaseText.value = ''
  showForm.value = true
}

async function saveProblem() {
  try {
    if (editingId.value) {
      await api.put(`/api/admin/problems/${editingId.value}`, form.value)
    } else {
      const res = await api.post('/api/admin/problems', form.value)
      editingId.value = res.data.data.id
    }
    alert('保存成功')
    showForm.value = false
    fetchProblems()
  } catch (e) {
    alert('保存失败: ' + (e.response?.data?.message || e.message))
  }
}

async function deleteProblem(id) {
  if (!confirm('确定删除该题目？相关测试用例和提交记录也会一并删除。')) return
  try {
    await api.delete(`/api/admin/problems/${id}`)
    fetchProblems()
  } catch (e) {
    alert('删除失败: ' + (e.response?.data?.message || e.message))
  }
}

async function uploadTestCases() {
  if (!testCaseText.value.trim()) return
  try {
    const lines = testCaseText.value.trim().split('\n')
    const items = []
    let i = 0
    while (i < lines.length) {
      const input = lines[i].startsWith('IN:') ? lines[i].substring(3).trim() : lines[i].trim()
      i++
      if (i < lines.length) {
        const expected = lines[i].startsWith('OUT:') ? lines[i].substring(4).trim() : lines[i].trim()
        i++
        items.push({
          input,
          expectedOutput: expected,
          timeLimitMs: 5000,
          memoryLimitKb: 131072,
          isSample: testCases.value.length === 0,
        })
      }
    }
    if (items.length === 0) return

    await api.post(`/api/admin/problems/${editingId.value}/test-cases`, { testCases: items })
    testCases.value.push(...items)
    testCaseText.value = ''
    alert(`成功上传 ${items.length} 个测试用例`)
  } catch (e) {
    alert('上传测试用例失败: ' + (e.response?.data?.message || e.message))
  }
}

onMounted(fetchProblems)
</script>

<template>
  <div v-if="auth.isAdmin" class="admin-page">
    <h2>题目管理</h2>

    <div class="toolbar">
      <button class="btn-primary" @click="openCreate">+ 新建题目</button>
      <span class="total-info" v-if="total">共 {{ total }} 题</span>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <table v-else-if="problems.length" class="admin-table">
      <thead>
        <tr>
          <th>#</th>
          <th>标题</th>
          <th>难度</th>
          <th>通过率</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in problems" :key="p.id">
          <td>{{ p.id }}</td>
          <td>{{ p.title }}</td>
          <td>
            <span class="tag" :class="p.difficulty">
              {{ { EASY: '简单', MEDIUM: '中等', HARD: '困难' }[p.difficulty] || p.difficulty }}
            </span>
          </td>
          <td>{{ p.acceptedCount || 0 }}/{{ p.totalSubmissions || 0 }}</td>
          <td class="actions">
            <button class="btn-sm" @click="openEdit(p)">编辑</button>
            <button class="btn-sm btn-danger" @click="deleteProblem(p.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">暂无题目</p>

    <div v-if="problems.length" class="pagination">
      <button :disabled="currentPage <= 1" @click="changePage(-1)">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}（共 {{ total }} 题）</span>
      <button :disabled="currentPage >= totalPages" @click="changePage(1)">下一页</button>
    </div>

    <!-- 编辑/新建弹窗 -->
    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal">
        <h3>{{ editingId ? '编辑题目' : '新建题目' }}</h3>

        <div class="form-group">
          <label>标题</label>
          <input v-model="form.title" placeholder="题目标题" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>难度</label>
            <select v-model="form.difficulty">
              <option value="EASY">简单</option>
              <option value="MEDIUM">中等</option>
              <option value="HARD">困难</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>描述 (支持 HTML)</label>
          <textarea v-model="form.description" rows="4" placeholder="题目描述..." />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>输入格式</label>
            <input v-model="form.inputFormat" placeholder="输入格式说明" />
          </div>
          <div class="form-group">
            <label>输出格式</label>
            <input v-model="form.outputFormat" placeholder="输出格式说明" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>样例输入</label>
            <textarea v-model="form.sampleInput" rows="3" placeholder="样例输入" />
          </div>
          <div class="form-group">
            <label>样例输出</label>
            <textarea v-model="form.sampleOutput" rows="3" placeholder="样例输出" />
          </div>
        </div>
        <div class="form-group">
          <label>参考代码 (JSON 格式: {"JAVA":"...","CPP":"...","PYTHON":"..."})</label>
          <textarea v-model="form.referenceCode" rows="4" placeholder='{"JAVA":"...","CPP":"...","PYTHON":"..."}' />
        </div>

        <!-- 测试用例上传 (仅编辑已有题目时) -->
        <div v-if="editingId" class="test-case-section">
          <h4>测试用例</h4>
          <p class="hint" v-if="testCases.length === 0">
            每两行为一组：第一行输入，第二行期望输出。<br />
            第一组自动标记为样例用例。
          </p>
          <p class="hint" v-else>已上传 {{ testCases.length }} 个测试用例</p>
          <textarea v-model="testCaseText" rows="6" placeholder="1 2&#10;3&#10;10 20&#10;30" />
          <button class="btn-primary" @click="uploadTestCases" :disabled="!testCaseText.trim()">上传测试用例</button>
        </div>

        <div class="modal-actions">
          <button class="btn-primary" @click="saveProblem">保存</button>
          <button class="btn-cancel" @click="showForm = false">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page { max-width: 1000px; margin: 0 auto; }
.toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.total-info { font-size: 13px; color: #999; }
.loading, .empty { text-align: center; color: #999; margin-top: 60px; }
.admin-table { width: 100%; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-collapse: collapse; }
.admin-table th { padding: 12px 16px; text-align: left; border-bottom: 2px solid #f0f0f0; font-size: 13px; color: #666; font-weight: 600; }
.admin-table td { padding: 10px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
.actions { display: flex; gap: 8px; }
.btn-primary { padding: 8px 20px; background: #1a73e8; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-sm { padding: 4px 12px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; font-size: 12px; }
.btn-sm:hover { background: #f0f0f0; }
.btn-danger { color: #f44336; border-color: #f44336; }
.btn-danger:hover { background: #fbe9e7; }
.btn-cancel { padding: 8px 20px; background: #fff; color: #666; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; font-size: 14px; }
.tag { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
.tag.EASY { background: #e8f5e9; color: #2e7d32; }
.tag.MEDIUM { background: #fff3e0; color: #e65100; }
.tag.HARD { background: #fbe9e7; color: #c62828; }

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: flex-start; justify-content: center; padding-top: 40px; overflow-y: auto; }
.modal { background: #fff; border-radius: 12px; padding: 32px; width: 720px; max-width: 90vw; box-shadow: 0 8px 32px rgba(0,0,0,0.15); max-height: 85vh; overflow-y: auto; }
.modal h3 { font-size: 20px; margin-bottom: 24px; }
.modal h4 { font-size: 16px; margin: 20px 0 8px; color: #333; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 4px; }
.form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
.form-group textarea { resize: vertical; font-family: inherit; }
.form-row { display: flex; gap: 16px; }
.form-row > .form-group { flex: 1; }
.test-case-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.test-case-section textarea { font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; }
.hint { font-size: 12px; color: #999; margin-bottom: 8px; line-height: 1.6; }
.modal-actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 16px; font-size: 13px; color: #666; }
.pagination button { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
.pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// 配置 Monaco Web Workers（Vite 下必须手动配置）
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker()
    if (label === 'typescript' || label === 'javascript') return new tsWorker()
    return new editorWorker()
  }
}
const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'java' },
})

const emit = defineEmits(['update:modelValue'])

const editorContainer = ref(null)
let editor = null

const LANGUAGE_MAP = {
  JAVA: 'java',
  CPP: 'cpp',
  PYTHON: 'python',
}

onMounted(() => {
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: LANGUAGE_MAP[props.language] || 'java',
    theme: 'vs-dark',
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    automaticLayout: true,
    scrollBeyondLastLine: false,
  })

  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor.getValue())
  })
})

onUnmounted(() => {
  editor?.dispose()
})

watch(() => props.language, (lang) => {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel(), LANGUAGE_MAP[lang] || 'java')
  }
})

watch(() => props.modelValue, (val) => {
  if (editor && editor.getValue() !== val) {
    editor.setValue(val)
  }
})
</script>

<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<style scoped>
.editor-container { height: 400px; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
</style>

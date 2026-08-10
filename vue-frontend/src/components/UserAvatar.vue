<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '?' },
  size: { type: Number, default: 32 },
})

// 取名字首字符作为头像字母
const letter = computed(() => (props.name || '?').trim().charAt(0).toUpperCase())

// 按名字哈希生成稳定背景色，同一用户颜色固定、不同用户颜色不同
const bgColor = computed(() => {
  const s = props.name || '?'
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) % 360
  }
  return `hsl(${hash}, 55%, 46%)`
})

const style = computed(() => ({
  width: props.size + 'px',
  height: props.size + 'px',
  fontSize: Math.round(props.size * 0.45) + 'px',
  background: bgColor.value,
}))
</script>

<template>
  <span class="user-avatar" :style="style" :title="name">{{ letter }}</span>
</template>

<style scoped>
.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  font-weight: 700;
  flex-shrink: 0;
  user-select: none;
}
</style>

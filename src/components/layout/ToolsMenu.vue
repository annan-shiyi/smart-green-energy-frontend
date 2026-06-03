<template>
  <div ref="menuRef" class="tools-menu">
    <button
      v-for="item in items"
      :key="item.key"
      class="menu-item"
      :class="{ disabled: !item.enabled }"
      :title="item.enabled ? item.label : '敬请期待'"
      @click="onItemClick(item)"
    >
      <span class="icon-slot">
        <img v-if="item.iconUrl" :src="item.iconUrl" alt="" />
        <span v-else class="icon-placeholder">{{ item.fallbackIcon || '◇' }}</span>
      </span>
      <span class="label">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import pvIcon from '../../assets/icons/pv.svg'

const emit = defineEmits(['select', 'close'])

const items = [
  { key: 'pv',         label: '光伏测算', enabled: true,  iconUrl: pvIcon },
  { key: 'space',      label: '空间分析', enabled: false, fallbackIcon: '⊞' },
  { key: 'coord',      label: '坐标定位', enabled: false, fallbackIcon: '◉' },
  { key: 'region',     label: '地区导航', enabled: false, fallbackIcon: '☰' },
  { key: 'mark',       label: '我的标记', enabled: false, fallbackIcon: '✎' },
  { key: 'bookmark',   label: '视角书签', enabled: false, fallbackIcon: '★' },
  { key: 'split',      label: '分屏对比', enabled: false, fallbackIcon: '▤' },
  { key: 'curtain',    label: '卷帘对比', enabled: false, fallbackIcon: '▥' },
  { key: 'roam',       label: '图上漫游', enabled: false, fallbackIcon: '→' },
  { key: 'fly',        label: '飞行漫游', enabled: false, fallbackIcon: '✈' },
  { key: 'route',      label: '路线导航', enabled: false, fallbackIcon: '⤴' },
  { key: 'print',      label: '地图打印', enabled: false, fallbackIcon: '⎙' },
  { key: 'share',      label: '分享地图', enabled: false, fallbackIcon: '↗' },
  { key: 'settings',   label: '参数设置', enabled: false, fallbackIcon: '⚙' }
]

const menuRef = ref(null)

function onItemClick(item) {
  if (!item.enabled) return
  emit('select', item.key)
}

// 点菜单外面任意位置 → 关闭
function onDocClick(e) {
  if (!menuRef.value) return
  if (menuRef.value.contains(e.target)) return
  // 点 floating-controls 的"工具"按钮本身也算"外面",但 Home 那边切换逻辑会处理
  // 这里只负责"点了真外面" → 通知关闭
  if (e.target.closest('.ctrl-btn.tool-btn')) return
  emit('close')
}

onMounted(() => {
  // 下一帧再挂,避免本次"点工具"事件冒泡到 document 直接把自己关了
  setTimeout(() => document.addEventListener('click', onDocClick), 0)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
})
</script>

<style scoped>
.tools-menu {
  position: absolute;
  top: 116px;
  right: 16px;
  width: 168px;
  padding: 6px;
  background: rgba(28, 37, 49, 0.96);
  border: 1px solid rgba(101, 160, 200, 0.28);
  border-radius: 6px;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.45);
  z-index: 95;
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: menuFadeIn 0.18s ease-out;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text);
  font-size: 13px;
  letter-spacing: 1px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
}

.menu-item:hover:not(.disabled) {
  background: rgba(64, 224, 208, 0.16);
  color: var(--accent);
}

.menu-item.disabled {
  color: var(--weak);
  cursor: not-allowed;
}

.menu-item.disabled .icon-slot {
  opacity: 0.5;
}

.icon-slot {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-slot img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.icon-placeholder {
  font-size: 13px;
  color: currentColor;
  opacity: 0.85;
}

.label {
  flex: 1;
}
</style>

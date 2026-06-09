<template>
  <button class="exit-btn" title="返回村情村貌首页" @click="onExit">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
    <span>退出</span>
  </button>
</template>

<script setup>
import { activeTab, villageView } from '../../store/nav.js'

// 退出:无论在哪张 3D 地图,都回到村情村貌首页(地球页)
function onExit() {
  activeTab.value = 'village'
  villageView.value = 'globe'
}
</script>

<style scoped>
.exit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  color: #d9f1fd;
  background: rgba(10, 20, 28, 0.7);
  border: 1px solid rgba(94, 211, 255, 0.18);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  transition: all 0.18s ease;
}
.exit-btn:hover {
  color: #fff;
  border-color: var(--accent);
  background: rgba(64, 224, 208, 0.18);
  box-shadow: 0 8px 22px rgba(64, 224, 208, 0.25);
}
.exit-btn svg {
  width: 17px;
  height: 17px;
}
</style>

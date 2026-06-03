<template>
  <div class="floating-controls">
    <button class="ctrl-btn" :class="{ active: activeKey === 'basemap' }" @click="handleClick('basemap')">
      <span class="ctrl-icon">▦</span>
      <span class="ctrl-label">底图</span>
    </button>
    <button class="ctrl-btn" :class="{ active: activeKey === 'layers' }" @click="handleClick('layers')">
      <span class="ctrl-icon">▤</span>
      <span class="ctrl-label">图层</span>
    </button>
    <button class="ctrl-btn tool-btn" :class="{ active: activeKey === 'tools' }" @click="handleClick('tools')">
      <span class="ctrl-icon">⚒</span>
      <span class="ctrl-label">工具</span>
      <span class="caret">▾</span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  activeKey: { type: String, default: '' }
})

const emit = defineEmits(['toggle'])

function handleClick(key) {
  emit('toggle', key)
}
</script>

<style scoped>
.floating-controls {
  position: absolute;
  top: 74px;
  right: 16px;
  display: flex;
  gap: 6px;
  z-index: 90;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: rgba(28, 37, 49, 0.9);
  border: 1px solid rgba(101, 160, 200, 0.25);
  border-radius: 4px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 1px;
  transition: all 0.18s ease;
}

.ctrl-btn:hover {
  color: var(--text);
  border-color: var(--accent);
  box-shadow: 0 0 10px rgba(64, 224, 208, 0.2);
}

.ctrl-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(64, 224, 208, 0.12);
}

.ctrl-icon {
  font-size: 13px;
}

.caret {
  font-size: 10px;
  opacity: 0.7;
  margin-left: 2px;
}
</style>

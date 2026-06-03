<template>
  <div class="right-controls">
    <!-- 指南针 / 回到默认视角 -->
    <button class="ctrl compass" title="回到默认视角" @click="$emit('reset-view')">
      <img :src="compassUrl" alt="compass" />
    </button>

    <!-- 全屏 -->
    <button class="ctrl small" title="全屏" @click="$emit('toggle-fullscreen')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 9V4h5" />
        <path d="M20 9V4h-5" />
        <path d="M4 15v5h5" />
        <path d="M20 15v5h-5" />
      </svg>
    </button>

    <!-- 放大 -->
    <button class="ctrl small" title="放大" @click="$emit('zoom-in')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <line x1="12" y1="5" x2="12" y2="19" />
      </svg>
    </button>

    <!-- 缩小 -->
    <button class="ctrl small" title="缩小" @click="$emit('zoom-out')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import compassUrl from '../../assets/icons/compass.svg'

defineEmits(['reset-view', 'toggle-fullscreen', 'zoom-in', 'zoom-out'])
</script>

<style scoped>
.right-controls {
  position: absolute;
  right: 18px;
  bottom: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 90;
}

.ctrl {
  border: none;
  padding: 0;
  cursor: pointer;
  background: rgba(28, 37, 49, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.ctrl:hover {
  background: rgba(64, 224, 208, 0.18);
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 8px 22px rgba(64, 224, 208, 0.25);
}

.compass {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  padding: 2px;
  background: transparent;
  border: none;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
}
.compass:hover {
  background: transparent;
  border: none;
  box-shadow: 0 8px 22px rgba(64, 224, 208, 0.35);
}
.compass img {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.small {
  width: 38px;
  height: 38px;
  border-radius: 6px;
}

.small svg {
  width: 18px;
  height: 18px;
}
</style>

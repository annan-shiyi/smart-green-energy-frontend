<template>
  <div class="pv-mode-controls">
    <button class="btn-primary" @click="$emit('open-multi-select')">
      <span class="btn-text">选择屋面进行测算</span>
    </button>
    <button class="btn-ghost" @click="$emit('exit')">
      <span class="btn-text">退出测算</span>
    </button>
  </div>
</template>

<script setup>
defineEmits(['open-multi-select', 'exit'])
</script>

<style scoped>
.pv-mode-controls {
  position: absolute;
  left: 18px;
  top: 290px;
  display: flex;
  gap: 10px;
  z-index: 80;
}

.btn-primary,
.btn-ghost {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px 18px;
  font-size: 13px;
  letter-spacing: 2px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  user-select: none;
}

.btn-primary {
  background: linear-gradient(180deg, rgba(20, 28, 42, 0.96), rgba(28, 37, 49, 0.96));
  border-color: var(--accent);
  color: var(--text);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4), inset 0 0 12px rgba(64, 224, 208, 0.18);
}

.btn-primary:hover {
  border-color: var(--accent-strong);
  color: var(--accent-strong);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45), inset 0 0 16px rgba(64, 224, 208, 0.28);
}

.btn-ghost {
  background: rgba(28, 37, 49, 0.7);
  border-color: rgba(101, 160, 200, 0.3);
  color: var(--muted);
}

.btn-ghost:hover {
  background: rgba(40, 50, 65, 0.88);
  border-color: var(--accent);
  color: var(--text);
}


</style>

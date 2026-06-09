<template>
  <div class="region-switch">
    <button
      v-for="r in REGION_LIST"
      :key="r.key"
      class="region-btn"
      :class="{ active: currentRegion === r.key }"
      :title="`切换到${r.name}`"
      @click="onSelect(r.key)"
    >
      {{ r.name }}
    </button>
  </div>
</template>

<script setup>
import { currentRegion, setRegion, REGION_LIST } from '../../store/region.js'

function onSelect(key) {
  setRegion(key)
}
</script>

<style scoped>
.region-switch {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  border-radius: 10px;
  background: rgba(10, 20, 28, 0.7);
  border: 1px solid rgba(94, 211, 255, 0.18);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
}

.region-btn {
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #d9f1fd;
  background: transparent;
  transition: all 0.18s ease;
  font-family: 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.region-btn:hover {
  color: #eaf6ff;
  background: rgba(94, 211, 255, 0.12);
}

.region-btn.active {
  color: #ffffff;
  background: linear-gradient(180deg, rgba(94, 211, 255, 0.6), rgba(47, 111, 196, 0.28));
  box-shadow: 0 0 12px rgba(94, 211, 255, 0.35);
}
</style>

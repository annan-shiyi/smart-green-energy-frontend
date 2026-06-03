<template>
  <PanelFrame title="基础设施及公展配套">
    <ul class="infra">
      <li v-for="item in infrastructure" :key="item.rank">
        <div class="row-top">
          <span class="rank">{{ item.rank }}</span>
          <span class="label">{{ item.label }}</span>
          <span class="percent">{{ fmt(item.percent) }}%</span>
        </div>
        <div class="bar">
          <div class="bar-fill" :style="{ width: item.percent + '%' }"></div>
        </div>
      </li>
    </ul>
  </PanelFrame>
</template>

<script setup>
import PanelFrame from './PanelFrame.vue'
import { infrastructure } from '../../data/villageData.js'

function fmt(v) {
  return Number.isInteger(v) ? v.toFixed(1) : String(v)
}
</script>

<style scoped>
.infra {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.rank {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: #eaf4ff;
  background: linear-gradient(90deg, #2f6fc4, #5ed3ff);
  padding: 1px 7px;
  border-radius: 2px;
  font-family: 'Arial', sans-serif;
  letter-spacing: 0.5px;
}

.label {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: rgba(205, 222, 240, 0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.percent {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  color: #5ed3ff;
  font-family: 'Consolas', monospace;
}

.bar {
  height: 6px;
  background: rgba(101, 160, 200, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2f6fc4, #5ed3ff);
  border-radius: 3px;
  box-shadow: 0 0 6px rgba(94, 211, 255, 0.5);
  transition: width 0.9s ease-out;
}
</style>

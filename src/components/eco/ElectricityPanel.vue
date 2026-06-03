<template>
  <div class="elec-panel">
    <div class="panel-head">
      <span class="head-marker">▣</span>
      <span class="head-title">电量测算</span>
      <span class="head-sub">Data Analysis</span>
    </div>

    <div class="body">
      <!-- 环形图(3D 图片) + 中心总数 -->
      <div class="ring-wrap">
        <img :src="elecRing" alt="" class="ring-img" />
        <div class="ring-center">
          <div class="ring-total">{{ electricityTotal.value }}<span class="ring-unit">{{ electricityTotal.unit }}</span></div>
          <div class="ring-caption">{{ electricityTotal.label }}</div>
        </div>
      </div>

      <!-- 图例 -->
      <ul class="legend">
        <li v-for="s in electricityStats" :key="s.name">
          <span class="dot" :style="{ background: s.color }"></span>
          <span class="name">{{ s.name }}</span>
          <span class="val">{{ s.value }}</span>
        </li>
      </ul>
    </div>

    <!-- 选择屋面进行测算 -->
    <button class="calc-btn" @click="$emit('open-multi-select')">
      <span class="calc-text">选择屋面进行测算</span>
      <span class="calc-icon">⚡</span>
    </button>
  </div>
</template>

<script setup>
import { electricityTotal, electricityStats } from '../../data/ecoData.js'
import elecRing from '../../assets/eco/elec-ring.png'

defineEmits(['open-multi-select'])
</script>

<style scoped>
.elec-panel {
  position: absolute;
  top: 286px;
  left: 18px;
  width: 450px;
  z-index: 80;
  user-select: none;
  background: var(--panel-fill);
  font-family: 'AlibabaPuHui-regular', 'Alibaba Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.panel-head {
  height: 45px;
  line-height: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  background: linear-gradient(
    -44.19deg,
    rgba(3, 21, 24, 0.1) 2.37%,
    rgba(3, 21, 24, 0.15) 24.37%,
    rgba(68, 109, 156, 0.8) 98.04%
  );
  color: rgba(149, 198, 234, 1);
}
.head-marker { font-size: 14px; opacity: 0.9; }
.head-title { font-size: 20px; font-weight: 700; letter-spacing: 1px; }
.head-sub { font-size: 12px; color: rgba(149, 198, 234, 0.55); font-family: 'Arial', sans-serif; }

.body {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 8px 6px;
}

.ring-wrap {
  position: relative;
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}
.ring-img { width: 100%; height: 100%; object-fit: contain; display: block; }
.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.ring-total {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  font-family: 'Consolas', 'Microsoft YaHei', monospace;
  text-shadow: 0 0 10px rgba(94, 211, 255, 0.5);
}
.ring-unit { font-size: 13px; margin-left: 2px; color: rgba(255, 255, 255, 0.85); }
.ring-caption { font-size: 12px; color: #95c6ea; letter-spacing: 1px; }

.legend {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(205, 222, 240, 0.92);
}
.dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.name { flex: 1; }
.val { color: #eaf4ff; font-weight: 700; font-family: 'Consolas', monospace; }

.calc-btn {
  width: calc(100% - 16px);
  margin: 6px 8px 0;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(180deg, rgba(20, 28, 42, 0.96), rgba(28, 37, 49, 0.96));
  border: 1px solid var(--accent);
  border-radius: 4px;
  color: var(--text);
  font-size: 14px;
  letter-spacing: 2px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4), inset 0 0 12px rgba(64, 224, 208, 0.18);
  transition: all 0.2s ease;
}
.calc-btn:hover {
  border-color: var(--accent-strong);
  color: var(--accent-strong);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45), inset 0 0 16px rgba(64, 224, 208, 0.28);
}
.calc-icon { color: var(--accent); }
</style>

<template>
  <div class="globe-stage">
    <!-- 中央地球组(地球 + 光环) -->
    <div class="globe" ref="globeBox">
      <img :src="globeAura" alt="" class="layer aura" />
      <img :src="globeRing" alt="" class="layer ring" />
      <img :src="globeBase" alt="" class="layer base" />
      <img :src="globeImg" alt="globe" class="layer sphere" />

      <!-- 发光点(相对地球容器定位) -->
      <button
        v-for="p in globePoints"
        :key="p.id"
        class="point"
        :class="{ clickable: p.clickable }"
        :style="{ top: p.top, left: p.left }"
        :title="p.label || ''"
        @click="onPoint(p)"
      >
        <span class="dot"></span>
        <span class="ring-pulse"></span>
        <span v-if="p.clickable && p.label" class="point-label">{{ p.label }}</span>
      </button>

      <!-- 坐标拾取:覆盖层捕获点击,返回相对地球容器的 top/left 百分比 -->
      <div v-if="pickMode" class="pick-capture" @click="onPickClick"></div>
      <span
        v-for="(p, i) in picks"
        :key="'pick' + i"
        class="pick-dot"
        :style="{ top: p.top, left: p.left }"
      >{{ i + 1 }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { globePoints } from '../../data/villageData.js'
import bgImg from '../../assets/village/bg.png'
import globeImg from '../../assets/village/globe.png'
import globeBase from '../../assets/village/globe-base.png'
import globeRing from '../../assets/village/globe-ring.png'
import globeAura from '../../assets/village/globe-bg2.png'

const bgUrl = `url(${bgImg})`

const emit = defineEmits(['enter-model'])
function onPoint(p) {
  if (p.clickable) emit('enter-model', p)
}

// ---------------- 坐标拾取(返回相对地球容器的 top/left 百分比) ----------------
const globeBox = ref(null)
const pickMode = ref(false)
const picks = ref([])

function togglePick() {
  pickMode.value = !pickMode.value
  return pickMode.value
}
function clearPicks() {
  picks.value = []
}
function onPickClick(e) {
  if (!globeBox.value) return
  const rect = globeBox.value.getBoundingClientRect()
  const left = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%'
  const top = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%'
  picks.value.push({ top, left })
  const txt = `top: '${top}', left: '${left}'`
  console.log(`[地球拾取#${picks.value.length}] ${txt}`)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).catch(() => {})
  }
}

defineExpose({ togglePick, clearPicks, pickMode })
</script>

<style scoped>
.globe-stage {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #050b1a;
  background-image: v-bind(bgUrl);
  background-size: cover;
  background-position: center;
}

/* 拾取覆盖层:盖住整个地球容器接收点击 */
.pick-capture {
  position: absolute;
  inset: 0;
  z-index: 9;
  cursor: crosshair;
}
/* 临时拾取标记 */
.pick-dot {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 8px;
  background: #ff4d4f;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  box-shadow: 0 0 6px rgba(255, 77, 79, 0.8);
  pointer-events: none;
}

.globe {
  position: relative;
  width: min(58vh, 58vw);
  height: min(58vh, 58vw);
}

.layer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
}

/* 淡色光晕底衬:垫在最底层,比地球略大,极缓慢自转 */
.aura {
  width: 138%;
  z-index: 0;
  opacity: 0.85;
  animation: auraSpin 90s linear infinite;
}
@keyframes auraSpin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(-360deg); }
}

/* 地球本体 */
.sphere {
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
}

/* 底座光环:稍宽,略偏下 */
.base {
  width: 128%;
  top: 58%;
  z-index: 1;
  opacity: 0.9;
}

/* 斜向轨道环:比地球大,缓慢自转 */
.ring {
  width: 150%;
  z-index: 1;
  opacity: 0.75;
  animation: ringSpin 40s linear infinite;
}
@keyframes ringSpin {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to   { transform: translate(-50%, -50%) rotate(360deg); }
}

/* ---------------- 发光点 ---------------- */
.point {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: default;
  z-index: 3;
}
.point.clickable { cursor: pointer; }

.dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ffd24a;
  box-shadow: 0 0 8px 2px rgba(255, 210, 74, 0.8);
}

.ring-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid rgba(255, 210, 74, 0.8);
  transform: translate(-50%, -50%);
  animation: pulse 1.8s ease-out infinite;
}

.point.clickable .dot {
  background: #5ed3ff;
  box-shadow: 0 0 10px 3px rgba(94, 211, 255, 0.9);
}
.point.clickable .ring-pulse {
  border-color: rgba(94, 211, 255, 0.9);
}
.point.clickable:hover .dot {
  transform: translate(-50%, -50%) scale(1.25);
}

@keyframes pulse {
  0%   { width: 9px;  height: 9px;  opacity: 0.9; }
  100% { width: 34px; height: 34px; opacity: 0; }
}

.point-label {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  color: #eaf4ff;
  text-shadow: 0 0 6px rgba(94, 211, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.8);
  pointer-events: none;
}
</style>

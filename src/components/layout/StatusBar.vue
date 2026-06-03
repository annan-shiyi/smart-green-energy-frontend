<template>
  <footer class="status-bar">
    <div class="scale">{{ scaleText }}</div>
    <div class="cam-info">
      <span>经度:{{ fmt(lng, 6) }}</span>
      <span class="sep">|</span>
      <span>纬度:{{ fmt(lat, 6) }}</span>
      <span class="sep">|</span>
      <span>海拔:{{ fmt(elevation, 1) }}米</span>
      <span class="sep">|</span>
      <span>方向:{{ fmt(heading, 0) }}度</span>
      <span class="sep">|</span>
      <span>俯仰角:{{ fmt(pitch, 0) }}度</span>
      <span class="sep">|</span>
      <span>视高:{{ fmt(viewHeight, 1) }}米</span>
    </div>
    <div class="perf">
      <span>{{ fmt(frameMs, 2) }} MS</span>
      <span class="sep">|</span>
      <span>{{ Math.round(fps) }} FPS</span>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  scaleText: { type: String, default: '10 m' },
  lng: { type: Number, default: 104.320368 },
  lat: { type: Number, default: 30.412588 },
  elevation: { type: Number, default: 419.4 },
  heading: { type: Number, default: 7 },
  pitch: { type: Number, default: -26 },
  viewHeight: { type: Number, default: 693.8 },
  frameMs: { type: Number, default: 16.65 },
  fps: { type: Number, default: 60 }
})

function fmt(v, d) {
  const n = Number(v)
  if (!Number.isFinite(n)) return '--'
  return n.toFixed(d)
}
</script>

<style scoped>
.status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 26px;
  /* 透明 + 极轻微深色蒙层,几乎不挡背后的三维 */
  background: linear-gradient(180deg, rgba(20, 28, 42, 0) 0%, rgba(20, 28, 42, 0.42) 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
  color: #d6dee9;
  font-size: 11px;
  font-family: 'Consolas', 'Microsoft YaHei', monospace;
  letter-spacing: 0.5px;
  user-select: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
}

.scale {
  color: #f0f5fb;
}

.cam-info,
.perf {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sep {
  color: rgba(255, 255, 255, 0.2);
}
</style>

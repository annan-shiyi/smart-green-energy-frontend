<template>
  <div class="eco-panel">
    <div class="panel-head">
      <span class="head-marker">▣</span>
      <span class="head-title">经济测算</span>
      <span class="head-sub">Economic Estimation</span>
    </div>

    <div class="unit-row">
      <span class="unit">单位: 万元</span>
      <span class="legend">
        <span class="lg"><i class="d1"></i>图例一</span>
        <span class="lg"><i class="d2"></i>图例二</span>
      </span>
    </div>

    <div ref="chartRef" class="chart-canvas"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { economyYears, economySeries1, economySeries2 } from '../../data/ecoData.js'

const chartRef = ref(null)
let chart = null

function getOption() {
  return {
    grid: { top: 14, right: 16, bottom: 24, left: 44 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 28, 42, 0.95)',
      borderColor: 'rgba(121, 171, 255, 0.4)',
      textStyle: { color: '#e6f1ff', fontSize: 11 },
      formatter: (ps) => ps.map((p) => `${p.seriesName}: ${Math.abs(p.value)}`).join('<br/>')
    },
    xAxis: {
      type: 'category',
      data: economyYears,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.35)' } },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 11,
        formatter: (v) => Math.abs(v)
      },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } }
    },
    series: [
      {
        name: '图例一',
        type: 'bar',
        stack: 'total',
        barWidth: 6,
        itemStyle: { color: '#3fa9f5' },
        data: economySeries1
      },
      {
        name: '图例二',
        type: 'bar',
        stack: 'total',
        barWidth: 6,
        itemStyle: { color: '#ff7a45' },
        // 图例二镜像到下方
        data: economySeries2.map((v) => -v)
      }
    ]
  }
}

function handleResize() { chart && chart.resize() }

onMounted(async () => {
  await nextTick()
  chart = echarts.init(chartRef.value)
  chart.setOption(getOption())
  window.addEventListener('resize', handleResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chart) { chart.dispose(); chart = null }
})
</script>

<style scoped>
.eco-panel {
  position: absolute;
  top: 120px;
  right: 18px;
  width: 480px;
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

.unit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}
.legend { display: flex; gap: 16px; }
.lg { display: inline-flex; align-items: center; gap: 5px; }
.lg i { width: 9px; height: 9px; border-radius: 50%; }
.d1 { background: #3fa9f5; }
.d2 { background: #ff7a45; }

.chart-canvas {
  width: 100%;
  height: 210px;
}
</style>

<template>
  <PanelFrame title="组织建设">
    <div class="org">
      <!-- 左:环形图 + 中心总数 -->
      <div class="ring-wrap">
        <div ref="chartRef" class="ring-canvas"></div>
        <div class="ring-center">
          <div class="ring-total">{{ partyTotal }}<span class="ring-unit">名</span></div>
          <div class="ring-caption">党员总数</div>
        </div>
      </div>

      <!-- 右:构成明细 -->
      <ul class="legend">
        <li v-for="m in orgMembers" :key="m.name">
          <span class="dot" :style="{ background: m.color }"></span>
          <span class="name">{{ m.name }}</span>
          <span class="val">{{ m.value }}名</span>
        </li>
      </ul>
    </div>
  </PanelFrame>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import PanelFrame from './PanelFrame.vue'
import { partyTotal, orgMembers } from '../../data/villageData.js'

const chartRef = ref(null)
let chart = null

function getOption() {
  return {
    series: [
      {
        type: 'pie',
        radius: ['62%', '88%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: 'rgba(8, 20, 38, 0.9)',
          borderWidth: 2
        },
        data: orgMembers.map((m) => ({
          name: m.name,
          value: m.value,
          itemStyle: { color: m.color }
        }))
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
.org {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ring-wrap {
  position: relative;
  width: 132px;
  height: 132px;
  flex-shrink: 0;
}

.ring-canvas {
  width: 100%;
  height: 100%;
}

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
  color: #ffffff;
  font-family: 'Consolas', 'Microsoft YaHei', monospace;
  text-shadow: 0 0 10px rgba(94, 211, 255, 0.5);
}

.ring-unit {
  font-size: 13px;
  margin-left: 2px;
  color: rgba(255, 255, 255, 0.45);
}

.ring-caption {
  font-size: 12px;
  color: #95c6ea;
  letter-spacing: 1px;
}

.legend {
  flex: 1;
  min-width: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(205, 222, 240, 0.92);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.name {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.val {
  color: #eaf4ff;
  font-weight: 600;
  flex-shrink: 0;
}
</style>

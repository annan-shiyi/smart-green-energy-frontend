<template>
  <div class="gen-chart">
    <div class="chart-head">
      <div class="title">
        <img :src="lightningIcon" alt="" class="title-icon" />
        <span><span class="title-em">预估</span>光伏发电测算</span>
      </div>
      <div class="range-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="range-tab"
          :class="{ active: range === tab.key }"
          @click="range = tab.key"
        >{{ tab.label }}</button>
      </div>
    </div>
    <div class="chart-unit">单位: kWh(每户)</div>
    <div ref="chartRef" class="chart-canvas"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import lightningIcon from '../../assets/icons/panel-lightning.png'
import barPatternUrl from '../../assets/icons/bar-pattern.png'

// 预加载柱子图案
const barPatternImg = new Image()
barPatternImg.src = barPatternUrl

const props = defineProps({
  roof: { type: Object, default: null },
  ratio: { type: Number, default: 65 }
})

const range = ref('month') // 'hour' | 'day' | 'month'
const tabs = [
  { key: 'hour', label: '时' },
  { key: 'day', label: '日' },
  { key: 'month', label: '月' }
]

// 基线:公司"75 平典型屋顶"的数据(对应下面的 MONTH/DAY/HOUR_BASE 和 _CAP)
const BASELINE_AREA = 75

// 评分 + 铺设比例(不含面积) — 跟 cap 配套用
function scale() {
  if (!props.roof || !props.roof.score) return 1
  const scoreFactor = props.roof.score / 95
  const ratioFactor = (props.ratio || 65) / 65
  return scoreFactor * ratioFactor
}

// ★ 面积因子:小屋顶发电少,大屋顶发电多。R001=75平 → 1.0,R005=45平 → 0.6
function areaFactor() {
  if (!props.roof) return 1
  return (props.roof.usableArea || BASELINE_AREA) / BASELINE_AREA
}

// ★ 公司给的真实数据基线(75 平屋顶,每户典型值,单位 kWh)
// 月:逐月发电量 - 范围中位值
const MONTH_BASE = [310, 370, 515, 650, 775, 825, 855, 805, 615, 485, 350, 295]
// 月:理论上限(物理 cap)- 即使 100% 铺设也不会超过这些值。5 月 = 780(用户指定)
const MONTH_CAP  = [360, 420, 580, 720, 780, 900, 930, 880, 680, 550, 400, 340]

// 日:5 月逐日发电量中位值(31 天)
const DAY_BASE = [23.0, 23.3, 23.1, 22.7, 23.4, 23.8, 23.6, 23.2, 22.8, 23.5,
                  24.0, 24.5, 24.3, 23.9, 23.5, 23.1, 23.7, 24.2, 24.7, 25.0,
                  24.7, 24.3, 23.9, 23.5, 23.1, 23.8, 24.3, 24.8, 24.6, 24.2,
                  23.9]
// 日:5 月逐日理论上限(公司原始范围的 max 端)
const DAY_CAP  = [25.5, 25.8, 25.6, 25.2, 25.9, 26.3, 26.1, 25.7, 25.3, 26.0,
                  26.5, 27.0, 26.8, 26.4, 26.0, 25.6, 26.2, 26.7, 27.2, 27.5,
                  27.2, 26.8, 26.4, 26.0, 25.6, 26.3, 26.8, 27.3, 27.1, 26.7,
                  26.4]

// 时:逐小时发电量中位值(24 小时)
const HOUR_BASE = [0, 0, 0, 0, 0, 0, 0, 0,
                   0.8, 1.8, 2.9, 3.9, 4.2, 3.9, 2.9, 1.8,
                   0.8, 0.3, 0, 0, 0, 0, 0, 0]
// 时:逐小时理论上限(公司原始范围 max,正午 5.2 kWh)
const HOUR_CAP  = [0, 0, 0, 0, 0, 0, 0, 0,
                   1.2, 2.4, 3.6, 4.8, 5.2, 4.8, 3.6, 2.4,
                   1.2, 0.5, 0, 0, 0, 0, 0, 0]

// 工具函数:基线 × 系数,但不超过物理上限
function clamp(base, cap, k) {
  return Math.min(base * k, cap)
}

function getData() {
  const k = scale()
  const a = areaFactor()           // ★ 当前屋顶相对 75 平基线的面积倍数
  if (range.value === 'hour') {
    return {
      x: Array.from({ length: 24 }, (_, i) => `${i}时`),
      y: HOUR_BASE.map((v, i) => +(clamp(v, HOUR_CAP[i], k) * a).toFixed(1))
    }
  }
  if (range.value === 'day') {
    return {
      x: Array.from({ length: 31 }, (_, i) => `${i + 1}`),
      y: DAY_BASE.map((v, i) => +(clamp(v, DAY_CAP[i], k) * a).toFixed(1))
    }
  }
  // 月:12 个月,带物理上限 cap,再乘以面积因子
  return {
    x: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    y: MONTH_BASE.map((v, i) => Math.round(clamp(v, MONTH_CAP[i], k) * a))
  }
}

function getOption() {
  const { x, y } = getData()
  return {
    grid: { top: 18, right: 22, bottom: 28, left: 42 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 28, 42, 0.95)',
      borderColor: 'rgba(121, 171, 255, 0.4)',
      textStyle: { color: '#e6f1ff', fontSize: 11 }
    },
    xAxis: {
      type: 'category',
      data: x,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.35)' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'PingFangSC-bold, PingFang SC, Microsoft YaHei'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'PingFangSC-bold, PingFang SC, Microsoft YaHei'
      },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.18)' } }
    },
    series: [
      {
        type: 'bar',
        data: y,
        /* 12 个月 / 30 天 / 24 时 都要塞下,柱宽自适应:让 ECharts 自己算 */
        barMaxWidth: 17,
        barCategoryGap: '30%',
        itemStyle: {
          // 全部柱子统一浅蓝实心(去除原渐变,避免"数值大时下半截变浅"的视觉误判)
          color: '#79ABFF',
          borderRadius: [3, 3, 0, 0]
        },
        label: {
          /* 月视图(7根柱)显示标签;时/日视图柱子太密(24/30 根),隐藏避免文字重叠 */
          show: range.value === 'month',
          position: 'top',
          color: '#ffffff',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'PingFangSC-bold, PingFang SC, Microsoft YaHei'
        }
      }
    ]
  }
}

const chartRef = ref(null)
let chart = null

function render() { chart && chart.setOption(getOption(), true) }
function handleResize() { chart && chart.resize() }

onMounted(async () => {
  await nextTick()
  chart = echarts.init(chartRef.value)
  render()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chart) { chart.dispose(); chart = null }
})

watch(() => props.roof, render, { deep: true })
watch(() => props.ratio, render)
watch(range, render)
</script>

<style scoped>
.gen-chart {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.chart-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 6px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.25);
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
}
.title-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.title-em {
  color: #79ABFF;
  font-weight: 700;
}

.range-tabs {
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.range-tab {
  padding: 4px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: transparent;
  border: none;
  border-right: 1px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.15s;
}
.range-tab:last-child { border-right: none; }
.range-tab:hover { background: rgba(255, 255, 255, 0.18); }
.range-tab.active {
  background: rgba(121, 171, 255, 0.95);
  color: #fff;
}

.chart-unit {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  padding-left: 4px;
}

.chart-canvas {
  width: 100%;
  height: 200px;
}
</style>

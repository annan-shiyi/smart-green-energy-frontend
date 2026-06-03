<template>
  <div class="multi-modal">
    <button class="close-btn" title="关闭" @click="$emit('close')">×</button>

    <!-- ============ 屋面选择头部 ============ -->
    <div class="section">
      <div class="section-head">
        <img :src="homeIcon" alt="" class="head-icon" />
        <span class="head-title">屋面选择</span>
        <label class="check-all">
          <input type="checkbox" :checked="allSelected" @change="toggleAll" />
          <span>全选</span>
        </label>
      </div>

      <!-- 9 个屋顶复选框 -->
      <div class="roof-checks">
        <label
          v-for="opt in roofOptions"
          :key="opt.id"
          class="roof-check"
          :class="{ disabled: !opt.enabled, active: opt.enabled && selectedIds.includes(opt.id) }"
        >
          <input
            type="checkbox"
            :disabled="!opt.enabled"
            :checked="selectedIds.includes(opt.id)"
            @change="toggleOne(opt.id)"
          />
          <span>{{ opt.label }}</span>
        </label>
      </div>

      <!-- 比例滑块 -->
      <div class="ratio-row">
        <span class="ratio-label">预设铺设比例</span>
        <input v-model.number="ratio" type="range" min="0" max="100" class="ratio-slider" />
        <span class="ratio-value">{{ ratio }}%</span>
      </div>

      <!-- 面积统计 + 开始测算 -->
      <div class="action-row">
        <div class="area-total">
          有效铺设面积共计:<b>{{ usableAreaTotal }}㎡</b>
        </div>
        <button class="btn-calc" :class="{ flash: calcing }" :disabled="!selectedIds.length" @click="onCalc">
          开始测算
        </button>
      </div>
    </div>

    <!-- ============ 预估光伏发电测算 ============ -->
    <div class="section">
      <div class="section-head">
        <img :src="lightningIcon" alt="" class="head-icon" />
        <span class="head-title"><span class="title-em">预估</span>光伏发电测算</span>
        <div class="range-tabs">
          <button
            v-for="tab in rangeTabs"
            :key="tab.key"
            class="range-tab"
            :class="{ active: range === tab.key }"
            @click="range = tab.key"
          >{{ tab.label }}</button>
        </div>
      </div>

      <!-- 两个图表并排 -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-title">预估发电量</div>
          <div class="chart-unit">单位:KW</div>
          <div ref="barChartRef" class="chart-canvas"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">预估收益</div>
          <div class="chart-legend">
            <span class="legend-item">
              <img :src="legend1" alt="" />
              <span>图例一</span>
            </span>
            <span class="legend-item">
              <img :src="legend2" alt="" />
              <span>图例二</span>
            </span>
          </div>
          <div class="chart-unit">单位:万元</div>
          <div ref="lineChartRef" class="chart-canvas"></div>
        </div>
      </div>
    </div>

    <!-- ============ 3 节能指标 + 声明 ============ -->
    <div class="footer-row">
      <div class="indicators">
        <div class="ind">
          <img :src="ecoIcon" alt="" class="ind-icon" />
          <div class="ind-text">
            <div class="ind-label">减排二氧化碳</div>
            <div class="ind-value">{{ totalCo2 }}<span class="ind-unit">吨</span></div>
          </div>
        </div>
        <div class="ind">
          <img :src="recycleIcon" alt="" class="ind-icon" />
          <div class="ind-text">
            <div class="ind-label">节约标准煤量</div>
            <div class="ind-value">{{ totalCoal }}<span class="ind-unit">吨</span></div>
          </div>
        </div>
        <div class="ind">
          <img :src="bankIcon" alt="" class="ind-icon" />
          <div class="ind-text">
            <div class="ind-label">投资回收期</div>
            <div class="ind-value">{{ payback }}<span class="ind-unit">年</span></div>
          </div>
        </div>
      </div>
      <div class="footer-note">
        <div>注:本数据均为预测值,仅供参考</div>
        <div>星河数为提供技术支持</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { roofList } from '../../data/mockRoofs.js'
import homeIcon from '../../assets/icons/panel-home.png'
import lightningIcon from '../../assets/icons/panel-lightning.png'
import ecoIcon from '../../assets/icons/panel-eco.png'
import recycleIcon from '../../assets/icons/panel-recycle.png'
import bankIcon from '../../assets/icons/panel-bank.png'
import legend1 from '../../assets/icons/legend1.png'
import legend2 from '../../assets/icons/legend2.png'
import barPatternUrl from '../../assets/icons/bar-pattern.png'

defineEmits(['close'])

// 9 项选项:5 个真实 + 4 个 disabled
const roofOptions = [
  ...roofList.map((r) => ({ id: r.id, label: `${r.seq}#屋面`, enabled: true })),
  { id: '_R006', label: '6#屋面', enabled: false },
  { id: '_R007', label: '7#屋面', enabled: false },
  { id: '_R008', label: '8#屋面', enabled: false },
  { id: '_R009', label: '9#屋面', enabled: false }
]
const enabledIds = roofOptions.filter((o) => o.enabled).map((o) => o.id)

// 默认空,让用户主动勾选(避免初始"全亮"误导)
const selectedIds = ref([])
const ratio = ref(65)
const range = ref('month')
const calcing = ref(false)

const rangeTabs = [
  { key: 'hour', label: '时' },
  { key: 'day', label: '日' },
  { key: 'month', label: '月' }
]

const allSelected = computed(
  () => selectedIds.value.length === enabledIds.length
)

function toggleAll(e) {
  selectedIds.value = e.target.checked ? [...enabledIds] : []
}
function toggleOne(id) {
  // 多选:点一下加入,再点一下移除。配合右上"全选"按钮可以一键全勾/全清
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}
function onCalc() {
  if (!selectedIds.value.length) return
  calcing.value = true
  setTimeout(() => (calcing.value = false), 600)
  // 图表已经实时联动,这里仅做"按一下"动效
  renderBoth()
}

// ============== 聚合计算 ==============
const selectedRoofs = computed(() =>
  roofList.filter((r) => selectedIds.value.includes(r.id))
)
const usableAreaTotal = computed(() =>
  selectedRoofs.value.reduce((s, r) => s + (r.usableArea || 0), 0)
)
const avgScore = computed(() => {
  if (!selectedRoofs.value.length) return 0
  return selectedRoofs.value.reduce((s, r) => s + r.score, 0) / selectedRoofs.value.length
})
// 基线:公司 75 平典型屋顶
const BASELINE_AREA = 75

// 评分 + 铺设比例,不含面积(配合 cap 用)
function baseScale() {
  const scoreFactor = avgScore.value / 95 || 0
  const ratioFactor = ratio.value / 65
  return scoreFactor * ratioFactor
}
// 选中户的总面积相对 75 平基线的倍数(用来把单户基线放大到全选总量)
function totalAreaFactor() {
  return usableAreaTotal.value / BASELINE_AREA
}
// 兼容老代码:多个指标还在用 aggregateFactor()
function aggregateFactor() {
  return baseScale() * totalAreaFactor()
}

// ★ 公司基线:单户(75 平屋顶) CO2 5.08吨/年 / 标煤 2.06吨/年 / 回收 9.5年
// 多户:CO2 和标煤按数量累加,回收期不变(因为投资/收益比例不变)
const totalCo2 = computed(() => {
  const v = 5.08 * aggregateFactor()
  return v.toFixed(2)
})
const totalCoal = computed(() => {
  const v = 2.06 * aggregateFactor()
  return v.toFixed(2)
})
const payback = computed(() => {
  const f = aggregateFactor()
  if (f <= 0) return 0
  // 回收期与户数无关,只跟"单户铺设强度"有关
  const k = ratio.value / 65
  if (k <= 0) return 0
  return Math.max(5, +(9.5 / k).toFixed(1))
})

// ★ 公司基线(单户 75 平,kWh)
const MONTH_BASE = [310, 370, 515, 650, 775, 825, 855, 805, 615, 485, 350, 295]
const MONTH_CAP  = [360, 420, 580, 720, 780, 900, 930, 880, 680, 550, 400, 340]
const DAY_BASE = [23.0, 23.3, 23.1, 22.7, 23.4, 23.8, 23.6, 23.2, 22.8, 23.5,
                  24.0, 24.5, 24.3, 23.9, 23.5, 23.1, 23.7, 24.2, 24.7, 25.0,
                  24.7, 24.3, 23.9, 23.5, 23.1, 23.8, 24.3, 24.8, 24.6, 24.2,
                  23.9]
const DAY_CAP  = [25.5, 25.8, 25.6, 25.2, 25.9, 26.3, 26.1, 25.7, 25.3, 26.0,
                  26.5, 27.0, 26.8, 26.4, 26.0, 25.6, 26.2, 26.7, 27.2, 27.5,
                  27.2, 26.8, 26.4, 26.0, 25.6, 26.3, 26.8, 27.3, 27.1, 26.7,
                  26.4]
const HOUR_BASE = [0, 0, 0, 0, 0, 0, 0, 0,
                   0.8, 1.8, 2.9, 3.9, 4.2, 3.9, 2.9, 1.8,
                   0.8, 0.3, 0, 0, 0, 0, 0, 0]
const HOUR_CAP  = [0, 0, 0, 0, 0, 0, 0, 0,
                   1.2, 2.4, 3.6, 4.8, 5.2, 4.8, 3.6, 2.4,
                   1.2, 0.5, 0, 0, 0, 0, 0, 0]

function clamp(base, cap, k) { return Math.min(base * k, cap) }

function getBarData() {
  const k = baseScale()           // 单户的"满铺占比+评分"系数(不超过 cap)
  const a = totalAreaFactor()     // 选中户的总面积(75 平倍数)
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
  return {
    x: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    y: MONTH_BASE.map((v, i) => Math.round(clamp(v, MONTH_CAP[i], k) * a))
  }
}

// ============== 收益双线数据(2016~2030 年累计收益,严格匹配设计稿曲线形态) ==============
function getIncomeData() {
  const k = aggregateFactor()
  const years = []
  for (let y = 2016; y <= 2030; y++) years.push(`${y}`)
  // 形态参考设计稿:两条曲线都是"波浪上升",有交叉,各自起伏不同
  // 图例一(粉黄):前期慢、中段陡升、后期回落再回升 — 模拟"政策红利"曲线
  const wave1 = [380, 520, 720, 880, 1450, 1280, 1620, 2150, 2480, 2240, 2680, 3120, 2980, 3400, 3850]
  // 图例二(青紫):平稳指数曲线 — 模拟"线性投产"
  const wave2 = [420, 680, 960, 1180, 1380, 1720, 2080, 2240, 2580, 2890, 3050, 3320, 3550, 3680, 3920]
  return {
    x: years,
    optimistic:   wave1.map((v) => Math.round(v * k)),
    conservative: wave2.map((v) => Math.round(v * k))
  }
}

// ============== ECharts 实例(2 个图表)==============
const barPatternImg = new Image()
barPatternImg.src = barPatternUrl

const barChartRef = ref(null)
const lineChartRef = ref(null)
let barChart = null
let lineChart = null

function barOption() {
  const { x, y } = getBarData()
  return {
    grid: { top: 18, right: 22, bottom: 26, left: 42 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 28, 42, 0.95)',
      borderColor: 'rgba(121, 171, 255, 0.4)',
      textStyle: { color: '#e6f1ff', fontSize: 11 }
    },
    xAxis: {
      type: 'category', data: x,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.35)' } },
      axisTick: { show: false },
      axisLabel: { color: '#ffffff', fontSize: 11, fontWeight: 600 }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 10, fontWeight: 600 },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.18)' } }
    },
    series: [{
      type: 'bar', data: y,
      barMaxWidth: 14, barCategoryGap: '30%',
      itemStyle: { color: '#79ABFF', borderRadius: [3, 3, 0, 0] },
      label: {
        /* 月视图(7根柱)显示标签;时/日柱太密则隐藏 */
        show: range.value === 'month',
        position: 'top',
        color: '#ffffff', fontSize: 10, fontWeight: 600
      }
    }]
  }
}

function lineOption() {
  const { x, optimistic, conservative } = getIncomeData()
  // 渐变色严格按墨刀给的两条 SVG 曲线取色
  const grad1 = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: '#d74177' }, { offset: 1, color: '#ffe98a' }
  ])
  const grad2 = new echarts.graphic.LinearGradient(0, 0, 1, 0, [
    { offset: 0, color: '#00b7ff' }, { offset: 1, color: '#a890fe' }
  ])
  // 面积渐变(从线下方往下淡出)
  const area1 = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(215, 65, 119, 0.35)' },
    { offset: 1, color: 'rgba(215, 65, 119, 0)' }
  ])
  const area2 = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: 'rgba(0, 183, 255, 0.35)' },
    { offset: 1, color: 'rgba(0, 183, 255, 0)' }
  ])

  return {
    grid: { top: 22, right: 16, bottom: 28, left: 44 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(20, 28, 42, 0.95)',
      borderColor: 'rgba(121, 171, 255, 0.4)',
      textStyle: { color: '#e6f1ff', fontSize: 11 }
    },
    xAxis: {
      type: 'category',
      data: x,
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.35)' } },
      axisTick: { show: false },
      // 年份太多就抽样显示,跟设计稿看着差不多
      axisLabel: {
        color: '#ffffff', fontSize: 10, fontWeight: 600,
        interval: 2
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(255, 255, 255, 0.85)', fontSize: 10, fontWeight: 600 },
      splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.16)', type: 'dashed' } }
    },
    series: [
      {
        name: '图例一',
        type: 'line',
        data: optimistic,
        smooth: 0.5,                     // 0.5 比 true 的曲度更柔和,接近 SVG 形态
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,               // 默认隐藏,hover 才显示点
        lineStyle: {
          width: 3,
          color: grad1,
          shadowColor: 'rgba(215, 65, 119, 0.6)',
          shadowBlur: 12,                // 发光感
          shadowOffsetY: 2
        },
        areaStyle: { color: area1 },     // 线下渐变填充
        itemStyle: { color: '#d74177', borderColor: '#fff', borderWidth: 2 },
        emphasis: { focus: 'series' }
      },
      {
        name: '图例二',
        type: 'line',
        data: conservative,
        smooth: 0.5,
        symbol: 'circle',
        symbolSize: 5,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: grad2,
          shadowColor: 'rgba(0, 183, 255, 0.6)',
          shadowBlur: 12,
          shadowOffsetY: 2
        },
        areaStyle: { color: area2 },
        itemStyle: { color: '#00b7ff', borderColor: '#fff', borderWidth: 2 },
        emphasis: { focus: 'series' }
      }
    ],
    // 切换数据时的过渡动画
    animationDuration: 600,
    animationDurationUpdate: 500,
    animationEasing: 'cubicInOut',
    animationEasingUpdate: 'cubicInOut'
  }
}

function renderBoth() {
  barChart && barChart.setOption(barOption(), true)
  lineChart && lineChart.setOption(lineOption(), true)
}

function handleResize() {
  barChart && barChart.resize()
  lineChart && lineChart.resize()
}

onMounted(async () => {
  await nextTick()
  barChart = echarts.init(barChartRef.value)
  lineChart = echarts.init(lineChartRef.value)
  renderBoth()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (barChart) { barChart.dispose(); barChart = null }
  if (lineChart) { lineChart.dispose(); lineChart = null }
})

watch([selectedIds, ratio, range], renderBoth, { deep: true })
</script>

<style scoped>
.multi-modal {
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  width: 880px;
  max-width: calc(100vw - 80px);
  max-height: calc(100vh - 130px);
  padding: 18px 22px 16px;
  /* 统一面板规范 */
  background-color: rgba(64, 95, 129, 0.54);
  backdrop-filter: blur(0px);
  border-radius: 18px;
  color: #ffffff;
  font-family: 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 22px;
  z-index: 85;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  overflow-y: auto;
  user-select: none;
  animation: modalIn 0.28s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: translate(-50%, -10px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}

.multi-modal::-webkit-scrollbar { width: 4px; }
.multi-modal::-webkit-scrollbar-thumb { background: rgba(121, 171, 255, 0.5); border-radius: 2px; }

.close-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 26px;
  height: 26px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 4px;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s;
}
.close-btn:hover { background: rgba(255, 77, 79, 0.55); }

.section + .section { margin-top: 14px; }

/* ===== Section Head ===== */
.section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.22);
}
.head-icon { width: 22px; height: 22px; object-fit: contain; }
.head-title { font-size: 16px; font-weight: 700; letter-spacing: 0.5px; }
.title-em { color: #79ABFF; }

.check-all {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
}
.check-all input { accent-color: #79ABFF; cursor: pointer; }

/* ===== Roof checks ===== */
.roof-checks {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 4px 0 12px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
}
.roof-check {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.roof-check:hover:not(.disabled) {
  background: rgba(121, 171, 255, 0.2);
  border-color: #79ABFF;
}
.roof-check.active {
  background: rgba(121, 171, 255, 0.3);
  border-color: #79ABFF;
  color: #fff;
}
.roof-check.disabled {
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}
.roof-check input { accent-color: #79ABFF; cursor: inherit; }
.roof-check.disabled input { cursor: not-allowed; }

/* ===== Ratio Row ===== */
.ratio-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
}
.ratio-label {
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}
.ratio-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: linear-gradient(90deg, #79ABFF, rgba(121, 171, 255, 0.25));
  border-radius: 2px;
  outline: none;
}
.ratio-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #79ABFF;
  border: 2px solid #ffffff;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(121, 171, 255, 0.7);
}
.ratio-value {
  font-size: 14px;
  font-weight: 700;
  width: 44px;
  text-align: right;
}

/* ===== Action Row ===== */
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0 2px;
}
.area-total {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.area-total b {
  color: #79ABFF;
  margin-left: 4px;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(121, 171, 255, 0.6);
}
.btn-calc {
  padding: 9px 38px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ffffff;
  background: linear-gradient(180deg, #79ABFF, #4a7fd8);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(121, 171, 255, 0.35);
  transition: all 0.18s ease;
}
.btn-calc:hover:not(:disabled) {
  background: linear-gradient(180deg, #8db8ff, #5a8fea);
  box-shadow: 0 8px 22px rgba(121, 171, 255, 0.45);
}
.btn-calc:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-calc.flash {
  animation: btnFlash 0.5s ease-out;
}
@keyframes btnFlash {
  0%   { box-shadow: 0 0 0 rgba(121, 171, 255, 1); }
  50%  { box-shadow: 0 0 0 12px rgba(121, 171, 255, 0); }
  100% { box-shadow: 0 6px 16px rgba(121, 171, 255, 0.35); }
}

/* ===== Range tabs (右上) ===== */
.range-tabs {
  margin-left: auto;
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

/* ===== Charts ===== */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.chart-card {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  padding: 8px 10px 10px;
  position: relative;
}
.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: #79ABFF;
}
.chart-unit {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 2px;
}
.chart-canvas {
  width: 100%;
  height: 180px;
  margin-top: 4px;
}
.chart-legend {
  position: absolute;
  top: 8px;
  right: 10px;
  display: flex;
  gap: 10px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #ffffff;
}
.legend-item img {
  width: 22px;
  height: 12px;
  object-fit: contain;
}

/* ===== Footer (indicators + 声明) ===== */
.footer-row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 16px;
  margin-top: 14px;
}
.indicators {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}
.ind {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
}
.ind-icon { width: 30px; height: 30px; object-fit: contain; flex-shrink: 0; }
.ind-label { font-size: 12px; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ind-value {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.ind-unit { font-size: 11px; color: rgba(255, 255, 255, 0.85); margin-left: 2px; }

.footer-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  text-align: right;
  line-height: 1.6;
  padding-right: 4px;
}
</style>

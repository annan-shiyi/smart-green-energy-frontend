<template>
  <aside v-if="roof" class="roof-info-panel" :class="placement">
    <!-- 顶部标题 -->
    <div class="panel-header">
      <img :src="homeIcon" alt="" class="header-icon" />
      <span class="header-title">屋面选择</span>
      <span class="header-sep">(当前选中:</span>
      <span class="header-current">{{ roof.seq }}#屋面光伏设备</span>
      <span class="header-sep">)</span>
      <button class="close-btn" title="关闭" @click="$emit('close')">×</button>
    </div>

    <!-- 屋面属性 + 评分圆环 -->
    <div class="info-row">
      <ul class="attr-list">
        <li><span class="k">·有效铺设面积:</span><span class="v">{{ roof.usableArea }}㎡</span></li>
        <li><span class="k">·朝向:</span><span class="v">{{ roof.orientation }}</span></li>
        <li><span class="k">·屋面坡度:</span><span class="v">斜坡 {{ roof.slope }}°</span></li>
        <li><span class="k">·屋面承载能力:</span><span class="v">{{ roof.bearingCapacity }}</span></li>
        <li><span class="k">·遮挡情况:</span><span class="v">{{ roof.shadingLevel }}</span></li>
        <li><span class="k">·屋面材质与状况:</span><span class="v">{{ roof.material }}</span></li>
      </ul>
      <ScoreRing :score="roof.score" :recommendation="roof.recommendation" />
    </div>

    <!-- 发电测算图表(随屋顶 + 比例同步) -->
    <GenerationChartV2 :roof="roof" :ratio="ratio" />

    <!-- 铺设比例 -->
    <div class="ratio">
      <span class="ratio-label">预设铺设比例</span>
      <input v-model.number="ratio" type="range" min="0" max="100" class="ratio-slider" />
      <span class="ratio-value">{{ ratio }}%</span>
    </div>

    <!-- 3 个节能指标 -->
    <div class="indicators">
      <div class="ind">
        <img :src="ecoIcon" alt="" class="ind-icon" />
        <div class="ind-text">
          <div class="ind-label">减排二氧化碳</div>
          <div class="ind-value">{{ ecoCo2 }}<span class="ind-unit">吨</span></div>
        </div>
      </div>
      <div class="ind">
        <img :src="recycleIcon" alt="" class="ind-icon" />
        <div class="ind-text">
          <div class="ind-label">节约标准煤量</div>
          <div class="ind-value">{{ ecoCoal }}<span class="ind-unit">吨</span></div>
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

    <!-- 天气提示 -->
    <div class="weather">
      <img :src="weatherIcon" alt="" class="weather-icon" />
      <div class="weather-text">
        <div>今日多云,预计发电量为晴天的70%</div>
        <div>未来三天晴朗,发电量预计提升20%</div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ScoreRing from './ScoreRing.vue'
import GenerationChartV2 from './GenerationChartV2.vue'
import homeIcon from '../../assets/icons/panel-home.png'
import ecoIcon from '../../assets/icons/panel-eco.png'
import recycleIcon from '../../assets/icons/panel-recycle.png'
import bankIcon from '../../assets/icons/panel-bank.png'
import weatherIcon from '../../assets/icons/weather-cloudy-night.png'

const props = defineProps({
  roof: { type: Object, default: null },
  // '' = 默认(安全防治/工具栏,右侧老位置);'eco' = 低碳生活(居中,按设计稿 p1)
  placement: { type: String, default: '' }
})

defineEmits(['close'])

const ratio = ref(65)


// ★ 公司基线(单户,75 平屋顶):
//   年发电 ~6,880 kWh,减排 CO2 ~5.08 吨/年,节标煤 ~2.06 吨/年,回收期 ~9.5 年
// 数字按"评分 × 铺设比例 × 面积比例"三因子缩放,**不同尺寸的屋顶数字会不一样**
const BASELINE_AREA = 75
const ecoCo2 = computed(() => {
  if (!props.roof) return '0.0'
  const a = (props.roof.usableArea || BASELINE_AREA) / BASELINE_AREA
  const v = 5.08 * (props.roof.score / 95) * (ratio.value / 65) * a
  return v.toFixed(2)
})
const ecoCoal = computed(() => {
  if (!props.roof) return '0.0'
  const a = (props.roof.usableArea || BASELINE_AREA) / BASELINE_AREA
  const v = 2.06 * (props.roof.score / 95) * (ratio.value / 65) * a
  return v.toFixed(2)
})
const payback = computed(() => {
  if (!props.roof) return 0
  // 回收期跟面积没关系(投资和收益按比例同涨),只跟评分和铺设比例有关
  const ratioFactor = ratio.value > 0 ? 65 / ratio.value : 1
  const v = 9.5 * (95 / Math.max(props.roof.score, 30)) * ratioFactor
  return Math.max(5, +v.toFixed(1))
})

watch(() => props.roof, () => { ratio.value = 65 })
</script>

<style scoped>
.roof-info-panel {
  position: absolute;
  top: 95px;
  right: 98px;
  width: 494px;
  /* 设计稿固定 740,但视口不够高时按视口缩 → 永远不会"露在屏幕外" */
  height: 740px;
  max-height: calc(100vh - 110px);
  padding: 16px 20px 18px;
  /* 保持深蓝色,透明度调到 0.30 — 真正能透过去看到 3D 场景 */
  background-color: rgba(64,95,129,0.54);
  /* 模糊也降低,避免过度磨砂感掩盖了透明 */
  backdrop-filter: blur(0px);
  border-radius: 18px;
  /* 字体严格按墨刀:PingFangSC-bold + 白 + 16/23 */
  color: #ffffff;
  font-family: 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 23px;
  text-align: left;
  z-index: 80;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.4);
  user-select: none;
  overflow-y: auto;
  animation: panelSlideIn 0.25s ease-out;
}

/* 低碳生活:仅改位置(居中,p1);宽高显式写死和工具栏完全一致,杜绝被撑开 */
.roof-info-panel.eco {
  top: 158px;
  left: 759px;
  right: auto;
  width: 494px;
  height: 740px;
  max-height: calc(100vh - 110px);
  background-color: rgba(64,95,129,0.78)
}

@keyframes panelSlideIn {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* 滚动条美化 */
.roof-info-panel::-webkit-scrollbar { width: 4px; }
.roof-info-panel::-webkit-scrollbar-thumb { background: rgba(121, 171, 255, 0.4); border-radius: 2px; }

/* ============ 顶部标题 ============ */
.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 10px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 16px;
  letter-spacing: 0.5px;
}
.header-icon { width: 22px; height: 22px; object-fit: contain; }
.header-title { font-size: 18px; font-weight: 700; }
.header-sep   { color: rgba(255, 255, 255, 0.85); font-size: 15px; }
.header-current {
  color: #79ABFF;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(121, 171, 255, 0.5);
}
.close-btn {
  margin-left: auto;
  width: 22px;
  height: 22px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-radius: 4px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s;
}
.close-btn:hover { background: rgba(255, 77, 79, 0.5); }

/* ============ 属性列表(严格按墨刀:254x163, 16/23, PingFangSC-bold, 段间距 5px)+ 评分 ============ */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 14px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.25);
}
.attr-list {
  flex: 1;
  width: 254px;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 5px;                         /* 段间距 5px */
  font-family: 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 23px;
  color: #ffffff;
  text-align: left;
}
.attr-list .k {
  color: #ffffff;
  margin-right: 4px;
}
.attr-list .v {
  color: #ffffff;
  font-weight: 700;
}

/* ============ 铺设比例 ============ */
.ratio {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.25);
}
.ratio-label {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
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
  font-size: 16px;
  color: #ffffff;
  font-weight: 700;
  font-family: 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  width: 44px;
  text-align: right;
}

/* ============ 3 节能指标 ============ */
.indicators {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin: 14px 0;
}
.ind {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  min-width: 0;
}
.ind-icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
  flex-shrink: 0;
}
.ind-text { min-width: 0; flex: 1; }
.ind-label {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0;
  white-space: nowrap;          /* 关键:一行不换行 */
  overflow: hidden;
  text-overflow: ellipsis;
}
.ind-value {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  letter-spacing: 0.5px;
}
.ind-unit {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-left: 2px;
}

/* ============ 天气提示 ============ */
.weather {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px dashed rgba(255, 255, 255, 0.25);
}
.weather-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  flex-shrink: 0;
}
.weather-text {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.6;
  letter-spacing: 0.3px;
}
</style>

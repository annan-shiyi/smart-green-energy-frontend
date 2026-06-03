<template>
  <header class="top-bar">
    <!-- 左:标题 + 英文副标题 -->
    <div class="brand">
      <div class="brand-cn">乡村综合治理数智化平台</div>
      <div class="brand-en">Digital &amp; Intelligent Platform for Rural Comprehensive Governance</div>
    </div>

    <!-- 中:5 个 tab(图标 + 文字) -->
    <nav class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: activeTab === tab.key, locked: tab.disabled }"
        @click="onTabClick(tab)"
      >
        <span class="tab-ico"><NavIcon :name="tab.key" /></span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- 右:时间 + 星期 + 天气 -->
    <div class="right">
      <div class="time-block">
        <span class="time-date">{{ nowDate }}</span>
        <span class="time-clock">{{ nowTime }}</span>
        <span class="time-week">{{ nowWeek }}</span>
      </div>
      <div class="weather">
        <span class="w-ico"><NavIcon name="weather" /></span>
        <div class="w-text">
          <div class="w-temp">{{ weather.temp }}</div>
          <div class="w-cond">{{ weather.cond }}</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import NavIcon from './NavIcon.vue'
import { activeTab, villageView } from '../../store/nav.js'

// 5 个 tab。activeTab 提升为全局共享态。
// 产业发展 / 民生服务 暂未开发,先锁死(点击无效),后续再开放。
const tabs = [
  { key: 'village',  label: '村情村貌' },
  { key: 'industry', label: '产业发展', disabled: true },
  { key: 'safety',   label: '安全防治' },
  { key: 'people',   label: '民生服务', disabled: true },
  { key: 'eco',      label: '低碳生活' }
]

function onTabClick(tab) {
  if (tab.disabled) return // 锁死的 tab 点击无效
  activeTab.value = tab.key
  // 点"村情村貌"时回到地球首页
  if (tab.key === 'village') villageView.value = 'globe'
}

// 天气(占位,后续接真实数据)
const weather = { temp: '20~28℃', cond: '晴转多云 优' }

// ===== 时间 =====
const nowDate = ref('')
const nowTime = ref('')
const nowWeek = ref('')
const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function updateTime() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  nowDate.value = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
  nowTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  nowWeek.value = weekMap[d.getDay()]
}

let timer = null
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  /* 设计稿:左侧青色,从"村情村貌"附近开始向右渐变成黑色 */
  background: linear-gradient(
    90deg,
    rgba(67, 111, 120, 1) 0%,
    rgba(15, 35, 39, 0.56) 22%,
    rgba(10, 14, 18, 0.96) 100%
  );
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-family: 'Arial', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  user-select: none;
}

/* ============ 左:标题 ============ */
.brand {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.brand-cn {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ffffff;
  text-shadow: 0 0 12px rgba(94, 211, 255, 0.5);
  font-family: 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 1.1;
}
.brand-en {
  font-size: 11px;
  letter-spacing: 0.3px;
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Arial', sans-serif;
  white-space: nowrap;
}

/* ============ 中:Tabs(图标 + 文字) ============ */
.tabs {
  display: flex;
  gap: 8px;
  flex: 1;
  justify-content: center;
}
.tab {
  /* 等腰梯形:上边满宽,下边两侧各内收 16px */
  width: 172px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0;
  border: none;
  cursor: pointer;
  color: #D9F1FD;
  clip-path: polygon(0 0, 100% 0, calc(100% - 16px) 100%, 16px 100%);
  background: linear-gradient(180deg, rgba(67, 111, 120, 0.35), rgba(67, 111, 120, 0.05));
  transition: all 0.2s ease;
}
.tab-ico {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab-label {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #D9F1FD;
  font-family: 'AlibabaPuHui-bold', 'Alibaba Sans', 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.tab:hover {
  background: linear-gradient(180deg, rgba(67, 111, 120, 0.55), rgba(67, 111, 120, 0.15));
  color: #eaf6ff;
}
.tab.active {
  background: linear-gradient(180deg, rgba(94, 211, 255, 0.55), rgba(47, 111, 196, 0.22));
  color: #ffffff;
  text-shadow: 0 0 10px rgba(94, 211, 255, 0.9);
}
.tab.active .tab-label { color: #ffffff; }

/* 锁死(未开发)的 tab:置灰、禁用、不响应 hover */
.tab.locked {
  opacity: 0.4;
  cursor: not-allowed;
}
.tab.locked:hover {
  background: linear-gradient(180deg, rgba(67, 111, 120, 0.35), rgba(67, 111, 120, 0.05));
  color: #D9F1FD;
}

/* ============ 右:时间 + 天气 ============ */
.right {
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 0 0 auto;
}
.time-block {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: 'Consolas', 'PingFang SC', 'Microsoft YaHei', monospace;
  color: rgba(255, 255, 255, 0.92);
}
.time-date { font-size: 13px; letter-spacing: 0.5px; }
.time-clock { font-size: 16px; font-weight: 700; color: #79ABFF; letter-spacing: 1px; }
.time-week { font-size: 13px; color: rgba(255, 255, 255, 0.78); }

.weather {
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(255, 255, 255, 0.92);
}
.w-ico {
  width: 26px;
  height: 26px;
  color: #ffd24a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.w-text { display: flex; flex-direction: column; line-height: 1.15; }
.w-temp { font-size: 14px; font-weight: 700; color: #fff; }
.w-cond { font-size: 11px; color: rgba(255, 255, 255, 0.7); }
</style>

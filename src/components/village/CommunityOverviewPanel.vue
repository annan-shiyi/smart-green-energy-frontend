<template>
  <PanelFrame title="社区概况" variant="community">
    <!-- 前 4 项:2 列 -->
    <div class="stats two">
      <div v-for="s in topStats" :key="s.label + s.value" class="stat">
        <div class="icon-box">
          <img v-if="iconMap[s.icon]" :src="iconMap[s.icon]" :alt="s.label" class="icon-img" />
          <StatIcon v-else :name="s.icon" class="icon-svg" />
        </div>
        <div class="stat-text">
          <div class="stat-value">{{ s.value }}<span class="stat-unit">{{ s.unit }}</span></div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- 第 5 项起:3 列 -->
    <div class="stats three">
      <div v-for="s in bottomStats" :key="s.label + s.value" class="stat">
        <div class="icon-box">
          <img v-if="iconMap[s.icon]" :src="iconMap[s.icon]" :alt="s.label" class="icon-img" />
          <StatIcon v-else :name="s.icon" class="icon-svg" />
        </div>
        <div class="stat-text">
          <div class="stat-value">{{ s.value }}<span class="stat-unit">{{ s.unit }}</span></div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </PanelFrame>
</template>

<script setup>
import { computed } from 'vue'
import PanelFrame from './PanelFrame.vue'
import StatIcon from './StatIcon.vue'
import { communityStats, communityTopCount } from '../../data/villageData.js'

import areaIcon from '../../assets/village/area.png'
import groupIcon from '../../assets/village/group.png'
import householdIcon from '../../assets/village/household.png'
import peopleIcon from '../../assets/village/people.png'
import residentIcon from '../../assets/village/resident.png'
import laborIcon from '../../assets/village/labor.png'

// 有真实 PNG 的图标走 <img>;没有的(外流/男/女)回退内联 SVG
const iconMap = {
  area: areaIcon,
  group: groupIcon,
  household: householdIcon,
  people: peopleIcon,
  resident: residentIcon,
  labor: laborIcon
}

const topStats = computed(() => communityStats.slice(0, communityTopCount))
const bottomStats = computed(() => communityStats.slice(communityTopCount))
</script>

<style scoped>
.stats {
  display: grid;
  gap: 8px;
}
.stats.two { grid-template-columns: 1fr 1fr; }
.stats.three {
  grid-template-columns: 1fr 1fr 1fr;
  margin-top: 8px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  padding: 0 14px;
  /* 引用光伏「光伏铺设概况」卡片同款渐变(-44.19deg 深青→蓝) */
  background: linear-gradient(
    -44.19deg,
    rgba(3, 21, 24, 0.1) 2.37%,
    rgba(3, 21, 24, 0.15) 24.37%,
    rgba(68, 109, 156, 0.8) 98.04%
  );
  color: rgba(149, 198, 234, 1);
  border: 1px solid rgba(0, 0, 0, 0);
}

.icon-box {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5ed3ff;
}
.icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.icon-svg {
  width: 28px;
  height: 28px;
}

.stat-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #f0f8ff;
  font-family: 'Consolas', 'Microsoft YaHei', monospace;
  letter-spacing: 0.5px;
  white-space: nowrap;
  line-height: 1.1;
}
.stat-unit {
  font-size: 11px;
  font-weight: 400;
  color: rgba(149, 198, 234, 0.85);
  margin-left: 3px;
}

.stat-label {
  font-size: 12px;
  color: rgba(149, 198, 234, 1);
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

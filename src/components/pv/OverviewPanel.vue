<template>
  <div class="overview-panel">
    <!-- 标题条:严格按墨刀给的 450×45 渐变 + #95C6EA 文字 -->
    <div class="panel-head">
      <span class="head-marker">▣</span>
      <span class="head-title">光伏铺设概况</span>
    </div>

    <!-- 4 个指标卡 -->
    <div class="stats">
      <div v-for="s in stats" :key="s.label" class="stat">
        <img :src="s.icon" alt="" class="stat-icon" />
        <div class="stat-text">
          <div class="stat-value">
            {{ s.value }}<span class="stat-unit">{{ s.unit }}</span>
          </div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import iconArea from '../../assets/icons/stat-area.png'
import iconHouseholds from '../../assets/icons/stat-households.png'
import iconGroups from '../../assets/icons/stat-groups.png'
import iconPower from '../../assets/icons/stat-power.png'

// 设计稿数字写死(整村汇总,不随当前选屋顶变化)
const stats = [
  { icon: iconArea,       label: '可铺设总面积', value: '8765',    unit: '平方米' },
  { icon: iconHouseholds, label: '可铺设户数',   value: '687',       unit: '户' },
  { icon: iconGroups,     label: '村民小组',     value: '6',         unit: '个' },
  { icon: iconPower,      label: '年耗电总量',   value: '约74.4万',  unit: 'kWh' }
]
</script>

<style scoped>
.overview-panel {
  position: absolute;
  top: 82px;
  left: 18px;
  width: 450px;
  z-index: 80;
  user-select: none;
  background: var(--panel-fill);
  /* 标题条字体(墨刀: AlibabaPuHui-regular,我们没装,优雅降级) */
  font-family: 'AlibabaPuHui-regular', 'Alibaba Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ============ 标题条 - 严格对齐墨刀 CSS ============ */
.panel-head {
  width: 450px;
  height: 45px;
  line-height: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  /* 设计稿:左下方深、右上方亮蓝的斜向渐变 */
  background: linear-gradient(
    -44.19deg,
    rgba(3, 21, 24, 0.1) 2.37%,
    rgba(3, 21, 24, 0.15) 24.37%,
    rgba(68, 109, 156, 0.8) 98.04%
  );
  color: rgba(149, 198, 234, 1);
  font-size: 20px;
  text-align: left;
  border: 1px solid rgba(0, 0, 0, 0);
}

.head-marker {
  font-size: 14px;
  opacity: 0.9;
}

.head-title {
  letter-spacing: 1px;
}

/* ============ 4 个指标卡 - 同款渐变 + 蓝边色 ============ */
.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 64px;
  padding: 0 14px;
  background: linear-gradient(
    -44.19deg,
    rgba(3, 21, 24, 0.1) 2.37%,
    rgba(3, 21, 24, 0.15) 24.37%,
    rgba(68, 109, 156, 0.8) 98.04%
  );
  color: rgba(149, 198, 234, 1);
  border: 1px solid rgba(0, 0, 0, 0);
}

.stat-icon {
  width: 34px;
  height: 34px;
  object-fit: contain;
  flex-shrink: 0;
}

.stat-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #f0f8ff;
  font-family: 'Consolas', 'AlibabaPuHui-regular', 'Microsoft YaHei', monospace;
  letter-spacing: 0.5px;
  white-space: nowrap;
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
  letter-spacing: 1px;
}
</style>

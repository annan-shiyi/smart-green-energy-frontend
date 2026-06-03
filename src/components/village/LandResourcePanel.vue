<template>
  <PanelFrame title="土地资源">
    <!-- 大数字行 -->
    <div class="land-main">
      <span class="lm-label">{{ landMain.label }}</span>
      <span class="lm-value">{{ landMain.value }}</span>
      <span class="lm-unit">{{ landMain.unit }}</span>
      <div class="lm-shield">
        <img :src="landShield" alt="桔园" />
      </div>
    </div>

    <!-- 三个小指标 -->
    <div class="land-stats">
      <div v-for="s in landStats" :key="s.label" class="ls">
        <div class="ls-icon"><StatIcon :name="s.icon" /></div>
        <div class="ls-text">
          <span class="ls-label">{{ s.label }}</span>
          <span class="ls-value">{{ s.value }}<span class="ls-unit">{{ s.unit }}</span></span>
        </div>
      </div>
    </div>
  </PanelFrame>
</template>

<script setup>
import PanelFrame from './PanelFrame.vue'
import StatIcon from './StatIcon.vue'
import { landMain, landStats } from '../../data/villageData.js'
import landShield from '../../assets/village/land-shield.png'
</script>

<style scoped>
.land-main {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 72px;
  padding: 0 22px;
  /* 设计稿:胶囊圆角 + -59.52deg 渐变 */
  border-radius: 999px;
  background: linear-gradient(
    -59.52deg,
    rgba(68, 109, 156, 0.1) 9.79%,
    rgba(68, 109, 156, 0.12) 63.34%,
    rgba(68, 109, 156, 0.5) 89.71%
  );
  border: 0 solid rgba(242, 242, 242, 1);
}

.lm-label {
  font-size: 18px;
  color: rgba(255, 255, 255, 1);
  letter-spacing: 0.5px;
}

.lm-value {
  font-size: 38px;
  font-weight: 700;
  color: #40e0d0;
  font-family: 'Consolas', 'Microsoft YaHei', monospace;
  text-shadow: 0 0 12px rgba(64, 224, 208, 0.45);
  line-height: 1;
}

.lm-unit {
  font-size: 16px;
  color: rgba(255, 255, 255, 1);
}

.lm-shield {
  margin-left: auto;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
}
.lm-shield img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.land-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.ls {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 12px;
  border-radius: 16px;
  background: linear-gradient(
    -59.52deg,
    rgba(68, 109, 156, 0.1) 9.79%,
    rgba(68, 109, 156, 0.12) 63.34%,
    rgba(68, 109, 156, 0.5) 89.71%
  );
  border: 1px solid rgba(101, 160, 200, 0.12);
}

.ls-icon {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: #5ed3ff;
}

.ls-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ls-label {
  font-size: 12px;
  color: rgba(190, 215, 240, 0.9);
  white-space: nowrap;
}

.ls-value {
  font-size: 17px;
  font-weight: 700;
  color: #f0f8ff;
  font-family: 'Consolas', 'Microsoft YaHei', monospace;
}

.ls-unit {
  font-size: 11px;
  font-weight: 400;
  color: rgba(149, 198, 234, 0.85);
  margin-left: 2px;
}
</style>

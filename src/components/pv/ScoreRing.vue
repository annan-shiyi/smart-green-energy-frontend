<template>
  <div class="score-ring">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <!-- 背景圆环 -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="rgba(121, 171, 255, 0.22)"
        :stroke-width="stroke"
      />
      <!-- 渐变定义 -->
      <defs>
        <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#79ABFF" />
          <stop offset="100%" stop-color="#5ed3ff" />
        </linearGradient>
      </defs>
      <!-- 进度圆环 -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke="url(#score-grad)"
        :stroke-width="stroke"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
        class="progress-arc"
      />
    </svg>
    <div class="center-text">
      <div class="score">{{ score }}<span class="unit">分</span></div>
      <div class="recommendation">{{ recommendation }}</div>
    </div>
    <div class="caption">综合评分</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: { type: Number, default: 0 },
  recommendation: { type: String, default: '' },
  size: { type: Number, default: 110 },
  stroke: { type: Number, default: 8 }
})

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => circumference.value * (1 - props.score / 100))
</script>

<style scoped>
.score-ring {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.progress-arc {
  transition: stroke-dashoffset 0.8s ease-out;
  filter: drop-shadow(0 0 6px rgba(121, 171, 255, 0.6));
}

.center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -58%);
  text-align: center;
  pointer-events: none;
}

.score {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'PingFangSC-bold', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  letter-spacing: 0.5px;
  text-shadow: 0 0 8px rgba(47, 111, 196, 0.4);
}

.unit {
  font-size: 13px;
  font-weight: 600;
  margin-left: 2px;
  color: rgba(255, 255, 255, 0.92);
}

.recommendation {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 1px;
  letter-spacing: 1px;
}

.caption {
  color: #79ABFF;
  font-size: 14px;
  letter-spacing: 2px;
  margin-top: 6px;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(121, 171, 255, 0.5);
}
</style>

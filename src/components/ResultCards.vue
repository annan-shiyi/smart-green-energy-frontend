<template>
  <div class="result-cards">
    <div class="panel-title">测算结果</div>

    <div v-if="!result" class="empty">请先完成测算</div>

    <div v-else class="cards">
      <div class="card">
        <div class="card-label">可铺设面积</div>
        <div class="card-value">{{ format(result.usableArea) }}</div>
        <div class="card-unit">㎡</div>
      </div>
      <div class="card">
        <div class="card-label">可安装容量</div>
        <div class="card-value">{{ format(result.installedCapacity) }}</div>
        <div class="card-unit">kW</div>
      </div>
      <div class="card highlight">
        <div class="card-label">年发电量</div>
        <div class="card-value">{{ format(result.annualGeneration) }}</div>
        <div class="card-unit">kWh</div>
      </div>
      <div class="card highlight">
        <div class="card-label">年收益</div>
        <div class="card-value">{{ format(result.annualIncome) }}</div>
        <div class="card-unit">元</div>
      </div>
      <div class="card">
        <div class="card-label">年减碳量</div>
        <div class="card-value">{{ format(result.annualCarbonReduction) }}</div>
        <div class="card-unit">kg</div>
      </div>
      <div class="card">
        <div class="card-label">投资成本</div>
        <div class="card-value">{{ format(result.totalInvestment) }}</div>
        <div class="card-unit">元</div>
      </div>
      <div class="card">
        <div class="card-label">静态回收期</div>
        <div class="card-value">{{ format(result.paybackPeriod) }}</div>
        <div class="card-unit">年</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatNumber } from '../services/solarCalc.js'

defineProps({
  result: {
    type: Object,
    default: null
  }
})

const format = (v) => formatNumber(v, 2)
</script>

<style scoped>
.result-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.empty {
  color: #6c7a91;
  font-size: 13px;
  text-align: center;
  padding: 20px 0;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.card {
  position: relative;
  padding: 14px 14px 12px;
  background: linear-gradient(135deg, rgba(13, 30, 60, 0.7), rgba(8, 18, 38, 0.7));
  border: 1px solid rgba(64, 224, 208, 0.2);
  border-radius: 6px;
  text-align: center;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #40e0d0, transparent);
}

.card.highlight {
  border-color: rgba(64, 224, 208, 0.5);
  box-shadow: 0 0 16px rgba(64, 224, 208, 0.15);
}

.card.highlight .card-value {
  color: #00ffaa;
}

.card-label {
  font-size: 12px;
  color: #8aa1bf;
  margin-bottom: 6px;
  letter-spacing: 1px;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #40e0d0;
  font-family: 'Consolas', 'Microsoft YaHei', monospace;
  text-shadow: 0 0 8px rgba(64, 224, 208, 0.5);
}

.card-unit {
  font-size: 11px;
  color: #8aa1bf;
  margin-top: 2px;
}
</style>

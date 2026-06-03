<template>
  <!-- 村情村貌共用数据层:地球首页 / 模型页都叠这一套 -->
  <div class="village-overlay">
    <!-- 左侧:社区概况 + 组织建设 -->
    <div class="panel-col left">
      <CommunityOverviewPanel />
      <OrgBuildingPanel />
    </div>

    <!-- 右侧:土地资源 + 基础设施 -->
    <div class="panel-col right">
      <LandResourcePanel />
      <InfrastructurePanel />
    </div>

    <!-- 底部中:三个导航 -->
    <div class="bottom-nav-wrap">
      <BottomNav @select="$emit('nav-select', $event)" />
    </div>
  </div>
</template>

<script setup>
import CommunityOverviewPanel from './CommunityOverviewPanel.vue'
import OrgBuildingPanel from './OrgBuildingPanel.vue'
import LandResourcePanel from './LandResourcePanel.vue'
import InfrastructurePanel from './InfrastructurePanel.vue'
import BottomNav from './BottomNav.vue'

defineEmits(['nav-select'])
</script>

<style scoped>
/* 这一层本身不挡指针,只有内部面板/按钮接收事件 */
.village-overlay {
  position: absolute;
  inset: 0;
  z-index: 80;
  pointer-events: none;
}

.panel-col {
  position: absolute;
  top: 72px;
  bottom: 40px;
  width: 470px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  pointer-events: auto;
}
.panel-col.left { left: 16px; animation: slideInLeft 0.6s ease-out both; }
.panel-col.right { right: 16px; animation: slideInRight 0.6s ease-out both; }

.bottom-nav-wrap {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;
  animation: fadeUp 0.6s 0.2s ease-out both;
}

/* 入场动画:切入页面时面板滑入 / 上浮淡入 */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translate(-50%, 20px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}
</style>

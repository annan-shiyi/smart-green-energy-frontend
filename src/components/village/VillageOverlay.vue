<template>
  <!-- 村情村貌共用数据层:地球首页 / 模型页都叠这一套 -->
  <div class="village-overlay">
    <!-- 左侧:社区概况 + 组织建设 -->
    <div class="panel-slot left" :class="{ closed: !leftOpen }">
      <div class="panel-col left">
        <CommunityOverviewPanel />
        <OrgBuildingPanel />
      </div>
    </div>
    <!-- 左侧收起/展开把手 -->
    <button
      class="panel-handle left"
      :class="{ open: leftOpen }"
      :title="leftOpen ? '收起面板' : '展开面板'"
      @click="leftOpen = !leftOpen"
    >{{ leftOpen ? '‹' : '›' }}</button>

    <!-- 右侧:土地资源 + 基础设施 -->
    <div class="panel-slot right" :class="{ closed: !rightOpen }">
      <div class="panel-col right">
        <LandResourcePanel />
        <InfrastructurePanel />
      </div>
    </div>
    <!-- 右侧收起/展开把手 -->
    <button
      class="panel-handle right"
      :class="{ open: rightOpen }"
      :title="rightOpen ? '收起面板' : '展开面板'"
      @click="rightOpen = !rightOpen"
    >{{ rightOpen ? '›' : '‹' }}</button>

    <!-- 底部中:三个导航 -->
    <div class="bottom-nav-wrap">
      <BottomNav @select="$emit('nav-select', $event)" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CommunityOverviewPanel from './CommunityOverviewPanel.vue'
import OrgBuildingPanel from './OrgBuildingPanel.vue'
import LandResourcePanel from './LandResourcePanel.vue'
import InfrastructurePanel from './InfrastructurePanel.vue'
import BottomNav from './BottomNav.vue'

defineEmits(['nav-select'])

// 左右信息面板的开合状态(默认展开)
const leftOpen = ref(true)
const rightOpen = ref(true)
</script>

<style scoped>
/* 这一层本身不挡指针,只有内部面板/按钮接收事件 */
.village-overlay {
  position: absolute;
  inset: 0;
  z-index: 80;
  pointer-events: none;
}

/* 定位 + 收合的外层容器(收起时整列滑出屏幕) */
.panel-slot {
  position: absolute;
  top: 72px;
  bottom: 40px;
  width: 470px;
  pointer-events: none;
  transition: transform 0.4s ease, opacity 0.4s ease;
}
.panel-slot.left { left: 16px; }
.panel-slot.right { right: 16px; }
.panel-slot.left.closed { transform: translateX(-110%); opacity: 0; }
.panel-slot.right.closed { transform: translateX(110%); opacity: 0; }
.panel-slot.closed .panel-col { pointer-events: none; }

/* 内层:两块面板的纵向排布 + 入场动画 */
.panel-col {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  pointer-events: auto;
}
.panel-col.left { animation: slideInLeft 0.6s ease-out both; }
.panel-col.right { animation: slideInRight 0.6s ease-out both; }

/* 收起/展开把手:展开时贴在面板内侧边缘,收起时贴屏幕边缘 */
.panel-handle {
  position: absolute;
  top: 50%;
  width: 20px;
  height: 64px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(28, 37, 49, 0.9);
  border: 1px solid rgba(101, 160, 200, 0.3);
  color: var(--muted);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  pointer-events: auto;
  z-index: 6;
  transition: left 0.4s ease, right 0.4s ease, color 0.18s ease, border-color 0.18s ease;
}
.panel-handle:hover {
  color: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 10px rgba(64, 224, 208, 0.2);
}
.panel-handle.left {
  left: 16px;
  border-left: none;
  border-radius: 0 6px 6px 0;
}
.panel-handle.left.open { left: 486px; } /* 16 + 470 面板右缘 */
.panel-handle.right {
  right: 16px;
  border-right: none;
  border-radius: 6px 0 0 6px;
}
.panel-handle.right.open { right: 486px; }

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

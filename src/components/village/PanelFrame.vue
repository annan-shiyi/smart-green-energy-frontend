<template>
  <section class="panel-frame" :class="variant">
    <div class="panel-head">
      <span class="head-bar"></span>
      <span class="head-title">{{ title }}</span>
      <span class="head-sub">{{ sub }}</span>
    </div>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  sub: { type: String, default: 'Data Analysis' },
  // 背景分组:'' = 默认(组织建设/土地资源/基础设施 共用);'community' = 社区概况单独
  variant: { type: String, default: '' }
})
</script>

<style scoped>
/* 默认背景:组织建设 / 土地资源 / 基础设施 三个面板共用(绑定,改这里三个一起变) */
.panel-frame {
  width: 100%;
  background: rgba(59, 73, 123, 0);
  border: 1px solid rgba(101, 160, 200, 0.12);
  backdrop-filter: blur(2px);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 社区概况单独背景(variant="community",改这里只影响社区概况) */
.panel-frame.community {
  background: rgba(59, 73, 123, 0);
}

/* 标题栏:严格按设计稿(墨刀)CSS — 所有面板统一 */
.panel-head {
  height: 45px;
  line-height: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  background: linear-gradient(
    -61.19deg,
    rgba(60, 129, 179, 0.27) 46.69%,
    rgba(69, 128, 170, 0.8) 77.71%,
    rgba(72, 148, 204, 0.19) 92.99%
  );
  color: rgba(149, 198, 234, 1);
  border: 2px solid rgba(0, 0, 0, 0);
}

.head-bar {
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #5ed3ff, #2f6fc4);
  box-shadow: 0 0 6px rgba(94, 211, 255, 0.7);
  flex-shrink: 0;
}

.head-title {
  font-size: 20px;
  font-weight: 700;
  color: rgba(149, 198, 234, 1);
  letter-spacing: 1px;
  font-family: 'AlibabaPuHui-regular', 'Alibaba Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.head-sub {
  font-size: 12px;
  font-weight: 400;
  color: rgba(149, 198, 234, 0.55);
  letter-spacing: 0.5px;
  font-family: 'Arial', sans-serif;
}

.panel-body {
  padding: 12px;
}
</style>

<template>
  <div class="village">
    <!-- ============ 地球首页 ============ -->
    <template v-if="villageView === 'globe'">
      <VillageGlobe @enter-model="enterModel" />
      <VillageOverlay @nav-select="onNavSelect" />
    </template>

    <!-- ============ 3D 模型页 ============ -->
    <template v-else>
      <div class="model-stage">
        <VillageModelViewer ref="modelRef" @camera-change="onCameraChange" />
      </div>

      <!-- 左右暗角蒙版:衬在两侧面板后面,中间模型保持清晰 -->
      <div class="scene-mask"></div>

      <!-- 地域切换 + 退出:左下角,两个社区都常驻 -->
      <div class="map-controls">
        <RegionSwitch />
        <ExitButton />
      </div>

      <!-- 数据面板仅主社区(石岗)展示;石盘滩为纯模型 -->
      <VillageOverlay v-if="showData" @nav-select="onNavSelect" />

      <!-- 右下控件:指南针 / 全屏 / 放大 / 缩小 -->
      <RightControls
        @reset-view="onResetView"
        @toggle-fullscreen="onToggleFullscreen"
        @zoom-in="onZoomIn"
        @zoom-out="onZoomOut"
      />

      <!-- 底部状态栏 -->
      <StatusBar
        :lng="camera.lng"
        :lat="camera.lat"
        :elevation="camera.elevation"
        :heading="camera.heading"
        :pitch="camera.pitch"
        :view-height="camera.viewHeight"
        :frame-ms="perf.frameMs"
        :fps="perf.fps"
      />
    </template>

    <!-- 顶部栏(两个子页面共用;再次点"村情村貌"会回到地球首页) -->
    <TopBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import VillageModelViewer from '../components/VillageModelViewer.vue'
import TopBar from '../components/layout/TopBar.vue'
import RightControls from '../components/layout/RightControls.vue'
import StatusBar from '../components/layout/StatusBar.vue'
import RegionSwitch from '../components/layout/RegionSwitch.vue'
import ExitButton from '../components/layout/ExitButton.vue'
import VillageGlobe from '../components/village/VillageGlobe.vue'
import VillageOverlay from '../components/village/VillageOverlay.vue'
import { villageView } from '../store/nav.js'
import { currentRegion, REGIONS } from '../store/region.js'

const modelRef = ref(null)

// 当前社区是否叠加数据(石岗=true,石盘滩=false)
const showData = computed(() => REGIONS[currentRegion.value]?.showData)

// 点地球上的可点点位 → 进入 3D 模型页
function enterModel() {
  villageView.value = 'model'
}


function onNavSelect(key) {
  // 底部导航切换(基本情况 / 历史事件 / 财务公开)— 后续接入对应内容
  console.log('[Village] 底部导航:', key)
}

function onResetView() { modelRef.value && modelRef.value.resetView() }
function onZoomIn()    { modelRef.value && modelRef.value.zoomIn() }
function onZoomOut()   { modelRef.value && modelRef.value.zoomOut() }

function onToggleFullscreen() {
  const el = document.documentElement
  if (!document.fullscreenElement) {
    if (el.requestFullscreen) el.requestFullscreen()
  } else {
    if (document.exitFullscreen) document.exitFullscreen()
  }
}

// ---------------- 相机坐标实时上报 ----------------
const camera = ref({
  lng: 0,
  lat: 0,
  elevation: 0,
  heading: 0,
  pitch: -45,
  viewHeight: 0
})
const perf = ref({ frameMs: 16.65, fps: 60 })

function onCameraChange(info) {
  camera.value = { ...camera.value, ...info }
}

// 简易 FPS
let rafId = 0
let lastT = performance.now()
let frames = 0
function tick(t) {
  frames += 1
  if (t - lastT >= 1000) {
    const fps = (frames * 1000) / (t - lastT)
    perf.value = { frameMs: 1000 / Math.max(fps, 1), fps }
    frames = 0
    lastT = t
  }
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  rafId = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.village {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

.model-stage {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* 地域切换 + 退出:左下角(贴在「组织建设」面板下方) */
.map-controls {
  position: absolute;
  left: 16px;
  bottom: 46px;
  z-index: 95;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 左右暗角蒙版:中间透明保留模型,两侧压暗衬托面板 */
.scene-mask {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.62) 0%,
    rgba(0, 0, 0, 0.22) 18%,
    rgba(0, 0, 0, 0) 30%,
    rgba(0, 0, 0, 0) 70%,
    rgba(0, 0, 0, 0.22) 82%,
    rgba(0, 0, 0, 0.62) 100%
  );
  animation: maskIn 0.6s ease-out both;
}
@keyframes maskIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>

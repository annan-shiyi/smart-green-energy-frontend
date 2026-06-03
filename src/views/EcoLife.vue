<template>
  <div class="eco">
    <!-- 三维全屏底图(与安全防治同一个模型) -->
    <div class="model-stage">
      <ModelViewer
        ref="modelRef"
        :selected-roof="selectedRoof"
        :show-markers="true"
        @select-roof="onSelectRoof"
        @camera-change="onCameraChange"
      />
    </div>

    <!-- 左右暗角阴影:衬在两侧面板后面 -->
    <div class="scene-mask"></div>

    <!-- 选中屋顶 / 多选模态时压暗场景 -->
    <div v-if="selectedRoof || multiSelectOpen" class="scene-dim"></div>

    <!-- 左上:光伏铺设概况(复用) -->
    <OverviewPanel />

    <!-- 左下:电量测算(新) -->
    <ElectricityPanel @open-multi-select="onOpenMultiSelect" />

    <!-- 右上:经济测算(新) -->
    <EconomyPanel />

    <!-- 选中屋顶详情(复用) -->
    <RoofInfoPanel
      v-if="selectedRoof && !multiSelectOpen"
      :roof="selectedRoof"
      placement="eco"
      @close="selectedRoof = null"
    />

    <!-- 屋面多选测算模态(复用) -->
    <MultiSelectModal
      v-if="multiSelectOpen"
      @close="multiSelectOpen = false"
    />

    <!-- 底部导航(环境感知/碳排碳汇/智慧绿能) -->
    <div class="bottom-nav-wrap">
      <BottomNav :items="ecoNavItems" @select="onNavSelect" />
    </div>

    <!-- 右上"底图/图层/工具"按钮组 -->
    <FloatingControls :active-key="activeControl" @toggle="onToggleControl" />
    <ToolsMenu
      v-if="activeControl === 'tools'"
      @select="onToolSelect"
      @close="activeControl = ''"
    />

    <!-- 右下控件 -->
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

    <!-- 顶部栏(共用,最后渲染) -->
    <TopBar />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ModelViewer from '../components/ModelViewer.vue'
import TopBar from '../components/layout/TopBar.vue'
import FloatingControls from '../components/layout/FloatingControls.vue'
import ToolsMenu from '../components/layout/ToolsMenu.vue'
import RightControls from '../components/layout/RightControls.vue'
import StatusBar from '../components/layout/StatusBar.vue'
import OverviewPanel from '../components/pv/OverviewPanel.vue'
import RoofInfoPanel from '../components/pv/RoofInfoPanel.vue'
import MultiSelectModal from '../components/pv/MultiSelectModal.vue'
import ElectricityPanel from '../components/eco/ElectricityPanel.vue'
import EconomyPanel from '../components/eco/EconomyPanel.vue'
import BottomNav from '../components/village/BottomNav.vue'
import { ecoNavItems } from '../data/ecoData.js'

const modelRef = ref(null)
const selectedRoof = ref(null)
const multiSelectOpen = ref(false)
const activeControl = ref('')

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

function onToggleControl(key) {
  activeControl.value = activeControl.value === key ? '' : key
}
function onToolSelect() {
  // 低碳生活已是测算态,工具菜单项暂不触发额外逻辑
  activeControl.value = ''
}

function onOpenMultiSelect() { multiSelectOpen.value = true }
function onSelectRoof(roof) { selectedRoof.value = roof }
function onNavSelect(key) { console.log('[EcoLife] 底部导航:', key) }

// ---------------- 相机坐标 + 性能 ----------------
const camera = ref({ lng: 104.320368, lat: 30.412588, elevation: 419.4, heading: 7, pitch: -26, viewHeight: 693.8 })
const perf = ref({ frameMs: 16.65, fps: 60 })
function onCameraChange(info) { camera.value = { ...camera.value, ...info } }

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
onMounted(() => { rafId = requestAnimationFrame(tick) })
onBeforeUnmount(() => { cancelAnimationFrame(rafId) })
</script>

<style scoped>
.eco {
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
/* 左右暗角阴影(在模型之上、面板之下) */
.scene-mask {
  position: absolute;
  inset: 0;
  z-index: 2;
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
}
.scene-dim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
  z-index: 5;
  pointer-events: none;
  animation: dimIn 0.25s ease-out;
}
@keyframes dimIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.bottom-nav-wrap {
  position: absolute;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 85;
}
</style>

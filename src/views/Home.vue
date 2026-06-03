<template>
  <div class="home">
    <!-- 三维全屏底图 -->
    <div class="model-stage">
      <ModelViewer
        ref="modelRef"
        :selected-roof="selectedRoof"
        :show-markers="pvMode"
        @select-roof="onSelectRoof"
        @camera-change="onCameraChange"
      />
    </div>

    <!-- 选中屋顶 / 打开多选模态时压暗 3D 场景,做焦点引导 -->
    <div v-if="pvMode && (selectedRoof || multiSelectOpen)" class="scene-dim"></div>

    <!-- 光伏测算模式(状态 C 起):左上概况卡 + 左侧模式按钮 -->
    <template v-if="pvMode">
      <OverviewPanel />
      <PVModeControls
        @exit="onExitPvMode"
        @open-multi-select="onOpenMultiSelect"
      />
      <!-- 状态 D:选中某屋顶时滑出右侧信息面板 -->
      <RoofInfoPanel
        v-if="selectedRoof && !multiSelectOpen"
        :roof="selectedRoof"
        @close="selectedRoof = null"
      />
      <!-- 状态 E:多选屋面测算模态 -->
      <MultiSelectModal
        v-if="multiSelectOpen"
        @close="multiSelectOpen = false"
      />
    </template>

    <!-- 顶部栏 -->
    <TopBar />

    <!-- 右上"底图/图层/工具"按钮组 -->
    <FloatingControls :active-key="activeControl" @toggle="onToggleControl" />

    <!-- 工具菜单(状态 B) -->
    <ToolsMenu
      v-if="activeControl === 'tools'"
      @select="onToolSelect"
      @close="activeControl = ''"
    />

    <!-- 右下控件:指南针 + 全屏 + 放大/缩小 -->
    <RightControls
      @reset-view="onResetView"
      @toggle-fullscreen="onToggleFullscreen"
      @zoom-in="onZoomIn"
      @zoom-out="onZoomOut"
    />

    <!-- 底部状态栏(相机坐标 + 性能) -->
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

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ModelViewer from '../components/ModelViewer.vue'
import TopBar from '../components/layout/TopBar.vue'
import StatusBar from '../components/layout/StatusBar.vue'
import FloatingControls from '../components/layout/FloatingControls.vue'
import RightControls from '../components/layout/RightControls.vue'
import ToolsMenu from '../components/layout/ToolsMenu.vue'
import OverviewPanel from '../components/pv/OverviewPanel.vue'
import PVModeControls from '../components/pv/PVModeControls.vue'
import RoofInfoPanel from '../components/pv/RoofInfoPanel.vue'
import MultiSelectModal from '../components/pv/MultiSelectModal.vue'

const modelRef = ref(null)

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

// ---------------- 状态机 ----------------
// 用 3 个互斥/正交的 flag 组合出 5 个状态
//   A 首页    : 全 false
//   B 工具菜单: activeControl === 'tools'
//   C 测算模式: pvMode
//   D 屋顶详情: pvMode + selectedRoof
//   E 多选模态: pvMode + multiSelectOpen
const activeControl = ref('') // '' | 'basemap' | 'layers' | 'tools'
const pvMode = ref(false)
const selectedRoof = ref(null)
const multiSelectOpen = ref(false)

function onToggleControl(key) {
  // 同一个按钮再次点 → 关闭;点别的 → 切换
  activeControl.value = activeControl.value === key ? '' : key
}

// 工具菜单里选了某项
function onToolSelect(key) {
  activeControl.value = '' // 选完关闭菜单
  if (key === 'pv') {
    pvMode.value = true // 进入光伏测算模式 → 状态 C
  }
  // 其他菜单项当前都是 disabled,不会进来
}

// 退出光伏测算模式 → 回到状态 A
function onExitPvMode() {
  pvMode.value = false
  selectedRoof.value = null
  multiSelectOpen.value = false
}

// 打开"屋面多选"模态(状态 E)— 阶段 6 实现 modal,这里先占位
function onOpenMultiSelect() {
  multiSelectOpen.value = true
  console.log('[Home] 打开屋面多选 modal (阶段 6 接入)')
}

function onSelectRoof(roof) {
  // 阶段 1 占位:三维点屋顶的事件先接住,后续状态 D 用
  if (pvMode.value) selectedRoof.value = roof
}

// ---------------- 相机坐标实时上报 ----------------
const camera = ref({
  lng: 104.320368,
  lat: 30.412588,
  elevation: 419.4,
  heading: 7,
  pitch: -26,
  viewHeight: 693.8
})

const perf = ref({ frameMs: 16.65, fps: 60 })

function onCameraChange(info) {
  camera.value = { ...camera.value, ...info }
}

// 简易 FPS 计算(后续可以接 Cesium scene postRender)
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
.home {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

/* 三维填满整个屏幕 (顶部栏 / 状态栏会浮在上面) */
.model-stage {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* 选中屋顶后给场景压一层半透明黑;不挡指针(还能继续点其它屋顶) */
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

</style>

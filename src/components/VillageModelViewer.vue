<template>
  <div class="model-viewer">
    <div ref="containerRef" class="cesium-container"></div>

    <div v-if="loading" class="overlay-status loading">
      <div class="spinner"></div>
      <div>三维模型加载中...</div>
    </div>

    <div v-if="error" class="overlay-status error">
      <div class="error-icon">!</div>
      <div class="error-text">{{ error }}</div>
      <div class="error-hint">
        提示:若提示 CORS / 403,请联系模型服务器管理员开启跨域。
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as Cesium from 'cesium'
import { mapMarkers } from '../data/villageData.js'
import { applyTiandituBasemap } from '../utils/tianditu.js'
import markerFire from '../assets/village/marker-fire.png'
import markerCar from '../assets/village/marker-car.png'
import markerMonitor from '../assets/village/marker-monitor.png'
import iconFire from '../assets/village/icon-fire.png'
import iconCamera from '../assets/village/icon-camera.png'
import iconCar from '../assets/village/icon-car.png'
import iconWalking from '../assets/village/icon-walking.png'

// 村情村貌 3D 模型地址,从 .env 读取(VITE_TILESET_SHIPANTAN)
const TILESET_URL = import.meta.env.VITE_TILESET_SHIPANTAN

// 村边界线 KMZ 文件(把主管发的 石盘滩.kmz 放到 public/ 目录,改名为 shipantan.kmz)
const BOUNDARY_KMZ_URL = '/shipantan.kmz'

// 模型整体垂直偏移(米)。负值 = 往下沉,让模型边缘贴合天地图卫星底图。
// 调试口诀:还悬空就更负(如 -200),沉太深陷进地里就往 0 调
const MODEL_HEIGHT_OFFSET = -250

const emit = defineEmits(['camera-change'])

const containerRef = ref(null)
const loading = ref(true)
const error = ref('')

let viewer = null
let tileset = null
let isInitialized = false
// 模型包围球,用于初始定位与"回到默认视角"
let homeBoundingSphere = null

// 坐标拾取工具状态
const pickMode = ref(false)
const pickedPoints = ref([])
let pickHandler = null
const pickEntities = []

async function initCesium() {
  if (isInitialized) return
  isInitialized = true

  try {
    Cesium.Ion.defaultAccessToken = ''

    viewer = new Cesium.Viewer(containerRef.value, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      infoBox: false,
      selectionIndicator: false,
      fullscreenButton: false,
      shouldAnimate: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      useBrowserRecommendedResolution: false,
      baseLayer: false,
      skyBox: false,
      skyAtmosphere: false
    })

    viewer.clock.shouldAnimate = false
    viewer.trackedEntity = undefined

    if (viewer.cesiumWidget && viewer.cesiumWidget.creditContainer) {
      viewer.cesiumWidget.creditContainer.style.display = 'none'
    }

    // 显示地球 + 天地图卫星底图(主管要求:模型叠加到卫星地图上)
    const scene = viewer.scene
    applyTiandituBasemap(viewer)

    scene.fog.enabled = false
    scene.skyAtmosphere && (scene.skyAtmosphere.show = false)
    if (scene.sun) scene.sun.show = false
    if (scene.moon) scene.moon.show = false
    scene.backgroundColor = Cesium.Color.fromCssColorString('#050b1a')

    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5)
    if ('msaaSamples' in scene) scene.msaaSamples = 2
    if (scene.postProcessStages && scene.postProcessStages.fxaa) {
      scene.postProcessStages.fxaa.enabled = false
    }

    // 相机控制器:无惯性、低敏感度
    const controller = scene.screenSpaceCameraController
    controller.enableRotate = true
    controller.enableTranslate = true
    controller.enableZoom = true
    controller.enableTilt = true
    controller.enableLook = false
    controller.inertiaSpin = 0
    controller.inertiaTranslate = 0
    controller.inertiaZoom = 0
    controller.zoomFactor = 1.5
    controller._zoomFactor = 1.5
    controller.minimumZoomDistance = 30
    controller.maximumZoomDistance = 20000
    controller.enableCollisionDetection = false

    scene.camera.percentageChanged = 0.001
    scene.camera.changed.addEventListener(emitCameraInfo)
    emitCameraInfo()

    await loadTileset()

    loading.value = false
  } catch (e) {
    console.error('[VillageModelViewer] 模型加载失败:', e)
    loading.value = false
    error.value = '模型加载失败,请检查 3D Tiles 地址或跨域配置'
  }
}

// 沿模型中心的"地面法线"方向整体平移 dh 米(正=升高,负=下沉)。
// 用 modelMatrix 实现,不改动原始瓦片数据。
function applyHeightOffset(ts, dh) {
  if (!dh) return
  const carto = Cesium.Cartographic.fromCartesian(ts.boundingSphere.center)
  const surface = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, 0)
  const target = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, dh)
  const translation = Cesium.Cartesian3.subtract(target, surface, new Cesium.Cartesian3())
  ts.modelMatrix = Cesium.Matrix4.fromTranslation(translation)
}

async function loadTileset() {
  if (tileset) return

  tileset = await Cesium.Cesium3DTileset.fromUrl(TILESET_URL, {
    maximumScreenSpaceError: 1,
    skipLevelOfDetail: true,
    immediatelyLoadDesiredLevelOfDetail: false,
    loadSiblings: true,
    cullWithChildrenBounds: false
  })

  tileset.maximumMemoryUsage = 2048
  tileset.preloadWhenHidden = true

  viewer.scene.primitives.add(tileset)

  // 模型整体下沉,贴合天地图卫星底图
  applyHeightOffset(tileset, MODEL_HEIGHT_OFFSET)

  if (tileset.readyEvent && typeof tileset.readyEvent.addEventListener === 'function') {
    tileset.readyEvent.addEventListener(() => {
      viewer && !viewer.isDestroyed() && viewer.scene.requestRender()
    })
  }

  // 新模型坐标未知:用包围球自动定位
  homeBoundingSphere = tileset.boundingSphere

  // 入场动画:从高空俯视俯冲下来,倾斜到 45°
  entranceFlyTo()

  // POI 占位标记(锚在模型上)
  addMarkers()

  // 叠加村边界线(主管发的 石盘滩.kmz)
  loadBoundary()

  viewer.scene.requestRender()
}

// 加载并样式化村边界线。Cesium 自带 KmlDataSource,可直接读 .kmz(压缩的 kml)
let boundaryDataSource = null
async function loadBoundary() {
  if (boundaryDataSource) return
  try {
    const ds = await Cesium.KmlDataSource.load(BOUNDARY_KMZ_URL, {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
      clampToGround: true
    })
    if (!viewer || viewer.isDestroyed()) return
    boundaryDataSource = ds
    viewer.dataSources.add(ds)

    // 统一描边样式:青色边界线 + 半透明填充
    const lineColor = Cesium.Color.fromCssColorString('#40e0d0')
    ds.entities.values.forEach((ent) => {
      if (ent.polygon) {
        ent.polygon.material = lineColor.withAlpha(0.12)
        ent.polygon.outline = true
        ent.polygon.outlineColor = lineColor
        ent.polygon.outlineWidth = 3
        ent.polygon.height = undefined
        ent.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND
      }
      if (ent.polyline) {
        ent.polyline.material = lineColor
        ent.polyline.width = 3
        ent.polyline.clampToGround = true
      }
    })
    viewer.scene.requestRender()
  } catch (e) {
    // 边界文件没放/加载失败时不影响模型显示,仅告警
    console.warn('[VillageModelViewer] 村边界 KMZ 加载失败(确认 public/shipantan.kmz 是否存在):', e)
  }
}

// 入场过渡:先把相机放到更高更远的俯视位,再飞向正常视角
function entranceFlyTo() {
  if (!viewer || viewer.isDestroyed() || !homeBoundingSphere) return
  const startOffset = new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(0),
    Cesium.Math.toRadians(-78),
    homeBoundingSphere.radius * 4.5
  )
  viewer.camera.viewBoundingSphere(homeBoundingSphere, startOffset)
  viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)

  const endOffset = new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(0),
    Cesium.Math.toRadians(-45),
    homeBoundingSphere.radius * 2.0
  )
  viewer.camera.flyToBoundingSphere(homeBoundingSphere, { offset: endOffset, duration: 2.0 })
  viewer.scene.requestRender()
}

// ---------------- POI 标记(边框 PNG + 内部图标 PNG 合成,图标按帧色着色) ----------------
// color = 该边框的强调色,内部白色图标会被重新着色成这个颜色
const MARKER_TYPES = {
  fire:    { frame: markerFire,    icon: iconFire,    color: '#ff7a3d' }, // 橙
  monitor: { frame: markerMonitor, icon: iconCamera,  color: '#3fe07a' }, // 绿
  car:     { frame: markerCar,     icon: iconCar,     color: '#4d9fff' }, // 蓝
  person:  { frame: markerCar,     icon: iconWalking, color: '#4d9fff' }  // 行人,复用蓝框
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// 把"边框图 + 内部图标"画到一张 canvas 上(Cesium billboard 只能用单张图)。
// 内部图标先用 source-in 重新着色成 tintColor,再叠到边框中央。
async function buildMarkerImage(frameSrc, iconSrc, tintColor) {
  const [frame, icon] = await Promise.all([loadImage(frameSrc), loadImage(iconSrc)])
  const w = frame.naturalWidth || 96
  const h = frame.naturalHeight || 120
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.drawImage(frame, 0, 0, w, h)

  // 离屏给图标重新上色(白色剪影 → tintColor)
  const gSize = Math.round(w * 0.5)
  const ic = document.createElement('canvas')
  ic.width = gSize
  ic.height = gSize
  const ictx = ic.getContext('2d')
  ictx.drawImage(icon, 0, 0, gSize, gSize)
  ictx.globalCompositeOperation = 'source-in'
  ictx.fillStyle = tintColor
  ictx.fillRect(0, 0, gSize, gSize)

  // 叠到边框上方方形区(约高度 40%)
  ctx.drawImage(ic, (w - gSize) / 2, h * 0.40 - gSize / 2, gSize, gSize)
  return canvas
}

// POI 标记,锚在拾取到的真实经纬度上(随相机移动贴地)
async function addMarkers() {
  if (!viewer || viewer.isDestroyed()) return

  for (const m of mapMarkers) {
    const def = MARKER_TYPES[m.type] || MARKER_TYPES.fire
    let canvas
    try {
      canvas = await buildMarkerImage(def.frame, def.icon, def.color)
    } catch (_) {
      continue
    }
    if (!viewer || viewer.isDestroyed()) return
    const ratio = canvas.width / canvas.height
    const dispH = 56
    viewer.entities.add({
      id: `poi-${m.id}`,
      // 加上 MODEL_HEIGHT_OFFSET,让图标跟着下沉后的模型走,不再悬空
      position: Cesium.Cartesian3.fromDegrees(m.lng, m.lat, m.height + MODEL_HEIGHT_OFFSET),
      billboard: {
        image: canvas,
        width: dispH * ratio,
        height: dispH,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      properties: { kind: 'poi', type: m.type }
    })
  }
  viewer.scene.requestRender()
}

// 定位到模型整体:基于包围球,heading 0 / pitch -45
function flyToHome(animate) {
  if (!viewer || viewer.isDestroyed() || !homeBoundingSphere) return
  const offset = new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(0),
    Cesium.Math.toRadians(-45),
    homeBoundingSphere.radius * 2.0
  )
  if (animate) {
    viewer.camera.flyToBoundingSphere(homeBoundingSphere, { offset, duration: 1.2 })
  } else {
    viewer.camera.viewBoundingSphere(homeBoundingSphere, offset)
    // viewBoundingSphere 会锁定 transform,用完立刻解除,否则平移/缩放会很怪
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
  }
  viewer.scene.requestRender()
}

function emitCameraInfo() {
  if (!viewer || viewer.isDestroyed()) return
  const cam = viewer.camera
  try {
    const carto = Cesium.Cartographic.fromCartesian(cam.positionWC)
    emit('camera-change', {
      lng: Cesium.Math.toDegrees(carto.longitude),
      lat: Cesium.Math.toDegrees(carto.latitude),
      elevation: carto.height,
      heading: Cesium.Math.toDegrees(cam.heading),
      pitch: Cesium.Math.toDegrees(cam.pitch),
      viewHeight: carto.height
    })
  } catch (_) {}
}

// ---------------- 给父组件用的相机控制方法 ----------------
function zoomIn() {
  if (!viewer || viewer.isDestroyed()) return
  const dist = Math.max(viewer.camera.positionCartographic.height * 0.2, 50)
  viewer.camera.zoomIn(dist)
  viewer.scene.requestRender()
}
function zoomOut() {
  if (!viewer || viewer.isDestroyed()) return
  const dist = Math.max(viewer.camera.positionCartographic.height * 0.25, 60)
  viewer.camera.zoomOut(dist)
  viewer.scene.requestRender()
}
function resetView() {
  flyToHome(true)
}

// ---------------- 坐标拾取工具 ----------------
// 开启后:左键点模型 → 打印并复制该点 [经度,纬度,高度],同时打印相对模型中心的偏移(dLng/dLat,方便填 mapMarkers)
function togglePickMode() {
  pickMode.value = !pickMode.value
  if (!viewer || viewer.isDestroyed()) return pickMode.value
  if (pickMode.value) {
    enablePickHandler()
    if (containerRef.value) containerRef.value.style.cursor = 'crosshair'
  } else {
    disablePickHandler()
    if (containerRef.value) containerRef.value.style.cursor = ''
  }
  return pickMode.value
}

function enablePickHandler() {
  if (!viewer || pickHandler) return
  pickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  pickHandler.setInputAction((click) => {
    const cartesian = viewer.scene.pickPosition(click.position)
    if (!Cesium.defined(cartesian)) {
      console.warn('[拾取] 该位置无可拾取深度,请点在模型表面上')
      return
    }
    const carto = Cesium.Cartographic.fromCartesian(cartesian)
    const lng = Cesium.Math.toDegrees(carto.longitude)
    const lat = Cesium.Math.toDegrees(carto.latitude)
    const height = carto.height
    pickedPoints.value.push({ lng, lat, height })
    const idx = pickedPoints.value.length

    const entity = viewer.entities.add({
      position: cartesian,
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString('#ff4d4f'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      label: {
        text: `#${idx}`,
        font: 'bold 13px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -18),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    })
    pickEntities.push(entity)

    const abs = `[${lng.toFixed(7)}, ${lat.toFixed(7)}, ${height.toFixed(2)}]`
    let rel = ''
    if (homeBoundingSphere) {
      try {
        const c = Cesium.Cartographic.fromCartesian(homeBoundingSphere.center)
        const dLng = (lng - Cesium.Math.toDegrees(c.longitude)).toFixed(6)
        const dLat = (lat - Cesium.Math.toDegrees(c.latitude)).toFixed(6)
        rel = `  相对中心: dLng: ${dLng}, dLat: ${dLat}`
      } catch (_) {}
    }
    console.log(`[拾取#${idx}] ${abs}${rel}`)
    copyToClipboard(abs)
    viewer.scene.requestRender()
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

function disablePickHandler() {
  if (pickHandler) {
    pickHandler.destroy()
    pickHandler = null
  }
}

function clearPicks() {
  pickedPoints.value = []
  if (viewer && !viewer.isDestroyed()) {
    pickEntities.forEach((e) => viewer.entities.remove(e))
    viewer.scene.requestRender()
  }
  pickEntities.length = 0
}

function copyAllPicks() {
  if (!pickedPoints.value.length) return
  const arr = pickedPoints.value.map((p) => [
    +p.lng.toFixed(7), +p.lat.toFixed(7), +p.height.toFixed(2)
  ])
  const txt = JSON.stringify(arr)
  copyToClipboard(txt)
  console.log('[全部坐标已复制]', txt)
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {})
  }
}

defineExpose({ zoomIn, zoomOut, resetView, togglePickMode, clearPicks, copyAllPicks, pickMode })

onMounted(() => {
  initCesium()
})

onBeforeUnmount(() => {
  disablePickHandler()
  if (viewer && !viewer.isDestroyed()) viewer.destroy()
  viewer = null
  tileset = null
  isInitialized = false
  homeBoundingSphere = null
  pickEntities.length = 0
  boundaryDataSource = null
})
</script>

<style scoped>
.model-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.cesium-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.cesium-container :deep(canvas) {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.cesium-container :deep(.cesium-viewer-bottom) {
  display: none;
}

.overlay-status {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(5, 11, 26, 0.75);
  color: #e6f1ff;
  z-index: 5;
}

.loading {
  color: #40e0d0;
  font-size: 14px;
  letter-spacing: 2px;
}

.spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid rgba(64, 224, 208, 0.2);
  border-top-color: #40e0d0;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: #ff7676;
}

.error-icon {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
}

.error-text {
  font-size: 15px;
  font-weight: 600;
}

.error-hint {
  color: #a0aec0;
  font-size: 12px;
  max-width: 360px;
  text-align: center;
}
</style>

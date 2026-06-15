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
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as Cesium from 'cesium'
import { roofList } from '../data/mockRoofs.js'
import { applyTiandituBasemap } from '../utils/tianditu.js'
import { currentRegion, REGIONS } from '../store/region.js'
import { addBoundaries, removeBoundaries } from '../utils/boundary.js'
import houseIcon from '../assets/icons/house.png'
import houseRing from '../assets/icons/house-ring.svg'

// 当前社区配置(全局切换):石岗=带数据,石盘滩=纯模型。切换时整体重载模型。
function regionCfg() {
  return REGIONS[currentRegion.value] || REGIONS.shigang
}

// 石岗村模型中心点(用户指定)
const MODEL_CENTER = {
  lng: 104.324842,
  lat: 30.400947,
  height: 1200
}

const props = defineProps({
  selectedRoof: { type: Object, default: null },
  // 是否显示屋顶图标标记(只有进入光伏测算模式才显示)
  showMarkers: { type: Boolean, default: false }
})

const emit = defineEmits(['select-roof', 'camera-change'])

const containerRef = ref(null)
const loading = ref(true)
const error = ref('')

// 坐标拾取状态
const pickMode = ref(false)
const pickedPoints = ref([])

// 模块级单例:viewer / tileset 只创建一次,初始 flyTo 只触发一次
let viewer = null
let tileset = null
let isInitialized = false
let hasInitialFlyTo = false
let boundaryDataSources = []
let pickHandler = null
let selectHandler = null
const pickEntities = []
// roof id -> { ring1, ring2, house } 屋顶图标标记
const markerEntityMap = new Map()

async function initCesium() {
  // 重复挂载守卫:无论什么原因被调多次,都不会再次创建 viewer
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
      // 按需渲染:空闲时 CPU/GPU 占用接近 0
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      // 关键:Cesium 默认会按浏览器"推荐分辨率"渲染(通常低于原生),
      // 设为 false 让 canvas 使用 1:1 物理像素,不再发糊
      useBrowserRecommendedResolution: false,
      // 不要默认底图、太阳/月亮/星空,场景不会随时间动
      baseLayer: false,
      skyBox: false,
      skyAtmosphere: false
    })

    // 停掉时钟,防止太阳/光照随时间自动变化
    viewer.clock.shouldAnimate = false
    viewer.trackedEntity = undefined

    // 隐藏版权信息容器
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

    // 渲染清晰度:DPR 封顶 1.5,避免高 DPI 屏 GPU 被压死导致画面出不来
    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, 1.5)
    // MSAA 2x 比 4x 性能宽松一半,大多数 GPU 都吃得下;实在不行可降到 1
    if ('msaaSamples' in scene) {
      scene.msaaSamples = 2
    }
    if (scene.postProcessStages && scene.postProcessStages.fxaa) {
      scene.postProcessStages.fxaa.enabled = false
    }

    // ---------- 相机控制器:无惯性、低敏感度、不会松手后乱飘 ----------
    const controller = scene.screenSpaceCameraController
    controller.enableRotate = true
    controller.enableTranslate = true
    controller.enableZoom = true
    controller.enableTilt = true
    controller.enableLook = false

    // 无惯性 -> 松开鼠标立即停止
    controller.inertiaSpin = 0
    controller.inertiaTranslate = 0
    controller.inertiaZoom = 0

    // 降低缩放灵敏度。Cesium 内部使用 _zoomFactor,新版本也暴露 zoomFactor。两个都设保险
    controller.zoomFactor = 1.5
    controller._zoomFactor = 1.5

    controller.minimumZoomDistance = 30
    controller.maximumZoomDistance = 8000

    // 关闭碰撞检测,镜头不会被地形/模型顶开
    controller.enableCollisionDetection = false

    // 相机移动时把"经纬度/海拔/方向/俯仰角/视高"上报给父组件(用于底部状态栏)
    scene.camera.percentageChanged = 0.001
    scene.camera.changed.addEventListener(emitCameraInfo)
    // 首次也立刻 emit 一次,避免状态栏一开始是 placeholder
    emitCameraInfo()

    await loadTileset()

    loading.value = false
  } catch (e) {
    console.error('[ModelViewer] 模型加载失败:', e)
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

  // 显示优先:先把低 LOD 显示出来,后台流式加载高 LOD,避免长时间黑屏
  // - immediatelyLoadDesiredLevelOfDetail = false :有什么瓦片就先用什么,不等目标 LOD
  // - skipLevelOfDetail = false :仍然逐级加载,保证最终能到 L17
  // - maximumScreenSpaceError = 1 :接近最高清晰度,但比 0.8 性能宽松,画面更快稳定
  tileset = await Cesium.Cesium3DTileset.fromUrl(regionCfg().tileset, {
    maximumScreenSpaceError: 1,
    skipLevelOfDetail: true,
    immediatelyLoadDesiredLevelOfDetail: false,
    loadSiblings: true,
    cullWithChildrenBounds: false
  })

  // 提高内存上限,避免高级 LOD 瓦片被早早回收又重新下载
  tileset.maximumMemoryUsage = 2048
  tileset.preloadWhenHidden = true

  viewer.scene.primitives.add(tileset)

  // 模型整体下沉,贴合天地图卫星底图
  applyHeightOffset(tileset, regionCfg().heightOffset)

  if (tileset.readyEvent && typeof tileset.readyEvent.addEventListener === 'function') {
    tileset.readyEvent.addEventListener(() => {
      // 模型 ready 后让 Cesium 重绘一次(配合 requestRenderMode)
      viewer && !viewer.isDestroyed() && viewer.scene.requestRender()
    })
  }

  // ---------- 关键:相机用 setView 硬编码定位 ----------
  // setView 是 Cesium 里最朴素的相机 API:同步、原子、不依赖任何会变化的对象
  // 不依赖 boundingSphere(那东西会随瓦片加载变化,导致相机看起来在"动")
  // 不要把这段逻辑写进 watch / watchEffect / onUpdated / setInterval / requestAnimationFrame
  if (!hasInitialFlyTo) {
    hasInitialFlyTo = true

    // 调试用:打印一次模型中心,方便后续微调坐标
    try {
      const bs = tileset.boundingSphere
      const carto = Cesium.Cartographic.fromCartesian(bs.center)
      console.log(
        '[ModelViewer] 模型中心 lng=%f lat=%f height=%f radius=%f',
        Cesium.Math.toDegrees(carto.longitude),
        Cesium.Math.toDegrees(carto.latitude),
        carto.height,
        bs.radius
      )
    } catch (_) {}

    // 用模型包围球自动定位:对准模型中心 + 填满视野(distance = 半径 ×2)
    // 不靠硬编码坐标,模型多大就框多大,始终居中、看得清
    const bs0 = tileset.boundingSphere
    const offset0 = new Cesium.HeadingPitchRange(
      Cesium.Math.toRadians(0),
      Cesium.Math.toRadians(-90), // 正摄(垂直俯瞰),与天地图吻合度最高
      bs0.radius * 2.0
    )
    viewer.camera.viewBoundingSphere(bs0, offset0)
    // viewBoundingSphere 会锁定相机 transform,立刻解除,否则后续平移/缩放会很怪
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)

    console.log('[ModelViewer] 初始视角定位完成(基于模型包围球)')
  }

  // 注册"选屋顶"点击处理器(实际触发依赖 markerEntityMap,无标记时点击是 no-op)
  enableSelectHandler()

  // 初始即要求显示屋顶标记(如低碳生活页 show-markers=true):模型就绪后立即渲染。
  // watch(showMarkers) 非 immediate,当它恒为 true 时不会触发,这里兜底渲染。
  // 仅在叠加数据的社区(石岗)渲染;石盘滩为纯模型,不显示屋顶数据。
  if (props.showMarkers && regionCfg().showData) {
    if (!markerEntityMap.size) renderRoofMarkers()
    setMarkersVisible(true)
  }

  // 村界线:每个社区显示各自的边界,与"是否叠数据"无关
  loadBoundary()

  // 让按需渲染管线立刻刷一次
  viewer.scene.requestRender()
}

// 加载当前社区的村界线(可多个文件,样式与加载逻辑见 utils/boundary.js)
async function loadBoundary() {
  if (boundaryDataSources.length) return
  boundaryDataSources = await addBoundaries(viewer, regionCfg().boundaryKmz)
}

// ---------------- 全局社区切换:整体重载模型 ----------------
function clearMarkers() {
  if (!viewer || viewer.isDestroyed()) return
  markerEntityMap.forEach(({ ring1, ring2, house }) => {
    viewer.entities.remove(ring1)
    viewer.entities.remove(ring2)
    viewer.entities.remove(house)
  })
  markerEntityMap.clear()
}

async function switchRegion() {
  if (!viewer || viewer.isDestroyed()) return
  loading.value = true
  error.value = ''
  try {
    stopMarkerAnim()
    clearMarkers()
    removeBoundaries(viewer, boundaryDataSources)
    boundaryDataSources = []
    if (tileset) {
      viewer.scene.primitives.remove(tileset)
      tileset = null
    }
    // 让新模型重新居中
    hasInitialFlyTo = false
    await loadTileset()
    loading.value = false
  } catch (e) {
    console.error('[ModelViewer] 切换社区失败:', e)
    loading.value = false
    error.value = '模型加载失败,请检查 3D Tiles 地址或跨域配置'
  }
}

watch(currentRegion, () => {
  switchRegion()
})

// ---------------- 相机坐标上报 ----------------

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
  } catch (_) {
    // 模型未就绪时忽略
  }
}

// ---------------- 屋顶图标标记(阶段 4 起使用) ----------------
// 每个屋顶 = ring1 + ring2(相位差 1s) + house
// ring 的 size / alpha 用 Cesium CallbackProperty 按时间脉动 — 完美还原原 SVG 动画
// 动画期间通过 requestAnimationFrame 不断 requestRender,只在 pvMode 开时跑
// 做这个好累 累死了
const RING_BASE_NORMAL = 100
const RING_BASE_ACTIVE = 200      // 选中态比常态大近一倍 -> 视觉冲击
const HOUSE_SIZE_NORMAL = 35
const HOUSE_SIZE_ACTIVE = 42
// ⚠⚠⚠ 不要把 NORMAL 改成 RED!这两行影响所有屋顶图标的染色,常态必须是 WHITE ⚠⚠⚠
const HOUSE_COLOR_NORMAL = Cesium.Color.WHITE                          // 常态 = 白(不染色,保持 PNG 原貌)
const HOUSE_COLOR_ACTIVE = Cesium.Color.fromCssColorString('#79ABFF')  // 选中 = 蓝(配合光圈色)
const ANIM_DURATION = 2.0        // 一个脉动周期(秒)

let markerAnimRaf = 0
const ANIM_START = performance.now()

function ringT(phaseOffset) {
  const elapsed = (performance.now() - ANIM_START) / 1000
  return ((elapsed + phaseOffset) % ANIM_DURATION) / ANIM_DURATION
}
function ringSizeFor(roofId, phaseOffset) {
  const t = ringT(phaseOffset)
  const active = props.selectedRoof && props.selectedRoof.id === roofId
  const base = active ? RING_BASE_ACTIVE : RING_BASE_NORMAL
  return base * (0.3 + t * 2.0)              // 0.3x → 2.3x
}
function ringColorFor(phaseOffset, roofId) {
  const t = ringT(phaseOffset)
  const active = props.selectedRoof && props.selectedRoof.id === roofId
  // ⚠ 选中态光圈色,跟 HOUSE_COLOR_ACTIVE 保持一致(蓝色 #79ABFF)
  if (active) {
    return Cesium.Color.fromCssColorString('#79ABFF').withAlpha(Math.max(0.6, 1 - t))
  }
  return Cesium.Color.WHITE.withAlpha(Math.max(0, 1 - t))
}

function startMarkerAnim() {
  if (markerAnimRaf) return
  const loop = () => {
    if (!viewer || viewer.isDestroyed()) { markerAnimRaf = 0; return }
    viewer.scene.requestRender()
    markerAnimRaf = requestAnimationFrame(loop)
  }
  markerAnimRaf = requestAnimationFrame(loop)
}
function stopMarkerAnim() {
  if (markerAnimRaf) {
    cancelAnimationFrame(markerAnimRaf)
    markerAnimRaf = 0
  }
}

function buildRing(roof, pos, phaseOffset, idTag) {
  return viewer.entities.add({
    id: `roof-${idTag}-${roof.id}`,
    position: pos,
    billboard: {
      image: houseRing,
      width: new Cesium.CallbackProperty(() => ringSizeFor(roof.id, phaseOffset), false),
      height: new Cesium.CallbackProperty(() => ringSizeFor(roof.id, phaseOffset), false),
      color: new Cesium.CallbackProperty(() => ringColorFor(phaseOffset, roof.id), false),
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    },
    properties: { roofId: roof.id, kind: 'roof-marker' }
  })
}

function renderRoofMarkers() {
  if (!viewer || viewer.isDestroyed()) return
  if (markerEntityMap.size) return
  roofList.forEach((roof) => {
    if (!roof.center) return
    const { lng, lat, height } = roof.center
    // 加上当前社区的垂直偏移,让图标跟着下沉后的模型走,不再悬空
    const pos = Cesium.Cartesian3.fromDegrees(lng, lat, height + 6 + regionCfg().heightOffset)

    const ring1 = buildRing(roof, pos, 0,   'ring1') // 主圈,起始相位 0
    const ring2 = buildRing(roof, pos, 1.0, 'ring2') // 副圈,相位差 1s

    // 小房子叠在中心
    const house = viewer.entities.add({
      id: `roof-house-${roof.id}`,
      position: pos,
      billboard: {
        image: houseIcon,
        width: HOUSE_SIZE_NORMAL,
        height: HOUSE_SIZE_NORMAL,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        // 小负 eyeOffset 把 house 强制压在 ring 上方
        eyeOffset: new Cesium.Cartesian3(0, 0, -1),
        pixelOffset: new Cesium.Cartesian2(0, -2)
      },
      properties: { roofId: roof.id, kind: 'roof-marker' }
    })

    markerEntityMap.set(roof.id, { ring1, ring2, house })
  })
  viewer.scene.requestRender()
}

function setMarkersVisible(visible) {
  if (!markerEntityMap.size) return
  markerEntityMap.forEach(({ ring1, ring2, house }) => {
    ring1.show = visible
    ring2.show = visible
    house.show = visible
  })
  if (visible) {
    // 重新显示时按当前 selectedRoof 同步一次颜色,防止上次的高亮残留
    highlightMarker(props.selectedRoof ? props.selectedRoof.id : null)
    startMarkerAnim()
  } else {
    // 隐藏时也提前把颜色清干净,避免下次显示前那一帧闪红
    highlightMarker(null)
    stopMarkerAnim()
  }
  if (viewer && !viewer.isDestroyed()) viewer.scene.requestRender()
}

function highlightMarker(activeId) {
  if (!viewer || viewer.isDestroyed()) return
  // ring 的尺寸/透明度由 CallbackProperty 通过 props.selectedRoof 自动联动
  markerEntityMap.forEach(({ house }, id) => {
    const active = id === activeId
    house.billboard.width = active ? HOUSE_SIZE_ACTIVE : HOUSE_SIZE_NORMAL
    house.billboard.height = active ? HOUSE_SIZE_ACTIVE : HOUSE_SIZE_NORMAL
    // 选中态:房子图标染暖黄,跟常态的白色一眼能区分
    house.billboard.color = active ? HOUSE_COLOR_ACTIVE : HOUSE_COLOR_NORMAL
  })
  viewer.scene.requestRender()
}

// watch:进入/退出光伏测算模式 → 渲染并控制标记可见性
// 石盘滩为纯模型,即便 showMarkers=true 也不渲染屋顶数据
watch(
  () => props.showMarkers,
  (show) => {
    if (show && regionCfg().showData) {
      if (!markerEntityMap.size) renderRoofMarkers()
      else setMarkersVisible(true)
    } else {
      setMarkersVisible(false)
    }
  }
)

// ---------------- 飞行到选中屋顶 ----------------

function flyToRoof(roof) {
  if (!viewer || viewer.isDestroyed() || !roof || !roof.center) return
  const { lng, lat, height } = roof.center
  viewer.camera.flyTo({
    // 垂直俯瞰:相机正对屋顶正上方(不再做 lat 横向偏移,否则屋顶会被顶到画面上方)
    destination: Cesium.Cartesian3.fromDegrees(lng, lat, height + 220 + regionCfg().heightOffset),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90), // 正摄(垂直俯瞰)
      roll: 0
    },
    duration: 1.2
  })
}

// watch 父组件传入的 selectedRoof,做图标标记高亮 + 飞行
watch(
  () => props.selectedRoof,
  (newRoof, oldRoof) => {
    if (!newRoof) {
      highlightMarker(null)
      return
    }
    highlightMarker(newRoof.id)
    if (!oldRoof || oldRoof.id !== newRoof.id) {
      flyToRoof(newRoof)
    }
  }
)

// ---------------- 三维 → 列表 反向联动 ----------------

function enableSelectHandler() {
  if (!viewer || selectHandler) return
  selectHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  selectHandler.setInputAction((click) => {
    // 拾取模式下让 pickHandler 处理,这里直接放行
    if (pickMode.value) return
    const picked = viewer.scene.pick(click.position)
    if (!Cesium.defined(picked) || !picked.id) return
    const entity = picked.id
    const roofIdProp = entity.properties && entity.properties.roofId
    const roofId = roofIdProp && roofIdProp.getValue
      ? roofIdProp.getValue(viewer.clock.currentTime)
      : undefined
    if (!roofId) return
    const roof = roofList.find((r) => r.id === roofId)
    if (roof) emit('select-roof', roof)
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

function disableSelectHandler() {
  if (selectHandler) {
    selectHandler.destroy()
    selectHandler = null
  }
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
  flyToModelCenter()
}

defineExpose({ zoomIn, zoomOut, resetView })

// 仅由用户点击按钮触发。基于模型包围球飞回,居中且填满视野
function flyToModelCenter() {
  if (!viewer || viewer.isDestroyed() || !tileset) return
  const bs = tileset.boundingSphere
  const offset = new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(0),
    Cesium.Math.toRadians(-90), // 正摄(垂直俯瞰)
    bs.radius * 2.0
  )
  viewer.camera.flyToBoundingSphere(bs, { offset, duration: 1.2 })
  viewer.scene.requestRender()
}

// ---------------- 坐标拾取工具 ----------------

function togglePickMode() {
  pickMode.value = !pickMode.value
  if (!viewer || viewer.isDestroyed()) return
  if (pickMode.value) {
    enablePickHandler()
    if (containerRef.value) containerRef.value.style.cursor = 'crosshair'
  } else {
    disablePickHandler()
    if (containerRef.value) containerRef.value.style.cursor = ''
  }
}

function enablePickHandler() {
  if (!viewer || pickHandler) return
  pickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  pickHandler.setInputAction((click) => {
    const cartesian = viewer.scene.pickPosition(click.position)
    if (!Cesium.defined(cartesian)) {
      console.warn('[拾取] 该位置无可拾取的深度,请点在屋面/地面上')
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

    const coordStr = `[${lng.toFixed(7)}, ${lat.toFixed(7)}, ${height.toFixed(2)}]`
    console.log(`[拾取#${idx}] ${coordStr}`)
    copyToClipboard(coordStr)

    viewer.scene.requestRender()
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
}

function disablePickHandler() {
  if (pickHandler) {
    pickHandler.destroy()
    pickHandler = null
  }
}

function copyAllPoints() {
  if (!pickedPoints.value.length) return
  const arr = pickedPoints.value.map((p) => [
    +p.lng.toFixed(7),
    +p.lat.toFixed(7),
    +p.height.toFixed(2)
  ])
  const txt = JSON.stringify(arr)
  copyToClipboard(txt)
  console.log('[全部坐标已复制]', txt)
}

function clearPoints() {
  pickedPoints.value = []
  if (viewer && !viewer.isDestroyed()) {
    pickEntities.forEach((e) => viewer.entities.remove(e))
    viewer.scene.requestRender()
  }
  pickEntities.length = 0
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {})
  }
}

onMounted(() => {
  initCesium()
})

onBeforeUnmount(() => {
  stopMarkerAnim()
  disablePickHandler()
  disableSelectHandler()
  if (viewer && !viewer.isDestroyed()) {
    viewer.destroy()
  }
  viewer = null
  tileset = null
  isInitialized = false
  hasInitialFlyTo = false
  boundaryDataSources = []
  pickEntities.length = 0
  markerEntityMap.clear()
})
</script>

<style scoped>
.model-viewer {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 用绝对定位让 cesium canvas 脱离布局流 */
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
  background: rgba(5, 11, 26, 0.55);
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
  to {
    transform: rotate(360deg);
  }
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

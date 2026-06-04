import * as Cesium from 'cesium'

// 天地图 token,从 .env 读取(VITE_TIANDITU_TOKEN)。支持多个,用英文逗号分隔。
// 多 token 轮换:每次请求瓦片轮流使用一个,把单 token 的限流配额成倍放大,显著减少 429。
const TDT_TOKENS = (import.meta.env.VITE_TIANDITU_TOKEN || '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean)

// 轮换指针:每取一次 +1,按 token 数量取模,均匀分摊请求
let tokenIdx = 0
function nextToken() {
  if (TDT_TOKENS.length === 0) return ''
  const t = TDT_TOKENS[tokenIdx % TDT_TOKENS.length]
  tokenIdx += 1
  return t
}

// 构造天地图 WMTS 影像图层。layer 取值:
//  'img_w' 卫星影像底图  /  'cia_w' 影像注记(地名/路名)
// 用 UrlTemplateImageryProvider(官方支持 customTags),tk 用 {tk} 占位,
// 由 customTags 在每次请求时动态填入,实现 token 轮换。
//  - TileMatrix={z} TileRow={y} TileCol={x}(天地图 w 矩阵集即缩放层级)
export function createTiandituProvider(layer) {
  const layerName = layer.split('_')[0] // img / cia
  return new Cesium.UrlTemplateImageryProvider({
    url:
      `https://t{s}.tianditu.gov.cn/${layer}/wmts?service=wmts&request=GetTile&version=1.0.0` +
      `&LAYER=${layerName}&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}` +
      `&style=default&format=tiles&tk={tk}`,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    maximumLevel: 17,
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
    // 每个瓦片请求动态取一个 token,轮流使用
    customTags: {
      tk: () => nextToken()
    },
    credit: new Cesium.Credit('天地图')
  })
}

// 在给定 viewer 上挂载天地图底图(卫星影像 + 影像注记)。
// 一行调用即可,两个三维组件复用同一套逻辑。
export function applyTiandituBasemap(viewer) {
  const scene = viewer.scene
  scene.globe.show = true
  scene.globe.depthTestAgainstTerrain = false
  scene.globe.baseColor = Cesium.Color.fromCssColorString('#050b1a')

  const layers = viewer.imageryLayers
  layers.removeAll()
  layers.addImageryProvider(createTiandituProvider('img_w')) // 卫星影像底图
  layers.addImageryProvider(createTiandituProvider('cia_w')) // 影像注记(地名)
}

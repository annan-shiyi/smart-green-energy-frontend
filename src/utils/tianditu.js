import * as Cesium from 'cesium'

// 天地图开发者 token,从 .env 读取(VITE_TIANDITU_TOKEN)
export const TDT_TOKEN = import.meta.env.VITE_TIANDITU_TOKEN

// 构造天地图 WMTS 影像图层。layer 取值:
//  'img_w' 卫星影像底图  /  'cia_w' 影像注记(地名/路名)
export function createTiandituProvider(layer) {
  const layerName = layer.split('_')[0] // img / cia
  return new Cesium.WebMapTileServiceImageryProvider({
    url:
      `https://t{s}.tianditu.gov.cn/${layer}/wmts?service=wmts&request=GetTile&version=1.0.0` +
      `&LAYER=${layerName}&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}` +
      `&style=default&format=tiles&tk=${TDT_TOKEN}`,
    layer: layerName,
    style: 'default',
    tileMatrixSetID: 'w',
    format: 'tiles',
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    maximumLevel: 17,
    tilingScheme: new Cesium.WebMercatorTilingScheme(),
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

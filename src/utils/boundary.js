import * as Cesium from 'cesium'

// 边界线统一描边样式:青色边界 + 半透明填充,贴地
const LINE_COLOR = Cesium.Color.fromCssColorString('#40e0d0')

// 加载并样式化村界线 KMZ/KML(Cesium 自带 KmlDataSource 可直接读 .kmz / .kml)。
// 成功返回 dataSource;url 为空或加载失败返回 null(不影响模型显示,仅告警)。
// encodeURI:文件名含中文时把路径转义,避免请求 404。
export async function addBoundary(viewer, url) {
  if (!viewer || viewer.isDestroyed() || !url) return null
  try {
    const ds = await Cesium.KmlDataSource.load(encodeURI(url), {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
      clampToGround: true
    })
    if (!viewer || viewer.isDestroyed()) return null
    viewer.dataSources.add(ds)

    ds.entities.values.forEach((ent) => {
      if (ent.polygon) {
        ent.polygon.material = LINE_COLOR.withAlpha(0.12)
        ent.polygon.outline = true
        ent.polygon.outlineColor = LINE_COLOR
        ent.polygon.outlineWidth = 3
        ent.polygon.height = undefined
        ent.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND
      }
      if (ent.polyline) {
        ent.polyline.material = LINE_COLOR
        ent.polyline.width = 3
        ent.polyline.clampToGround = true
      }
    })
    viewer.scene.requestRender()
    return ds
  } catch (e) {
    // 边界文件没放/加载失败时不影响模型显示,仅告警
    console.warn('[boundary] 村界 KMZ 加载失败(确认 public/ 下文件是否存在):', url, e)
    return null
  }
}

// 从 viewer 移除边界 dataSource
export function removeBoundary(viewer, ds) {
  if (viewer && !viewer.isDestroyed() && ds) {
    viewer.dataSources.remove(ds, true)
    viewer.scene.requestRender()
  }
}

// 批量加载一个社区的多个边界文件,返回成功加载的 dataSource 数组
export async function addBoundaries(viewer, urls) {
  if (!urls || !urls.length) return []
  const results = await Promise.all(urls.map((u) => addBoundary(viewer, u)))
  return results.filter(Boolean)
}

// 批量移除
export function removeBoundaries(viewer, list) {
  if (!list) return
  list.forEach((ds) => removeBoundary(viewer, ds))
}

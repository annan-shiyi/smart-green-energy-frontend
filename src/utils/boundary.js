import * as Cesium from 'cesium'

// 边界线样式(主管要求:只要边界、不要填充、红色粗线)
const LINE_COLOR = Cesium.Color.fromCssColorString('#ff2d2d')
const LINE_WIDTH = 3

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

    // 多边形:去掉填充和默认 1px 描边(Cesium polygon outlineWidth 在多数浏览器被锁 1px),
    // 改用「贴地红色粗线」勾出边界,这样线宽可控、不填充。
    const rings = []
    ds.entities.values.forEach((ent) => {
      if (ent.polygon) {
        try {
          const h = ent.polygon.hierarchy && ent.polygon.hierarchy.getValue(Cesium.JulianDate.now())
          const positions = h && (h.positions || h)
          if (positions && positions.length) rings.push(positions)
        } catch (_) {}
        ent.polygon.fill = false
        ent.polygon.outline = false
      }
      if (ent.polyline) {
        ent.polyline.material = LINE_COLOR
        ent.polyline.width = LINE_WIDTH
        ent.polyline.clampToGround = true
      }
    })
    // 多边形外环 → 闭合的红色贴地粗线
    rings.forEach((positions) => {
      const ring = positions.slice()
      ring.push(positions[0]) // 闭合
      ds.entities.add({
        polyline: {
          positions: ring,
          width: LINE_WIDTH,
          material: LINE_COLOR,
          clampToGround: true
        }
      })
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

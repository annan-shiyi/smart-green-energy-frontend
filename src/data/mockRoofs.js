// 每个屋顶的 polygon 为顺时针 4 个角点: [lng, lat, height]
// center 由 polygon 平均得出,用于相机 flyTo

function centerOf(polygon) {
  const n = polygon.length
  const sum = polygon.reduce(
    (acc, [lng, lat, h]) => {
      acc.lng += lng
      acc.lat += lat
      acc.h += h
      return acc
    },
    { lng: 0, lat: 0, h: 0 }
  )
  return { lng: sum.lng / n, lat: sum.lat / n, height: sum.h / n }
}

const rawRoofs = [
  {
    id: 'R001',
    seq: 1,
    name: '石岗村 1 号屋顶',
    buildingType: '村民住宅',
    roofArea: 120,
    usableArea: 75,            // 公司给的典型户:75 平方米
    roofType: '坡屋顶',
    orientation: '正南向',
    slope: 25,
    shadingLevel: '无遮挡',
    bearingCapacity: '较好',
    material: '彩钢瓦,状况良好',
    score: 95,
    recommendation: '建议安装',
    polygon: [
      [104.3242854, 30.4203874, 405.24],
      [104.3244109, 30.420346, 406.74],
      [104.3243863, 30.4202602, 406.34],
      [104.3242661, 30.4202837, 406.34]
    ]
  },
  {
    id: 'R002',
    seq: 2,
    name: '石岗村 2 号屋顶',
    buildingType: '村民住宅',
    roofArea: 86,
    usableArea: 54,            // 公司典型户型(三人户)
    roofType: '坡屋顶',
    orientation: '南偏东15°',
    slope: 12,
    shadingLevel: '轻微遮挡',
    bearingCapacity: '一般',
    material: '混凝土,状况良好',
    score: 82,
    recommendation: '建议安装',
    polygon: [
      [104.3257404, 30.4227926, 417.42],
      [104.3257982, 30.422635, 420.99],
      [104.3257288, 30.4226251, 417.6],
      [104.325667, 30.4227683, 417.41]
    ]
  },
  {
    id: 'R003',
    seq: 3,
    name: '石岗村公共建筑屋顶',
    buildingType: '公共建筑',
    roofArea: 210,
    usableArea: 75,            // 公司典型户型(无人户/公共建筑)
    roofType: '平屋顶',
    orientation: '正南向',
    slope: 5,
    shadingLevel: '无遮挡',
    bearingCapacity: '强',
    material: '钢筋混凝土,状况良好',
    score: 98,
    recommendation: '强烈建议',
    polygon: [
      [104.3289173, 30.42675, 413.72],
      [104.3290457, 30.4266846, 413.77],
      [104.3290053, 30.4266269, 413.74],
      [104.3288753, 30.4266906, 413.73]
    ]
  },
  {
    id: 'R004',
    seq: 4,
    name: '石岗村村委屋顶',
    buildingType: '公共建筑',
    roofArea: 160,
    usableArea: 63,            // 公司典型户型(四人户)
    roofType: '平屋顶',
    orientation: '南偏西20°',
    slope: 8,
    shadingLevel: '无遮挡',
    bearingCapacity: '强',
    material: '钢筋混凝土,状况良好',
    score: 90,
    recommendation: '建议安装',
    polygon: [
      [104.3260352, 30.4307298, 424.72],
      [104.3260082, 30.4306149, 425.06],
      [104.325934, 30.4306257, 425.05],
      [104.325957, 30.4307668, 420.8]
    ]
  },
  {
    id: 'R005',
    seq: 5,
    name: '石岗村农户屋顶',
    buildingType: '村民住宅',
    roofArea: 65,
    usableArea: 45,            // 公司典型户型(两人户)
    roofType: '坡屋顶',
    orientation: '东向',
    slope: 28,
    shadingLevel: '轻微遮挡',
    bearingCapacity: '弱',
    material: '青瓦,状况一般',
    score: 68,
    recommendation: '酌情评估',
    polygon: [
      [104.3247796, 30.4323999, 411.91],
      [104.3247345, 30.4322933, 411.89],
      [104.3246343, 30.4323228, 411.98],
      [104.3246759, 30.4324298, 412.07]
    ]
  }
]

export const roofList = rawRoofs.map((r) => ({
  ...r,
  center: centerOf(r.polygon)
}))

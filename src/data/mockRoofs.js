// 石盘滩屋顶数据
// center 为「坐标拾取工具」在石盘滩模型上取到的真实经纬度,
// 高度已换算回模型原始高度(拾取值 + 模型下沉量),图标渲染时再叠加 MODEL_HEIGHT_OFFSET,
// 这样无论模型下沉参数怎么调,蓝房子图标都能稳稳落在屋顶上。

const rawRoofs = [
  {
    id: 'R001',
    seq: 1,
    name: '石盘滩 1 号屋顶',
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
    center: { lng: 107.5961972, lat: 30.0527106, height: 149.92 }
  },
  {
    id: 'R002',
    seq: 2,
    name: '石盘滩 2 号屋顶',
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
    center: { lng: 107.5971918, lat: 30.0529927, height: 159.15 }
  },
  {
    id: 'R003',
    seq: 3,
    name: '石盘滩公共建筑屋顶',
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
    center: { lng: 107.5955558, lat: 30.0529803, height: 144.11 }
  },
  {
    id: 'R004',
    seq: 4,
    name: '石盘滩村委屋顶',
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
    center: { lng: 107.5956360, lat: 30.0532131, height: 150.49 }
  },
  {
    id: 'R005',
    seq: 5,
    name: '石盘滩农户屋顶',
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
    center: { lng: 107.5944258, lat: 30.0539784, height: 141.45 }
  }
]

export const roofList = rawRoofs

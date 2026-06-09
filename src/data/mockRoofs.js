// 石岗屋顶数据
// center 为「坐标拾取工具」在石岗模型上取到的真实经纬度(四角点几何中心),
// height 为石岗模型原始海拔(米),图标渲染时再叠加 MODEL_HEIGHT_OFFSET(-250),
// 这样无论模型下沉参数怎么调,蓝房子图标都能稳稳落在屋顶上。
// 原始四角点坐标见聊天记录(R001~R005,每个屋顶 4 个角),后续画光伏板可用。

const rawRoofs = [
  {
    id: 'R001',
    seq: 1,
    name: '石岗 1 号屋顶',
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
    center: { lng: 104.3243372, lat: 30.4203193, height: 406.17 }
  },
  {
    id: 'R002',
    seq: 2,
    name: '石岗 2 号屋顶',
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
    center: { lng: 104.3257310, lat: 30.4227412, height: 414.41 }
  },
  {
    id: 'R003',
    seq: 3,
    name: '石岗公共建筑屋顶',
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
    center: { lng: 104.3289609, lat: 30.4266880, height: 413.74 }
  },
  {
    id: 'R004',
    seq: 4,
    name: '石岗村委屋顶',
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
    center: { lng: 104.3259835, lat: 30.4307109, height: 422.09 }
  },
  {
    id: 'R005',
    seq: 5,
    name: '石岗农户屋顶',
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
    center: { lng: 104.3247061, lat: 30.4323615, height: 411.96 }
  }
]

export const roofList = rawRoofs

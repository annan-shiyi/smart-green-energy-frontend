// 村情村貌大屏数据(均按 PM 设计稿转写,需要调整直接改这里)

// 左上:社区概况
// 前 4 项排 2 列;从第 5 项起(常住人口/户籍人口/外流人口...)排 3 列。
export const communityStats = [
  { icon: 'area',     label: '面积',          value: '3.02', unit: '平方公里' },
  { icon: 'group',    label: '村民小组',      value: '6',    unit: '个' },
  { icon: 'household', label: '户籍户数',     value: '629',  unit: '户' },
  { icon: 'people',   label: '户籍人口',      value: '2041', unit: '人' },
  { icon: 'resident', label: '常住人口',      value: '1668', unit: '人' },
  { icon: 'people',   label: '户籍人口',      value: '923',  unit: '人' },
  { icon: 'outflow',  label: '外流人口',      value: '736',  unit: '人' },
  { icon: 'labor',    label: '户籍劳动力人口', value: '1278', unit: '人' },
  { icon: 'male',     label: '男性',          value: '697',  unit: '人' },
  { icon: 'female',   label: '女性',          value: '581',  unit: '人' }
]
// 2 列 / 3 列的分界(前 TOP_COLS_COUNT 项为 2 列)
export const communityTopCount = 4

// 左下:组织建设 - 党员构成(name / value / 颜色)
export const partyTotal = 59
export const orgMembers = [
  { name: '社区专职工作者',           value: 7,  color: '#33d6a6' },
  { name: '党支部书记',               value: 1,  color: '#3fa9f5' },
  { name: '党组织副书记',             value: 1,  color: '#9b8cff' },
  { name: '社区居委主任',             value: 1,  color: '#5ed3ff' },
  { name: '纪检委员、监察委员会主任', value: 1,  color: '#ff6b6b' },
  { name: '社区居委会委员',           value: 2,  color: '#ffb648' },
  { name: '网格党支部',               value: 6,  color: '#ff8a5c' },
  { name: '镇网格长',                 value: 10, color: '#7dd957' },
  { name: '其他工作者',               value: 30, color: '#c879ff' }
]

// 右上:土地资源
export const landMain = { label: '社区现有桔园', value: 300, unit: '亩' }
export const landStats = [
  { icon: 'staff', label: '员工数量', value: '2368', unit: '人' },
  { icon: 'agri',  label: '安保人员', value: '168',  unit: '人' },
  { icon: 'visit', label: '访客数量', value: '223',  unit: '人' }
]

// 右下:基础设施及公展配套(进度条)
export const infrastructure = [
  { rank: 'TOP1', label: '农户入户路硬化率',                          percent: 98.0 },
  { rank: 'TOP2', label: '农村自来水普及率',                          percent: 95.0 },
  { rank: 'TOP3', label: '4G网络、物流配送服务站点村邮站、垄区信息社覆盖率', percent: 100 },
  { rank: 'TOP4', label: 'C、D级危旧农房整治率',                      percent: 100 },
  { rank: 'TOP5', label: '户用无害化卫生厕所',                        percent: 95.7 },
  { rank: 'TOP6', label: '生活垃圾收集处置普及率',                    percent: 100 }
]

// 3D 模型页地图上的 POI 标记(占位)。
// 暂用「相对模型中心的经纬度偏移」摆放,等拿到真实坐标改成绝对 lng/lat 即可。
// color 是占位定位针颜色;label 仅做标识;type 留给后续替换真实图标用。
// type 对应三种边框图标:fire(橙·火焰) / car(蓝·汽车) / monitor(绿·监控)
// 坐标为拾取工具扒到的真实 [经度, 纬度, 高度]
export const mapMarkers = [
  { id: 'm1', type: 'fire',    label: '火警点', lng: 107.5954382, lat: 30.0531295, height: 140.54 },
  { id: 'm2', type: 'monitor', label: '监控点', lng: 107.5966268, lat: 30.0530493, height: 164.43 },
  { id: 'm3', type: 'car',     label: '车辆',   lng: 107.5953464, lat: 30.0535993, height: 150.53 },
  { id: 'm4', type: 'person',  label: '行人感应', lng: 107.5940997, lat: 30.0523410, height: 140.51 },
  { id: 'm5', type: 'fire',    label: '火警点', lng: 107.5980816, lat: 30.0527675, height: 151.04 }
]

// 底部导航
export const bottomNavItems = [
  { key: 'basic',   label: '基本情况' },
  { key: 'history', label: '历史事件' },
  { key: 'finance', label: '财务公开' }
]

// 地球首页上的发光点(top/left 为相对地球容器的百分比)。
// clickable: true 的点可点进 3D 模型页;其余为装饰光点。
// 真实地球图到位后,按图微调这些百分比即可。
export const globePoints = [
  { id: 'shigang', label: '石岗社区', top: '42%', left: '54%', clickable: true },
  { id: 'p2', top: '30%', left: '40%', clickable: false },
  { id: 'p3', top: '24%', left: '60%', clickable: false },
  { id: 'p4', top: '50%', left: '36%', clickable: false },
  { id: 'p5', top: '62%', left: '50%', clickable: false },
  { id: 'p6', top: '38%', left: '68%', clickable: false }
]

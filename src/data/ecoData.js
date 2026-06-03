// 低碳生活页数据(设计稿占位,可改)

// 电量测算:环形图(已安装/待安装/未安装)+ 中心总数量
export const electricityTotal = { value: 600, unit: '户', label: '总数量' }
export const electricityStats = [
  { name: '已安装', value: 2000, color: '#5ed3ff' },
  { name: '待安装', value: 2000, color: '#ffd24a' },
  { name: '未安装', value: 2000, color: '#7dd957' }
]

// 经济测算:双序列(图例一上、图例二下,镜像柱状),按年份
export const economyYears = [
  '2016', '2017', '2018', '2019', '2020', '2021', '2022',
  '2023', '2024', '2025', '2026', '2027'
]
// 图例一(上,蓝)
export const economySeries1 = [2600, 2900, 2750, 3000, 2850, 2950, 2700, 2880, 2980, 2820, 2900, 2760]
// 图例二(下,橙)
export const economySeries2 = [2400, 2700, 2550, 2820, 2650, 2780, 2500, 2700, 2800, 2620, 2720, 2580]

// 底部导航
export const ecoNavItems = [
  { key: 'env',    label: '环境感知' },
  { key: 'carbon', label: '碳排碳汇' },
  { key: 'smart',  label: '智慧绿能' }
]

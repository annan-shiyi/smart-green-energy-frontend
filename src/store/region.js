import { ref } from 'vue'

// ============================================================
// 社区 / 地域配置
//   石岗   = 主社区(默认),两个 tab 默认显示它;数据(屋顶光伏 / POI 等)只在石岗叠加
//   石盘滩 = 纯模型,不叠加任何数据(主管要求)
//
// ⚠ 数据坐标说明:现有 mockRoofs / mapMarkers 的坐标在 107.6(即石盘滩模型所在位置),
//   跟石岗模型(VITE_TILESET_SHIGANG,约 104.32)对不上,因此石岗上暂时看不到屋顶小房子。
//   待后续在石岗模型上用拾取工具重新采集坐标、回填到 mockRoofs / villageData 后即可显示。
//
// boundaryKmz:各社区村界线 KMZ/KML 数组(放在 public/kmz/ 下,支持中文名)。
//   一个社区可挂多个边界文件(如铜罐驿镇=各下辖村+镇级整体轮廓)。
//   边界与"是否叠数据"无关,所有 3D 页都会按当前社区显示对应边界;空数组=不显示。
// ============================================================
export const REGIONS = {
  shigang: {
    key: 'shigang',
    name: '石岗社区',
    tileset: import.meta.env.VITE_TILESET_SHIGANG,
    showData: true, // 数据只在石岗叠加
    boundaryKmz: [], // 暂无边界文件
    // 模型整体垂直偏移(米)。负=下沉,贴合天地图卫星底图。若悬空就更负,陷地里就往 0 调
    heightOffset: -250
  },
  shipantan: {
    key: 'shipantan',
    name: '石盘滩社区',
    tileset: import.meta.env.VITE_TILESET_SHIPANTAN,
    showData: false,
    boundaryKmz: ['/kmz/石盘滩村.kmz'],
    heightOffset: -250
  },
  yongpingzhai: {
    key: 'yongpingzhai',
    name: '永平寨',
    tileset: import.meta.env.VITE_TILESET_YONGPINGZHAI,
    showData: false, // 纯模型
    boundaryKmz: ['/kmz/永平寨.kmz'],
    heightOffset: -250
  },
  shizikoucun: {
    key: 'shizikoucun',
    name: '十字口村',
    tileset: import.meta.env.VITE_TILESET_SHIZIKOUCUN,
    showData: false, // 纯模型
    boundaryKmz: ['/kmz/十字口村.kmz'],
    heightOffset: -250
  },
  tongguanyizhen: {
    key: 'tongguanyizhen',
    name: '铜罐驿镇',
    tileset: import.meta.env.VITE_TILESET_TONGGUANYIZHEN,
    showData: false, // 纯模型
    // 9 个下辖村(排除带 + 的重复件)+ 镇级整体轮廓 .kml
    boundaryKmz: [
      '/kmz/双骑龙村.kmz',
      '/kmz/大碑.kmz',
      '/kmz/建设村.kmz',
      '/kmz/新合村.kmz',
      '/kmz/英雄湾村.kmz',
      '/kmz/观音桥村.kmz',
      '/kmz/铜罐第一社区.kmz',
      '/kmz/铜罐第二社区.kmz',
      '/kmz/黄金堡.kmz',
      '/kmz/铜罐驿镇_500107111000.kml'
    ],
    heightOffset: -250
  }
}

// 切换控件用的顺序列表
export const REGION_LIST = [
  REGIONS.shigang,
  REGIONS.shipantan,
  REGIONS.yongpingzhai,
  REGIONS.shizikoucun,
  REGIONS.tongguanyizhen
]

// 当前社区 key。默认石岗(主社区)。
export const currentRegion = ref('shigang')

export function setRegion(key) {
  if (REGIONS[key] && currentRegion.value !== key) {
    currentRegion.value = key
  }
}

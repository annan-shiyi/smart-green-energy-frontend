import { ref } from 'vue'

// ============================================================
// 社区 / 地域配置
//   石岗   = 主社区(默认),两个 tab 默认显示它;数据(屋顶光伏 / POI 等)只在石岗叠加
//   石盘滩 = 纯模型,不叠加任何数据(主管要求)
//
// ⚠ 数据坐标说明:现有 mockRoofs / mapMarkers 的坐标在 107.6(即石盘滩模型所在位置),
//   跟石岗模型(VITE_TILESET_SHIGANG,约 104.32)对不上,因此石岗上暂时看不到屋顶小房子。
//   待后续在石岗模型上用拾取工具重新采集坐标、回填到 mockRoofs / villageData 后即可显示。
// ============================================================
export const REGIONS = {
  shigang: {
    key: 'shigang',
    name: '石岗社区',
    tileset: import.meta.env.VITE_TILESET_SHIGANG,
    showData: true, // 数据只在石岗叠加
    // 模型整体垂直偏移(米)。负=下沉,贴合天地图卫星底图。若悬空就更负,陷地里就往 0 调
    heightOffset: -250
  },
  shipantan: {
    key: 'shipantan',
    name: '石盘滩社区',
    tileset: import.meta.env.VITE_TILESET_SHIPANTAN,
    showData: false,
    heightOffset: -250
  }
}

// 切换控件用的顺序列表
export const REGION_LIST = [REGIONS.shigang, REGIONS.shipantan]

// 当前社区 key。默认石岗(主社区)。
export const currentRegion = ref('shigang')

export function setRegion(key) {
  if (REGIONS[key] && currentRegion.value !== key) {
    currentRegion.value = key
  }
}

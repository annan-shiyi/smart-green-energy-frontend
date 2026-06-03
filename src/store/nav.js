import { ref } from 'vue'

// 顶部 5 个 tab 的全局选中态。
// 提升为共享状态后,TopBar 负责写,App.vue 负责读(决定渲染哪个视图)。
// 默认进入"村情村貌"。
export const activeTab = ref('village')

// 村情村貌内部子页面: 'globe'(地球首页) | 'model'(3D 模型页)。
// 默认地球首页;点地球上的点 → 'model';再次点顶部"村情村貌"tab → 重置回 'globe'。
export const villageView = ref('globe')

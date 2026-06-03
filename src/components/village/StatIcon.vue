<template>
  <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <!-- 面积 -->
    <template v-if="name === 'area'">
      <path d="M3 5h18v14H3z" />
      <path d="M3 5l18 14M21 5L3 19" opacity="0.5" />
    </template>
    <!-- 村民小组 -->
    <template v-else-if="name === 'group'">
      <circle cx="7" cy="9" r="2.2" />
      <circle cx="17" cy="9" r="2.2" />
      <circle cx="12" cy="15" r="2.2" />
    </template>
    <!-- 户籍户数(房子) -->
    <template v-else-if="name === 'house'">
      <path d="M4 11l8-6 8 6" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </template>
    <!-- 户籍人口(两人) -->
    <template v-else-if="name === 'people'">
      <circle cx="9" cy="8" r="2.6" />
      <path d="M4 19v-1.5C4 15 6 14 9 14s5 1 5 3.5V19" />
      <circle cx="17" cy="9" r="2" />
      <path d="M15 19v-1c0-2 1.5-3 3.5-3s2.5 1 2.5 2.2" opacity="0.7" />
    </template>
    <!-- 常住人口(单人) -->
    <template v-else-if="name === 'resident'">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20v-1.5C5 15.5 8 14 12 14s7 1.5 7 4.5V20" />
    </template>
    <!-- 流动人口(双向箭头) -->
    <template v-else-if="name === 'flow'">
      <circle cx="12" cy="7" r="2.6" />
      <path d="M7 20v-2c0-2.5 2-3.5 5-3.5s5 1 5 3.5v2" />
      <path d="M3 12l2-2 2 2M21 12l-2-2-2 2" opacity="0.8" />
    </template>
    <!-- 外流人口(向外箭头) -->
    <template v-else-if="name === 'outflow'">
      <circle cx="10" cy="8" r="2.6" />
      <path d="M4 20v-1.5C4 16 6.5 15 10 15c1 0 1.9.1 2.7.3" />
      <path d="M16 12h6M19 9l3 3-3 3" />
    </template>
    <!-- 户籍劳动力人口(人+工具) -->
    <template v-else-if="name === 'labor'">
      <circle cx="10" cy="7" r="2.6" />
      <path d="M4 20v-2c0-2.5 2.5-3.5 6-3.5" />
      <path d="M15 14l5 5M14 16l3 3" />
      <circle cx="13.5" cy="13.5" r="1.4" />
    </template>
    <!-- 男性 -->
    <template v-else-if="name === 'male'">
      <circle cx="10" cy="14" r="5" />
      <path d="M14 10l6-6M15 4h5v5" />
    </template>
    <!-- 女性 -->
    <template v-else-if="name === 'female'">
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7M9 18h6" />
    </template>
    <!-- 员工数量(工牌人) -->
    <template v-else-if="name === 'staff'">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 20v-1.5C5 15.5 8 14 12 14s7 1.5 7 4.5V20" />
      <path d="M9 4h6" opacity="0.7" />
    </template>
    <!-- 安农人员(叶片) -->
    <template v-else-if="name === 'agri'">
      <path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z" />
      <path d="M5 19c3-6 7-9 11-10" opacity="0.7" />
    </template>
    <!-- 访农数量(放大镜人) -->
    <template v-else-if="name === 'visit'">
      <circle cx="10" cy="10" r="5" />
      <path d="M14 14l6 6" />
      <path d="M8 11c0-1.2 1-2 2-2s2 .8 2 2" />
      <circle cx="10" cy="8" r="1.2" />
    </template>
    <!-- 盾牌(土地资源) -->
    <template v-else-if="name === 'shield'">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </template>
  </svg>
</template>

<script setup>
defineProps({ name: { type: String, required: true } })
</script>

<style scoped>
.stat-icon {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

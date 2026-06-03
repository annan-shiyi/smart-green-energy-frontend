<template>
  <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <!-- 村情村貌(房子) -->
    <template v-if="name === 'village'">
      <path d="M4 11l8-6 8 6" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </template>
    <!-- 产业发展(增长柱) -->
    <template v-else-if="name === 'industry'">
      <path d="M4 20V10M9 20V6M14 20v-8M19 20V4" />
      <path d="M3 20h18" opacity="0.7" />
    </template>
    <!-- 安全防治(盾牌) -->
    <template v-else-if="name === 'safety'">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </template>
    <!-- 民生服务(双人) -->
    <template v-else-if="name === 'people'">
      <circle cx="9" cy="8" r="2.6" />
      <path d="M4 19v-1.5C4 15 6 14 9 14s5 1 5 3.5V19" />
      <circle cx="17" cy="9" r="2" />
      <path d="M15 19v-1c0-2 1.5-3 3.5-3s2.5 1 2.5 2.2" opacity="0.8" />
    </template>
    <!-- 低碳生活(叶子) -->
    <template v-else-if="name === 'eco'">
      <path d="M5 19C5 11 11 5 19 5c0 8-6 14-14 14z" />
      <path d="M5 19c3-6 7-9 11-10" opacity="0.7" />
    </template>
    <!-- 天气(云 + 太阳) -->
    <template v-else-if="name === 'weather'">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M4 4l1 1M11 11l1 1M12 4l-1 1M5 11l-1 1" opacity="0.8" />
      <path d="M10 18h7a3 3 0 0 0 0-6 4 4 0 0 0-7.6-1.2A3.5 3.5 0 0 0 10 18z" fill="currentColor" stroke="none" opacity="0.92" />
    </template>
  </svg>
</template>

<script setup>
defineProps({ name: { type: String, required: true } })
</script>

<style scoped>
.nav-icon {
  width: 100%;
  height: 100%;
  display: block;
}
</style>

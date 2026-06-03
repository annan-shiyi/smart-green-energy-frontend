<template>
  <!-- 按 tab 切换视图;其余 tab 仍停留在原综合页面(安全防治) -->
  <Village v-if="activeTab === 'village'" />
  <EcoLife v-else-if="activeTab === 'eco'" />
  <Home v-else />
</template>

<script setup>
import Home from './views/Home.vue'
import Village from './views/Village.vue'
import EcoLife from './views/EcoLife.vue'
import { activeTab } from './store/nav.js'
</script>

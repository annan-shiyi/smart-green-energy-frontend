<template>
  <nav class="bottom-nav">
    <button
      v-for="item in items"
      :key="item.key"
      class="nav-item"
      :class="{ active: active === item.key }"
      @click="select(item.key)"
    >
      <img :src="navIcon" alt="" class="nav-icon" />
      <span class="nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { bottomNavItems } from '../../data/villageData.js'
import navIcon from '../../assets/village/nav-icon.png'

const props = defineProps({
  // 默认用村情村貌的导航项,传入 items 可复用到其它页(如低碳生活)
  items: { type: Array, default: () => bottomNavItems }
})

const emit = defineEmits(['select'])
const active = ref(props.items[0] ? props.items[0].key : '')

function select(key) {
  active.value = key
  emit('select', key)
}
</script>

<style scoped>
.bottom-nav {
  display: flex;
  gap: 46px;
  align-items: center;
  user-select: none;
}

.nav-item {
  position: relative;
  background: transparent;
  border: none;
  padding: 6px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.nav-icon {
  width: 38px;
  height: auto;
  object-fit: contain;
  flex-shrink: 0;
  transition: filter 0.2s, transform 0.2s;
  opacity: 0.85;
}

.nav-label {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(205, 222, 240, 0.8);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  transition: color 0.2s;
}

.nav-item:hover .nav-label {
  color: #eaf4ff;
}
.nav-item:hover .nav-icon {
  opacity: 1;
}

.nav-item.active .nav-label {
  color: #ffffff;
  text-shadow: 0 0 12px rgba(94, 211, 255, 0.8);
}
.nav-item.active .nav-icon {
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(94, 211, 255, 0.9));
  transform: scale(1.08);
}
</style>

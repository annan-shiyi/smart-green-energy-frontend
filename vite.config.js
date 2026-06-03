import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const cesiumSource = path.dirname(require.resolve('cesium/package.json'))
const cesiumBuild = path.join(cesiumSource, 'Build', 'Cesium')

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        { src: path.join(cesiumBuild, 'Workers').replace(/\\/g, '/'), dest: 'cesium' },
        { src: path.join(cesiumBuild, 'ThirdParty').replace(/\\/g, '/'), dest: 'cesium' },
        { src: path.join(cesiumBuild, 'Assets').replace(/\\/g, '/'), dest: 'cesium' },
        { src: path.join(cesiumBuild, 'Widgets').replace(/\\/g, '/'), dest: 'cesium' }
      ]
    })
  ],
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium')
  },
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    }
  }
})

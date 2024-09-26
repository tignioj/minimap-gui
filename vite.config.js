import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import flaskPlugin from './vite-plugin-flask'

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     vue(),
//     // flaskPlugin(),
//   ],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url))
//     }
//   },
//   build: {
//     manifest: true, // 启用 manifest 选项
//     rollupOptions: {
//       output: {
//         entryFileNames: 'assets/[name]-[hash].js',
//         chunkFileNames: 'assets/[name]-[hash].js',
//         assetFileNames: 'assets/[name]-[hash].[ext]',
//       },
//     },
//   },
// })


export default defineConfig(({ command }) => {
  return {
    plugins: [
      vue(),
      // 仅在 build 模式下启用 flaskPlugin
      command === 'build' && flaskPlugin()
    ],
    resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
    build: {
      outDir: 'dist',
      assetsDir: 'static/assets',
      rollupOptions: {
        output: {
          entryFileNames: 'static/assets/[name].[hash].js',
          chunkFileNames: 'static/assets/[name].[hash].js',
          assetFileNames: 'static/assets/[name].[hash].[ext]'
        }
      }
    },
  };
});
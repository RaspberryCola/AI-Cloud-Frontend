import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 代理所有以 `/api` 开头的请求
      '/api': {
        target: 'http://localhost:8080', // 后端 API 地址
        changeOrigin: true, // 修改请求头中的 Host
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // استبدل 'project-zero' بالاسم اللي سميته للريبو بتاعك بالظبط
  base: '/project-zero/', 
})
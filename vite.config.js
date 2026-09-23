import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'constants': path.resolve(__dirname, 'src/constants')
    }
  },
  css: {
     devSourcemap: true
  }
})

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],

// })
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.VITE_BASE_PATH || '/'
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`
  return {
    base: baseWithSlash,
    plugins: [
      vue(),
      tailwindcss(),
      viteSingleFile({ overrideConfig: { base: baseWithSlash } }),
    ],
  }
})

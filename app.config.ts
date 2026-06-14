import { defineConfig } from '@tanstack/react-start/config'
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  tsr: {
    routeFileIgnorePrefix: '-',
  },
  vite: {
    plugins: [tailwindcss(), tsConfigPaths()],
  },
  server: {
    preset: 'node-server',
  },
})

import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,       // bind to all interfaces — ufw only lets Tailscale traffic in
    port: 5173,
    strictPort: true
  }
})

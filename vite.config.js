
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//     strictPort: true,
//     allowedHosts: ['erp.buniyaadhry.com'],
//   },
// })




// digital ocean

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // DigitalOcean App Platform subpath
  base: '/vikalpa-erp2-frontend/',

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['erp.buniyaadhry.com'],
  },
})
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Puerto leído desde variable de entorno — permite cambiar sin tocar código
// En Docker: ENV VITE_PORT se inyecta desde el Dockerfile / docker-compose
// En local:  definir VITE_PORT en .env o dejar el default 5174
const FRONTEND_PORT = parseInt(process.env.VITE_PORT ?? '5174', 10);
const BACKEND_PORT  = parseInt(process.env.VITE_BACKEND_PORT ?? '3000', 10);
// Destino del proxy de /api. En Docker `localhost` es el propio contenedor del
// frontend, así que compose inyecta VITE_PROXY_TARGET=http://backend:<puerto>.
// Fuera de Docker se mantiene el backend local.
const PROXY_TARGET  = process.env.VITE_PROXY_TARGET ?? `http://localhost:${BACKEND_PORT}`;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@features': resolve(__dirname, 'src/features'),
      '@ibm-talent-bridge/shared-types': resolve(__dirname, '../../packages/shared-types/src/index.ts'),
    },
  },
  server: {
    port: FRONTEND_PORT,
    strictPort: true,   // falla rápido si el puerto está ocupado en vez de buscar otro
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: PROXY_TARGET,
        changeOrigin: true,
      },
    },
  },
});

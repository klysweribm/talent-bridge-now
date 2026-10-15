import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Puerto leído desde variable de entorno — permite cambiar sin tocar código
// En Docker: ENV VITE_PORT se inyecta desde el Dockerfile / docker-compose
// En local:  definir VITE_PORT en .env o dejar el default 5174
const FRONTEND_PORT = parseInt(process.env.VITE_PORT ?? '5174', 10);
const BACKEND_PORT  = parseInt(process.env.VITE_BACKEND_PORT ?? '3000', 10);

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
        target: `http://localhost:${BACKEND_PORT}`,
        changeOrigin: true,
      },
    },
  },
});

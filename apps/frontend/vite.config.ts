import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/ws': {
          target: `ws://${env.VITE_BACKEND_URL}` || 'ws://localhost:5001',
          ws: true,
        },
      },
    },
  };
});

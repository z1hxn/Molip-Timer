import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';


// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
  host: true,
  allowedHosts: [
    'uneruptive-unmystically-viviana.ngrok-free.dev',
  ],
  },
  resolve: {
    alias: {
      '@features': path.resolve(__dirname, 'src/features'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@widgets': path.resolve(__dirname, 'src/widgets'),
    },
  },
})

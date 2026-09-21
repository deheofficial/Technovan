import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react({ babel: { plugins: ['nativewind/babel'] } })],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      '@technovan/types': path.resolve(__dirname, '../../shared/types/src'),
      '@technovan/utils': path.resolve(__dirname, '../../shared/utils/src'),
    },
  },
  server: { port: 8080 },
  build: { outDir: 'dist', emptyOutDir: true },
});

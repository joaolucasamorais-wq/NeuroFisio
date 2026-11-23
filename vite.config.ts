import { defineConfig } from 'vite';
export default defineConfig({
  base: '/',
  build: { outDir: 'dist', assetsDir: 'assets', sourcemap: false, target: 'es2020' },
  server: { host: '0.0.0.0' }
});

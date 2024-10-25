import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'src/login.html',
        dashboard: 'src/dashboard.html',
        neuralAssistant: 'src/neural-assistant.html'
      }
    }
  }
});
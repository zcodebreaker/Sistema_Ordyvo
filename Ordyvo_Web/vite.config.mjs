import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@material-ui/styles': fileURLToPath(
        new URL('./src/styles/materialUiStylesCompat.js', import.meta.url)
      )
    }
  }
});

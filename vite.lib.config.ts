import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Samostatná build cesta vedle vite.config.ts (ten zůstává pro dev/ harness beze změny).
// Produkuje publikovatelný balíček z AntsGameComponent/ (viz plán, sekce "Component repo — knihovní build").
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['AntsGameComponent/**/*.ts', 'AntsGameComponent/**/*.tsx'],
      rollupTypes: true,
      insertTypesEntry: true,
    }),
    libInjectCss(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'AntsGameComponent/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});

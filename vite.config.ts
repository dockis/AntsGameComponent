import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// AntsGameComponent/ je sourozenec dev/ (ne potomek) — package.json/node_modules proto žijí
// v kořeni repozitáře, aby byly společným předkem obou (viz plán migrace, sekce "Dev prostředí").
export default defineConfig({
  root: 'dev',
  plugins: [react()],
  server: {
    fs: {
      allow: [__dirname],
    },
  },
});

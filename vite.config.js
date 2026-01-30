import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import fs from 'fs';

// Helper function to find all index.html files in subdirectories
function getHtmlEntries() {
  const entries = {
    main: resolve(__dirname, 'index.html'),
  };

  const folders = fs.readdirSync(__dirname, { withFileTypes: true });

  folders.forEach((dir) => {
    // Skip system folders and hidden folders
    if (dir.isDirectory() && !['node_modules', '.git', 'dist', 'assets'].includes(dir.name) && !dir.name.startsWith('.')) {
      const indexPath = resolve(__dirname, dir.name, 'index.html');
      if (fs.existsSync(indexPath)) {
        entries[dir.name] = indexPath;
      }
    }
  });

  return entries;
}

export default defineConfig({
  plugins: [react(), vue()],
  build: {
    rollupOptions: {
      input: getHtmlEntries(),
    },
  },
});

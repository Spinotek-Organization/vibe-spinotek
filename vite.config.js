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
  plugins: [
    react(), 
    vue(),
    // Custom plugin to handle clean URLs for subdirectories in dev
    {
      name: 'handle-clean-urls',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0];
          if (url !== '/' && !url.includes('.') && !url.endsWith('/')) {
            const folderPath = resolve(__dirname, url.slice(1));
            if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
              if (fs.existsSync(resolve(folderPath, 'index.html'))) {
                req.url = `${url}/`;
              }
            }
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: getHtmlEntries(),
    },
  },
});

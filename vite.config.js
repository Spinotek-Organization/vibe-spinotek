import { defineConfig } from 'vite';
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
    if (dir.isDirectory() && !['node_modules', '.git', 'dist', 'assets', 'public', '_template-react', '_template-vue', 'system-flow'].includes(dir.name) && !dir.name.startsWith('.')) {
      const fullDirPath = resolve(__dirname, dir.name);
      const files = fs.readdirSync(fullDirPath);

      files.forEach((file) => {
        if (file.endsWith('.html')) {
          // Create a unique key for the entry point
          // For index.html, use folder name. For others, use folderName-fileName
          const key = file === 'index.html' ? dir.name : `${dir.name}-${file.replace('.html', '')}`;
          entries[key] = resolve(fullDirPath, file);
        }
      });
    }
  });

  return entries;
}

export default defineConfig({
  base: './',
  plugins: [

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

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

    // Custom plugin to handle clean URLs & local projects API for dev
    {
      name: 'handle-clean-urls',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/__api/projects') {
            const excludedFolders = ["assets", ".github", "node_modules", "dist", ".git", "lib", "_template-react", "_template-vue", "system-flow"];
            const folders = fs.readdirSync(__dirname, { withFileTypes: true })
              .filter(item => item.isDirectory() && !excludedFolders.includes(item.name) && !item.name.startsWith('.'))
              .map(item => ({ name: item.name, type: 'dir' }));
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(folders));
            return;
          }

          const rawUrl = req.url.split('?')[0];
          const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
          const trimmed = rawUrl.replace(/^\/+|\/+$/g, '');
          if (!trimmed) {
            req.url = `/index.html${query}`;
          } else if (!trimmed.includes('.')) {
            const folderPath = resolve(__dirname, trimmed);
            if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
              if (fs.existsSync(resolve(folderPath, 'index.html'))) {
                req.url = `/${trimmed}/index.html${query}`;
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

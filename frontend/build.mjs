import esbuild from 'esbuild';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.argv.includes('--dev');
const clients = [];

const processCss = async () => {
  const input = fs.readFileSync('src/globals.css', 'utf8');
  const output = input; // Tailwind v4 procesuje się via PostCSS w bundlerze

  fs.mkdirSync('dist', { recursive: true });
  fs.writeFileSync('dist/globals.css', output);
};

const buildConfig = {
  define: {
    'process.env.FRONTEND_PORT': JSON.stringify(process.env.FRONTEND_PORT || '3000'),
  },
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.jsx': 'jsx',
    '.js': 'js'
  },
  target: 'es2020'
};

if (isDev) {
  const buildConfigDev = {
    ...buildConfig,
    format: 'iife',
    sourcemap: true,
    define: {
      'process.env.NODE_ENV': '"development"'
    }
  };

  let isBuilding = false;

  const build = async () => {
    isBuilding = true;
    try {
      await processCss();
      await esbuild.build(buildConfigDev);
      console.log('✅ Build complete');
      // Notify clients to refresh
      clients.forEach(ws => {
        if (ws.readyState === 1) ws.send('reload');
      });
    } catch (err) {
      console.error('Build failed:', err);
    }
    isBuilding = false;
  };

  // Watch for file changes
  const watchFiles = (dir) => {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        watchFiles(fullPath);
      } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css'))) {
        fs.watchFile(fullPath, () => {
          if (!isBuilding) build();
        });
      }
    });
  };

  // HTTP Server with WebSocket support
  const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    if (extname === '.js') contentType = 'application/javascript';
    if (extname === '.jsx') contentType = 'application/javascript';
    if (extname === '.ts') contentType = 'application/typescript';
    if (extname === '.tsx') contentType = 'application/typescript';
    if (extname === '.css') contentType = 'text/css';
    if (extname === '.json') contentType = 'application/json';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - File not found', 'utf-8');
        } else {
          res.writeHead(500);
          res.end('Sorry, check with the site admin for error: ' + err.code + ' ..\n');
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  const wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    clients.push(ws);
    ws.on('close', () => {
      clients.splice(clients.indexOf(ws), 1);
    });
  });
  const PORT = process.env.FRONTEND_PORT;
  server.listen(PORT, async () => {
    console.log(`✅ Dev server running on http://localhost:${PORT}`);
    await build();
    watchFiles('src');
  });

} else {
  const buildConfigProd = {
    ...buildConfig,
    format: 'iife',
    minify: true,
    sourcemap: false,
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  };

  (async () => {
    try {
      await processCss();
      await esbuild.build(buildConfigProd);
      console.log('✅ Build complete: dist/bundle.js');
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

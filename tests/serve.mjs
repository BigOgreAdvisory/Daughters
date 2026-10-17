// Static server that mimics GitHub Pages: the repo root is served under /Daughters/.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = +process.env.PORT || 4173;
const TYPES = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.png':'image/png', '.webmanifest':'application/manifest+json', '.json':'application/json', '.md':'text/markdown; charset=utf-8', '.svg':'image/svg+xml',
  '.ttf':'font/ttf', '.mp3':'audio/mpeg' };

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if(!u.pathname.startsWith('/Daughters/')){ res.writeHead(404); return res.end('not found'); }
  let p = path.join(ROOT, decodeURIComponent(u.pathname.slice('/Daughters/'.length)));
  if(!p.startsWith(ROOT) || p.includes(`${path.sep}tests${path.sep}`) || p.includes('node_modules')){ res.writeHead(404); return res.end(); }
  if(fs.existsSync(p) && fs.statSync(p).isDirectory()){
    if(!u.pathname.endsWith('/')){ res.writeHead(301, {Location: u.pathname + '/'}); return res.end(); }
    p = path.join(p, 'index.html');
  }
  fs.readFile(p, (err, buf) => {
    if(err){ res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-cache'});
    res.end(buf);
  });
}).listen(PORT, () => console.log(`serving ${ROOT} at http://localhost:${PORT}/Daughters/`));

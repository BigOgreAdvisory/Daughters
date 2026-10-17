// Writes precache.json: every file the offline worker (sw.js) stores at install, i.e. everything in
// this folder except the voice clips (cached separately), this tools folder and git/editor files.
// Run after adding or renaming files:  node tools/make-precache.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['audio', 'tools', 'node_modules', '.git', '.DS_Store', 'precache.json', 'sw.js', 'README.md', '.nojekyll']);

function walk(dir, rel = '') {
  const out = [];
  for (const name of fs.readdirSync(dir).sort()) {
    if (SKIP.has(name) || name.startsWith('.')) continue;
    const p = path.join(dir, name), r = rel ? rel + '/' + name : name;
    if (fs.statSync(p).isDirectory()) out.push(...walk(p, r));
    else out.push(r);
  }
  return out;
}

const files = walk(ROOT);
fs.writeFileSync(path.join(ROOT, 'precache.json'), JSON.stringify(files, null, 0) + '\n');
console.log('precache.json: ' + files.length + ' files');

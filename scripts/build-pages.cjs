const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const input = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
// Only the entry point is generated; the CSS and scripts remain in dist/.
const assets = /\b(href|src)="((?:style\.css|engine\.js|hold-repeat\.js|strategies\.js|app\.js|tutorial\.js)(?:\?[^"<>]*)?)"/g;
let count = 0;
const html = input.replace(assets, (_, attr, asset) => {
  count++;
  return `${attr}="dist/${asset}"`;
});
if (count !== 6) throw new Error(`Expected six runtime asset links; found ${count}.`);
fs.writeFileSync(path.join(root, 'index.html'), html);
fs.writeFileSync(path.join(root, '.nojekyll'), '');
console.log('GitHub Pages entry generated: index.html and .nojekyll.');

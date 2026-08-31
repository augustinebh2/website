const fs = require('fs');

const appJs = fs.readFileSync('app.js', 'utf8');

// Match classList.add, remove, toggle
const classOps = [];
const matches = appJs.matchAll(/classList\.(add|remove|toggle|contains)\(['"]([^'"]+)['"]\)/g);
for (const m of matches) {
  classOps.push({ op: m[1], class: m[2] });
}

console.log('ClassList operations in app.js:', classOps);

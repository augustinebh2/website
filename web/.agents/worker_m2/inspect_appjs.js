const fs = require('fs');

const appJs = fs.readFileSync('app.js', 'utf8');

// Find querySelector / querySelectorAll
const qsMatches = appJs.matchAll(/querySelector(?:All)?\(['"]([^'"]+)['"]\)/g);
const selectors = new Set();
for (const m of qsMatches) {
  selectors.add(m[1]);
}

// Find getElementById
const idMatches = appJs.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g);
const ids = new Set();
for (const m of idMatches) {
  ids.add(m[1]);
}

console.log('Selectors used in app.js:');
console.log(Array.from(selectors).sort());

console.log('\nIDs targeted in app.js:');
console.log(Array.from(ids).sort());

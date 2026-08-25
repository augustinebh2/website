const fs = require('fs');

const projectRoot = '.';
const htmlFiles = ['index.html', 'company.html', 'discover.html', 'industries.html', 'solutions.html'];

const htmlClassSet = new Set();
htmlFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/class=["']([^"']+)["']/g);
  for (const match of matches) {
    match[1].split(/\s+/).forEach(c => c.trim() && htmlClassSet.add(c.trim()));
  }
});

const stylesContent = fs.readFileSync('styles.css', 'utf8');

const missing = [];
htmlClassSet.forEach(cls => {
  if (cls.startsWith('fa') || cls.startsWith('fa-')) return; // FontAwesome
  const re = new RegExp(`(?<![\\w\\d\\.-])\\.${cls}(?![\\w\\d_-])`);
  if (!re.test(stylesContent)) {
    missing.push(cls);
  }
});

console.log('HTML classes not found as standalone or compound class selector in styles.css:');
console.log(missing.sort());

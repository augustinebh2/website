const fs = require('fs');

const files = ['index.html', 'company.html', 'discover.html', 'industries.html', 'solutions.html'];
const allClasses = {};

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.matchAll(/class=["']([^"']+)["']/g);
  for (const m of matches) {
    m[1].split(/\s+/).forEach(c => {
      if (c) {
        if (!allClasses[c]) allClasses[c] = [];
        if (!allClasses[c].includes(f)) allClasses[c].push(f);
      }
    });
  }
});

console.log(`Total unique classes in all 5 HTML files: ${Object.keys(allClasses).length}`);
Object.keys(allClasses).sort().forEach(c => {
  console.log(`${c} -> [${allClasses[c].join(', ')}]`);
});

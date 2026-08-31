const fs = require('fs');
const path = require('path');

const files = ['index.html', 'company.html', 'discover.html', 'industries.html', 'solutions.html'];

files.forEach(f => {
  console.log(`\n================== ${f} ==================`);
  const content = fs.readFileSync(f, 'utf8');
  
  // Extract all section tags or main structure
  const sectionMatches = content.matchAll(/<(section|header|footer|div|main)[^>]*class=["']([^"']+)["'][^>]*>/g);
  const classesSeen = new Set();
  for (const m of sectionMatches) {
    m[2].split(/\s+/).forEach(c => classesSeen.add(c));
  }
  console.log('Classes found in ' + f + ' (' + classesSeen.size + ' classes):');
  console.log(Array.from(classesSeen).sort().join(', '));
});

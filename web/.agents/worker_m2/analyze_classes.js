const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const htmlFiles = ['index.html', 'company.html', 'discover.html', 'industries.html', 'solutions.html'];

const htmlClassSet = new Set();
htmlFiles.forEach(f => {
  const p = path.join(projectRoot, f);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    const matches = content.matchAll(/class=["']([^"']+)["']/g);
    for (const match of matches) {
      match[1].split(/\s+/).forEach(c => {
        const trimmed = c.trim();
        if (trimmed) htmlClassSet.add(trimmed);
      });
    }
  }
});

// Also check classes added dynamically in app.js
const appJsPath = path.join(projectRoot, 'app.js');
const jsClassSet = new Set();
if (fs.existsSync(appJsPath)) {
  const appJs = fs.readFileSync(appJsPath, 'utf8');
  const classListAdds = appJs.matchAll(/classList\.(?:add|remove|toggle|contains)\(['"]([^'"]+)['"]\)/g);
  for (const m of classListAdds) {
    jsClassSet.add(m[1]);
  }
  const classNameMatches = appJs.matchAll(/className\s*=\s*['"]([^'"]+)['"]/g);
  for (const m of classNameMatches) {
    m[1].split(/\s+/).forEach(c => c.trim() && jsClassSet.add(c.trim()));
  }
}

// Read styles.css
const stylesPath = path.join(projectRoot, 'styles.css');
const stylesContent = fs.existsSync(stylesPath) ? fs.readFileSync(stylesPath, 'utf8') : '';

// Find all CSS class selectors - match valid CSS class identifiers starting with a letter, underscore, or hyphen (not preceded by word character or digit)
const cssClassMatches = stylesContent.matchAll(/(?<![\w\d\.])\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g);
const cssClassSet = new Set();
for (const m of cssClassMatches) {
  cssClassSet.add(m[1]);
}

console.log(`Total HTML Classes: ${htmlClassSet.size}`);
console.log(`Total JS Classes: ${jsClassSet.size}`);
console.log(`Total CSS Classes: ${cssClassSet.size}`);

const allNeededClasses = new Set([...htmlClassSet, ...jsClassSet]);
// Filter out FontAwesome icon classes (fa, fa-solid, fa-*, etc.) since they come from the FA library
const unstyledClasses = [...allNeededClasses].filter(c => !cssClassSet.has(c) && !c.startsWith('fa-') && c !== 'fa' && c !== 'fa-solid' && c !== 'fa-regular' && c !== 'fa-brands');
const orphanClasses = [...cssClassSet].filter(c => !allNeededClasses.has(c));

console.log('\n--- UNSTYLED CLASSES (in markup/JS but missing from styles.css) ---');
console.log(JSON.stringify(unstyledClasses.sort(), null, 2));

console.log('\n--- ORPHAN CLASSES (in styles.css but not in markup/JS) ---');
console.log(JSON.stringify(orphanClasses.sort(), null, 2));

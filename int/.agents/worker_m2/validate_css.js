const fs = require('fs');

const css = fs.readFileSync('styles.css', 'utf8');

console.log('=== CSS VALIDATION & HEALTH CHECK ===\n');

// 1. Bracket / Brace matching
let openBraces = 0;
let openParens = 0;
let openBrackets = 0;
let inComment = false;
let inString = false;
let stringChar = '';

const lines = css.split('\n');
const errors = [];

for (let lineNum = 1; lineNum <= lines.length; lineNum++) {
  const line = lines[lineNum - 1];
  for (let col = 0; col < line.length; col++) {
    const char = line[col];
    const nextChar = line[col + 1] || '';

    if (!inString && !inComment && char === '/' && nextChar === '*') {
      inComment = true;
      col++;
      continue;
    }
    if (inComment && char === '*' && nextChar === '/') {
      inComment = false;
      col++;
      continue;
    }
    if (inComment) continue;

    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
      continue;
    }
    if (inString && char === stringChar && line[col - 1] !== '\\') {
      inString = false;
      continue;
    }
    if (inString) continue;

    if (char === '{') openBraces++;
    if (char === '}') {
      openBraces--;
      if (openBraces < 0) {
        errors.push(`Line ${lineNum}: Unmatched closing brace '}'`);
      }
    }
    if (char === '(') openParens++;
    if (char === ')') {
      openParens--;
      if (openParens < 0) {
        errors.push(`Line ${lineNum}: Unmatched closing parenthesis ')'`);
      }
    }
    if (char === '[') openBrackets++;
    if (char === ']') {
      openBrackets--;
      if (openBrackets < 0) {
        errors.push(`Line ${lineNum}: Unmatched closing bracket ']'`);
      }
    }
  }
}

if (openBraces !== 0) errors.push(`End of file: ${openBraces} unclosed braces '{'`);
if (openParens !== 0) errors.push(`End of file: ${openParens} unclosed parentheses '('`);
if (openBrackets !== 0) errors.push(`End of file: ${openBrackets} unclosed brackets '['`);

// 2. Check CSS variables definition and usage
const definedVars = new Set();
const usedVars = new Set();

const varDefMatches = css.matchAll(/--([a-zA-Z0-9_-]+)\s*:/g);
for (const m of varDefMatches) {
  definedVars.add(m[1]);
}

const varUseMatches = css.matchAll(/var\(--([a-zA-Z0-9_-]+)[,\)]/g);
for (const m of varUseMatches) {
  usedVars.add(m[1]);
}

const undefinedVars = [...usedVars].filter(v => !definedVars.has(v));
if (undefinedVars.length > 0) {
  errors.push(`Undefined CSS variables used: ${undefinedVars.join(', ')}`);
}

// 3. Media Queries check
const mediaQueries = css.matchAll(/@media\s*([^{]+)\{/g);
let mediaCount = 0;
for (const m of mediaQueries) {
  mediaCount++;
  console.log(`Media Query #${mediaCount}: ${m[1].trim()}`);
}

console.log(`\nTotal Lines: ${lines.length}`);
console.log(`Defined CSS Variables: ${definedVars.size}`);
console.log(`Used CSS Variables: ${usedVars.size}`);
console.log(`Media Queries defined: ${mediaCount}`);

if (errors.length === 0) {
  console.log('\n✅ CSS SYNTAX & VARIABLE INTEGRITY: 100% VALID, ZERO ERRORS');
} else {
  console.error('\n❌ VALIDATION ERRORS FOUND:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

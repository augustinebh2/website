const fs = require('fs');

const content = fs.readFileSync('styles.css', 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

// Find all comment blocks like /* ===== ... ===== */ or /* 1. ... */
lines.forEach((line, idx) => {
  if (line.includes('/*') || line.includes('=====')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});

const fs = require('fs');

const content = fs.readFileSync('styles.css', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/*')) {
    let comment = lines[i];
    while (!comment.includes('*/') && i < lines.length - 1) {
      i++;
      comment += ' ' + lines[i];
    }
    console.log(`Line ${i + 1}: ${comment.replace(/\/\*|\*\/|=/g, '').trim()}`);
  }
}

const { describe, test, assert } = require('./e2e_runner');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readJsFile(filename) {
  const filePath = path.join(PROJECT_ROOT, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

describe('Tier 3.7: Speed-to-Lead Graph JS Component Logic', () => {
  test('3.7.1: initSpeedToLeadGraph function has timeDataMap configuration for expected keys', () => {
    const jsFiles = ['app.js', 'hww_app.js'];
    const expectedKeys = ['5min', '15min', '30min', '24hr'];

    for (const file of jsFiles) {
      const code = readJsFile(file);
      for (const key of expectedKeys) {
        assert.ok(
          code.includes(`'${key}': {`),
          `${file} must contain timeDataMap configuration for '${key}'`
        );
      }
    }
  });

  test('3.7.2: DOM query selectors correctly implemented in initSpeedToLeadGraph', () => {
    const jsFiles = ['app.js', 'hww_app.js'];

    for (const file of jsFiles) {
        const code = readJsFile(file);
        assert.ok(code.includes(`document.querySelectorAll('.time-pill-btn')`), `${file} must query for time-pill-btn`);
        assert.ok(code.includes(`document.getElementById('disp-graph-mult')`), `${file} must query for disp-graph-mult`);
        assert.ok(code.includes(`document.getElementById('disp-graph-time')`), `${file} must query for disp-graph-time`);
        assert.ok(code.includes(`document.querySelectorAll('.mit-bar-group')`), `${file} must query for mit-bar-group`);
    }
  });
});

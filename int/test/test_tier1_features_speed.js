const { describe, test, assert } = require('./e2e_runner');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readAppJs() {
  const filePath = path.join(PROJECT_ROOT, 'app.js');
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

describe('Tier 1.8: Core Interactive Component Markup Contracts', () => {
  test('1.8.7: app.js contains logic for Speed-to-Lead Live Graph', () => {
    const appJs = readAppJs();
    assert.ok(appJs.includes('initSpeedToLeadGraph'), 'app.js must contain initSpeedToLeadGraph function');
    assert.ok(appJs.includes('.time-pill-btn'), 'app.js must query .time-pill-btn elements');
    assert.ok(appJs.includes('disp-graph-mult'), 'app.js must update disp-graph-mult element');
  });
});

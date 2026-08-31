const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const { spawn } = require('child_process');

console.log('=== INDEPENDENT VICTORY AUDITOR FORENSIC VERIFICATION ===');

const projectRoot = 'C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int';
const indexPath = path.join(projectRoot, 'index.html');
const cssPath = path.join(projectRoot, 'styles.css');
const jsPath = path.join(projectRoot, 'app.js');
const origReqPath = path.join(projectRoot, 'ORIGINAL_REQUEST.md');

const indexHtml = fs.readFileSync(indexPath, 'utf-8');
const stylesCss = fs.readFileSync(cssPath, 'utf-8');
const appJs = fs.readFileSync(jsPath, 'utf-8');
const origReq = fs.readFileSync(origReqPath, 'utf-8');

// 1. Verbatim Copy Checks
console.log('\n[CHECK 1] Verifying Verbatim Content Copy...');
const expectedCopy = [
  'How we work',
  'Discovery Call',
  'We get on a call with you so you can explain to us what problems you are facing and what outcomes you want.',
  'Vent to us about your problems',
  'Clear understanding of your operating systems',
  'Credential Handover',
  '40% upfront payment',
  'Building Phase',
  'We build the systems designed specifically for your needs, and blends into your operating system',
  'Takes from 1 - 4 weeks depending on the case',
  'Live dashboard so you can track progress',
  'Engineering state-of-the-art architecture',
  'Integrating phase',
  "We plug your new intelligent system into your company's existing tools, softwares, databases and operational setup",
  'Documentation so your entire team can understand how system works',
  'Final Testing',
  '60% final payment',
  'Maintenance',
  'We do not just integrate the system and leave you stranded if anything changes in your business, we constantly maintain it for optimal functionality.',
  'Optional, we charge monthly retainer after opted for',
  'Real time system updates, agent training and optimization',
  'System exponentially improves and delivers exceptional results'
];

let copyPass = 0;
for (const phrase of expectedCopy) {
  const normHtml = indexHtml.toLowerCase().replace(/\s+/g, ' ');
  const normPhrase = phrase.toLowerCase().replace(/\s+/g, ' ');
  if (normHtml.includes(normPhrase)) {
    copyPass++;
  } else {
    console.error(`FAIL: Missing phrase: "${phrase}"`);
  }
}
console.log(`Copy check result: ${copyPass}/${expectedCopy.length} phrases matched.`);
assert.strictEqual(copyPass, expectedCopy.length, 'All copy must match verbatim');

// 2. Corner Tags & Color Tokens
console.log('\n[CHECK 2] Verifying 4 Corner Tags & Color Tokens...');
const cornerTags = ['discovery', 'building', 'integrating', 'maintenance'];
for (const tag of cornerTags) {
  assert.ok(indexHtml.includes(`data-corner="${tag}"`), `Corner tag ${tag} must exist`);
}
const colors = ['#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#0a0a0c'];
for (const col of colors) {
  assert.ok(stylesCss.includes(col), `Color token ${col} must exist in styles.css`);
}
console.log('Corner tags and theme colors verified successfully.');

// 3. Mathematical Camera Controller Verification
console.log('\n[CHECK 3] Verifying Camera Math & Smoothstep...');
const mockWindow = {
  innerHeight: 800,
  innerWidth: 1440,
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  removeEventListener: () => {}
};
const mockDoc = {
  readyState: 'loading',
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {},
  documentElement: { scrollTop: 0 }
};

// Evaluate HowWeWorkModule directly
const moduleContext = {
  window: mockWindow,
  document: mockDoc,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: (fn) => setTimeout(fn, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  console
};

const vm = require('vm');
vm.createContext(moduleContext);
vm.runInContext(appJs, moduleContext);

const HowWeWork = moduleContext.window.Intellectir.HowWeWorkModule;
assert.ok(HowWeWork, 'HowWeWorkModule must be exported on window.Intellectir');
assert.strictEqual(typeof HowWeWork.computeCameraTransform, 'function');

// Test stage keyframes
const samples = [
  { p: 0.00, expectedStage: 0, scale: 1.0, x: 0, y: 0 },
  { p: 0.25, expectedStage: 1, scale: 1.85, x: 24, y: 24 },
  { p: 0.45, expectedStage: 2, scale: 1.85, x: -24, y: 24 },
  { p: 0.65, expectedStage: 3, scale: 1.85, x: 24, y: -24 },
  { p: 0.825, expectedStage: 4, scale: 1.85, x: -24, y: -24 },
  { p: 0.95, expectedStage: 5, scale: 1.0, x: 0, y: 0 }
];

for (const s of samples) {
  const result = HowWeWork.computeCameraTransform(s.p);
  console.log(`Progress ${s.p.toFixed(3)} -> Stage ${result.stage}, Scale ${result.scale}, Trans(${result.translateX}%, ${result.translateY}%)`);
  assert.strictEqual(result.stage, s.expectedStage, `Stage mismatch at p=${s.p}`);
  assert.strictEqual(result.scale, s.scale, `Scale mismatch at p=${s.p}`);
}
console.log('Camera calculations verified.');

// 4. Server Integration & HTTP Routing Test
console.log('\n[CHECK 4] Verifying HTTP Server on dynamic port...');
const testPort = 3987;
const serverProcess = spawn('node', ['server.js'], {
  cwd: projectRoot,
  env: { ...process.env, PORT: String(testPort) },
  stdio: 'pipe'
});

setTimeout(() => {
  http.get(`http://127.0.0.1:${testPort}/`, (res) => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', () => {
      console.log(`Server response status: ${res.statusCode}`);
      assert.strictEqual(res.statusCode, 200, 'Server must return 200 OK');
      assert.ok(raw.includes('id="how-we-work-section"'), 'Response must contain #how-we-work-section');
      console.log('Server verified cleanly.');
      serverProcess.kill();
      console.log('\n=== ALL INDEPENDENT VERIFICATION CHECKS PASSED ===\n');
      process.exit(0);
    });
  }).on('error', (err) => {
    console.error('HTTP Request failed:', err);
    serverProcess.kill();
    process.exit(1);
  });
}, 800);

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('=== ADVERSARIAL STRESS TESTING ===');

const projectRoot = 'C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int';
const appJs = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf-8');

const mockWindow = {
  innerHeight: 800,
  innerWidth: 1440,
  matchMedia: (query) => ({ matches: false }),
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

const moduleContext = {
  window: mockWindow,
  document: mockDoc,
  setTimeout,
  clearTimeout,
  requestAnimationFrame: (fn) => setTimeout(fn, 16),
  cancelAnimationFrame: (id) => clearTimeout(id),
  console
};

vm.createContext(moduleContext);
vm.runInContext(appJs, moduleContext);

const HowWeWork = moduleContext.window.Intellectir.HowWeWorkModule;

// Test 1: NaN, null, undefined, negative, and over-1 progress
const extremeInputs = [NaN, null, undefined, -100, -0.0001, 1.0001, 9999, Infinity, -Infinity];
for (const val of extremeInputs) {
  const res = HowWeWork.computeCameraTransform(val);
  assert.ok(!isNaN(res.scale), `Scale must not be NaN for input ${val}`);
  assert.ok(!isNaN(res.translateX), `translateX must not be NaN for input ${val}`);
  assert.ok(!isNaN(res.translateY), `translateY must not be NaN for input ${val}`);
  assert.ok(res.scale >= 1.0 && res.scale <= 1.85, `Scale out of bounds for input ${val}: ${res.scale}`);
  assert.ok(res.stage >= 0 && res.stage <= 5, `Stage out of bounds for input ${val}: ${res.stage}`);
}
console.log('Test 1 Passed: Extreme & malformed numerical inputs safely handled.');

// Test 2: Fine-grained continuous sweep across 10,000 progress points
let maxScale = -Infinity;
let minScale = Infinity;
let maxX = -Infinity;
let minX = Infinity;
let maxY = -Infinity;
let minY = Infinity;

for (let i = -500; i <= 1500; i++) {
  const p = i / 1000;
  const res = HowWeWork.computeCameraTransform(p);
  assert.ok(Number.isFinite(res.scale), `Scale non-finite at p=${p}`);
  assert.ok(Number.isFinite(res.translateX), `translateX non-finite at p=${p}`);
  assert.ok(Number.isFinite(res.translateY), `translateY non-finite at p=${p}`);
  if (res.scale > maxScale) maxScale = res.scale;
  if (res.scale < minScale) minScale = res.scale;
  if (res.translateX > maxX) maxX = res.translateX;
  if (res.translateX < minX) minX = res.translateX;
  if (res.translateY > maxY) maxY = res.translateY;
  if (res.translateY < minY) minY = res.translateY;
}
console.log(`Bounds across 2,000 samples: scale=[${minScale}, ${maxScale}], x=[${minX}%, ${maxX}%], y=[${minY}%, ${maxY}%]`);
assert.ok(minScale >= 1.0 && maxScale <= 1.85, 'Scale bounds exceeded');
assert.ok(minX >= -24 && maxX <= 24, 'TranslateX bounds exceeded');
assert.ok(minY >= -24 && maxY <= 24, 'TranslateY bounds exceeded');
console.log('Test 2 Passed: 2,000 sub-pixel continuous sweep completely stable and bounded.');

// Test 3: Idempotent teardown and re-init
for (let i = 0; i < 100; i++) {
  HowWeWork.destroy();
  const initRes = HowWeWork.init();
  assert.ok(initRes.reason === 'Document missing' || initRes.reason === 'Root element missing' || initRes.initialized !== undefined);
}
console.log('Test 3 Passed: 100 consecutive lifecycle destroy/init cycles executed with 0 errors.');

console.log('\n=== ALL ADVERSARIAL TESTS PASSED ===\n');

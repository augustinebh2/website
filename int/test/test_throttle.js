const { describe, test, assert } = require('./e2e_runner');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// We need to pass Date inside the sandbox so we can manipulate it
function getThrottleEnv() {
  const code = fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
  const match = code.match(/function throttle\(fn, wait\) \{[\s\S]*?\n    \}/);
  if (!match) throw new Error("Could not find throttle function in app.js");

  const throttleCode = match[0];

  const sandbox = {
      module: {},
      Date: {
          now: Date.now
      }
  };

  const context = vm.createContext(sandbox);
  vm.runInContext(`${throttleCode}; module.exports = throttle;`, context);

  return { throttle: sandbox.module.exports, sandbox };
}

describe('Tier 6: Utilities - throttle()', () => {
  test('should return a function', () => {
    const { throttle } = getThrottleEnv();
    assert.strictEqual(typeof throttle, 'function');

    const throttledFn = throttle(() => {}, 100);
    assert.strictEqual(typeof throttledFn, 'function');
  });

  test('should execute the function immediately on first call', () => {
    const { throttle, sandbox } = getThrottleEnv();
    let callCount = 0;
    const fn = () => callCount++;

    let currentTime = 1000;
    sandbox.Date.now = () => currentTime;

    const throttledFn = throttle(fn, 100);
    throttledFn();

    assert.strictEqual(callCount, 1, 'Function should have been called once immediately');
  });

  test('should not execute the function if called again before wait time has passed', () => {
    const { throttle, sandbox } = getThrottleEnv();
    let callCount = 0;
    const fn = () => callCount++;

    let currentTime = 1000;
    sandbox.Date.now = () => currentTime;

    const throttledFn = throttle(fn, 100);

    throttledFn(); // currentTime = 1000. lastTime becomes 1000. callCount = 1
    assert.strictEqual(callCount, 1);

    currentTime = 1050; // less than wait (100)
    throttledFn(); // diff is 50. Should not execute.
    assert.strictEqual(callCount, 1, 'Function should not have been called again');
  });

  test('should execute the function again if wait time has passed', () => {
    const { throttle, sandbox } = getThrottleEnv();
    let callCount = 0;
    const fn = () => callCount++;

    let currentTime = 1000;
    sandbox.Date.now = () => currentTime;

    const throttledFn = throttle(fn, 100);

    throttledFn(); // currentTime = 1000. callCount = 1
    assert.strictEqual(callCount, 1);

    currentTime = 1100; // wait is 100. 1100 - 1000 = 100 >= 100.
    throttledFn();
    assert.strictEqual(callCount, 2, 'Function should have been called again after wait time');

    currentTime = 1150;
    throttledFn();
    assert.strictEqual(callCount, 2, 'Function should not be called before next wait time');

    currentTime = 1200;
    throttledFn();
    assert.strictEqual(callCount, 3, 'Function should be called again after wait time');
  });

  test('should pass arguments and maintain context correctly', () => {
    const { throttle } = getThrottleEnv();
    let receivedArgs = [];
    let receivedContext = null;

    const contextObj = { val: 42 };

    function fn(...args) {
      receivedContext = this;
      receivedArgs = args;
    }

    const throttledFn = throttle(fn, 100);

    // Using call to set 'this'
    throttledFn.call(contextObj, 'arg1', 'arg2');

    assert.strictEqual(receivedContext, contextObj, 'Context should be passed correctly');
    assert.strictEqual(receivedArgs.length, 2, 'Correct number of arguments should be passed');
    assert.strictEqual(receivedArgs[0], 'arg1');
    assert.strictEqual(receivedArgs[1], 'arg2');
  });
});

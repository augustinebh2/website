const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, test } = require('./e2e_runner');

// We need to extract the debounce function from app.js to test it
const appJsPath = path.join(__dirname, '..', 'app.js');
const appJs = fs.readFileSync(appJsPath, 'utf8');

// Extract debounce source code
const startIndex = appJs.indexOf('function debounce(fn, delay)');
let openBraces = 0;
let endIndex = startIndex;
let started = false;

for (let i = startIndex; i < appJs.length; i++) {
  if (appJs[i] === '{') {
    openBraces++;
    started = true;
  } else if (appJs[i] === '}') {
    openBraces--;
  }
  if (started && openBraces === 0) {
    endIndex = i + 1;
    break;
  }
}
const debounceStr = appJs.substring(startIndex, endIndex);

// We evaluate the debounce function so we can use it
// Must pass setTimeout and clearTimeout to the context
const context = {
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
};
vm.createContext(context);
const debounce = vm.runInContext(`(${debounceStr.replace('function debounce', 'function')})`, context);

describe('Debounce Utility Function', () => {
    test('Debounce delays execution until delay has passed', async () => {
        let callCount = 0;
        const fn = debounce(() => { callCount++; }, 50);

        fn();
        fn();
        fn();

        assert.strictEqual(callCount, 0, 'Function should not be called immediately');

        await new Promise(resolve => setTimeout(resolve, 60));

        assert.strictEqual(callCount, 1, 'Function should be called exactly once after the delay');
    });

    test('Debounce preserves arguments and context', async () => {
        let savedArgs = null;
        let savedContext = null;

        const obj = {
            val: 42,
            method: debounce(function(...args) {
                savedContext = this;
                savedArgs = args;
            }, 30)
        };

        obj.method('hello', 'world');

        await new Promise(resolve => setTimeout(resolve, 40));

        assert.strictEqual(savedContext, obj, 'Context (this) should be preserved');
        assert.deepStrictEqual(savedArgs, ['hello', 'world'], 'Arguments should be preserved');
    });

    test('Debounce correctly resets the timer on subsequent calls', async () => {
        let callCount = 0;
        const fn = debounce(() => { callCount++; }, 30);

        fn();
        await new Promise(resolve => setTimeout(resolve, 15));
        fn();
        await new Promise(resolve => setTimeout(resolve, 15));
        fn();
        await new Promise(resolve => setTimeout(resolve, 15));

        assert.strictEqual(callCount, 0, 'Function should not have been called yet because timer keeps resetting');

        await new Promise(resolve => setTimeout(resolve, 35));

        assert.strictEqual(callCount, 1, 'Function should be called exactly once after the final delay');
    });
});

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, test, it } = require('./e2e_runner');

const appJsCode = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function createMockEnvironment() {
  const listeners = {};
  const dom = {
    window: {
      addEventListener: () => {},
      innerWidth: 1024,
      scrollY: 0,
      requestAnimationFrame: (cb) => { cb(); return 1; },
      cancelAnimationFrame: () => {}
    },
    document: {
      getElementById: (id) => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: (evt, fn) => { listeners[evt] = fn; },
      readyState: 'complete',
      createElement: () => ({ style: {} }),
      body: { style: {} },
    }
  };

  let clearBtnDisplay = '';
  const inputListeners = {};
  const clickListeners = {};

  const searchInput = {
    id: 'discover-search-input',
    value: '',
    tagName: 'INPUT',
    addEventListener: (evt, fn) => { inputListeners[evt] = fn; },
    focus: () => {},
    select: () => {}
  };

  const clearBtn = {
    id: 'discover-search-clear',
    style: {
      get display() { return clearBtnDisplay; },
      set display(val) { clearBtnDisplay = val; }
    },
    addEventListener: (evt, fn) => { clickListeners[evt] = fn; }
  };

  dom.document.getElementById = (id) => {
    if (id === 'discover-search-input') return searchInput;
    if (id === 'discover-search-clear') return clearBtn;
    return null;
  };

  const context = {
    window: dom.window,
    document: dom.document,
    setTimeout: (fn, delay) => { fn(); }, // Sync setTimeout for debounce
    clearTimeout: () => {},
    Date: Date,
    console: console
  };

  vm.createContext(context);
  vm.runInContext(appJsCode, context);

  return {
    context,
    searchInput,
    clearBtn,
    getClearBtnDisplay: () => clearBtnDisplay,
    triggerInput: () => { if(inputListeners['input']) inputListeners['input'](); },
    triggerClearBtnClick: (e) => { if(clickListeners['click']) clickListeners['click'](e || {preventDefault: () => {}}); }
  };
}

describe('DiscoverFilterModule updateClearButton', () => {
  test('updateClearButton displays button only when input has non-whitespace characters', () => {
     const env = createMockEnvironment();
     env.context.window.Intellectir.DiscoverFilterModule.init();

     // Initial setup -> should be none since value is empty
     assert.strictEqual(env.getClearBtnDisplay(), 'none');

     // 1. Whitespace only -> should be none
     env.searchInput.value = '   ';
     env.triggerInput();
     assert.strictEqual(env.getClearBtnDisplay(), 'none');

     // 2. Text value -> should be inline-flex
     env.searchInput.value = 'AI agents';
     env.triggerInput();
     assert.strictEqual(env.getClearBtnDisplay(), 'inline-flex');

     // 3. Clear button click should reset value and hide clear button
     env.triggerClearBtnClick();
     assert.strictEqual(env.searchInput.value, '');
     assert.strictEqual(env.getClearBtnDisplay(), 'none');
  });

  test('updateClearButton handles missing clearBtn or searchInput gracefully', () => {
     const env = createMockEnvironment();
     env.context.document.getElementById = (id) => null; // Returns null for both elements

     // This shouldn't throw an error when called
     assert.doesNotThrow(() => {
        env.context.window.Intellectir.DiscoverFilterModule.init();
     });
  });
});

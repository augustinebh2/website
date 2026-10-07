const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, test, assert } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readAppJs() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
}

function createMockScrollEnvironment(customOptions = {}) {
  const mockElements = [];

  const mockDocument = {
    readyState: 'complete',
    querySelectorAll: (selector) => {
      if (selector.includes('reveal-on-scroll')) {
        return mockElements;
      }
      return [];
    },
    addEventListener: () => {},
    getElementById: () => null,
    querySelector: () => null
  };

  let observerInstances = [];

  const mockIntersectionObserver = function(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observedElements = [];
    this.observe = (el) => this.observedElements.push(el);
    this.unobserve = (el) => {
      this.observedElements = this.observedElements.filter(e => e !== el);
    };
    observerInstances.push(this);
  };

  const mockWindow = {
    addEventListener: () => {},
    requestAnimationFrame: (cb) => { cb(); },
    scrollY: 0
  };

  if (customOptions.hasObserver !== false) {
    mockWindow.IntersectionObserver = mockIntersectionObserver;
  }

  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    Date: Date
  };

  // Provide IntersectionObserver globally since `app.js` might look for it directly
  if (customOptions.hasObserver !== false) {
    sandbox.IntersectionObserver = mockIntersectionObserver;
  }

  const context = vm.createContext(sandbox);
  vm.runInContext(readAppJs(), context);

  return {
    module: sandbox.window.Intellectir.ScrollAnimationModule,
    elements: mockElements,
    observerInstances,
    triggerIntersection: (observerInstance, entries) => {
        observerInstance.callback(entries, observerInstance);
    }
  };
}

const createMockElement = (classNames = []) => {
    const classSet = new Set(classNames);
    return {
        classList: {
            add: (...cls) => cls.forEach(c => classSet.add(c)),
            contains: (c) => classSet.has(c)
        },
        _classes: classSet
    };
};

describe('ScrollAnimationModule initObserver testing', () => {
    test('Returns early if no elements found', () => {
        const env = createMockScrollEnvironment();
        env.module.init();
        assert.strictEqual(env.observerInstances.length, 0);
    });

    test('Initializes observer and observes elements', () => {
        const env = createMockScrollEnvironment();
        const el1 = createMockElement(['glass-card']);
        const el2 = createMockElement(['prop-card', 'reveal-on-scroll']);
        env.elements.push(el1, el2);

        env.module.init();

        assert.strictEqual(env.observerInstances.length, 1);
        const observer = env.observerInstances[0];

        assert.strictEqual(observer.observedElements.length, 2);
        assert.ok(el1._classes.has('reveal-on-scroll'), 'Missing reveal-on-scroll class should be added');
    });

    test('Triggers intersection adds classes and unobserves', () => {
        const env = createMockScrollEnvironment();
        const el = createMockElement(['glass-card']);
        env.elements.push(el);

        env.module.init();
        const observer = env.observerInstances[0];

        env.triggerIntersection(observer, [{
            isIntersecting: true,
            target: el
        }]);

        assert.ok(el._classes.has('is-revealed'));
        assert.ok(el._classes.has('in-view'));
        assert.strictEqual(observer.observedElements.length, 0);
    });

    test('Fallback when IntersectionObserver is not available', () => {
        const env = createMockScrollEnvironment({ hasObserver: false });
        const el = createMockElement(['glass-card']);
        env.elements.push(el);

        env.module.init();

        assert.strictEqual(env.observerInstances.length, 0);
        assert.ok(el._classes.has('is-revealed'));
        assert.ok(el._classes.has('in-view'));
    });
});

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, test, assert } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readAppJs() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
}

function createMockEnvironment() {
  const createMockElement = (classNames) => {
    const listeners = {};
    return {
      classList: { contains: (c) => classNames.includes(c) },
      style: { transform: '' },
      addEventListener: (evt, cb) => {
        if (!listeners[evt]) listeners[evt] = [];
        listeners[evt].push(cb);
      },
      getBoundingClientRect: () => ({
        top: 100,
        left: 100,
        width: 200,
        height: 300
      }),
      _trigger: (evt, e) => {
        if (listeners[evt]) listeners[evt].forEach(cb => cb(e));
      }
    };
  };

  const mockCards = [
    createMockElement(['glass-card']),
    createMockElement(['prop-card'])
  ];

  const mockDocument = {
    querySelectorAll: (selector) => {
      if (selector === '.glass-card, .prop-card, .pillar-card') {
        return mockCards;
      }
      return [];
    },
    getElementById: (id) => null,
    querySelector: (selector) => null, // Add querySelector to prevent TypeError
    addEventListener: () => {},
    readyState: 'complete'
  };

  const mockWindow = {
    addEventListener: () => {},
    matchMedia: () => ({ matches: false }),
    Intellectir: {}
  };

  let rafCallback = null;

  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    requestAnimationFrame: (cb) => { rafCallback = cb; return 1; },
    cancelAnimationFrame: (id) => {},
    console: console,
    Math: Math,
    Date: Date,
    String: String,
    Number: Number,
    Array: Array,
    Set: Set,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    IntersectionObserver: class {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
  };

  const context = vm.createContext(sandbox);
  const code = readAppJs();
  vm.runInContext(code, context);

  return {
    module: sandbox.window.Intellectir.InteractiveComponentsModule,
    cards: mockCards,
    triggerRaf: () => {
      if (rafCallback) {
        const cb = rafCallback;
        rafCallback = null;
        cb();
      }
    }
  };
}

describe('InteractiveComponentsModule: Card Tilt', () => {
  test('initCardTilt adds listeners and tilts card on mousemove', () => {
    const env = createMockEnvironment();
    env.module.init();

    const card = env.cards[0];

    // Simulate mousemove at center (clientX: 200, clientY: 250)
    card._trigger('mousemove', { clientX: 200, clientY: 250 });
    env.triggerRaf();

    assert.ok(
      card.style.transform.includes('perspective(1000px) rotateX(0.00deg) rotateY(0.00deg) translateY(-4px)'),
      `Expected transform to be center, got: ${card.style.transform}`
    );

    // Mousemove top-left
    card._trigger('mousemove', { clientX: 100, clientY: 100 });
    env.triggerRaf();
    assert.ok(
      card.style.transform.includes('rotateX(5.00deg) rotateY(-5.00deg)'),
      `Expected transform for top-left, got: ${card.style.transform}`
    );

    // Mousemove bottom-right
    card._trigger('mousemove', { clientX: 300, clientY: 400 });
    env.triggerRaf();
    assert.ok(
      card.style.transform.includes('rotateX(-5.00deg) rotateY(5.00deg)'),
      `Expected transform for bottom-right, got: ${card.style.transform}`
    );
  });

  test('initCardTilt resets transform on mouseleave', () => {
    const env = createMockEnvironment();
    env.module.init();

    const card = env.cards[0];

    card._trigger('mousemove', { clientX: 200, clientY: 250 });
    env.triggerRaf();
    assert.ok(card.style.transform !== '');

    card._trigger('mouseleave', {});
    assert.strictEqual(card.style.transform, 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)');
  });

  test('initCardTilt handles empty cards gracefully', () => {
    const env = createMockEnvironment();
    env.cards.length = 0; // Simulate no cards
    assert.doesNotThrow(() => {
      env.module.init();
    });
  });
});

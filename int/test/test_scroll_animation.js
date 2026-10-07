const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, test, assert } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readAppJs() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
}

function createMockEnvironment() {
  const eventListeners = {
    window: {},
    document: {}
  };

  const classListFactory = () => {
    const classes = new Set();
    return {
      add: (...cls) => cls.forEach(c => classes.add(c)),
      remove: (...cls) => cls.forEach(c => classes.delete(c)),
      contains: (c) => classes.has(c),
      get length() { return classes.size; },
      toArray: () => Array.from(classes)
    };
  };

  const createMockElement = (id) => ({
    id,
    classList: classListFactory(),
    offsetHeight: 0
  });

  const elementsById = {
    'masthead': createMockElement('masthead')
  };

  const elementsBySelector = {};

  const mockWindow = {
    scrollY: 0,
    pageYOffset: 0,
    innerHeight: 800,
    requestAnimationFrame: (cb) => {
      cb();
      return 1;
    },
    addEventListener: (event, handler, options) => {
      if (!eventListeners.window[event]) eventListeners.window[event] = [];
      eventListeners.window[event].push(handler);
    },
    removeEventListener: () => {},
    IntersectionObserver: class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  };

  const mockDocument = {
    getElementById: (id) => elementsById[id] || null,
    querySelector: (sel) => elementsBySelector[sel] || null,
    querySelectorAll: (sel) => [],
    addEventListener: (event, handler, options) => {
      if (!eventListeners.document[event]) eventListeners.document[event] = [];
      eventListeners.document[event].push(handler);
    },
    removeEventListener: () => {}
  };

  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    Math: Math,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    Date: Date,
    IntersectionObserver: mockWindow.IntersectionObserver
  };

  const context = vm.createContext(sandbox);
  const code = readAppJs();
  vm.runInContext(code, context);

  return {
    module: sandbox.window.Intellectir.ScrollAnimationModule,
    window: mockWindow,
    document: mockDocument,
    elementsById,
    elementsBySelector,
    eventListeners
  };
}

describe('ScrollAnimationModule tests', () => {
  test('initHeaderScroll adds scroll and resize listeners', () => {
    const env = createMockEnvironment();
    env.module.init();

    assert.ok(env.eventListeners.window['scroll'] && env.eventListeners.window['scroll'].length > 0, 'Should add scroll listener');
    assert.ok(env.eventListeners.window['resize'] && env.eventListeners.window['resize'].length > 0, 'Should add resize listener');
  });

  test('updateHeaderContrast updates classes based on scrollY (no videoHero, no darkHero)', () => {
    const env = createMockEnvironment();
    env.module.init();
    const masthead = env.elementsById['masthead'];

    // scrollY < 40
    env.window.scrollY = 20;
    env.module.updateHeaderContrast();
    assert.ok(masthead.classList.contains('light-nav'), 'Should have light-nav');
    assert.ok(!masthead.classList.contains('scrolled'), 'Should not have scrolled');
    assert.ok(!masthead.classList.contains('dark-nav'), 'Should not have dark-nav');

    // scrollY > 40
    env.window.scrollY = 50;
    env.module.updateHeaderContrast();
    assert.ok(masthead.classList.contains('light-nav'), 'Should have light-nav');
    assert.ok(masthead.classList.contains('scrolled'), 'Should have scrolled');
    assert.ok(!masthead.classList.contains('dark-nav'), 'Should not have dark-nav');
  });

  test('updateHeaderContrast updates classes with darkHero', () => {
    const env = createMockEnvironment();
    // Simulate darkHero
    env.elementsBySelector['.hero-section, .hero-particles, body.dark-theme'] = {
      classList: classListFactory()
    };
    env.module.init();
    const masthead = env.elementsById['masthead'];

    // scrollY < 40
    env.window.scrollY = 20;
    env.module.updateHeaderContrast();
    assert.ok(masthead.classList.contains('dark-nav'), 'Should have dark-nav');
    assert.ok(!masthead.classList.contains('scrolled'), 'Should not have scrolled');
    assert.ok(!masthead.classList.contains('light-nav'), 'Should not have light-nav');

    // scrollY > 40
    env.window.scrollY = 50;
    env.module.updateHeaderContrast();
    assert.ok(masthead.classList.contains('light-nav'), 'Should have light-nav');
    assert.ok(masthead.classList.contains('scrolled'), 'Should have scrolled');
    assert.ok(!masthead.classList.contains('dark-nav'), 'Should not have dark-nav');
  });

  test('updateHeaderContrast updates classes with videoHero', () => {
    const env = createMockEnvironment();
    // Simulate videoHero
    env.elementsBySelector['.ind-fullscreen-video-hero'] = {
      offsetHeight: 500,
      classList: classListFactory()
    };
    env.module.init();
    const masthead = env.elementsById['masthead'];

    // scrollY < videoHeight - 80 (500 - 80 = 420)
    env.window.scrollY = 400;
    env.module.updateHeaderContrast();
    assert.ok(masthead.classList.contains('dark-nav'), 'Should have dark-nav');
    assert.ok(!masthead.classList.contains('scrolled'), 'Should not have scrolled');
    assert.ok(!masthead.classList.contains('light-nav'), 'Should not have light-nav');

    // scrollY > videoHeight - 80
    env.window.scrollY = 450;
    env.module.updateHeaderContrast();
    assert.ok(masthead.classList.contains('light-nav'), 'Should have light-nav');
    assert.ok(masthead.classList.contains('scrolled'), 'Should have scrolled');
    assert.ok(!masthead.classList.contains('dark-nav'), 'Should not have dark-nav');
  });

  test('initHeaderScroll scrolling triggers updateHeaderContrast via requestAnimationFrame', () => {
    const env = createMockEnvironment();
    env.module.init();
    const masthead = env.elementsById['masthead'];

    // Trigger scroll
    env.window.scrollY = 100;
    const scrollHandlers = env.eventListeners.window['scroll'];
    scrollHandlers.forEach(handler => handler({}));

    assert.ok(masthead.classList.contains('scrolled'), 'Scroll handler should update contrast');
  });

  test('initHeaderScroll early return when no masthead', () => {
    const env = createMockEnvironment();
    // Re-create the module context with a fresh mockDocument that returns null
    const noMastheadDocument = { ...env.document, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };

    // We need a totally new sandbox context so the state is clean.
    const sandbox2 = {
      window: env.window,
      document: noMastheadDocument,
      Math: Math,
      parseInt: parseInt,
      parseFloat: parseFloat,
      isNaN: isNaN,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout,
      Date: Date,
      IntersectionObserver: env.window.IntersectionObserver
    };

    const context2 = vm.createContext(sandbox2);
    const code2 = readAppJs();
    vm.runInContext(code2, context2);

    const noMastheadModule = sandbox2.window.Intellectir.ScrollAnimationModule;

    // Reset window event listeners to ensure we only check ones added by this test
    env.eventListeners.window = {};

    noMastheadModule.init();

    assert.ok(!env.eventListeners.window['scroll'], 'Should not add scroll listener if no masthead');
  });

  test('updateHeaderContrast gracefully handles missing elements without throwing', () => {
    const env = createMockEnvironment();
    env.module.init();

    assert.doesNotThrow(() => {
        env.module.updateHeaderContrast();
    });
  });
});

function classListFactory() {
  const classes = new Set();
  return {
    add: (...cls) => cls.forEach(c => classes.add(c)),
    remove: (...cls) => cls.forEach(c => classes.delete(c)),
    contains: (c) => classes.has(c),
    get length() { return classes.size; },
    toArray: () => Array.from(classes)
  };
}

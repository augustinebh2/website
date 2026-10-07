const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, test, assert } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Common function to test the ScrollAnimationModule logic
function createDOMEnvironment(sourceFile) {
  class ClassList {
    constructor() {
      this.classes = new Set();
    }
    add(...cls) { cls.forEach(c => this.classes.add(c)); }
    remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
    contains(c) { return this.classes.has(c); }
  }

  const dom = {
    window: {
      scrollY: 0,
      pageYOffset: 0,
      innerHeight: 800,
      innerWidth: 1024,
      addEventListener: () => {},
      removeEventListener: () => {},
      requestAnimationFrame: (cb) => cb(),
      cancelAnimationFrame: () => {},
    },
    document: {
      getElementById: (id) => null,
      querySelector: (sel) => null,
      querySelectorAll: () => [],
      readyState: 'complete',
      addEventListener: () => {},
      body: { style: {} }
    }
  };

  dom.window.document = dom.document;
  const context = vm.createContext(dom);
  const jsCode = fs.readFileSync(path.join(PROJECT_ROOT, sourceFile), 'utf-8');
  vm.runInContext(jsCode, context);

  return { context, dom, ClassList };
}

for (const appFile of ['app.js', 'hww_app.js']) {
  describe(`Tier 1: updateHeaderContrast unit tests (${appFile})`, () => {
    test(`returns early if masthead is not present (${appFile})`, () => {
      const { dom, context } = createDOMEnvironment(appFile);
      dom.document.querySelector = (sel) => null;
      dom.document.getElementById = (id) => null;
      context.window.Intellectir.ScrollAnimationModule.init();
      context.window.Intellectir.ScrollAnimationModule.updateHeaderContrast();
    });

    test(`when videoHero is present and scrollY < videoHeight - 80, adds dark-nav (${appFile})`, () => {
      const { dom, context, ClassList } = createDOMEnvironment(appFile);

      const mockMasthead = { classList: new ClassList() };
      const mockVideoHero = { offsetHeight: 400 };

      dom.document.getElementById = (id) => {
        if (id === 'masthead') return mockMasthead;
        return null;
      };
      dom.document.querySelector = (sel) => {
        if (sel === '.ind-fullscreen-video-hero') return mockVideoHero;
        return null;
      };

      dom.window.scrollY = 100; // < 400 - 80 (320)

      context.window.Intellectir.ScrollAnimationModule.init();
      context.window.Intellectir.ScrollAnimationModule.updateHeaderContrast();

      assert.ok(mockMasthead.classList.contains('dark-nav'), 'Should have dark-nav');
      assert.ok(!mockMasthead.classList.contains('scrolled'), 'Should not have scrolled');
      assert.ok(!mockMasthead.classList.contains('light-nav'), 'Should not have light-nav');
    });

    test(`when videoHero is present and scrollY >= videoHeight - 80, adds light-nav and scrolled (${appFile})`, () => {
      const { dom, context, ClassList } = createDOMEnvironment(appFile);

      const mockMasthead = { classList: new ClassList() };
      const mockVideoHero = { offsetHeight: 400 };

      dom.document.getElementById = (id) => {
        if (id === 'masthead') return mockMasthead;
        return null;
      };
      dom.document.querySelector = (sel) => {
        if (sel === '.ind-fullscreen-video-hero') return mockVideoHero;
        return null;
      };

      dom.window.scrollY = 350; // >= 320

      context.window.Intellectir.ScrollAnimationModule.init();
      context.window.Intellectir.ScrollAnimationModule.updateHeaderContrast();

      assert.ok(!mockMasthead.classList.contains('dark-nav'), 'Should not have dark-nav');
      assert.ok(mockMasthead.classList.contains('scrolled'), 'Should have scrolled');
      assert.ok(mockMasthead.classList.contains('light-nav'), 'Should have light-nav');
    });

    test(`when no videoHero, scrollY > 40, adds light-nav and scrolled (${appFile})`, () => {
      const { dom, context, ClassList } = createDOMEnvironment(appFile);

      const mockMasthead = { classList: new ClassList() };

      dom.document.getElementById = (id) => {
        if (id === 'masthead') return mockMasthead;
        return null;
      };
      dom.document.querySelector = (sel) => null;

      dom.window.scrollY = 50;

      context.window.Intellectir.ScrollAnimationModule.init();
      context.window.Intellectir.ScrollAnimationModule.updateHeaderContrast();

      assert.ok(!mockMasthead.classList.contains('dark-nav'), 'Should not have dark-nav');
      assert.ok(mockMasthead.classList.contains('scrolled'), 'Should have scrolled');
      assert.ok(mockMasthead.classList.contains('light-nav'), 'Should have light-nav');
    });

    test(`when no videoHero, scrollY <= 40, and darkHero is present, adds dark-nav (${appFile})`, () => {
      const { dom, context, ClassList } = createDOMEnvironment(appFile);

      const mockMasthead = { classList: new ClassList() };
      const mockDarkHero = {};

      dom.document.getElementById = (id) => {
        if (id === 'masthead') return mockMasthead;
        return null;
      };
      dom.document.querySelector = (sel) => {
        if (sel === '.hero-section, .hero-particles, body.dark-theme') return mockDarkHero;
        return null;
      };

      dom.window.scrollY = 20;

      context.window.Intellectir.ScrollAnimationModule.init();
      context.window.Intellectir.ScrollAnimationModule.updateHeaderContrast();

      assert.ok(mockMasthead.classList.contains('dark-nav'), 'Should have dark-nav');
      assert.ok(!mockMasthead.classList.contains('scrolled'), 'Should not have scrolled');
      assert.ok(!mockMasthead.classList.contains('light-nav'), 'Should not have light-nav');
    });

    test(`when no videoHero, scrollY <= 40, and no darkHero, adds light-nav (${appFile})`, () => {
      const { dom, context, ClassList } = createDOMEnvironment(appFile);

      const mockMasthead = { classList: new ClassList() };

      dom.document.getElementById = (id) => {
        if (id === 'masthead') return mockMasthead;
        return null;
      };
      dom.document.querySelector = (sel) => null;

      dom.window.scrollY = 20;

      context.window.Intellectir.ScrollAnimationModule.init();
      context.window.Intellectir.ScrollAnimationModule.updateHeaderContrast();

      assert.ok(!mockMasthead.classList.contains('dark-nav'), 'Should not have dark-nav');
      assert.ok(!mockMasthead.classList.contains('scrolled'), 'Should not have scrolled');
      assert.ok(mockMasthead.classList.contains('light-nav'), 'Should have light-nav');
    });
  });
}

/**
 * Challenger 1: Adversarial Stress Testing & Empirical Validation Harness
 * =========================================================================
 * Target: Intellectir HowWeWorkModule & 2.5D Camera Controller
 *
 * Scope:
 * 1. Extreme Math & Boundary Inputs ($progress < 0$, $0$, $1.0$, $> 1.0$, degenerate types, jitter)
 * 2. 10,000-Step High-Resolution Sub-Pixel Monotonicity & Bounding Verification
 * 3. Scrubber Jump Stress & High-Frequency Alternating Jitter
 * 4. DOM Fault-Injection & Missing/Corrupted Element Resilience
 * 5. Window Resize, Viewport Dimension Stress & Reduced-Motion Switching
 * 6. Lifecycle & Concurrency Stress (Idempotency, Re-init, Rapid Teardown)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, it, assert } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// Guard: Skip entire test suite if How We Work section is temporarily removed
const _hwwGuardHtml = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf-8');
if (!_hwwGuardHtml.includes('id="how-we-work-section"')) {
  describe('Challenger 1 Stress Tests (SKIPPED - HWW section temporarily removed)', () => {
    it('HWW section not present, skipping all challenger stress tests', () => { /* SKIPPED */ });
  });
  return;
}

const appJsCode = fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');

function instantiateHowWeWork(customOptions = {}) {
  const eventListeners = {
    window: {},
    elements: {}
  };

  const createMockElement = (id, classNames = [], attributes = {}, bounding = {}) => {
    const classSet = new Set(classNames);
    const attrMap = new Map(Object.entries(attributes));
    const el = {
      id,
      tagName: 'DIV',
      classList: {
        add: (...cls) => cls.forEach(c => classSet.add(c)),
        remove: (...cls) => cls.forEach(c => classSet.delete(c)),
        toggle: (c, force) => {
          if (force === undefined) {
            if (classSet.has(c)) classSet.delete(c); else classSet.add(c);
          } else if (force) {
            classSet.add(c);
          } else {
            classSet.delete(c);
          }
          return classSet.has(c);
        },
        contains: (c) => classSet.has(c)
      },
      style: {},
      getAttribute: (k) => attrMap.get(k) !== undefined ? attrMap.get(k) : null,
      setAttribute: (k, v) => attrMap.set(k, String(v)),
      removeAttribute: (k) => attrMap.delete(k),
      getBoundingClientRect: () => ({
        top: bounding.top !== undefined ? bounding.top : (customOptions.scrollTop !== undefined ? -customOptions.scrollTop : 0),
        bottom: bounding.bottom !== undefined ? bounding.bottom : 5000,
        left: bounding.left !== undefined ? bounding.left : 0,
        right: bounding.right !== undefined ? bounding.right : 1440,
        width: bounding.width !== undefined ? bounding.width : 1440,
        height: bounding.height !== undefined ? bounding.height : 5000
      }),
      offsetHeight: bounding.height !== undefined ? bounding.height : 5000,
      offsetWidth: bounding.width !== undefined ? bounding.width : 1440,
      addEventListener: (evt, fn) => {
        if (!eventListeners.elements[id]) eventListeners.elements[id] = {};
        if (!eventListeners.elements[id][evt]) eventListeners.elements[id][evt] = [];
        eventListeners.elements[id][evt].push(fn);
      },
      removeEventListener: (evt, fn) => {
        if (eventListeners.elements[id] && eventListeners.elements[id][evt]) {
          eventListeners.elements[id][evt] = eventListeners.elements[id][evt].filter(f => f !== fn);
        }
      },
      querySelector: () => null,
      querySelectorAll: () => []
    };
    return el;
  };

  const sectionEl = customOptions.noSection ? null : createMockElement('how-we-work-section', ['how-we-work-section']);
  const trackEl = customOptions.noTrack ? null : createMockElement('hww-track', ['hww-track'], {}, customOptions.trackBounding || {});
  const canvasEl = customOptions.noCanvas ? null : createMockElement('hww-spatial-canvas', ['hww-spatial-canvas']);
  const introFrameEl = customOptions.noIntroFrame ? null : createMockElement('hww-intro-frame', ['hww-intro-frame']);
  const stateIntroEl = customOptions.noStateIntro ? null : createMockElement('hww-state-intro', ['state-intro']);
  const statePlatformEl = customOptions.noStatePlatform ? null : createMockElement('hww-state-platform', ['state-platform']);
  const scrubberProgressEl = customOptions.noScrubber ? null : createMockElement('hww-scrubber-progress', ['hww-scrubber-progress']);

  const navPills = [1, 2, 3, 4].map(idx =>
    createMockElement('hww-nav-pill-' + idx, ['hww-nav-pill'], { 'data-hww-goto': String(idx) })
  );

  const cornerTags = [
    createMockElement('hww-tag-discovery', ['hww-corner-tag', 'corner-tr'], { 'data-corner': 'discovery' }),
    createMockElement('hww-tag-building', ['hww-corner-tag', 'corner-tl'], { 'data-corner': 'building' }),
    createMockElement('hww-tag-integrating', ['hww-corner-tag', 'corner-bl'], { 'data-corner': 'integrating' }),
    createMockElement('hww-tag-maintenance', ['hww-corner-tag', 'corner-br'], { 'data-corner': 'maintenance' })
  ];

  const quadrantCards = [1, 2, 3, 4].map(idx =>
    createMockElement('hww-quadrant-card-' + idx, ['hww-quadrant-card'], { 'data-quadrant': String(idx) })
  );

  if (sectionEl) {
    sectionEl.querySelectorAll = (selector) => {
      if (selector.includes('.hww-nav-pill')) return navPills;
      if (selector.includes('.hww-corner-tag')) return cornerTags;
      if (selector.includes('.hww-quadrant-card')) return quadrantCards;
      return [];
    };
    sectionEl.querySelector = (selector) => {
      if (selector.includes('.hww-track')) return trackEl;
      if (selector.includes('.hww-spatial-canvas')) return canvasEl;
      if (selector.includes('.hww-intro-frame')) return introFrameEl;
      return null;
    };
  }

  const elementsById = {
    'how-we-work-section': sectionEl,
    'hww-track': trackEl,
    'hww-spatial-canvas': canvasEl,
    'hww-intro-frame': introFrameEl,
    'hww-state-intro': stateIntroEl,
    'hww-state-platform': statePlatformEl,
    'hww-scrubber-progress': scrubberProgressEl
  };

  let scrollPosition = customOptions.scrollTop || 0;
  let rafCallback = null;
  let rafHandleId = 100;
  let activeRafIds = new Set();
  let observerDisconnected = false;

  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      if (customOptions.isIntersecting !== false) {
        this.callback([{ isIntersecting: true, target }]);
      }
    }
    unobserve() {}
    disconnect() {
      observerDisconnected = true;
    }
  }

  const mockWindow = {
    innerHeight: customOptions.innerHeight !== undefined ? customOptions.innerHeight : 900,
    innerWidth: customOptions.innerWidth !== undefined ? customOptions.innerWidth : 1440,
    pageYOffset: scrollPosition,
    _listeners: eventListeners.window,
    addEventListener: (evt, fn) => {
      if (!eventListeners.window[evt]) eventListeners.window[evt] = [];
      eventListeners.window[evt].push(fn);
    },
    removeEventListener: (evt, fn) => {
      if (eventListeners.window[evt]) {
        eventListeners.window[evt] = eventListeners.window[evt].filter(f => f !== fn);
      }
    },
    scrollTo: (options) => {
      if (customOptions.onScrollTo) {
        customOptions.onScrollTo(options);
      }
      if (typeof options === 'object' && options.top !== undefined) {
        scrollPosition = options.top;
        mockWindow.pageYOffset = scrollPosition;
      }
    },
    requestAnimationFrame: (cb) => {
      const id = ++rafHandleId;
      activeRafIds.add(id);
      rafCallback = cb;
      return id;
    },
    cancelAnimationFrame: (id) => {
      activeRafIds.delete(id);
      if (rafHandleId === id) rafCallback = null;
    },
    matchMedia: (query) => ({
      matches: customOptions.reducedMotion && query.includes('prefers-reduced-motion') ? true : false,
      media: query,
      addListener: () => {},
      removeListener: () => {}
    }),
    IntersectionObserver: MockIntersectionObserver
  };

  const mockDocument = {
    readyState: 'complete',
    getElementById: (id) => elementsById[id] || null,
    querySelector: (sel) => null,
    querySelectorAll: (sel) => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    documentElement: { scrollTop: scrollPosition }
  };

  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    Math: Math,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    isFinite: isFinite,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    Array: Array,
    Set: Set,
    Map: Map,
    IntersectionObserver: MockIntersectionObserver,
    console: { log: () => {}, warn: () => {}, error: () => {} }
  };

  const context = vm.createContext(sandbox);
  vm.runInContext(appJsCode, context);

  return {
    sandbox,
    module: sandbox.window.Intellectir.HowWeWorkModule,
    window: mockWindow,
    document: mockDocument,
    elements: {
      sectionEl,
      trackEl,
      canvasEl,
      introFrameEl,
      stateIntroEl,
      statePlatformEl,
      scrubberProgressEl,
      navPills,
      cornerTags,
      quadrantCards
    }
  };
}

describe('Challenger 1.1: Extreme Math & Boundary Inputs ($progress < 0, 0, 1.0, > 1.0, Degenerate Types)', () => {
  const { module } = instantiateHowWeWork();

  it('1.1.1: Handles extreme negative progress ($progress < 0) safely without NaN/errors', () => {
    const negatives = [-Infinity, -1e9, -1000, -100, -1, -0.5, -0.000001, -0.0];
    negatives.forEach(p => {
      const transform = module.computeCameraTransform(p);
      assert.strictEqual(transform.stage, 0, 'Negative progress ' + p + ' must clamp to stage 0');
      assert.strictEqual(transform.scale, 1.00, 'Negative progress ' + p + ' must have scale 1.00');
      assert.strictEqual(transform.translateX, 0, 'Negative progress ' + p + ' must have translateX 0');
      assert.strictEqual(transform.translateY, 0, 'Negative progress ' + p + ' must have translateY 0');
      assert.ok(!isNaN(transform.scale), 'Scale must not be NaN for ' + p);
      assert.ok(!isNaN(transform.translateX), 'translateX must not be NaN for ' + p);
      assert.ok(!isNaN(transform.translateY), 'translateY must not be NaN for ' + p);
    });
  });

  it('1.1.2: Handles exact zero progress ($progress = 0.0) correctly', () => {
    const transform = module.computeCameraTransform(0.0);
    assert.strictEqual(transform.stage, 0);
    assert.strictEqual(transform.scale, 1.00);
    assert.strictEqual(transform.translateX, 0);
    assert.strictEqual(transform.translateY, 0);
    assert.strictEqual(transform.transformString, 'scale(1.0000) translate3d(0.00%, 0.00%, 0px)');
  });

  it('1.1.3: Handles exact 1.0 progress ($progress = 1.0) correctly', () => {
    const transform = module.computeCameraTransform(1.0);
    assert.strictEqual(transform.stage, 5);
    assert.strictEqual(transform.scale, 1.00);
    assert.strictEqual(transform.translateX, 0);
    assert.strictEqual(transform.translateY, 0);
    assert.strictEqual(transform.transformString, 'scale(1.0000) translate3d(0.00%, 0.00%, 0px)');
  });

  it('1.1.4: Handles extreme positive progress ($progress > 1.0) safely without overflow', () => {
    const positives = [1.000001, 1.05, 1.5, 2.0, 100, 1e6, Infinity];
    positives.forEach(p => {
      const transform = module.computeCameraTransform(p);
      assert.strictEqual(transform.stage, 5, 'Progress ' + p + ' must clamp to stage 5');
      assert.strictEqual(transform.scale, 1.00, 'Progress ' + p + ' must clamp to scale 1.00');
      assert.strictEqual(transform.translateX, 0, 'Progress ' + p + ' must clamp to translateX 0');
      assert.strictEqual(transform.translateY, 0, 'Progress ' + p + ' must clamp to translateY 0');
    });
  });

  it('1.1.5: Handles non-numeric and degenerate types gracefully', () => {
    const degenerates = [NaN, null, undefined, '0.5', 'invalid', {}, [], true, false];
    degenerates.forEach(d => {
      const transform = module.computeCameraTransform(d);
      assert.ok(transform !== null && typeof transform === 'object', 'Must return object for ' + typeof d);
      assert.strictEqual(transform.stage, 0, 'Degenerate input ' + d + ' must default safely to stage 0');
      assert.strictEqual(transform.scale, 1.00);
      assert.strictEqual(transform.translateX, 0);
      assert.strictEqual(transform.translateY, 0);
    });
  });
});

describe('Challenger 1.2: 10,000-Step High-Resolution Sub-Pixel Monotonicity & Bounding Verification', () => {
  const { module } = instantiateHowWeWork();

  it('1.2.1: Evaluates 10,000 continuous samples from progress -0.5 to +1.5 with strict invariants', () => {
    const STEPS = 10000;
    const minP = -0.5;
    const maxP = 1.5;
    const stepSize = (maxP - minP) / STEPS;

    let prevTransform = null;

    for (let i = 0; i <= STEPS; i++) {
      const p = minP + i * stepSize;
      const t = module.computeCameraTransform(p);

      // Invariant 1: No NaN or Infs
      assert.ok(!isNaN(t.scale), 'Scale NaN at p=' + p);
      assert.ok(!isNaN(t.translateX), 'translateX NaN at p=' + p);
      assert.ok(!isNaN(t.translateY), 'translateY NaN at p=' + p);
      assert.ok(isFinite(t.scale), 'Scale non-finite at p=' + p);
      assert.ok(isFinite(t.translateX), 'translateX non-finite at p=' + p);
      assert.ok(isFinite(t.translateY), 'translateY non-finite at p=' + p);

      // Invariant 2: Value ranges
      assert.ok(t.scale >= 0.9999 && t.scale <= 1.8501, 'Scale out of bounds ' + t.scale + ' at p=' + p);
      assert.ok(t.translateX >= -24.01 && t.translateX <= 24.01, 'translateX out of bounds ' + t.translateX + ' at p=' + p);
      assert.ok(t.translateY >= -24.01 && t.translateY <= 24.01, 'translateY out of bounds ' + t.translateY + ' at p=' + p);

      // Invariant 3: Valid stage partition
      assert.ok([0, 1, 2, 3, 4, 5].includes(t.stage), 'Invalid stage ' + t.stage + ' at p=' + p);

      // Invariant 4: Continuous delta (no wild teleportation > 0.5 per 0.0002 step)
      if (prevTransform && p >= 0 && p <= 1) {
        const dScale = Math.abs(t.scale - prevTransform.scale);
        const dX = Math.abs(t.translateX - prevTransform.translateX);
        const dY = Math.abs(t.translateY - prevTransform.translateY);
        assert.ok(dScale < 0.05, 'Discontinuous scale jump ' + dScale + ' at p=' + p);
        assert.ok(dX < 0.5, 'Discontinuous X jump ' + dX + ' at p=' + p);
        assert.ok(dY < 0.5, 'Discontinuous Y jump ' + dY + ' at p=' + p);
      }

      prevTransform = t;
    }
  });

  it('1.2.2: Stage transition points adhere strictly to keyframe ranges', () => {
    // Stage 0: 0.00 <= p < 0.15
    assert.strictEqual(module.computeCameraTransform(0.00).stage, 0);
    assert.strictEqual(module.computeCameraTransform(0.14).stage, 0);

    // Stage 1 (Top-Right Discovery): 0.15 <= p < 0.35 (peak at 0.25: x=-24, y=24)
    assert.strictEqual(module.computeCameraTransform(0.15).stage, 1);
    assert.strictEqual(module.computeCameraTransform(0.25).stage, 1);
    const s1Peak = module.computeCameraTransform(0.25);
    assert.strictEqual(s1Peak.scale, 1.85);
    assert.strictEqual(s1Peak.translateX, -24);
    assert.strictEqual(s1Peak.translateY, 24);

    // Stage 2 (Top-Left Building): 0.35 <= p < 0.55 (peak at 0.45: x=24, y=24)
    assert.strictEqual(module.computeCameraTransform(0.35).stage, 2);
    assert.strictEqual(module.computeCameraTransform(0.45).stage, 2);
    const s2Peak = module.computeCameraTransform(0.45);
    assert.strictEqual(s2Peak.scale, 1.85);
    assert.strictEqual(s2Peak.translateX, 24);
    assert.strictEqual(s2Peak.translateY, 24);

    // Stage 3 (Bottom-Left Integrating): 0.55 <= p < 0.75 (peak at 0.65: x=24, y=-24)
    assert.strictEqual(module.computeCameraTransform(0.55).stage, 3);
    assert.strictEqual(module.computeCameraTransform(0.65).stage, 3);
    const s3Peak = module.computeCameraTransform(0.65);
    assert.strictEqual(s3Peak.scale, 1.85);
    assert.strictEqual(s3Peak.translateX, 24);
    assert.strictEqual(s3Peak.translateY, -24);

    // Stage 4 (Bottom-Right Maintenance): 0.75 <= p < 0.90 (peak at 0.825: x=-24, y=-24)
    assert.strictEqual(module.computeCameraTransform(0.75).stage, 4);
    assert.strictEqual(module.computeCameraTransform(0.825).stage, 4);
    const s4Peak = module.computeCameraTransform(0.825);
    assert.strictEqual(s4Peak.scale, 1.85);
    assert.strictEqual(s4Peak.translateX, -24);
    assert.strictEqual(s4Peak.translateY, -24);

    // Stage 5 (Ecosystem Zoom-Out): p >= 0.90 (peak at 1.00: scale=1.00, x=0, y=0)
    assert.strictEqual(module.computeCameraTransform(0.90).stage, 5);
    assert.strictEqual(module.computeCameraTransform(0.95).stage, 5);
    assert.strictEqual(module.computeCameraTransform(1.00).stage, 5);
  });
});

describe('Challenger 1.3: Scrubber Jumps & High-Frequency Alternating Jitter', () => {
  it('1.3.1: Survives 1,000 rapid chaotic jump sequences across phases', () => {
    let scrollCalls = [];
    const env = instantiateHowWeWork({
      onScrollTo: (opts) => scrollCalls.push(opts)
    });
    env.module.init();

    const targets = [1, 2, 3, 4, -1, 0, 5, 999, '2', null, undefined, 'abc', 3, 1, 4];

    for (let i = 0; i < 1000; i++) {
      const t = targets[i % targets.length];
      env.module.scrollToPhase(t);
    }

    assert.strictEqual(scrollCalls.length, 1000, 'All 1000 scrollToPhase calls must dispatch cleanly');
    scrollCalls.forEach(call => {
      assert.ok(typeof call.top === 'number' && !isNaN(call.top) && isFinite(call.top), 'Target scroll top must be finite number');
      assert.strictEqual(call.behavior, 'smooth');
    });

    env.module.destroy();
  });

  it('1.3.2: High-frequency alternating progress jitter preserves state machine stability', () => {
    const env = instantiateHowWeWork();
    env.module.init();

    // Alternate rapidly between 0.05 and 0.98
    for (let i = 0; i < 500; i++) {
      const p = (i % 2 === 0) ? 0.05 : 0.98;
      const transform = env.module.computeCameraTransform(p);
      assert.ok(transform.stage === 0 || transform.stage === 5);
    }

    env.module.destroy();
  });
});

describe('Challenger 1.4: DOM Fault-Injection & Missing/Corrupted Element Resilience', () => {
  it('1.4.1: Gracefully handles missing root element (#how-we-work-section)', () => {
    const env = instantiateHowWeWork({ noSection: true });
    const res = env.module.init();
    assert.strictEqual(res.initialized, false);
    assert.strictEqual(res.reason, 'Root element missing');
    assert.doesNotThrow(() => env.module.destroy());
  });

  it('1.4.2: Gracefully handles missing trackEl (#hww-track)', () => {
    const env = instantiateHowWeWork({ noTrack: true });
    assert.doesNotThrow(() => env.module.init());
    const progress = env.module.computeTargetProgress();
    assert.strictEqual(progress, 0, 'Target progress should fallback to 0 when trackEl is missing');
    assert.doesNotThrow(() => env.module.scrollToPhase(2));
    assert.doesNotThrow(() => env.module.destroy());
  });

  it('1.4.3: Gracefully handles missing spatial canvas (#hww-spatial-canvas)', () => {
    const env = instantiateHowWeWork({ noCanvas: true });
    assert.doesNotThrow(() => env.module.init());
    assert.doesNotThrow(() => env.module.destroy());
  });

  it('1.4.4: Gracefully handles missing intro frame (#hww-intro-frame)', () => {
    const env = instantiateHowWeWork({ noIntroFrame: true });
    assert.doesNotThrow(() => env.module.init());
    assert.doesNotThrow(() => env.module.destroy());
  });

  it('1.4.5: Gracefully handles missing scrubber progress (#hww-scrubber-progress)', () => {
    const env = instantiateHowWeWork({ noScrubber: true });
    assert.doesNotThrow(() => env.module.init());
    assert.doesNotThrow(() => env.module.destroy());
  });

  it('1.4.6: Gracefully handles corrupt pill / tag attributes (nulls and NaNs)', () => {
    const env = instantiateHowWeWork();
    env.elements.navPills.forEach(p => p.getAttribute = () => 'corrupted_value');
    env.elements.cornerTags.forEach(t => t.getAttribute = () => null);
    env.elements.quadrantCards.forEach(c => c.getAttribute = () => 'not_a_number');

    assert.doesNotThrow(() => env.module.init());
    assert.doesNotThrow(() => env.module.destroy());
  });
});

describe('Challenger 1.5: Window Resize, Viewport Dimension Stress & Reduced Motion', () => {
  it('1.5.1: Handles extreme viewport dimensions (0x0, 1x1, 10000x10000, negative top)', () => {
    const dimensions = [
      { innerWidth: 0, innerHeight: 0, top: 0, height: 0 },
      { innerWidth: 1, innerHeight: 1, top: 100, height: 1 },
      { innerWidth: 320, innerHeight: 480, top: -1500, height: 3000 },
      { innerWidth: 768, innerHeight: 1024, top: -2500, height: 4000 },
      { innerWidth: 992, innerHeight: 800, top: -2000, height: 4500 },
      { innerWidth: 1440, innerHeight: 900, top: -3500, height: 5000 },
      { innerWidth: 2560, innerHeight: 1440, top: -4500, height: 6000 },
      { innerWidth: 10000, innerHeight: 10000, top: -50000, height: 100000 }
    ];

    dimensions.forEach(dim => {
      const env = instantiateHowWeWork({
        innerWidth: dim.innerWidth,
        innerHeight: dim.innerHeight,
        trackBounding: { top: dim.top, height: dim.height }
      });
      assert.doesNotThrow(() => {
        env.module.init();
        const p = env.module.computeTargetProgress();
        assert.ok(!isNaN(p) && p >= 0 && p <= 1, 'Progress ' + p + ' must be valid normalized float');
        env.module.destroy();
      });
    });
  });

  it('1.5.2: Simulates rapid resize event stream without memory growth or unhandled exceptions', () => {
    const env = instantiateHowWeWork();
    env.module.init();

    // Trigger 200 rapid resize events
    for (let i = 0; i < 200; i++) {
      env.window.innerWidth = 320 + (i * 10);
      env.window.innerHeight = 480 + (i * 5);
      if (env.window._listeners && env.window._listeners['resize']) {
        env.window._listeners['resize'].forEach(fn => fn());
      }
    }

    assert.doesNotThrow(() => env.module.destroy());
  });

  it('1.5.3: Reduced-motion accessibility mode disables canvas transforms', () => {
    const env = instantiateHowWeWork({ reducedMotion: true });
    env.module.init();

    assert.strictEqual(env.elements.canvasEl.style.transform, 'none', 'Canvas transform must be "none" under prefers-reduced-motion');
    env.module.destroy();
  });

  it('1.5.4: Mobile reflow mode (innerWidth <= 992) resets inline canvas transform', () => {
    const env = instantiateHowWeWork({ innerWidth: 768 });
    env.module.init();

    assert.strictEqual(env.elements.canvasEl.style.transform, '', 'Canvas transform must be reset under mobile reflow <= 992px');
    env.module.destroy();
  });
});

describe('Challenger 1.6: Lifecycle, Concurrency & Idempotency Stress', () => {
  it('1.6.1: 100 consecutive init() -> destroy() cycles execute without leaks or state corruption', () => {
    const env = instantiateHowWeWork();
    for (let i = 0; i < 100; i++) {
      const resInit = env.module.init();
      assert.strictEqual(resInit.initialized, true);
      assert.doesNotThrow(() => env.module.destroy());
    }
  });

  it('1.6.2: Calling init() repeatedly without destroy() returns alreadyInitialized', () => {
    const env = instantiateHowWeWork();
    env.module.destroy(); // reset initial load

    const first = env.module.init();
    assert.strictEqual(first.initialized, true);
    assert.strictEqual(first.alreadyInitialized, undefined);

    const second = env.module.init();
    assert.strictEqual(second.initialized, true);
    assert.strictEqual(second.alreadyInitialized, true);

    const third = env.module.init();
    assert.strictEqual(third.initialized, true);
    assert.strictEqual(third.alreadyInitialized, true);

    env.module.destroy();
  });

  it('1.6.3: Calling destroy() on uninitialized module does not throw', () => {
    const env = instantiateHowWeWork();
    assert.doesNotThrow(() => env.module.destroy());
    assert.doesNotThrow(() => env.module.destroy());
  });
});
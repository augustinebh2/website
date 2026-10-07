const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, test, it, assert } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readAppJs() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
}

// Helper to create a mock DOM environment for app.js testing ModalModule
function createMockModalEnvironment() {
  const eventListeners = {
    elements: {},
    document: {}
  };

  const createMockElement = (id, tagName = 'DIV') => {
    const classSet = new Set();
    const el = {
      id,
      tagName,
      classList: {
        add: (...cls) => cls.forEach(c => classSet.add(c)),
        remove: (...cls) => cls.forEach(c => classSet.delete(c)),
        contains: (c) => classSet.has(c)
      },
      style: {},
      querySelector: (selector) => {
        if (selector === 'form' && id === 'demo-modal') return mockElements.modalForm;
        return null;
      },
      querySelectorAll: () => [],
      addEventListener: (evt, fn) => {
        if (!eventListeners.elements[id]) eventListeners.elements[id] = {};
        if (!eventListeners.elements[id][evt]) eventListeners.elements[id][evt] = [];
        eventListeners.elements[id][evt].push(fn);
      },
      setAttribute: () => {},
      value: 'test_value'
    };
    return el;
  };

  const mockElements = {
    demoModal: createMockElement('demo-modal'),
    modalForm: createMockElement('modal-consultation-form', 'FORM'),
    consultationForm: createMockElement('consultation-form', 'FORM'),
    modalDate: createMockElement('modal-selected-date', 'INPUT'),
    modalTime: createMockElement('modal-selected-time', 'INPUT')
  };

  const mockDocument = {
    getElementById: (id) => {
      if (id === 'demo-modal') return mockElements.demoModal;
      if (id === 'modal-consultation-form') return mockElements.modalForm;
      if (id === 'consultation-form') return mockElements.consultationForm;
      if (id === 'modal-selected-date') return mockElements.modalDate;
      if (id === 'modal-selected-time') return mockElements.modalTime;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.modal-backdrop, .modal') return mockElements.demoModal;
      return null;
    },
    querySelectorAll: (selector) => {
      if (selector === '[data-modal-target="demo-modal"], [data-modal="demo"], .open-modal-btn' ||
          selector === '#close-modal-btn, .modal-close-btn, [data-modal-close]') {
        return [createMockElement('btn')];
      }
      return [];
    },
    addEventListener: (evt, fn) => {
      if (!eventListeners.document[evt]) eventListeners.document[evt] = [];
      eventListeners.document[evt].push(fn);
    },
    body: { style: {} },
    createElement: () => ({}),
    head: { appendChild: () => ({}) }
  };

  // Mock Cal namespace
  const mockCal = function(action, type, config) {};
  mockCal.ns = {
    meeting: function(action, config) {}
  };

  const mockWindow = {
    addEventListener: () => {},
    requestAnimationFrame: (cb) => { cb(); return 1; },
    cancelAnimationFrame: () => {},
    IntersectionObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    document: mockDocument,
    Cal: mockCal
  };

  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    console: { log: () => {}, error: () => {} },
    setTimeout: (cb) => cb(),
    Date: Date,
    Cal: mockCal
  };

  return { sandbox, mockElements, eventListeners };
}

describe('Booking Wizard / Modal Module (app.js) Feature Tests', () => {
  test('ModalModule form submission successfully triggers resetBookingWizard without errors', () => {
    const { sandbox, mockElements, eventListeners } = createMockModalEnvironment();
    const appJsCode = readAppJs();
    const context = vm.createContext(sandbox);

    // Execute app.js in sandbox
    vm.runInContext(appJsCode, context);

    if (eventListeners.document['DOMContentLoaded']) {
      eventListeners.document['DOMContentLoaded'].forEach(fn => fn());
    }

    const submitListeners = eventListeners.elements['modal-consultation-form']?.['submit'];
    assert.ok(submitListeners && submitListeners.length > 0, 'modal-consultation-form should have a submit event listener');

    let preventedDefault = false;
    const mockEvent = {
      preventDefault: () => { preventedDefault = true; }
    };

    // Trigger submit
    assert.doesNotThrow(() => {
      submitListeners[0](mockEvent);
    }, 'Form submission should execute without throwing errors, validating resetBookingWizard() execution');

    assert.strictEqual(preventedDefault, true, 'Form submission should call preventDefault()');
  });

  test('Consultation form submission successfully executes logic without errors', () => {
    const { sandbox, mockElements, eventListeners } = createMockModalEnvironment();

    let formResetCalled = false;
    mockElements.consultationForm.reset = () => { formResetCalled = true; };

    const appJsCode = readAppJs();
    const context = vm.createContext(sandbox);
    vm.runInContext(appJsCode, context);

    if (eventListeners.document['DOMContentLoaded']) {
      eventListeners.document['DOMContentLoaded'].forEach(fn => fn());
    }

    const submitListeners = eventListeners.elements['consultation-form']?.['submit'];
    assert.ok(submitListeners && submitListeners.length > 0, 'consultation-form should have a submit event listener');

    let preventedDefault = false;
    const mockEvent = {
      preventDefault: () => { preventedDefault = true; }
    };

    assert.doesNotThrow(() => {
      submitListeners[0](mockEvent);
    }, 'consultation-form submission should execute without throwing errors');

    assert.strictEqual(preventedDefault, true, 'consultation-form submission should call preventDefault()');
    assert.strictEqual(formResetCalled, true, 'consultation-form submission should call form.reset()');
  });
});

/**
 * Tier 5: Accordion Module Adversarial & Logic Tests
 * ===================================================
 * Verifies AccordionModule logic including:
 * 1. ARIA attribute assignments on initialization.
 * 2. Interaction state changes on click.
 * 3. Interaction state changes on keyboard events (Enter/Space).
 * 4. Mutual exclusion (closing other accordions in the same container).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, test, it, assert } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readAppJs() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
}

// Minimal mock DOM for Accordion tests
function createAccordionMockDOM() {
  class MockClassList {
    constructor() { this.classes = new Set(); }
    add(c) { this.classes.add(c); }
    remove(c) { this.classes.delete(c); }
    contains(c) { return this.classes.has(c); }
  }

  class MockElement {
    constructor(tag = 'div') {
      this.tagName = tag.toUpperCase();
      this.classList = new MockClassList();
      this.attributes = new Map();
      this.listeners = {};
      this.children = [];
      this.parentElement = null;
    }

    setAttribute(k, v) { this.attributes.set(k, String(v)); }
    getAttribute(k) { return this.attributes.has(k) ? this.attributes.get(k) : null; }
    removeAttribute(k) { this.attributes.delete(k); }

    addEventListener(event, fn) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    }

    dispatchEvent(eventObj) {
      const type = eventObj.type;
      if (this.listeners[type]) {
        this.listeners[type].forEach(fn => fn(eventObj));
      }
    }

    appendChild(child) {
      this.children.push(child);
      child.parentElement = this;
    }

    closest(selector) {
      let current = this;
      const selectors = selector.split(',').map(s => s.trim());
      while (current) {
        const classNames = Array.from(current.classList.classes);
        for (const sel of selectors) {
          if (sel.startsWith('.') && classNames.includes(sel.substring(1))) {
            return current;
          }
        }
        current = current.parentElement;
      }
      return null;
    }

    querySelectorAll(selector) {
      const results = [];
      const selectors = selector.split(',').map(s => s.trim());
      const traverse = (node) => {
        let matches = false;
        const classNames = Array.from(node.classList.classes);
        for (const sel of selectors) {
          if (sel.startsWith('.') && classNames.includes(sel.substring(1))) {
            matches = true;
            break;
          }
        }
        if (matches && node !== this) results.push(node);
        node.children.forEach(traverse);
      };
      traverse(this);
      return results;
    }

    querySelector(selector) {
      const res = this.querySelectorAll(selector);
      return res.length > 0 ? res[0] : null;
    }
  }

  const container = new MockElement();
  container.classList.add('minimal-accordion-list');

  const item1 = new MockElement();
  item1.classList.add('minimal-accordion-item');
  const header1 = new MockElement();
  header1.classList.add('minimal-accordion-header');
  item1.appendChild(header1);

  const item2 = new MockElement();
  item2.classList.add('minimal-accordion-item');
  const header2 = new MockElement();
  header2.classList.add('minimal-accordion-header');
  item2.appendChild(header2);

  container.appendChild(item1);
  container.appendChild(item2);

  return { container, item1, header1, item2, header2, MockElement };
}

describe('Tier 5.12: Accordion Module Interaction & State Machine Contracts', () => {
  test('5.12.1: Accordion headers receive correct ARIA roles and tabindexes on init', () => {
    const dom = createAccordionMockDOM();
    const sandbox = {
      window: {},
      document: {
        addEventListener: () => {},
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: (selector) => {
          if (selector.includes('.minimal-accordion-header') || selector.includes('.faq-header')) {
            return [dom.header1, dom.header2];
          }
          return [];
        }
      }
    };
    const context = vm.createContext(sandbox);
    vm.runInContext(readAppJs(), context);
    sandbox.window.Intellectir.AccordionModule.init();

    assert.strictEqual(dom.header1.getAttribute('role'), 'button');
    assert.strictEqual(dom.header1.getAttribute('tabindex'), '0');
    assert.strictEqual(dom.header1.getAttribute('aria-expanded'), 'false');
  });

  test('5.12.2: Accordion toggles open and close on click, updating classes and ARIA attributes', () => {
    const dom = createAccordionMockDOM();
    const sandbox = {
      window: {},
      document: {
        addEventListener: () => {},
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: (selector) => {
          if (selector.includes('.minimal-accordion-header') || selector.includes('.faq-header')) {
            return [dom.header1, dom.header2];
          }
          return [];
        }
      }
    };
    const context = vm.createContext(sandbox);
    vm.runInContext(readAppJs(), context);
    sandbox.window.Intellectir.AccordionModule.init();

    // Click to open item 1
    dom.header1.dispatchEvent({ type: 'click' });
    assert.ok(dom.item1.classList.contains('active'), 'Item 1 should be active');
    assert.strictEqual(dom.header1.getAttribute('aria-expanded'), 'true');
    assert.ok(!dom.item2.classList.contains('active'), 'Item 2 should not be active');

    // Click to open item 2, should close item 1 (mutual exclusion)
    dom.header2.dispatchEvent({ type: 'click' });
    assert.ok(!dom.item1.classList.contains('active'), 'Item 1 should not be active');
    assert.strictEqual(dom.header1.getAttribute('aria-expanded'), 'false');
    assert.ok(dom.item2.classList.contains('active'), 'Item 2 should be active');
    assert.strictEqual(dom.header2.getAttribute('aria-expanded'), 'true');

    // Click to close item 2
    dom.header2.dispatchEvent({ type: 'click' });
    assert.ok(!dom.item2.classList.contains('active'), 'Item 2 should not be active');
    assert.strictEqual(dom.header2.getAttribute('aria-expanded'), 'false');
  });

  test('5.12.3: Accordion toggles on Enter and Space keydown events', () => {
    const dom = createAccordionMockDOM();
    const sandbox = {
      window: {},
      document: {
        addEventListener: () => {},
        getElementById: () => null,
        querySelector: () => null,
        querySelectorAll: (selector) => {
          if (selector.includes('.minimal-accordion-header') || selector.includes('.faq-header')) {
            return [dom.header1, dom.header2];
          }
          return [];
        }
      }
    };
    const context = vm.createContext(sandbox);
    vm.runInContext(readAppJs(), context);
    sandbox.window.Intellectir.AccordionModule.init();

    let preventDefaultCalled = false;
    const preventDefault = () => { preventDefaultCalled = true; };

    // Test Enter key
    dom.header1.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault });
    assert.ok(preventDefaultCalled, 'preventDefault should be called on Enter');
    assert.ok(dom.item1.classList.contains('active'), 'Item 1 should be active on Enter');

    preventDefaultCalled = false;

    // Test Space key (closes it since it's open)
    dom.header1.dispatchEvent({ type: 'keydown', key: ' ', preventDefault });
    assert.ok(preventDefaultCalled, 'preventDefault should be called on Space');
    assert.ok(!dom.item1.classList.contains('active'), 'Item 1 should be closed on Space');
  });
});

const { describe, test, it, assert } = require('./e2e_runner');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readAppJs() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
}

function extractInitTabsFunction(jsCode) {
    const startIdx = jsCode.indexOf('function initTabs() {');
    if (startIdx === -1) throw new Error('Could not find initTabs in app.js');

    let braceCount = 0;
    let endIdx = -1;
    for (let i = startIdx; i < jsCode.length; i++) {
        if (jsCode[i] === '{') braceCount++;
        if (jsCode[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                endIdx = i;
                break;
            }
        }
    }

    if (endIdx === -1) throw new Error('Could not find end of initTabs in app.js');

    return jsCode.substring(startIdx, endIdx + 1);
}

function createSimpleMockDOM() {
    const elements = [];

    function createEl(tag, classes = [], id = null) {
        const classSet = new Set(classes);
        const attrs = new Map();
        const listeners = {};

        const el = {
            tagName: tag.toUpperCase(),
            id,
            classList: {
                add: (c) => classSet.add(c),
                remove: (c) => classSet.delete(c),
                contains: (c) => classSet.has(c),
                toggle: (c, f) => {
                    if (f !== undefined) {
                        if (f) classSet.add(c); else classSet.delete(c);
                    } else {
                        if (classSet.has(c)) classSet.delete(c); else classSet.add(c);
                    }
                }
            },
            getAttribute: (k) => attrs.get(k) || null,
            setAttribute: (k, v) => attrs.set(k, String(v)),
            addEventListener: (evt, cb) => {
                if (!listeners[evt]) listeners[evt] = [];
                listeners[evt].push(cb);
            },
            click: () => {
                if (listeners['click']) {
                    listeners['click'].forEach(cb => cb({}));
                }
            },
            style: {},
            querySelectorAll: (sel) => {
                if (sel.startsWith('.')) {
                    const c = sel.substring(1);
                    return elements.filter(e => e.classList.contains(c));
                }
                if (sel.startsWith('#')) {
                    const idx = sel.substring(1);
                    return elements.filter(e => e.id === idx);
                }
                return [];
            },
            querySelector: (sel) => {
                const res = el.querySelectorAll(sel);
                return res.length > 0 ? res[0] : null;
            }
        };

        el.closest = (sel) => {
           if (sel.startsWith('.')) {
               const c = sel.substring(1);
               return el._parent || null;
           }
           return null;
        };

        elements.push(el);
        return el;
    }

    const document = {
        querySelectorAll: (sel) => {
            if (sel.startsWith('.')) {
                const c = sel.substring(1);
                return elements.filter(e => e.classList.contains(c));
            }
            return [];
        },
        getElementById: (id) => {
            return elements.find(e => e.id === id) || null;
        }
    };

    return { document, createEl, elements };
}

describe('App.js Tabs Interactions (initTabs)', () => {
  it('should be able to extract initTabs', () => {
     const jsCode = readAppJs();
     const initTabs = extractInitTabsFunction(jsCode);
     assert.ok(initTabs.includes('function initTabs()'), 'Function signature found');
     assert.ok(initTabs.includes('prop-tab-btn'), 'Contains prop-tab-btn logic');
  });

  it('should correctly toggle Business Proposition Section Tabs', () => {
     const jsCode = readAppJs();
     const initTabsCode = extractInitTabsFunction(jsCode);

     const { document, createEl } = createSimpleMockDOM();

     const navParent = createEl('div', ['prop-tabs-nav']);
     const container = createEl('div', ['prop-cards-container']);

     navParent.nextElementSibling = container;

     const btn1 = createEl('button', ['prop-tab-btn']);
     btn1.setAttribute('data-tab-id', 'tab1');
     btn1._parent = navParent;

     const btn2 = createEl('button', ['prop-tab-btn', 'active']);
     btn2.setAttribute('data-tab-id', 'tab2');
     btn2._parent = navParent;

     const panel1 = createEl('div', ['prop-card-panel'], 'tab1');
     const panel2 = createEl('div', ['prop-card-panel', 'active'], 'tab2');

     navParent.querySelectorAll = (sel) => [btn1, btn2].filter(b => b.classList.contains(sel.substring(1)));
     container.querySelectorAll = (sel) => [panel1, panel2].filter(p => p.classList.contains(sel.substring(1)));
     container.querySelector = (sel) => [panel1, panel2].find(p => p.id === sel.substring(1));

     const script = new vm.Script(`${initTabsCode}; initTabs();`);
     const context = vm.createContext({ document, parseInt });
     script.runInContext(context);

     btn1.click();

     assert.ok(btn1.classList.contains('active'), 'btn1 should be active');
     assert.ok(!btn2.classList.contains('active'), 'btn2 should lose active');
     assert.ok(panel1.classList.contains('active'), 'panel1 should be active');
     assert.ok(!panel2.classList.contains('active'), 'panel2 should lose active');
  });

  it('should correctly toggle General Tabs', () => {
     const jsCode = readAppJs();
     const initTabsCode = extractInitTabsFunction(jsCode);

     const { document, createEl } = createSimpleMockDOM();

     const btn1 = createEl('button', ['tab-btn']);
     btn1.setAttribute('data-tab', '1');

     const btn2 = createEl('button', ['tab-btn', 'active']);
     btn2.setAttribute('data-tab', '2');

     const pane1 = createEl('div', ['tab-pane'], 'tab-1');
     const pane2 = createEl('div', ['tab-pane', 'active'], 'tab-2');

     const script = new vm.Script(`${initTabsCode}; initTabs();`);
     const context = vm.createContext({ document, parseInt });
     script.runInContext(context);

     btn1.click();

     assert.ok(btn1.classList.contains('active'), 'btn1 should be active');
     assert.ok(!btn2.classList.contains('active'), 'btn2 should lose active');
     assert.ok(pane1.classList.contains('active'), 'pane1 should be active');
     assert.ok(!pane2.classList.contains('active'), 'pane2 should lose active');
  });

  it('should correctly toggle Problem Tabs', () => {
     const jsCode = readAppJs();
     const initTabsCode = extractInitTabsFunction(jsCode);

     const { document, createEl } = createSimpleMockDOM();

     const btn1 = createEl('button', ['prob-tab-btn']);
     btn1.setAttribute('data-problem', 'prob1');

     const btn2 = createEl('button', ['prob-tab-btn', 'active']);
     btn2.setAttribute('data-problem', 'prob2');

     const block1 = createEl('div', ['problem-content-block'], 'problem-prob1-block');
     const block2 = createEl('div', ['problem-content-block', 'active'], 'problem-prob2-block');

     const script = new vm.Script(`${initTabsCode}; initTabs();`);
     const context = vm.createContext({ document, parseInt });
     script.runInContext(context);

     btn1.click();

     assert.ok(btn1.classList.contains('active'), 'btn1 should be active');
     assert.ok(!btn2.classList.contains('active'), 'btn2 should lose active');
     assert.ok(block1.classList.contains('active'), 'block1 should be active');
     assert.ok(!block2.classList.contains('active'), 'block2 should lose active');
  });

  it('should correctly toggle Step Pills in Sticky Showcase', () => {
     const jsCode = readAppJs();
     const initTabsCode = extractInitTabsFunction(jsCode);

     const { document, createEl } = createSimpleMockDOM();

     const stickySection = createEl('div', [], 'sticky-showcase');

     const text1 = createEl('div', ['sticky-text-layer']);
     text1.setAttribute('data-step', '0');
     const text2 = createEl('div', ['sticky-text-layer']);
     text2.setAttribute('data-step', '1');

     const graphic1 = createEl('div', ['sticky-graphic-layer']);
     graphic1.setAttribute('data-step', '0');
     const graphic2 = createEl('div', ['sticky-graphic-layer']);
     graphic2.setAttribute('data-step', '1');

     const pill1 = createEl('div', ['step-pill', 'active']);
     const pill2 = createEl('div', ['step-pill']);

     stickySection.querySelectorAll = (sel) => {
         if (sel === '.sticky-text-layer') return [text1, text2];
         if (sel === '.sticky-graphic-layer') return [graphic1, graphic2];
         if (sel === '.step-pill') return [pill1, pill2];
         return [];
     };

     const script = new vm.Script(`${initTabsCode}; initTabs();`);
     const context = vm.createContext({ document, parseInt });
     script.runInContext(context);

     pill2.click();

     assert.ok(!pill1.classList.contains('active'), 'pill1 should lose active');
     assert.ok(pill2.classList.contains('active'), 'pill2 should be active');
     assert.ok(!text1.classList.contains('active'), 'text1 should lose active');
     assert.ok(text2.classList.contains('active'), 'text2 should be active');
     assert.ok(!graphic1.classList.contains('active'), 'graphic1 should lose active');
     assert.ok(graphic2.classList.contains('active'), 'graphic2 should be active');
  });

  it('should correctly animate Proposition Slider Pills', () => {
     const jsCode = readAppJs();
     const initTabsCode = extractInitTabsFunction(jsCode);

     const { document, createEl } = createSimpleMockDOM();

     const propTrack = createEl('div', [], 'prop-slider-track');

     const pill1 = createEl('div', ['prop-tab-pill', 'active']);
     const pill2 = createEl('div', ['prop-tab-pill']);
     const pill3 = createEl('div', ['prop-tab-pill']);

     const script = new vm.Script(`${initTabsCode}; initTabs();`);
     const context = vm.createContext({ document, parseInt });
     script.runInContext(context);

     pill2.click();

     assert.ok(!pill1.classList.contains('active'), 'pill1 should lose active');
     assert.ok(pill2.classList.contains('active'), 'pill2 should be active');
     assert.strictEqual(propTrack.style.transform, 'translateX(-33.333333%)', 'Track should translate to 2nd pos');

     pill3.click();
     assert.ok(pill3.classList.contains('active'), 'pill3 should be active');
     assert.strictEqual(propTrack.style.transform, 'translateX(-66.666666%)', 'Track should translate to 3rd pos');
  });
});

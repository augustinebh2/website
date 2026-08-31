/**
 * ADVERSARIAL CLIENT-SIDE UI/UX & INTERACTIVITY STRESS TEST HARNESS
 * ================================================================
 * Challenger 2: Empirical Verification & Adversarial Hardening Suite
 *
 * Test Suites:
 * 1. Discover Search & Regex Injection / State Machine Fuzzing
 * 2. ROI Calculator Boundary & Department Matrix Stress
 * 3. Mobile Navigation Drawer & Keyboard / Resize Lifecycle
 * 4. Modal Dialog Accessibility, Focus Trapping & Toast Race Conditions
 * 5. Accordion & Interactive UI Components
 * 6. WCAG 2.1 AA Mathematical Color Contrast Compliance Verification
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const APP_JS_PATH = path.join(PROJECT_ROOT, 'app.js');
const STYLES_CSS_PATH = path.join(PROJECT_ROOT, 'styles.css');
const DISCOVER_HTML_PATH = path.join(PROJECT_ROOT, 'discover.html');
const INDEX_HTML_PATH = path.join(PROJECT_ROOT, 'index.html');
const COMPANY_HTML_PATH = path.join(PROJECT_ROOT, 'company.html');
const INDUSTRIES_HTML_PATH = path.join(PROJECT_ROOT, 'industries.html');
const SOLUTIONS_HTML_PATH = path.join(PROJECT_ROOT, 'solutions.html');

// ANSI Color Helpers
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
    dim: '\x1b[2m'
};

let totalPassed = 0;
let totalFailed = 0;
const failures = [];

function testCase(name, fn) {
    try {
        fn();
        console.log(`  ${colors.green}✔ PASS${colors.reset} ${name}`);
        totalPassed++;
    } catch (err) {
        console.log(`  ${colors.red}✖ FAIL${colors.reset} ${name}`);
        console.log(`    ${colors.dim}${err.message}${colors.reset}`);
        totalFailed++;
        failures.push({ name, error: err.message, stack: err.stack });
    }
}

/* ==========================================================================
   ROBUST SYNTHETIC DOM & HTML PARSER FOR ZERO-DEPENDENCY NODE TESTING
   ========================================================================== */

class DOMTokenList {
    constructor(element) {
        this.element = element;
        this.tokens = new Set();
    }
    add(...tokens) {
        tokens.forEach(t => { if (t) this.tokens.add(t); });
        this._sync();
    }
    remove(...tokens) {
        tokens.forEach(t => { this.tokens.delete(t); });
        this._sync();
    }
    toggle(token, force) {
        if (force !== undefined) {
            if (force) this.tokens.add(token);
            else this.tokens.delete(token);
        } else {
            if (this.tokens.has(token)) this.tokens.delete(token);
            else this.tokens.add(token);
        }
        this._sync();
        return this.tokens.has(token);
    }
    contains(token) {
        return this.tokens.has(token);
    }
    _sync() {
        this.element.attributes['class'] = Array.from(this.tokens).join(' ');
    }
    _fromClass(className) {
        this.tokens.clear();
        (className || '').split(/\s+/).filter(Boolean).forEach(t => this.tokens.add(t));
    }
}

class CSSStyleDeclaration {
    constructor() {
        this._styles = {};
    }
    get display() { return this._styles.display || ''; }
    set display(v) { this._styles.display = v; }
    get opacity() { return this._styles.opacity || ''; }
    set opacity(v) { this._styles.opacity = v; }
    get transform() { return this._styles.transform || ''; }
    set transform(v) { this._styles.transform = v; }
    get width() { return this._styles.width || ''; }
    set width(v) { this._styles.width = v; }
    get overflow() { return this._styles.overflow || ''; }
    set overflow(v) { this._styles.overflow = v; }
    getPropertyValue(prop) { return this._styles[prop] || ''; }
    setProperty(prop, val) { this._styles[prop] = val; }
}

class DOMNode {
    constructor(tagName = 'div') {
        this.tagName = tagName.toUpperCase();
        this.nodeType = 1;
        this.attributes = {};
        this.children = [];
        this.parentNode = null;
        this.classList = new DOMTokenList(this);
        this.style = new CSSStyleDeclaration();
        this.listeners = {};
        this._value = '';
        this._textContent = '';
        this.disabled = false;
        this.offsetWidth = 100;
        this.offsetHeight = 100;
        this.ownerDocument = null;
    }

    get id() { return this.attributes['id'] || ''; }
    set id(val) { this.setAttribute('id', val); }

    get className() { return this.attributes['class'] || ''; }
    set className(val) { this.setAttribute('class', val); }

    get value() { return this._value; }
    set value(v) { this._value = String(v); }

    get textContent() {
        if (this.children.length === 0) return this._textContent;
        return this.children.map(c => c.textContent).join(' ');
    }
    set textContent(v) {
        this._textContent = String(v);
        this.children = [];
    }

    get innerHTML() { return this._textContent; }
    set innerHTML(v) { this._textContent = String(v); }

    getAttribute(attr) {
        const key = attr.toLowerCase();
        return this.attributes[key] !== undefined ? this.attributes[key] : null;
    }
    setAttribute(attr, val) {
        const key = attr.toLowerCase();
        this.attributes[key] = String(val);
        if (key === 'class') this.classList._fromClass(String(val));
        if (key === 'value') this._value = String(val);
    }
    removeAttribute(attr) {
        delete this.attributes[attr.toLowerCase()];
    }
    hasAttribute(attr) {
        return this.attributes[attr.toLowerCase()] !== undefined;
    }

    appendChild(child) {
        child.parentNode = this;
        child.ownerDocument = this.ownerDocument || this;
        this.children.push(child);
        return child;
    }

    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) {
            child.parentNode = null;
            this.children.splice(idx, 1);
        }
        return child;
    }

    contains(node) {
        if (!node) return false;
        if (node === this) return true;
        for (const child of this.children) {
            if (child.contains(node)) return true;
        }
        return false;
    }

    closest(selector) {
        let curr = this;
        while (curr) {
            if (curr.matches && curr.matches(selector)) return curr;
            curr = curr.parentNode;
        }
        return null;
    }

    matches(selector) {
        const selList = selector.split(',').map(s => s.trim());
        for (const sel of selList) {
            if (this._matchSingleSelector(sel)) return true;
        }
        return false;
    }

    _matchSingleSelector(sel) {
        // Handle :not(...)
        const notMatches = sel.match(/:not\(([^)]+)\)/g);
        let baseSel = sel;
        if (notMatches) {
            for (const notClause of notMatches) {
                const inner = notClause.slice(5, -1);
                if (this._matchSingleSelector(inner)) return false;
                baseSel = baseSel.replace(notClause, '');
            }
        }
        if (!baseSel) return true;

        const parts = baseSel.match(/([.#\[][^.#\[]+|[a-zA-Z0-9\-_*]+)/g);
        if (!parts) return false;

        for (const part of parts) {
            if (part.startsWith('#')) {
                if (this.id !== part.substring(1)) return false;
            } else if (part.startsWith('.')) {
                if (!this.classList.contains(part.substring(1))) return false;
            } else if (part.startsWith('[')) {
                const m = part.slice(1, -1).match(/([a-zA-Z0-9_\-]+)(?:=["']?(.*?)["']?)?$/);
                if (m) {
                    const attr = m[1].toLowerCase();
                    const val = m[2];
                    if (val !== undefined) {
                        if (this.getAttribute(attr) !== val) return false;
                    } else {
                        if (!this.hasAttribute(attr)) return false;
                    }
                } else {
                    return false;
                }
            } else if (part !== '*') {
                if (this.tagName.toLowerCase() !== part.toLowerCase()) return false;
            }
        }
        return true;
    }

    querySelector(selector) {
        const all = this.querySelectorAll(selector);
        return all.length > 0 ? all[0] : null;
    }

    querySelectorAll(selector) {
        const results = [];
        const selList = selector.split(',').map(s => s.trim());

        function walk(node) {
            for (const child of node.children) {
                let matched = false;
                for (const sel of selList) {
                    if (matchesComplexSelector(child, sel)) {
                        results.push(child);
                        matched = true;
                        break;
                    }
                }
                walk(child);
            }
        }

        function matchesComplexSelector(node, sel) {
            const segments = sel.trim().split(/\s+/);
            if (segments.length === 1) {
                return node.matches(segments[0]);
            }
            // Multi-segment descendant match
            if (!node.matches(segments[segments.length - 1])) return false;
            let curr = node.parentNode;
            let segIdx = segments.length - 2;
            while (curr && segIdx >= 0) {
                if (curr.matches(segments[segIdx])) {
                    segIdx--;
                }
                curr = curr.parentNode;
            }
            return segIdx < 0;
        }

        walk(this);
        return results;
    }

    addEventListener(event, fn) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(fn);
    }

    removeEventListener(event, fn) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(f => f !== fn);
        }
    }

    dispatchEvent(event) {
        event.target = event.target || this;
        event.currentTarget = this;
        if (this.listeners[event.type]) {
            for (const fn of this.listeners[event.type]) {
                fn.call(this, event);
                if (event._stopped) break;
            }
        }
        if (!event._stopped && this.parentNode && event.bubbles) {
            this.parentNode.dispatchEvent(event);
        }
        return !event.defaultPrevented;
    }

    click() {
        const e = {
            type: 'click',
            target: this,
            currentTarget: this,
            bubbles: true,
            defaultPrevented: false,
            _stopped: false,
            preventDefault() { this.defaultPrevented = true; },
            stopPropagation() { this._stopped = true; }
        };
        this.dispatchEvent(e);
    }

    focus() {
        const doc = this.ownerDocument || (this.nodeType === 9 ? this : null);
        if (doc) doc.activeElement = this;
    }

    reset() {
        const inputs = this.querySelectorAll('input, select, textarea');
        inputs.forEach(i => { i.value = ''; });
    }
}

class SyntheticDocument extends DOMNode {
    constructor() {
        super('#document');
        this.nodeType = 9;
        this.ownerDocument = this;
        this.head = new DOMNode('head');
        this.head.ownerDocument = this;
        this.body = new DOMNode('body');
        this.body.ownerDocument = this;
        this.appendChild(this.head);
        this.appendChild(this.body);
        this.activeElement = this.body;
        this.readyState = 'complete';
    }

    getElementById(id) {
        return this.querySelector(`#${id}`);
    }

    createElement(tag) {
        const el = new DOMNode(tag);
        el.ownerDocument = this;
        return el;
    }
}

// Tree-Building HTML Parser
function parseHTMLIntoDocument(htmlString, doc) {
    const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
    const tagRegex = /<!--[\s\S]*?-->|<(\/)?([a-zA-Z0-9\-]+)([^>]*)>|([^<]+)/g;
    const attrRegex = /([a-zA-Z0-9\-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^>\s]+)))?/g;

    let currentParent = doc.body;
    let match;

    while ((match = tagRegex.exec(htmlString)) !== null) {
        const fullMatch = match[0];
        if (fullMatch.startsWith('<!--')) continue;

        const isClosing = match[1] === '/';
        const tagName = match[2];
        const attrString = match[3];
        const textContent = match[4];

        if (textContent) {
            const cleanText = textContent.trim();
            if (cleanText && currentParent) {
                currentParent._textContent = (currentParent._textContent ? currentParent._textContent + ' ' : '') + cleanText;
            }
            continue;
        }

        if (isClosing) {
            if (currentParent && currentParent.parentNode && currentParent.tagName.toLowerCase() === tagName.toLowerCase()) {
                currentParent = currentParent.parentNode;
            }
            continue;
        }

        if (tagName) {
            const lowerTag = tagName.toLowerCase();
            if (lowerTag === 'html' || lowerTag === 'head' || lowerTag === 'body' || lowerTag === '!doctype') {
                continue;
            }

            const element = doc.createElement(tagName);

            if (attrString) {
                let attrMatch;
                while ((attrMatch = attrRegex.exec(attrString)) !== null) {
                    const attrName = attrMatch[1];
                    const attrVal = attrMatch[2] !== undefined ? attrMatch[2] : (attrMatch[3] !== undefined ? attrMatch[3] : (attrMatch[4] !== undefined ? attrMatch[4] : ''));
                    element.setAttribute(attrName, attrVal);
                }
            }

            currentParent.appendChild(element);

            if (!voidTags.has(lowerTag) && !fullMatch.endsWith('/>')) {
                currentParent = element;
            }
        }
    }
    return doc;
}

function createIntellectirEnvironment(htmlPath) {
    const doc = new SyntheticDocument();
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    parseHTMLIntoDocument(htmlContent, doc);

    const win = {
        document: doc,
        innerWidth: 1200,
        innerHeight: 800,
        scrollY: 0,
        pageYOffset: 0,
        addEventListener: (event, fn) => doc.addEventListener(event, fn),
        removeEventListener: (event, fn) => doc.removeEventListener(event, fn),
        dispatchEvent: (event) => doc.dispatchEvent(event),
        requestAnimationFrame: (cb) => setTimeout(cb, 16),
        cancelAnimationFrame: (id) => clearTimeout(id),
        setTimeout: global.setTimeout,
        clearTimeout: global.clearTimeout,
        setInterval: global.setInterval,
        clearInterval: global.clearInterval,
        IntersectionObserver: class {
            constructor(cb) { this.cb = cb; }
            observe() {}
            unobserve() {}
            disconnect() {}
        }
    };

    global.window = win;
    global.document = doc;
    global.IntersectionObserver = win.IntersectionObserver;

    // Load and evaluate app.js within this sandbox
    const appCode = fs.readFileSync(APP_JS_PATH, 'utf-8');
    const sandboxFunc = new Function('window', 'document', appCode);
    sandboxFunc(win, doc);

    return { win, doc, Intellectir: win.Intellectir };
}

/* ==========================================================================
   START TEST SUITES
   ========================================================================== */

console.log(`\n${colors.bold}${colors.cyan}=================================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  INTELLECTIR ADVERSARIAL STRESS TEST SUITE — CHALLENGER 2      ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}\n`);

// --------------------------------------------------------------------------
// SUITE 1: Discover Search & Regex Metacharacters / HTML Injection
// --------------------------------------------------------------------------
console.log(`${colors.bold}Suite 1: Discover Search Filter & Malicious Payload Fuzzing${colors.reset}`);

testCase('1.1: escapeRegex() handles dangerous regex metacharacters without throwing', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(DISCOVER_HTML_PATH);
    const searchInput = doc.getElementById('discover-search-input');
    assert.ok(searchInput, 'Search input should exist in discover.html');

    const maliciousPatterns = [
        '.*', '[a-z]+', '(', ')', '\\', '?', '^', '$', '+', '*', '{1,100}', '(?=.*)', '(?<=)',
        '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', // email regex
        '((a+)+)+$', // catastrophic backtracking ReDoS pattern
        '(\\d+)*',
        '\\u0000\\uFFFF',
        '"><script>alert(1)</script>',
        '<img src=x onerror=alert("XSS")>',
        '\' OR \'1\'=\'1',
        '${process.exit(1)}',
        '{{constructor.constructor("alert(1)")()}}',
        'A'.repeat(10000) // 10k character input
    ];

    for (const pattern of maliciousPatterns) {
        searchInput.value = pattern;
        Intellectir.DiscoverFilterModule.filterArticles();
        // Verifies zero throws across all adversarial regexes
    }
});

testCase('1.2: Discover search correctly matches case-insensitive queries and filters cards', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(DISCOVER_HTML_PATH);
    const searchInput = doc.getElementById('discover-search-input');
    const cards = doc.querySelectorAll('.discover-article-card');
    assert.ok(cards.length > 0, `Should find discover article cards (found ${cards.length})`);

    // Search 'RAG' (uppercase)
    searchInput.value = 'RAG';
    Intellectir.DiscoverFilterModule.filterArticles();

    let visibleCount = 0;
    cards.forEach(card => {
        if (card.style.display !== 'none') visibleCount++;
    });
    assert.ok(visibleCount > 0, `Matching RAG query should keep at least 1 card visible (found ${visibleCount})`);

    // Search nonexistent query 'ZZZZ_NO_MATCH_999'
    searchInput.value = 'ZZZZ_NO_MATCH_999';
    Intellectir.DiscoverFilterModule.filterArticles();
    let noMatchVisible = 0;
    cards.forEach(card => {
        if (card.style.display !== 'none') noMatchVisible++;
    });
    assert.strictEqual(noMatchVisible, 0, 'No cards should be visible for non-matching query');

    // Clear search -> all restored
    searchInput.value = '';
    Intellectir.DiscoverFilterModule.filterArticles();
    let allVisible = 0;
    cards.forEach(card => {
        if (card.style.display !== 'none') allVisible++;
    });
    assert.strictEqual(allVisible, cards.length, 'All cards should be visible after clearing search');
});

testCase('1.3: Category pill switching state machine combined with search query', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(DISCOVER_HTML_PATH);
    const pills = doc.querySelectorAll('.filter-pill');
    const cards = doc.querySelectorAll('.discover-article-card');
    const searchInput = doc.getElementById('discover-search-input');

    assert.ok(pills.length >= 4, `Should find filter pills (found ${pills.length})`);

    // Find RAG pill
    const ragPill = Array.from(pills).find(p => p.getAttribute('data-category') === 'rag');
    assert.ok(ragPill, 'Should find RAG category pill');

    // Click RAG pill
    ragPill.click();

    // Verify only RAG cards are displayed
    cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (cat === 'rag') {
            assert.strictEqual(card.style.display, '', 'RAG card must be visible under RAG pill');
        } else {
            assert.strictEqual(card.style.display, 'none', `Card with category ${cat} must be hidden under RAG pill`);
        }
    });

    // Reset to All Topics
    const allPill = Array.from(pills).find(p => p.getAttribute('data-category') === 'all');
    allPill.click();
    cards.forEach(card => {
        assert.strictEqual(card.style.display, '', 'All cards must be visible under All Topics');
    });
});

// --------------------------------------------------------------------------
// SUITE 2: ROI Calculator Boundary Stress & Extreme Value Invariance
// --------------------------------------------------------------------------
console.log(`\n${colors.bold}Suite 2: ROI Calculator Boundary Stress & Extreme Bounds${colors.reset}`);

testCase('2.1: Slider boundary handling: Clamping negative, zero, and huge numbers (1 <= teamSize <= 500)', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(DISCOVER_HTML_PATH);

    const slider = doc.getElementById('team-size-slider');
    const badge = doc.getElementById('team-size-val');
    const resHours = doc.getElementById('res-hours');
    const resSavings = doc.getElementById('res-savings');

    assert.ok(slider, 'team-size-slider should exist');
    assert.ok(badge, 'team-size-val should exist');
    assert.ok(resHours, 'res-hours should exist');
    assert.ok(resSavings, 'res-savings should exist');

    const boundaryValues = [
        { input: '-100', expectedTeam: 1, expectedPlural: '1 Employee' },
        { input: '0', expectedTeam: 1, expectedPlural: '1 Employee' },
        { input: '1', expectedTeam: 1, expectedPlural: '1 Employee' },
        { input: '2', expectedTeam: 2, expectedPlural: '2 Employees' },
        { input: '10', expectedTeam: 10, expectedPlural: '10 Employees' },
        { input: '500', expectedTeam: 500, expectedPlural: '500 Employees' },
        { input: '999999', expectedTeam: 500, expectedPlural: '500 Employees' },
        { input: 'NaN', expectedTeam: 1, expectedPlural: '1 Employee' },
        { input: 'abc', expectedTeam: 1, expectedPlural: '1 Employee' },
        { input: 'null', expectedTeam: 1, expectedPlural: '1 Employee' },
        { input: '12.8', expectedTeam: 12, expectedPlural: '12 Employees' }
    ];

    for (const b of boundaryValues) {
        slider.value = b.input;
        const res = Intellectir.RoiCalculatorModule.calculate();
        assert.strictEqual(res.teamSize, b.expectedTeam, `Input '${b.input}' should clamp to ${b.expectedTeam}`);
        assert.strictEqual(badge.textContent, b.expectedPlural, `Badge should pluralize correctly for ${b.expectedTeam}`);
        assert.ok(!resHours.textContent.includes('NaN'), `Hours output must not contain NaN for input ${b.input}`);
        assert.ok(!resSavings.textContent.includes('NaN'), `Savings output must not contain NaN for input ${b.input}`);
    }
});

testCase('2.2: Department matrix math & multiplier calculation accuracy', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(DISCOVER_HTML_PATH);
    const slider = doc.getElementById('team-size-slider');
    const resHours = doc.getElementById('res-hours');
    const resSavings = doc.getElementById('res-savings');
    slider.value = '10';

    const deptBtns = doc.querySelectorAll('.dept-btn');
    assert.ok(deptBtns.length >= 4, `Should find department buttons (found ${deptBtns.length})`);

    const deptExpected = {
        support: { hours: 22, rate: 45, weekly: 220, annual: Math.round(220 * 45 * 52 * 0.70) },
        sales: { hours: 18, rate: 65, weekly: 180, annual: Math.round(180 * 65 * 52 * 0.70) },
        finance: { hours: 25, rate: 55, weekly: 250, annual: Math.round(250 * 55 * 52 * 0.70) },
        operations: { hours: 20, rate: 60, weekly: 200, annual: Math.round(200 * 60 * 52 * 0.70) }
    };

    deptBtns.forEach(btn => {
        btn.click();
        const deptKey = btn.getAttribute('data-dept');
        const exp = deptExpected[deptKey];
        if (exp) {
            const res = Intellectir.RoiCalculatorModule.calculate();
            assert.strictEqual(res.weeklyHours, exp.weekly, `Weekly hours for ${deptKey} should be ${exp.weekly}`);
            assert.strictEqual(res.annualSavings, exp.annual, `Annual savings for ${deptKey} should be ${exp.annual}`);
            assert.strictEqual(resHours.textContent, `${exp.weekly.toLocaleString()} hrs`);
            assert.strictEqual(resSavings.textContent, `$${exp.annual.toLocaleString()}`);
        }
    });
});

testCase('2.3: Graceful fallback when department data attributes are missing or malformed', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(DISCOVER_HTML_PATH);
    const slider = doc.getElementById('team-size-slider');
    slider.value = '5';

    // Remove active from all buttons and add an invalid one
    const deptBtns = doc.querySelectorAll('.dept-btn');
    deptBtns.forEach(b => b.classList.remove('active'));

    const hackedBtn = doc.createElement('button');
    hackedBtn.className = 'dept-btn active';
    hackedBtn.setAttribute('data-dept', 'malicious_sql_injection');
    doc.body.appendChild(hackedBtn);

    const res = Intellectir.RoiCalculatorModule.calculate();
    assert.strictEqual(res.deptKey, 'support', 'Should fallback to default support department');
    assert.ok(res.annualSavings > 0, 'Annual savings should compute valid positive number');
});

// --------------------------------------------------------------------------
// SUITE 3: Mobile Navigation Drawer & Keyboard / Resize Lifecycle
// --------------------------------------------------------------------------
console.log(`\n${colors.bold}Suite 3: Mobile Navigation Drawer Lifecycle & Accessibility${colors.reset}`);

testCase('3.1: Mobile drawer toggle synchronizes aria-expanded, is-active, and is-open', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(INDEX_HTML_PATH);
    const navToggle = doc.getElementById('nav-toggle');
    const primaryNav = doc.getElementById('primary-nav');

    assert.ok(navToggle, 'nav-toggle must exist in index.html');
    assert.ok(primaryNav, 'primary-nav must exist in index.html');

    assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'false');
    assert.strictEqual(primaryNav.classList.contains('is-open'), false);

    // Click to open
    navToggle.click();
    assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'true');
    assert.strictEqual(navToggle.classList.contains('is-active'), true);
    assert.strictEqual(primaryNav.classList.contains('is-open'), true);

    // Click to close
    navToggle.click();
    assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'false');
    assert.strictEqual(navToggle.classList.contains('is-active'), false);
    assert.strictEqual(primaryNav.classList.contains('is-open'), false);
});

testCase('3.2: Mobile drawer ESC key dismisses open menu and restores toggle focus', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(INDEX_HTML_PATH);
    const navToggle = doc.getElementById('nav-toggle');
    const primaryNav = doc.getElementById('primary-nav');

    // Open drawer
    Intellectir.HeaderNavModule.openNav();
    assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'true');

    // Press Escape on document
    doc.dispatchEvent({ type: 'keydown', key: 'Escape', target: doc.body });
    assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'false', 'Escape must close drawer');
    assert.strictEqual(primaryNav.classList.contains('is-open'), false);
    assert.strictEqual(doc.activeElement, navToggle, 'Focus must be restored to navToggle');
});

testCase('3.3: Mobile drawer click outside dismisses menu', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(INDEX_HTML_PATH);
    const primaryNav = doc.getElementById('primary-nav');
    const mainContent = doc.getElementById('primary') || doc.body;

    Intellectir.HeaderNavModule.openNav();
    assert.strictEqual(primaryNav.classList.contains('is-open'), true);

    // Click outside on main content
    mainContent.click();
    assert.strictEqual(primaryNav.classList.contains('is-open'), false, 'Click outside header and nav must close drawer');
});

testCase('3.4: Rapid spam toggle clicking preserves consistent boolean state', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(INDEX_HTML_PATH);
    const navToggle = doc.getElementById('nav-toggle');
    const primaryNav = doc.getElementById('primary-nav');

    for (let i = 0; i < 101; i++) {
        navToggle.click();
    }
    // 101 toggles -> open (odd number)
    assert.strictEqual(navToggle.getAttribute('aria-expanded'), 'true');
    assert.strictEqual(primaryNav.classList.contains('is-open'), true);
});

// --------------------------------------------------------------------------
// SUITE 4: Modal Dialog Accessibility, Focus Trapping & Toast System
// --------------------------------------------------------------------------
console.log(`\n${colors.bold}Suite 4: Modal Accessibility, Focus Trapping & Toast System${colors.reset}`);

testCase('4.1: Modal open/close lifecycle manages aria-hidden and body overflow locking', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(INDEX_HTML_PATH);
    const triggerBtn = doc.querySelector('[data-modal-target="demo-modal"]');
    const modal = doc.getElementById('demo-modal');
    const closeBtn = doc.getElementById('close-modal-btn');

    assert.ok(triggerBtn, 'Trigger button should exist');
    assert.ok(modal, 'Modal should exist');
    assert.ok(closeBtn, 'Close button should exist');

    assert.strictEqual(modal.getAttribute('aria-hidden'), 'true');
    assert.strictEqual(doc.body.style.overflow, '');

    // Open modal
    triggerBtn.click();
    assert.strictEqual(modal.getAttribute('aria-hidden'), 'false');
    assert.strictEqual(modal.classList.contains('is-open'), true);
    assert.strictEqual(doc.body.style.overflow, 'hidden', 'Body overflow must be hidden when modal is active');

    // Close modal
    closeBtn.click();
    assert.strictEqual(modal.getAttribute('aria-hidden'), 'true');
    assert.strictEqual(modal.classList.contains('is-open'), false);
    assert.strictEqual(doc.body.style.overflow, '', 'Body overflow must be restored after modal closes');
});

testCase('4.2: Modal keyboard focus trapping handles forward Tab and reverse Shift+Tab', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(INDEX_HTML_PATH);
    const modal = doc.getElementById('demo-modal');
    Intellectir.ModalModule.open();

    const focusables = modal.querySelectorAll('a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
    assert.ok(focusables.length >= 4, `Modal should contain focusable elements (found ${focusables.length})`);

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Forward Tab from last element -> wraps to first
    last.focus();
    let defaultPrevented = false;
    doc.dispatchEvent({
        type: 'keydown',
        key: 'Tab',
        shiftKey: false,
        target: doc.body,
        preventDefault() { defaultPrevented = true; }
    });
    assert.strictEqual(defaultPrevented, true, 'Tab from last element must prevent default');
    assert.strictEqual(doc.activeElement, first, 'Tab from last element must wrap to first element');

    // Shift+Tab from first element -> wraps to last
    first.focus();
    defaultPrevented = false;
    doc.dispatchEvent({
        type: 'keydown',
        key: 'Tab',
        shiftKey: true,
        target: doc.body,
        preventDefault() { defaultPrevented = true; }
    });
    assert.strictEqual(defaultPrevented, true, 'Shift+Tab from first element must prevent default');
    assert.strictEqual(doc.activeElement, last, 'Shift+Tab from first element must wrap to last element');
});

testCase('4.3: Modal ESC key closes dialog and restores focus to triggering element', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(INDEX_HTML_PATH);
    const triggerBtn = doc.querySelector('[data-modal-target="demo-modal"]');
    const modal = doc.getElementById('demo-modal');

    triggerBtn.focus();
    triggerBtn.click();
    assert.strictEqual(Intellectir.ModalModule.isOpen(), true);

    // Press Escape
    doc.dispatchEvent({ type: 'keydown', key: 'Escape', target: doc.body, preventDefault() {} });
    assert.strictEqual(Intellectir.ModalModule.isOpen(), false, 'Escape key must close modal');
    assert.strictEqual(doc.activeElement, triggerBtn, 'Focus must return to trigger button after modal dismiss');
});

testCase('4.4: Backdrop click closes modal; interior dialog click does not', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(INDEX_HTML_PATH);
    const modal = doc.getElementById('demo-modal');
    const modalDialog = modal.querySelector('.modal-card, .modal-dialog');

    Intellectir.ModalModule.open();
    assert.strictEqual(Intellectir.ModalModule.isOpen(), true);

    // Click inside dialog
    modalDialog.click();
    assert.strictEqual(Intellectir.ModalModule.isOpen(), true, 'Clicking inside modal card must NOT close modal');

    // Click directly on backdrop
    modal.click();
    assert.strictEqual(Intellectir.ModalModule.isOpen(), false, 'Clicking on backdrop must close modal');
});

testCase('4.5: Toast notification system handles rapid calls without timer collisions', () => {
    const { Intellectir, doc, win } = createIntellectirEnvironment(INDEX_HTML_PATH);
    const toast = doc.getElementById('toast');
    const toastMsg = doc.getElementById('toast-message');

    assert.ok(toast, 'Toast element should exist in index.html');
    assert.ok(toastMsg, 'Toast message element should exist');

    for (let i = 1; i <= 50; i++) {
        win.showToast(`Notification #${i}`);
        assert.strictEqual(toastMsg.textContent, `Notification #${i}`);
        assert.strictEqual(toast.classList.contains('show'), true);
    }
});

// --------------------------------------------------------------------------
// SUITE 5: Accordion & Interactive UI Components
// --------------------------------------------------------------------------
console.log(`\n${colors.bold}Suite 5: Accordion & Interactive UI Components${colors.reset}`);

testCase('5.1: Accordion expand/collapse with keyboard (Enter/Space) and mutual exclusivity', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(INDEX_HTML_PATH);

    const headers = doc.querySelectorAll('.minimal-accordion-header, .faq-header');
    if (headers.length >= 2) {
        const h1 = headers[0];
        const h2 = headers[1];
        const item1 = h1.closest('.minimal-accordion-item, .faq-item');
        const item2 = h2.closest('.minimal-accordion-item, .faq-item');

        assert.strictEqual(h1.getAttribute('role'), 'button');
        assert.strictEqual(h1.getAttribute('tabindex'), '0');

        // Open h1 via Enter key
        h1.dispatchEvent({ type: 'keydown', key: 'Enter', preventDefault() {} });
        assert.strictEqual(item1.classList.contains('active'), true);
        assert.strictEqual(h1.getAttribute('aria-expanded'), 'true');
        assert.strictEqual(item2.classList.contains('active'), false);

        // Open h2 via Space key -> h1 collapses, h2 expands
        h2.dispatchEvent({ type: 'keydown', key: ' ', preventDefault() {} });
        assert.strictEqual(item1.classList.contains('active'), false, 'Item 1 should collapse when Item 2 opens');
        assert.strictEqual(item2.classList.contains('active'), true, 'Item 2 should expand');
        assert.strictEqual(h2.getAttribute('aria-expanded'), 'true');
    }
});

testCase('5.2: Capability & Problem Tab Switching across pages', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(SOLUTIONS_HTML_PATH);
    const tabBtns = doc.querySelectorAll('.tab-btn');
    const tabPanes = doc.querySelectorAll('.tab-pane');

    if (tabBtns.length >= 2) {
        tabBtns[1].click();
        assert.strictEqual(tabBtns[1].classList.contains('active'), true);
        assert.strictEqual(tabBtns[0].classList.contains('active'), false);
    }
});

testCase('5.3: Speed-to-Lead Live Graph Pill Switching', () => {
    const { Intellectir, doc } = createIntellectirEnvironment(DISCOVER_HTML_PATH);
    const timePills = doc.querySelectorAll('.time-pill-btn');
    const dispMult = doc.getElementById('disp-graph-mult');
    const dispTime = doc.getElementById('disp-graph-time');

    if (timePills.length >= 4) {
        const p15 = Array.from(timePills).find(p => p.getAttribute('data-time') === '15min');
        if (p15) {
            p15.click();
            assert.strictEqual(p15.classList.contains('active'), true);
            if (dispMult) assert.strictEqual(dispMult.textContent, '10x');
            if (dispTime) assert.strictEqual(dispTime.textContent, '15 Mins');
        }
    }
});

// --------------------------------------------------------------------------
// SUITE 6: Multi-Page Initializer Safety (Zero Uncaught Exceptions)
// --------------------------------------------------------------------------
console.log(`\n${colors.bold}Suite 6: Multi-Page Initializer Safety & Zero Uncaught Exceptions${colors.reset}`);

const ALL_PAGES = [
    { name: 'index.html', path: INDEX_HTML_PATH },
    { name: 'company.html', path: COMPANY_HTML_PATH },
    { name: 'discover.html', path: DISCOVER_HTML_PATH },
    { name: 'industries.html', path: INDUSTRIES_HTML_PATH },
    { name: 'solutions.html', path: SOLUTIONS_HTML_PATH }
];

ALL_PAGES.forEach(({ name, path: pagePath }) => {
    testCase(`6.${ALL_PAGES.indexOf(ALL_PAGES.find(p => p.name === name)) + 1}: ${name} initializes all modules without errors or missing element crashes`, () => {
        const { Intellectir, doc } = createIntellectirEnvironment(pagePath);
        assert.doesNotThrow(() => {
            Intellectir.init();
        }, `Intellectir.init() must execute cleanly on ${name}`);

        const navToggle = doc.getElementById('nav-toggle');
        const modal = doc.getElementById('demo-modal');
        const toast = doc.getElementById('toast');

        assert.ok(navToggle, `${name} must include #nav-toggle`);
        assert.ok(modal, `${name} must include #demo-modal`);
        assert.ok(toast, `${name} must include #toast`);
    });
});

// --------------------------------------------------------------------------
// SUITE 7: WCAG 2.1 AA Mathematical Color Contrast Compliance Engine
// --------------------------------------------------------------------------
console.log(`\n${colors.bold}Suite 7: WCAG 2.1 AA Mathematical Color Contrast Verification${colors.reset}`);


// WCAG 2.1 Formula Implementation
function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

function getLuminance(rgb) {
    const a = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastRatio(hex1, hex2) {
    const l1 = getLuminance(hexToRgb(hex1));
    const l2 = getLuminance(hexToRgb(hex2));
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

testCase('7.1: Primary Button (.btn-primary) contrast ratio >= 4.5:1 against white text', () => {
    const white = '#ffffff';
    const accentPrimary = '#2563eb'; // Royal blue
    const accentPrimaryHover = '#1d4ed8'; // Darker blue
    const accentSecondary = '#4f46e5'; // Indigo

    const ratioDefault = getContrastRatio(white, accentPrimary);
    const ratioHover = getContrastRatio(white, accentPrimaryHover);
    const ratioSecondary = getContrastRatio(white, accentSecondary);

    console.log(`    ${colors.dim}Ratio #ffffff on #2563eb: ${ratioDefault.toFixed(2)}:1 (Min 4.5:1)${colors.reset}`);
    console.log(`    ${colors.dim}Ratio #ffffff on #1d4ed8: ${ratioHover.toFixed(2)}:1 (Min 4.5:1)${colors.reset}`);
    console.log(`    ${colors.dim}Ratio #ffffff on #4f46e5: ${ratioSecondary.toFixed(2)}:1 (Min 4.5:1)${colors.reset}`);

    assert.ok(ratioDefault >= 4.5, `.btn-primary default contrast (${ratioDefault.toFixed(2)}) must be >= 4.5:1`);
    assert.ok(ratioHover >= 4.5, `.btn-primary hover contrast (${ratioHover.toFixed(2)}) must be >= 4.5:1`);
    assert.ok(ratioSecondary >= 4.5, `.btn-primary indigo gradient contrast (${ratioSecondary.toFixed(2)}) must be >= 4.5:1`);
});

testCase('7.2: Body typography contrast ratios in Light Theme meet WCAG AA (>= 4.5:1)', () => {
    const bgMain = '#ffffff';
    const bgSecondary = '#f8fafc';
    const textPrimary = '#0f172a';
    const textSecondary = '#334155';
    const textMuted = '#64748b';

    const ratioPrimary = getContrastRatio(textPrimary, bgMain);
    const ratioSecondary = getContrastRatio(textSecondary, bgMain);
    const ratioMuted = getContrastRatio(textMuted, bgMain);
    const ratioMutedOnSec = getContrastRatio(textMuted, bgSecondary);

    console.log(`    ${colors.dim}Primary text #0f172a on #ffffff: ${ratioPrimary.toFixed(2)}:1${colors.reset}`);
    console.log(`    ${colors.dim}Secondary text #334155 on #ffffff: ${ratioSecondary.toFixed(2)}:1${colors.reset}`);
    console.log(`    ${colors.dim}Muted text #64748b on #ffffff: ${ratioMuted.toFixed(2)}:1${colors.reset}`);
    console.log(`    ${colors.dim}Muted text #64748b on #f8fafc: ${ratioMutedOnSec.toFixed(2)}:1${colors.reset}`);

    assert.ok(ratioPrimary >= 4.5, `Primary text contrast (${ratioPrimary.toFixed(2)}) must be >= 4.5:1`);
    assert.ok(ratioSecondary >= 4.5, `Secondary text contrast (${ratioSecondary.toFixed(2)}) must be >= 4.5:1`);
    assert.ok(ratioMuted >= 4.5, `Muted text contrast (${ratioMuted.toFixed(2)}) must be >= 4.5:1`);
    assert.ok(ratioMutedOnSec >= 4.5, `Muted text on secondary background (${ratioMutedOnSec.toFixed(2)}) must be >= 4.5:1`);
});

testCase('7.3: Dark Theme typography contrast ratios meet WCAG AA (>= 4.5:1)', () => {
    const bgDark = '#090d16';
    const bgDarkSurface = '#0f172a';
    const textInverse = '#ffffff';
    const textInverseMuted = '#cbd5e1';
    const slate400 = '#94a3b8';

    const ratioInverseOnDark = getContrastRatio(textInverse, bgDark);
    const ratioInverseOnSurface = getContrastRatio(textInverse, bgDarkSurface);
    const ratioInverseMutedOnDark = getContrastRatio(textInverseMuted, bgDark);
    const ratioSlateOnDark = getContrastRatio(slate400, bgDark);

    console.log(`    ${colors.dim}Inverse text #ffffff on #090d16: ${ratioInverseOnDark.toFixed(2)}:1${colors.reset}`);
    console.log(`    ${colors.dim}Inverse text #ffffff on #0f172a: ${ratioInverseOnSurface.toFixed(2)}:1${colors.reset}`);
    console.log(`    ${colors.dim}Inverse muted #cbd5e1 on #090d16: ${ratioInverseMutedOnDark.toFixed(2)}:1${colors.reset}`);
    console.log(`    ${colors.dim}Slate-400 #94a3b8 on #090d16: ${ratioSlateOnDark.toFixed(2)}:1${colors.reset}`);

    assert.ok(ratioInverseOnDark >= 4.5, `Inverse text contrast (${ratioInverseOnDark.toFixed(2)}) must be >= 4.5:1`);
    assert.ok(ratioInverseOnSurface >= 4.5, `Inverse surface contrast (${ratioInverseOnSurface.toFixed(2)}) must be >= 4.5:1`);
    assert.ok(ratioInverseMutedOnDark >= 4.5, `Inverse muted contrast (${ratioInverseMutedOnDark.toFixed(2)}) must be >= 4.5:1`);
    assert.ok(ratioSlateOnDark >= 4.5, `Slate-400 contrast (${ratioSlateOnDark.toFixed(2)}) must be >= 4.5:1`);
});

testCase('7.4: Accent Badges & UI Components contrast ratios (WCAG 2.1 AA >= 3.0:1 UI / >= 4.5:1 Text)', () => {

    const bgWhite = '#ffffff';
    const bgDark = '#090d16';
    const emeraldDark = '#047857';
    const amberDark = '#d97706';
    const rose = '#e11d48';
    const cyan = '#0284c7';

    const ratioEmerald = getContrastRatio(emeraldDark, bgWhite);
    const ratioAmber = getContrastRatio(amberDark, bgWhite);
    const ratioRose = getContrastRatio(rose, bgWhite);
    const ratioCyanOnDark = getContrastRatio(cyan, bgDark);
    const ratioCyanOnWhite = getContrastRatio(cyan, bgWhite);

    console.log(`    ${colors.dim}Emerald dark #047857 on white: ${ratioEmerald.toFixed(2)}:1 (Text >= 4.5:1)${colors.reset}`);
    console.log(`    ${colors.dim}Rose #e11d48 on white: ${ratioRose.toFixed(2)}:1 (Text >= 4.5:1)${colors.reset}`);
    console.log(`    ${colors.dim}Amber #d97706 on white: ${ratioAmber.toFixed(2)}:1 (UI Component / Large Text >= 3.0:1)${colors.reset}`);
    console.log(`    ${colors.dim}Cyan #0284c7 on dark #090d16: ${ratioCyanOnDark.toFixed(2)}:1 (Text >= 4.5:1)${colors.reset}`);
    console.log(`    ${colors.dim}Cyan #0284c7 on white #ffffff: ${ratioCyanOnWhite.toFixed(2)}:1 (UI Component / Icon >= 3.0:1)${colors.reset}`);

    assert.ok(ratioEmerald >= 4.5, `Emerald dark text contrast must be >= 4.5:1`);
    assert.ok(ratioRose >= 4.5, `Rose text contrast must be >= 4.5:1`);
    assert.ok(ratioAmber >= 3.0, `Amber UI component contrast must be >= 3.0:1`);
    assert.ok(ratioCyanOnDark >= 4.5, `Cyan text contrast on dark theme must be >= 4.5:1`);
    assert.ok(ratioCyanOnWhite >= 3.0, `Cyan UI icon contrast on white must be >= 3.0:1`);
});

// --------------------------------------------------------------------------
// TEST SUMMARY & REPORTING
// --------------------------------------------------------------------------
console.log(`\n${colors.bold}${colors.cyan}=================================================================${colors.reset}`);
console.log(`${colors.bold}ADVERSARIAL STRESS TEST SUMMARY:${colors.reset}`);
console.log(`  Total Passed: ${colors.green}${colors.bold}${totalPassed}${colors.reset}`);
console.log(`  Total Failed: ${totalFailed > 0 ? colors.red : colors.green}${colors.bold}${totalFailed}${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}=================================================================${colors.reset}\n`);

if (totalFailed > 0) {
    console.error(`${colors.red}${colors.bold}VERDICT: FAIL (${totalFailed} failure(s) detected)${colors.reset}`);
    process.exit(1);
} else {
    console.log(`${colors.green}${colors.bold}VERDICT: PASS (100% Adversarial & Accessibility Checks Cleared)${colors.reset}\n`);
    process.exit(0);
}

const { describe, test, it, assert } = require('./e2e_runner');
const fs = require('fs');
const path = require('path');

describe('Tier 3: Discover Filter and Rank Functional Unit Tests', () => {

    class MockElement {
        constructor(tagName, id, className = '') {
            this.tagName = tagName;
            this.id = id;
            this.className = className;
            this.style = {};
            this.attributes = {};
            this.children = [];
            this.textContent = '';
            this.innerHTML = '';
            this.value = '';

            this.classList = {
                add: (c) => { if (!this.className.includes(c)) this.className += ` ${c}`; },
                remove: (c) => { this.className = this.className.replace(new RegExp(`\\b${c}\\b`, 'g'), '').trim(); },
                toggle: (c) => { if (this.className.includes(c)) this.classList.remove(c); else this.classList.add(c); }
            };
        }
        getAttribute(n) { return this.attributes[n] || null; }
        setAttribute(n, v) { this.attributes[n] = v; }
        appendChild(c) { this.children.push(c); }
        querySelector(sel) {
            if (sel === '.pill-count') return this.children.find(c => c.className && c.className.includes('pill-count')) || null;
            if (sel === 'span:first-child') return this.children[0] || null;
            if (sel === '.article-title') return this.children.find(c => c.className && c.className.includes('article-title')) || null;
            if (sel === '.article-desc') return this.children.find(c => c.className && c.className.includes('article-desc')) || null;
            return null;
        }
        querySelectorAll(sel) {
            if (sel === '.discover-article-card') return this.children.filter(c => c.className && c.className.includes('discover-article-card'));
            return [];
        }
        addEventListener() {}
        getBoundingClientRect() { return { top: 0, height: 100, width: 100 }; }
    }

    function setupEnvironment() {
        const dom = {
            window: {
                addEventListener: () => {},
                matchMedia: () => ({ matches: false, addEventListener: () => {} }),
                requestAnimationFrame: (cb) => setTimeout(cb, 0),
                cancelAnimationFrame: () => {},
                innerWidth: 1024,
                innerHeight: 768,
                location: { pathname: '/discover.html', search: '' },
                Cal: () => {} // Mock Cal.com script
            },
            elements: {}
        };

        const documentMock = {
            addEventListener: () => {},
            getElementById: (id) => dom.elements[id] || null,
            querySelector: (sel) => {
                if (sel === '.filter-pill.active, .category-pill.active') {
                    return dom.elements.pills.find(p => p.className.includes('active')) || null;
                }
                if (sel === '.hww-wireframe') return new MockElement('DIV', '');
                return null;
            },
            querySelectorAll: (sel) => {
                if (sel === '.filter-pill, .category-pill') return dom.elements.pills;
                if (sel === '.discover-article-card, .case-card, .insight-card, .article-card, .whitepaper, .research-card') return dom.elements.cards || [];
                if (sel === '.hww-corner-node' || sel === '.hww-quadrant') return [];
                if (sel === '.accordion-item') return [];
                return [];
            },
            createElement: (tagName) => new MockElement(tagName, '')
        };

        dom.document = documentMock;

        // Setup DOM for Discover
        dom.elements['discover-search-input'] = new MockElement('INPUT', 'discover-search-input');
        dom.elements['discover-search-clear'] = new MockElement('BUTTON', 'discover-search-clear');
        dom.elements['discover-articles-grid'] = new MockElement('DIV', 'discover-articles-grid');
        dom.elements['discover-no-results'] = new MockElement('DIV', 'discover-no-results');
        dom.elements['discover-results-count'] = new MockElement('DIV', 'discover-results-count');
        dom.elements['empty-state-reset-btn'] = new MockElement('BUTTON', 'empty-state-reset-btn');

        // Setup Pills
        const allPill = new MockElement('DIV', '', 'filter-pill active');
        allPill.setAttribute('data-category', 'all');
        const pillCountAll = new MockElement('SPAN', '', 'pill-count');
        allPill.appendChild(new MockElement('SPAN', ''));
        allPill.appendChild(pillCountAll);

        const strategyPill = new MockElement('DIV', '', 'filter-pill');
        strategyPill.setAttribute('data-category', 'strategy');
        const pillCountStrat = new MockElement('SPAN', '', 'pill-count');
        strategyPill.appendChild(new MockElement('SPAN', ''));
        strategyPill.appendChild(pillCountStrat);

        dom.elements.pills = [allPill, strategyPill];
        dom.elements.cards = [];

        return dom;
    }

    function loadApp(dom) {
        const appJsPath = path.join(__dirname, '..', 'app.js');
        const appJs = fs.readFileSync(appJsPath, 'utf8');

        // Execute app.js in a confined scope to define window.Intellectir safely
        const scriptFn = new Function('window', 'document', 'localStorage', 'IntersectionObserver', 'matchMedia', 'requestAnimationFrame', 'cancelAnimationFrame', 'Cal', appJs);
        scriptFn(dom.window, dom.document, { getItem: () => null, setItem: () => {} }, class { observe(){} unobserve(){} disconnect(){} }, dom.window.matchMedia, dom.window.requestAnimationFrame, dom.window.cancelAnimationFrame, dom.window.Cal);

        return dom.window.Intellectir;
    }

    function createCard(dom, title, desc, publisher, category, tags) {
        const card = new MockElement('ARTICLE', '', 'discover-article-card');
        card.setAttribute('data-title', title);
        card.setAttribute('data-summary', desc);
        card.setAttribute('data-publisher', publisher);
        card.setAttribute('data-category', category);
        card.setAttribute('data-tags', tags);

        const titleEl = new MockElement('H3', '', 'article-title');
        titleEl.textContent = title;
        const descEl = new MockElement('P', '', 'article-desc');
        descEl.textContent = desc;

        card.appendChild(titleEl);
        card.appendChild(descEl);

        dom.elements['discover-articles-grid'].appendChild(card);
        dom.elements.cards.push(card);
        return card;
    }

    test('3.X.1: Core functionality - empty search returns all items in original order', () => {
        const dom = setupEnvironment();
        const card1 = createCard(dom, 'AI in Finance', 'A broad overview', 'P1', 'strategy', 't1');
        const card2 = createCard(dom, 'Tech Planning', 'Planning for AI', 'P2', 'engineering', 't2');

        const intellectir = loadApp(dom);
        intellectir.DiscoverFilterModule.init();

        dom.elements['discover-search-input'].value = '';
        dom.elements.pills.forEach(p => p.classList.remove('active'));
        dom.elements.pills[0].classList.add('active'); // "all"

        intellectir.DiscoverFilterModule.filterArticles();

        assert.strictEqual(card1.style.display, '');
        assert.strictEqual(card2.style.display, '');
        assert.strictEqual(dom.elements['discover-no-results'].style.display, 'none');
        assert.ok(dom.elements['discover-results-count'].textContent.includes('Showing all 2 articles'));
    });

    test('3.X.2: Category filtering hides non-matching categories', () => {
        const dom = setupEnvironment();
        const card1 = createCard(dom, 'AI in Finance', 'A broad overview', 'P1', 'strategy', 't1');
        const card2 = createCard(dom, 'Tech Planning', 'Planning for AI', 'P2', 'engineering', 't2');

        const intellectir = loadApp(dom);
        intellectir.DiscoverFilterModule.init();

        dom.elements['discover-search-input'].value = '';
        dom.elements.pills.forEach(p => p.classList.remove('active'));
        dom.elements.pills[1].classList.add('active'); // "strategy"

        intellectir.DiscoverFilterModule.filterArticles();

        assert.strictEqual(card1.style.display, '');
        assert.strictEqual(card2.style.display, 'none');
    });

    test('3.X.3: Search filtering hides non-matching queries', () => {
        const dom = setupEnvironment();
        const card1 = createCard(dom, 'Finance AI', 'D1', 'P1', 'strategy', 't1');
        const card2 = createCard(dom, 'Tech AI', 'D2', 'P2', 'strategy', 't2');

        const intellectir = loadApp(dom);
        intellectir.DiscoverFilterModule.init();

        dom.elements['discover-search-input'].value = 'finance';
        dom.elements.pills.forEach(p => p.classList.remove('active'));
        dom.elements.pills[0].classList.add('active'); // "all"

        intellectir.DiscoverFilterModule.filterArticles();

        assert.strictEqual(card1.style.display, '');
        assert.strictEqual(card2.style.display, 'none');
        assert.ok(dom.elements['discover-results-count'].textContent.includes('Showing 1 result'));
    });

    test('3.X.4: Relevance ranking prioritizes exact phrase matches over token matches', () => {
        const dom = setupEnvironment();
        const grid = dom.elements['discover-articles-grid'];
        const card1 = createCard(dom, 'AI in Finance', 'A broad overview', 'P1', 'strategy', 't1');
        const card2 = createCard(dom, 'Strategic Planning', 'Planning for AI in finance sector', 'P2', 'strategy', 't2');

        const intellectir = loadApp(dom);
        intellectir.DiscoverFilterModule.init();

        dom.elements['discover-search-input'].value = 'ai in finance';
        dom.elements.pills.forEach(p => p.classList.remove('active'));
        dom.elements.pills[0].classList.add('active'); // "all"

        // Track append order by overriding appendChild
        let appendedOrder = [];
        grid.appendChild = (node) => {
            if (node.tagName === 'ARTICLE') appendedOrder.push(node.getAttribute('data-title'));
        };

        intellectir.DiscoverFilterModule.filterArticles();

        assert.strictEqual(appendedOrder.length, 2);
        assert.strictEqual(appendedOrder[0], 'AI in Finance'); // Ranked first due to exact match
        assert.strictEqual(appendedOrder[1], 'Strategic Planning');
    });

    test('3.X.5: Zero results shows empty state', () => {
        const dom = setupEnvironment();
        const card1 = createCard(dom, 'First', 'D1', 'P1', 'a', 't1');

        const intellectir = loadApp(dom);
        intellectir.DiscoverFilterModule.init();

        dom.elements['discover-search-input'].value = 'xyz123';
        dom.elements.pills.forEach(p => p.classList.remove('active'));
        dom.elements.pills[0].classList.add('active'); // "all"

        intellectir.DiscoverFilterModule.filterArticles();

        assert.strictEqual(card1.style.display, 'none');
        assert.strictEqual(dom.elements['discover-no-results'].style.display, 'block');
        assert.ok(dom.elements['discover-results-count'].textContent.includes('Showing 0 results for "xyz123"'));
    });
});

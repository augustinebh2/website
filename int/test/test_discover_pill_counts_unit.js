const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, test } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

describe('Tier 5.12: DiscoverFilterModule updatePillCounts', () => {
    test('5.12.1: updatePillCounts correctly updates based on search query', () => {
        const code = fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');

        const mockWindow = {
            addEventListener: () => {},
            requestAnimationFrame: () => 1,
            cancelAnimationFrame: () => {},
            setTimeout: () => 1,
            clearTimeout: () => {},
            Intellectir: {},
            Cal: Object.assign(() => {}, { ns: { meeting: () => {} } })
        };

        const searchInput = { value: '', focus: () => {}, select: () => {}, addEventListener: () => {} };
        const clearBtn = { style: { display: 'none' }, addEventListener: () => {} };
        const resultsCountEl = { textContent: '' };
        const noResultsEl = { style: { display: 'none' } };
        const emptyResetBtn = { addEventListener: () => {} };
        const articlesGrid = { appendChild: () => {} };

        const mockPills = [
            { cat: 'all', getAttribute: () => 'all', classList: { add: ()=>{}, remove: ()=>{} }, setAttribute: ()=>{}, el: { textContent: '' } },
            { cat: 'strategy', getAttribute: () => 'strategy', classList: { add: ()=>{}, remove: ()=>{} }, setAttribute: ()=>{}, el: { textContent: '' } },
            { cat: 'implementation', getAttribute: () => 'implementation', classList: { add: ()=>{}, remove: ()=>{} }, setAttribute: ()=>{}, el: { textContent: '' } }
        ];

        mockPills.forEach(p => {
            p.querySelector = () => p.el;
            p.addEventListener = () => {};
        });

        const mockCards = [
            {
                getAttribute: (attr) => {
                    if (attr === 'data-title') return 'Agent AI';
                    if (attr === 'data-summary') return 'How agents work';
                    if (attr === 'data-publisher') return 'IBM';
                    if (attr === 'data-category') return 'strategy';
                    if (attr === 'data-tags') return 'ai,agent';
                    return null;
                },
                querySelector: () => ({ textContent: 'mock', innerHTML: 'mock', querySelector: () => null }),
                style: {},
                classList: { add: () => {} }
            },
            {
                getAttribute: (attr) => {
                    if (attr === 'data-title') return 'RAG Systems';
                    if (attr === 'data-summary') return 'Data retrieval';
                    if (attr === 'data-publisher') return 'McKinsey';
                    if (attr === 'data-category') return 'strategy';
                    if (attr === 'data-tags') return 'rag,data';
                    return null;
                },
                querySelector: () => ({ textContent: 'mock', innerHTML: 'mock', querySelector: () => null }),
                style: {},
                classList: { add: () => {} }
            },
            {
                getAttribute: (attr) => {
                    if (attr === 'data-title') return 'Deploying agents';
                    if (attr === 'data-summary') return 'Agent deployment';
                    if (attr === 'data-publisher') return 'Deloitte';
                    if (attr === 'data-category') return 'implementation';
                    if (attr === 'data-tags') return 'deployment';
                    return null;
                },
                querySelector: () => ({ textContent: 'mock', innerHTML: 'mock', querySelector: () => null }),
                style: {},
                classList: { add: () => {} }
            },
            {
                getAttribute: (attr) => {
                    if (attr === 'data-title') return 'Data engineering';
                    if (attr === 'data-summary') return 'Setup data';
                    if (attr === 'data-publisher') return 'Shopify';
                    if (attr === 'data-category') return 'implementation';
                    if (attr === 'data-tags') return 'data';
                    return null;
                },
                querySelector: () => ({ textContent: 'mock', innerHTML: 'mock', querySelector: () => null }),
                style: {},
                classList: { add: () => {} }
            }
        ];

        const mockDocument = {
            head: { appendChild: () => ({ src: '' }) },
            createElement: () => ({ src: '' }),
            getElementById: (id) => {
                if (id === 'discover-search-input') return searchInput;
                if (id === 'discover-search-clear') return clearBtn;
                if (id === 'discover-articles-grid') return articlesGrid;
                if (id === 'discover-results-count') return resultsCountEl;
                if (id === 'discover-no-results') return noResultsEl;
                if (id === 'empty-state-reset-btn') return emptyResetBtn;
                if (id === 'demo-modal') return { querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, classList: { add: ()=>{}, remove: ()=>{} }, setAttribute: ()=>{} };
                return null;
            },
            querySelectorAll: (sel) => {
                if (sel.includes('.filter-pill')) return mockPills;
                if (sel.includes('.discover-article-card')) return mockCards;
                if (sel.includes('.reveal-on-scroll')) return mockCards;
                return [];
            },
            querySelector: () => mockPills[0],
            addEventListener: () => {},
            body: { style: {} },
            readyState: 'complete'
        };

        const sandbox = {
            window: mockWindow,
            document: mockDocument,
            setTimeout: mockWindow.setTimeout,
            clearTimeout: mockWindow.clearTimeout,
            requestAnimationFrame: mockWindow.requestAnimationFrame,
            cancelAnimationFrame: mockWindow.cancelAnimationFrame,
            Date: Date,
            Math: Math,
            Array: Array,
            console: console,
            RegExp: RegExp
        };

        sandbox.Cal = mockWindow.Cal;

        const context = vm.createContext(sandbox);
        vm.runInContext(code, context);

        const discoverModule = mockWindow.Intellectir.DiscoverFilterModule;
        discoverModule.init();

        assert.strictEqual(mockPills[0].el.textContent, 4, 'Initial all pills count should be 4');
        assert.strictEqual(mockPills[1].el.textContent, 2, 'Initial strategy pills count should be 2');
        assert.strictEqual(mockPills[2].el.textContent, 2, 'Initial implementation pills count should be 2');

        searchInput.value = 'agents';
        discoverModule.filterArticles();
        assert.strictEqual(mockPills[0].el.textContent, 2, 'Search "agents": all pills count should be 2');
        assert.strictEqual(mockPills[1].el.textContent, 1, 'Search "agents": strategy pills count should be 1');
        assert.strictEqual(mockPills[2].el.textContent, 1, 'Search "agents": implementation pills count should be 1');

        searchInput.value = 'data';
        discoverModule.filterArticles();
        assert.strictEqual(mockPills[0].el.textContent, 2, 'Search "data": all pills count should be 2');
        assert.strictEqual(mockPills[1].el.textContent, 1, 'Search "data": strategy pills count should be 1');
        assert.strictEqual(mockPills[2].el.textContent, 1, 'Search "data": implementation pills count should be 1');

        searchInput.value = 'ibm';
        discoverModule.filterArticles();
        assert.strictEqual(mockPills[0].el.textContent, 1, 'Search "ibm": all pills count should be 1');
        assert.strictEqual(mockPills[1].el.textContent, 1, 'Search "ibm": strategy pills count should be 1');
        assert.strictEqual(mockPills[2].el.textContent, 0, 'Search "ibm": implementation pills count should be 0');
    });
});

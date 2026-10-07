const { describe, test, assert } = require('./e2e_runner');
const vm = require('vm');
const fs = require('fs');
const path = require('path');

describe('Tier 0: Utilities & Helpers - escapeRegex', () => {

    // Set up the VM context once for the entire test suite
    const appJsPath = path.join(__dirname, '..', 'app.js');
    let code = fs.readFileSync(appJsPath, 'utf-8');

    // To robustly access the unexported escapeRegex function inside the IIFE,
    // we can rewrite the file's code to expose it globally in our test context.
    // Replace the function declaration to attach it to window.
    code = code.replace(
        'function escapeRegex(str) {',
        'window.escapeRegex = function escapeRegex(str) {'
    );

    const context = vm.createContext({
        window: {
            addEventListener: () => {},
            innerWidth: 1024,
            innerHeight: 768
        },
        document: {
            readyState: 'complete',
            addEventListener: () => {},
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            body: { style: {} }
        },
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        Date: Date,
        console: console,
        requestAnimationFrame: () => {},
        cancelAnimationFrame: () => {}
    });

    const script = new vm.Script(code);
    script.runInContext(context);

    const escapeRegex = context.window.escapeRegex;

    test('0.1.1: escapeRegex correctly escapes basic regex special characters', async () => {
        const testCases = [
            { input: 'a.b', expected: 'a\\.b' },
            { input: 'a*b', expected: 'a\\*b' },
            { input: 'a+b', expected: 'a\\+b' },
            { input: 'a?b', expected: 'a\\?b' },
            { input: '^ab', expected: '\\^ab' },
            { input: 'ab$', expected: 'ab\\$' }
        ];

        for (const tc of testCases) {
            const result = escapeRegex(tc.input);
            assert.strictEqual(result, tc.expected, `Failed basic escape for: ${tc.input}`);
        }
    });

    test('0.1.2: escapeRegex correctly escapes grouping and set characters', async () => {
        const testCases = [
            { input: '(ab)', expected: '\\(ab\\)' },
            { input: '[ab]', expected: '\\[ab\\]' },
            { input: '{ab}', expected: '\\{ab\\}' },
            { input: 'a|b', expected: 'a\\|b' },
            { input: 'a\\b', expected: 'a\\\\b' }
        ];

        for (const tc of testCases) {
            const result = escapeRegex(tc.input);
            assert.strictEqual(result, tc.expected, `Failed group escape for: ${tc.input}`);
        }
    });

    test('0.1.3: escapeRegex handles falsy and empty inputs gracefully', async () => {
        const testCases = [
            { input: null, expected: '' },
            { input: undefined, expected: '' },
            { input: '', expected: '' }
        ];

        for (const tc of testCases) {
            const result = escapeRegex(tc.input);
            assert.strictEqual(result, tc.expected, `Failed empty input escape for: ${tc.input}`);
        }
    });

    test('0.1.4: escapeRegex does not modify strings without special characters', async () => {
        const testCases = [
            { input: 'hello world', expected: 'hello world' },
            { input: '1234567890', expected: '1234567890' },
            { input: 'abcABC', expected: 'abcABC' },
            { input: 'word-with-hyphen', expected: 'word-with-hyphen' },
            { input: 'word_with_underscore', expected: 'word_with_underscore' }
        ];

        for (const tc of testCases) {
            const result = escapeRegex(tc.input);
            assert.strictEqual(result, tc.expected, `Failed unmodified escape for: ${tc.input}`);
        }
    });

    test('0.1.5: escapeRegex correctly escapes complex combinations of special characters', async () => {
        const input = 'a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o';
        const expected = 'a\\.b\\*c\\+d\\?e\\^f\\$g\\{h\\}i\\(j\\)k\\|l\\[m\\]n\\\\o';
        const result = escapeRegex(input);
        assert.strictEqual(result, expected, 'Failed complex combination escape');
    });
});


const { describe, test, assert } = require('./e2e_runner');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readAppJs() {
    let code = fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
    code = code.replace(/ToastModule\.show/g, 'window.Intellectir.ToastModule.show');
    return code;
}

// Mock elements
class MockElement {
    constructor(id) {
        this.id = id;
        this.classList = {
            classes: new Set(),
            add: (...cls) => cls.forEach(c => this.classList.classes.add(c)),
            remove: (...cls) => cls.forEach(c => this.classList.classes.delete(c)),
            toggle: (c, force) => {
                if (force !== undefined) {
                    if (force) this.classList.classes.add(c);
                    else this.classList.classes.delete(c);
                } else {
                    if (this.classList.classes.has(c)) this.classList.classes.delete(c);
                    else this.classList.classes.add(c);
                }
            },
            contains: (c) => this.classList.classes.has(c)
        };
        this.listeners = {};
        this.children = [];
        this.textContent = '';
        this.className = '';
        this.muted = false;
        this.currentTime = 0;

        // Video specific mocked methods
        this.playPromise = null;
        this.play = () => {
            this._played = true;
            return this.playPromise !== null ? this.playPromise : Promise.resolve();
        };
        this.pause = () => { this._paused = true; };
    }

    addEventListener(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    removeEventListener(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    triggerEvent(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    querySelector(selector) {
        return this.children.find(c => c.matches && c.matches(selector)) || null;
    }

    matches(selector) {
        if (selector.startsWith('.')) {
            return this.classList.classes.has(selector.substring(1));
        }
        return false;
    }

    appendChild(child) {
        this.children.push(child);
    }
}

class MockIntersectionObserver {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options;
        this.observed = [];
    }
    observe(element) {
        this.observed.push(element);
    }
    unobserve(element) {
        this.observed = this.observed.filter(e => e !== element);
    }
    disconnect() {
        this.observed = [];
    }
    trigger(entries) {
        this.callback(entries);
    }
}

function createDOMEnv() {
    const mockElements = {
        'ind-top-video': new MockElement('ind-top-video'),
        'top-industry-video-box': new MockElement('top-industry-video-box'),
        'btn-toggle-sticky': new MockElement('btn-toggle-sticky'),
        'btn-toggle-mute': new MockElement('btn-toggle-mute'),
        'mute-icon': new MockElement('mute-icon'),
        'mute-label': new MockElement('mute-label'),
        'awareness-section': new MockElement('awareness-section'),
        'new-era-video': new MockElement('new-era-video')
    };

    const toolLabel = new MockElement('tool-label');
    toolLabel.classList.add('tool-label');
    mockElements['btn-toggle-sticky'].appendChild(toolLabel);

    const mockDocument = {
        getElementById: (id) => mockElements[id] || null,
        querySelectorAll: () => [],
        querySelector: () => null,
        createElement: () => new MockElement()
    };

    const mockWindow = {
        IntersectionObserver: MockIntersectionObserver,
        requestAnimationFrame: (cb) => cb(),
        cancelAnimationFrame: () => {}
    };

    const mockToastModule = {
        lastMessage: null,
        show: function(msg) { this.lastMessage = msg; }
    };

    const sandbox = {
        window: mockWindow,
        document: mockDocument,
        IntersectionObserver: MockIntersectionObserver,
        Math: Math,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isNaN: isNaN,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        Array: Array,
        Set: Set,
        Promise: Promise,
        console: console
    };

    const context = vm.createContext(sandbox);
    const appJsCode = readAppJs();
    vm.runInContext(appJsCode, context);

    sandbox.window.Intellectir.ToastModule = mockToastModule;

    // We only want to test initVideoControllers, not the whole InteractiveComponentsModule which could add other listeners that error out
    // Wait, the easiest way is to let init() run, since it calls initVideoControllers() among others.
    // auto initialized by app.js

    return {
        elements: mockElements,
        toastModule: mockToastModule,
        sandbox: sandbox
    };
}

describe('InteractiveComponentsModule - Video Controllers', () => {
    test('initVideoControllers: Sticky Video Toggle functionality', () => {
        const env = createDOMEnv();
        const btnSticky = env.elements['btn-toggle-sticky'];
        const videoBox = env.elements['top-industry-video-box'];
        const label = btnSticky.querySelector('.tool-label');

        assert.ok(!videoBox.classList.contains('is-sticky'), 'Initially not sticky');

        // Toggle ON

        btnSticky.triggerEvent('click');
        assert.ok(videoBox.classList.contains('is-sticky'), 'Video box should have is-sticky class');
        assert.ok(btnSticky.classList.contains('active'), 'Button should have active class');
        assert.strictEqual(label.textContent, 'Pinned Top', 'Label should be Pinned Top');
        assert.strictEqual(env.toastModule.lastMessage, 'Video pinned to top of screen!', 'Toast message for pinned top');

        // Toggle OFF
        btnSticky.triggerEvent('click');
        assert.ok(!videoBox.classList.contains('is-sticky'), 'Video box should not have is-sticky class');
        assert.ok(!btnSticky.classList.contains('active'), 'Button should not have active class');
        assert.strictEqual(label.textContent, 'Sticky Pin', 'Label should be Sticky Pin');
        assert.strictEqual(env.toastModule.lastMessage, 'Video returned to header banner.', 'Toast message for returned to banner');
    });

    test('initVideoControllers: Mute Video Toggle functionality', () => {
        const env = createDOMEnv();
        const btnMute = env.elements['btn-toggle-mute'];
        const indTopVideo = env.elements['ind-top-video'];
        const muteIcon = env.elements['mute-icon'];
        const muteLabel = env.elements['mute-label'];

        indTopVideo.muted = false;

        // Toggle MUTE

        btnMute.triggerEvent('click');
        assert.strictEqual(indTopVideo.muted, true, 'Video should be muted');
        assert.strictEqual(muteIcon.className, 'fa-solid fa-volume-xmark', 'Icon should be volume-xmark');
        assert.strictEqual(muteLabel.textContent, 'Muted', 'Label should be Muted');

        // Toggle UNMUTE
        btnMute.triggerEvent('click');
        assert.strictEqual(indTopVideo.muted, false, 'Video should be unmuted');
        assert.strictEqual(muteIcon.className, 'fa-solid fa-volume-high', 'Icon should be volume-high');
        assert.strictEqual(muteLabel.textContent, 'Sound On', 'Label should be Sound On');
    });

    test('initVideoControllers: Intersection Observer Auto-play functionality', () => {
        const env = createDOMEnv();
        const awarenessSection = env.elements['awareness-section'];
        const newEraVideo = env.elements['new-era-video'];

        let interceptedObserver = null;

        class InterceptingObserver extends MockIntersectionObserver {
            constructor(cb, options) {
                super(cb, options);
                interceptedObserver = this;
            }
        }

        env.sandbox.window.IntersectionObserver = InterceptingObserver;
        env.sandbox.IntersectionObserver = InterceptingObserver;

        env.sandbox.window.Intellectir.InteractiveComponentsModule.init();

        assert.ok(interceptedObserver !== null, 'Observer should have been created');

        // Trigger intersecting
        interceptedObserver.trigger([{
            isIntersecting: true,
            target: awarenessSection
        }]);

        assert.ok(awarenessSection.classList.contains('is-visible'), 'Section should be visible');
        assert.ok(awarenessSection.classList.contains('in-view'), 'Section should be in view');
        assert.strictEqual(newEraVideo.currentTime, 0, 'Video current time should reset to 0');
        assert.ok(newEraVideo._played, 'Video should have started playing');

        newEraVideo._played = false;

        interceptedObserver.trigger([{
            isIntersecting: true,
            target: awarenessSection
        }]);

        assert.ok(!newEraVideo._played, 'Video should not play again (hasPlayedOnce)');

        newEraVideo.triggerEvent('ended');
        assert.ok(newEraVideo._paused, 'Video should pause when ended');
    });
});

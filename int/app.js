/**
 * INTELLECTIR - ENTERPRISE AI ARCHITECTURE & CLIENT CONTROLLER
 * ============================================================
 * Modular, Accessible, Zero-Dependency Client Interaction Architecture.
 *
 * Modules:
 * 1. HeaderNavModule        - Mobile drawer, hamburger toggle, ARIA sync, outside click / ESC
 * 2. ModalModule            - Consultation dialog (#demo-modal), focus trapping, ESC key, form handling
 * 3. ToastModule            - Live notification system (#toast), auto-dismiss, ARIA announcement
 * 4. DiscoverFilterModule   - Real-time research search with regex escaping, category pill filters
 * 5. RoiCalculatorModule    - Department ROI capacity simulator, range slider, real-time formula
 * 6. AccordionModule        - Blueprint / FAQ accordion toggle with ARIA expanded sync
 * 7. ScrollAnimationModule  - IntersectionObserver reveal animations, header scroll contrast
 * 8. InteractiveComponents  - Guarded UI features (tabs, interactive simulator, speed graph)
 */

(function (window, document) {
    'use strict';

    /* ==========================================================================
       0. UTILITIES (Throttling, Debouncing, Regex Escaping & Focus Helpers)
       ========================================================================== */

    function throttle(fn, wait) {
        let lastTime = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastTime >= wait) {
                lastTime = now;
                fn.apply(this, args);
            }
        };
    }

    function debounce(fn, delay) {
        let timer = null;
        return function (...args) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    }

    function escapeRegex(str) {
        return (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /* ==========================================================================
       1. TOAST NOTIFICATION MODULE
       ========================================================================== */
    const ToastModule = (() => {
        let toastEl = null;
        let toastMsgEl = null;
        let dismissTimer = null;

        function init() {
            toastEl = document.getElementById('toast') || document.querySelector('.toast');
            if (toastEl) {
                toastMsgEl = document.getElementById('toast-message') || toastEl.querySelector('.toast-message, span, p');
            }
        }

        function show(message, type = 'success', duration = 4000) {
            if (!toastEl) {
                init();
            }
            if (!toastEl) return;

            if (dismissTimer) {
                clearTimeout(dismissTimer);
                dismissTimer = null;
            }

            const feedbackText = message || 'Request submitted successfully! We will be in touch shortly.';
            if (toastMsgEl) {
                toastMsgEl.textContent = feedbackText;
            } else {
                toastEl.textContent = feedbackText;
            }

            toastEl.classList.remove('show', 'active', 'is-visible');
            // Trigger DOM reflow to restart CSS animation cleanly
            void toastEl.offsetWidth;
            toastEl.classList.add('show', 'active', 'is-visible');

            dismissTimer = setTimeout(() => {
                hide();
            }, duration);
        }

        function hide() {
            if (dismissTimer) {
                clearTimeout(dismissTimer);
                dismissTimer = null;
            }
            if (toastEl) {
                toastEl.classList.remove('show', 'active', 'is-visible');
            }
        }

        return { init, show, hide };
    })();

    /* Expose showToast globally for backwards-compatibility & inline form callbacks */
    window.showToast = function (msg, type) {
        ToastModule.show(msg, type);
    };

    /* ==========================================================================
       2. HEADER NAVIGATION & MOBILE DRAWER MODULE
       ========================================================================== */
    const HeaderNavModule = (() => {
        let navToggle = null;
        let primaryNav = null;
        let siteHeader = null;
        let isOpen = false;

        function init() {
            navToggle = document.getElementById('nav-toggle') || document.querySelector('.nav-toggle, .mobile-menu-btn');
            primaryNav = document.getElementById('primary-nav') || document.querySelector('.site-navigation, .nav-drawer');
            siteHeader = document.getElementById('masthead') || document.querySelector('.site-header');

            if (!navToggle || !primaryNav) return;

            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-controls', primaryNav.id || 'primary-nav');

            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleNav();
            });

            // Close mobile menu on click outside
            document.addEventListener('click', (e) => {
                if (isOpen && siteHeader && !siteHeader.contains(e.target) && !primaryNav.contains(e.target)) {
                    closeNav();
                }
            });

            // Close mobile menu on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isOpen) {
                    closeNav();
                    if (navToggle) navToggle.focus();
                }
            });

            // Reset menu on viewport resize above mobile breakpoint
            window.addEventListener('resize', throttle(() => {
                if (window.innerWidth > 992 && isOpen) {
                    closeNav();
                }
            }, 150));
        }

        function toggleNav() {
            if (isOpen) {
                closeNav();
            } else {
                openNav();
            }
        }

        function openNav() {
            isOpen = true;
            if (primaryNav) primaryNav.classList.add('is-open', 'active');
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'true');
                navToggle.classList.add('is-active');
            }
        }

        function closeNav() {
            isOpen = false;
            if (primaryNav) primaryNav.classList.remove('is-open', 'active');
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('is-active');
            }
        }

        return { init, openNav, closeNav, toggleNav };
    })();

    /* ==========================================================================
       3. ACCESSIBLE MODAL & CONSULTATION DIALOG MODULE
       ========================================================================== */
    const ModalModule = (() => {
        let demoModal = null;
        let lastFocusedElement = null;

        const focusableSelectors = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]';

        function init() {
            demoModal = document.getElementById('demo-modal') || document.querySelector('.modal-backdrop, .modal');
            if (!demoModal) return;

            // Trigger buttons
            const openBtns = document.querySelectorAll('[data-modal-target="demo-modal"], [data-modal="demo"], .open-modal-btn');
            openBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    open(btn);
                });
            });

            // Close buttons
            const closeBtns = demoModal.querySelectorAll('#close-modal-btn, .modal-close-btn, [data-modal-close]');
            closeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    close();
                });
            });

            // Click outside backdrop
            demoModal.addEventListener('click', (e) => {
                if (e.target === demoModal) {
                    close();
                }
            });

            // Keyboard navigation (ESC + Focus Trapping)
            document.addEventListener('keydown', (e) => {
                if (!isOpen()) return;

                if (e.key === 'Escape') {
                    e.preventDefault();
                    close();
                    return;
                }

                if (e.key === 'Tab') {
                    trapFocus(e);
                }
            });

            // Initialize Booking Wizard & Calendar Logic
            initBookingWizard();

            // Form Submissions
            const modalForm = document.getElementById('modal-consultation-form') || demoModal.querySelector('form');
            const consultationForm = document.getElementById('consultation-form');

            if (modalForm) {
                modalForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const dateVal = document.getElementById('modal-selected-date')?.value;
                    const timeVal = document.getElementById('modal-selected-time')?.value;

                    let msg = 'Thank you! Your AI Consultation request has been received.';
                    if (dateVal && timeVal) {
                        const dObj = new Date(dateVal);
                        const dateStr = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        msg = `Booking Confirmed! Consultation scheduled for ${dateStr} at ${timeVal}. Check your email for calendar invite.`;
                    }
                    ToastModule.show(msg);
                    resetBookingWizard();
                    close();
                });
            }

            if (consultationForm) {
                consultationForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    ToastModule.show('Thank you! Your AI Consultation request has been received.');
                    consultationForm.reset();
                    close();
                });
            }
        }

        function initBookingWizard() {
            if (!demoModal) return;

            (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed.js", "init");

            Cal("init", "meeting", {origin:"https://cal.com"});

            Cal.ns["meeting"]("inline", {
                elementOrSelector:"#my-cal-inline",
                calLink: "augustine-ekwunife-jr1xqa/meeting",
                config: {
                    "theme": "dark"
                }
            });
        }

        function resetBookingWizard() {
            // Handled by Cal.com
        }

        function isOpen() {
            return demoModal && (
                demoModal.classList.contains('active') ||
                demoModal.classList.contains('is-open') ||
                demoModal.classList.contains('open')
            );
        }

        function open(triggerEl) {
            if (!demoModal) return;
            lastFocusedElement = triggerEl || document.activeElement;
            demoModal.classList.add('active', 'is-open', 'open');
            demoModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            const firstFocusable = demoModal.querySelector(focusableSelectors);
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 50);
            }
        }

        function close() {
            if (!demoModal) return;
            demoModal.classList.remove('active', 'is-open', 'open');
            demoModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }

        function trapFocus(e) {
            const focusables = Array.from(demoModal.querySelectorAll(focusableSelectors));
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first || !demoModal.contains(document.activeElement)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last || !demoModal.contains(document.activeElement)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }

        return { init, open, close, isOpen };
    })();

    /* ==========================================================================
       4. DISCOVER RESEARCH & RELEVANCE SEARCH MODULE
       ========================================================================== */
    const DiscoverFilterModule = (() => {
        let searchInput = null;
        let clearBtn = null;
        let filterPills = [];
        let articlesGrid = null;
        let articleCards = [];
        let resultsCountEl = null;
        let noResultsEl = null;
        let emptyResetBtn = null;
        let cardData = [];

        function init() {
            searchInput = document.getElementById('discover-search-input') ||
                document.getElementById('search-input') ||
                document.getElementById('article-search');
            clearBtn = document.getElementById('discover-search-clear');
            filterPills = Array.from(document.querySelectorAll('.filter-pill, .category-pill'));
            articlesGrid = document.getElementById('discover-articles-grid') || document.querySelector('.ind-grid-3');
            articleCards = Array.from(document.querySelectorAll('.discover-article-card, .case-card, .insight-card, .article-card, .whitepaper, .research-card'));
            resultsCountEl = document.getElementById('discover-results-count');
            noResultsEl = document.getElementById('discover-no-results');
            emptyResetBtn = document.getElementById('empty-state-reset-btn');

            if (!searchInput && filterPills.length === 0 && articleCards.length === 0) return;

            // Cache metadata for high-speed relevance calculation
            cardData = articleCards.map((card, index) => {
                const titleEl = card.querySelector('h3, .card-title, .case-title, .pillar-title');
                const descEl = card.querySelector('p, .card-desc, .case-desc, .pillar-desc');
                const rawTitle = card.getAttribute('data-title') || titleEl?.textContent?.trim() || '';
                const rawDesc = card.getAttribute('data-summary') || descEl?.textContent?.trim() || '';

                return {
                    card,
                    index,
                    titleEl,
                    descEl,
                    rawTitle,
                    rawDesc,
                    titleText: rawTitle.toLowerCase(),
                    descText: rawDesc.toLowerCase(),
                    publisher: (card.getAttribute('data-publisher') || '').toLowerCase(),
                    category: (card.getAttribute('data-category') || 'all').toLowerCase(),
                    tags: (card.getAttribute('data-tags') || '').toLowerCase()
                };
            });

            // Search input listeners
            if (searchInput) {
                searchInput.addEventListener('input', debounce(() => {
                    updateClearButton();
                    filterAndRankArticles();
                }, 80));

                if (clearBtn) {
                    clearBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        searchInput.value = '';
                        updateClearButton();
                        searchInput.focus();
                        filterAndRankArticles();
                    });
                }
            }

            // Keyboard shortcut '/' to search
            document.addEventListener('keydown', (e) => {
                if (e.key === '/' && searchInput && document.activeElement !== searchInput) {
                    const tag = document.activeElement?.tagName?.toLowerCase();
                    if (tag !== 'input' && tag !== 'textarea') {
                        e.preventDefault();
                        searchInput.focus();
                        searchInput.select();
                    }
                }
            });

            // Category pills listeners
            filterPills.forEach(pill => {
                pill.addEventListener('click', (e) => {
                    e.preventDefault();
                    filterPills.forEach(p => {
                        p.classList.remove('active');
                        p.setAttribute('aria-pressed', 'false');
                    });
                    pill.classList.add('active');
                    pill.setAttribute('aria-pressed', 'true');
                    filterAndRankArticles();
                });
            });

            // Empty state reset button
            if (emptyResetBtn) {
                emptyResetBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (searchInput) searchInput.value = '';
                    updateClearButton();
                    const allPill = filterPills.find(p => (p.getAttribute('data-category') || 'all') === 'all');
                    if (allPill) {
                        filterPills.forEach(p => {
                            p.classList.remove('active');
                            p.setAttribute('aria-pressed', 'false');
                        });
                        allPill.classList.add('active');
                        allPill.setAttribute('aria-pressed', 'true');
                    }
                    filterAndRankArticles();
                    if (searchInput) searchInput.focus();
                });
            }

            // Initial calculation
            updateClearButton();
            updatePillCounts();
            filterAndRankArticles();
        }

        function updateClearButton() {
            if (!clearBtn || !searchInput) return;
            clearBtn.style.display = searchInput.value.trim().length > 0 ? 'inline-flex' : 'none';
        }

        function updatePillCounts() {
            const rawQuery = searchInput ? searchInput.value : '';
            const normalizedQuery = (rawQuery || '').trim().toLowerCase();
            const tokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

            const counts = { all: 0 };
            filterPills.forEach(pill => {
                const cat = pill.getAttribute('data-category') || 'all';
                counts[cat] = 0;
            });

            cardData.forEach(item => {
                let matchesSearch = true;
                if (tokens.length > 0) {
                    matchesSearch = tokens.some(token =>
                        item.titleText.includes(token) ||
                        item.descText.includes(token) ||
                        item.publisher.includes(token) ||
                        item.tags.includes(token) ||
                        item.category.includes(token)
                    );
                }
                if (matchesSearch) {
                    counts.all = (counts.all || 0) + 1;
                    if (counts[item.category] !== undefined) {
                        counts[item.category]++;
                    }
                }
            });

            filterPills.forEach(pill => {
                const cat = pill.getAttribute('data-category') || 'all';
                const countEl = pill.querySelector('.pill-count');
                if (countEl && counts[cat] !== undefined) {
                    countEl.textContent = counts[cat];
                }
            });
        }

        function filterAndRankArticles() {
            const rawQuery = searchInput ? searchInput.value : '';
            const normalizedQuery = (rawQuery || '').trim().toLowerCase();
            const activePill = document.querySelector('.filter-pill.active, .category-pill.active');
            const selectedCategory = activePill ? (activePill.getAttribute('data-category') || 'all').toLowerCase() : 'all';
            const tokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

            let visibleCount = 0;
            const scoredCards = [];

            cardData.forEach(item => {
                const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;

                if (!matchesCategory) {
                    scoredCards.push({ ...item, score: -1, isVisible: false });
                    return;
                }

                if (tokens.length === 0) {
                    scoredCards.push({ ...item, score: 100 - item.index, isVisible: true });
                    visibleCount++;
                    return;
                }

                let score = 0;
                let matchedAny = false;

                // Exact full phrase bonuses
                if (normalizedQuery.length > 2) {
                    if (item.titleText.includes(normalizedQuery)) score += 45;
                    if (item.publisher.includes(normalizedQuery)) score += 40;
                    if (item.tags.includes(normalizedQuery)) score += 30;
                    if (item.descText.includes(normalizedQuery)) score += 20;
                }

                // Token-level scoring
                tokens.forEach(token => {
                    let tokenMatched = false;
                    if (item.publisher.includes(token)) {
                        score += 20;
                        tokenMatched = true;
                    }
                    if (item.titleText.includes(token)) {
                        score += 16;
                        tokenMatched = true;
                    }
                    if (item.tags.includes(token)) {
                        score += 12;
                        tokenMatched = true;
                    }
                    if (item.category.includes(token)) {
                        score += 10;
                        tokenMatched = true;
                    }
                    if (item.descText.includes(token)) {
                        score += 6;
                        tokenMatched = true;
                    }
                    if (tokenMatched) matchedAny = true;
                });

                // All tokens matched bonus
                const allTokensMatch = tokens.every(token =>
                    item.titleText.includes(token) ||
                    item.descText.includes(token) ||
                    item.publisher.includes(token) ||
                    item.tags.includes(token) ||
                    item.category.includes(token)
                );

                if (allTokensMatch) score += 25;

                if (matchedAny && score > 0) {
                    scoredCards.push({ ...item, score, isVisible: true });
                    visibleCount++;
                } else {
                    scoredCards.push({ ...item, score: 0, isVisible: false });
                }
            });

            // Sort visible cards by relevance score descending, then original index
            const visibleCards = scoredCards.filter(c => c.isVisible);
            visibleCards.sort((a, b) => b.score - a.score || a.index - b.index);

            // Reorder in DOM so top-ranked articles pop up first
            if (articlesGrid) {
                visibleCards.forEach(item => {
                    item.card.style.display = '';
                    item.card.style.opacity = '1';
                    item.card.style.transform = 'scale(1)';
                    articlesGrid.appendChild(item.card);
                    applyHighlight(item, tokens);
                });

                scoredCards.filter(c => !c.isVisible).forEach(item => {
                    item.card.style.display = 'none';
                    item.card.style.opacity = '0';
                    item.card.style.transform = 'scale(0.96)';
                    resetHighlight(item);
                });
            }

            // Update status text
            if (resultsCountEl) {
                const categoryLabel = activePill ? (activePill.querySelector('span:first-child')?.textContent || 'resources') : 'resources';
                if (normalizedQuery) {
                    resultsCountEl.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? 'result' : 'results'} for "${rawQuery.trim()}"`;
                } else if (selectedCategory === 'all') {
                    resultsCountEl.textContent = `Showing all ${visibleCount} articles`;
                } else {
                    resultsCountEl.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? 'article' : 'articles'} in ${categoryLabel}`;
                }
            }

            // Toggle empty state
            if (noResultsEl) {
                noResultsEl.style.display = visibleCount === 0 ? 'block' : 'none';
            }

            updatePillCounts();
        }

        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        function applyHighlight(item, tokens) {
            if (!item.titleEl || !item.descEl) return;
            if (tokens.length === 0) {
                resetHighlight(item);
                return;
            }

            const cleanTokens = tokens.map(t => escapeRegExp(t)).filter(t => t.length > 1);
            if (cleanTokens.length === 0) return;

            const regex = new RegExp(`(${cleanTokens.join('|')})`, 'gi');

            const titleLink = item.titleEl.querySelector('a');
            if (titleLink) {
                titleLink.innerHTML = item.rawTitle.replace(regex, '<mark class="search-highlight">$1</mark>');
            } else {
                item.titleEl.innerHTML = item.rawTitle.replace(regex, '<mark class="search-highlight">$1</mark>');
            }

            item.descEl.innerHTML = item.rawDesc.replace(regex, '<mark class="search-highlight">$1</mark>');
        }

        function resetHighlight(item) {
            if (!item.titleEl || !item.descEl) return;
            const titleLink = item.titleEl.querySelector('a');
            if (titleLink) {
                titleLink.textContent = item.rawTitle;
            } else {
                item.titleEl.textContent = item.rawTitle;
            }
            item.descEl.textContent = item.rawDesc;
        }

        return { init, filterArticles: filterAndRankArticles };
    })();

    /* ==========================================================================
       5. INTERACTIVE ROI CALCULATOR MODULE
       ========================================================================== */
    const RoiCalculatorModule = (() => {
        let teamSlider = null;
        let teamValBadge = null;
        let resHours = null;
        let resSavings = null;
        let resTaskDesc = null;
        let deptBtns = [];

        // Department rate and workload multipliers
        const deptHourlyRates = {
            support: { hours: 22, rate: 45, desc: "Ticket triage, customer replies, CRM logging & follow-ups" },
            sales: { hours: 18, rate: 65, desc: "Lead qualification, deal prep, CRM sync & follow-up emails" },
            finance: { hours: 25, rate: 55, desc: "Invoice extraction, contract audit, compliance & reporting" },
            operations: { hours: 20, rate: 60, desc: "Incident triage, system checks, ticket routing & workflows" }
        };

        function init() {
            teamSlider = document.getElementById('team-size-slider') ||
                document.getElementById('team-slider') ||
                document.querySelector('input[type="range"].calc-slider');
            teamValBadge = document.getElementById('team-size-val');
            resHours = document.getElementById('res-hours') || document.getElementById('roi-hours-saved');
            resSavings = document.getElementById('res-savings') || document.getElementById('roi-annual-savings');
            resTaskDesc = document.getElementById('res-task-desc') || document.getElementById('roi-efficiency-gain');
            deptBtns = Array.from(document.querySelectorAll('.dept-btn, .dept-pill'));

            if (!teamSlider && deptBtns.length === 0 && !resHours && !resSavings) return;

            deptBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    deptBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    calculate();
                });
            });

            if (teamSlider) {
                teamSlider.addEventListener('input', calculate);
                teamSlider.addEventListener('change', calculate);
            }

            // Run initial baseline calculation
            calculate();
        }

        function calculate() {
            if (!teamSlider && deptBtns.length === 0) return;

            let teamSize = teamSlider ? parseInt(teamSlider.value, 10) : 10;
            if (isNaN(teamSize) || teamSize < 1) teamSize = 1;
            if (teamSize > 500) teamSize = 500;

            const activeBtn = document.querySelector('.dept-btn.active, .dept-pill.active');
            let deptKey = activeBtn ? activeBtn.getAttribute('data-dept') : 'support';
            if (!deptKey || !deptHourlyRates[deptKey]) deptKey = 'support';

            const config = deptHourlyRates[deptKey] || deptHourlyRates.operations;
            const hoursPerEmp = activeBtn && activeBtn.getAttribute('data-hours')
                ? parseFloat(activeBtn.getAttribute('data-hours'))
                : config.hours;
            const hourlyRate = activeBtn && activeBtn.getAttribute('data-rate')
                ? parseFloat(activeBtn.getAttribute('data-rate'))
                : config.rate;

            if (teamValBadge) {
                teamValBadge.textContent = `${teamSize} Employee${teamSize === 1 ? '' : 's'}`;
            }

            const weeklyHours = teamSize * hoursPerEmp;
            // 70% efficiency automation model over 52 weeks
            const annualSavings = Math.round(weeklyHours * hourlyRate * 52 * 0.70);

            if (resHours) {
                resHours.textContent = `${weeklyHours.toLocaleString()} hrs`;
            }
            if (resSavings) {
                resSavings.textContent = `$${annualSavings.toLocaleString()}`;
            }
            if (resTaskDesc && config.desc) {
                resTaskDesc.textContent = config.desc;
            }

            return { teamSize, weeklyHours, annualSavings, deptKey };
        }

        return { init, calculate, deptHourlyRates };
    })();

    /* ==========================================================================
       6. ACCORDION & FAQ CONTROLLER MODULE
       ========================================================================== */
    const AccordionModule = (() => {
        function init() {
            const accordionHeaders = document.querySelectorAll('.minimal-accordion-header, .faq-header');
            if (accordionHeaders.length === 0) return;

            accordionHeaders.forEach(header => {
                const item = header.closest('.minimal-accordion-item, .faq-item');
                if (!item) return;

                header.setAttribute('role', 'button');
                header.setAttribute('tabindex', '0');
                const isCurrentlyActive = item.classList.contains('active');
                header.setAttribute('aria-expanded', isCurrentlyActive ? 'true' : 'false');

                function toggleAccordion() {
                    const isOpen = item.classList.contains('active');
                    const container = item.closest('.minimal-accordion-list, .faq-accordion, .minimal-industries-container') || item.parentElement;

                    if (container) {
                        const siblings = container.querySelectorAll('.minimal-accordion-item, .faq-item');
                        siblings.forEach(sib => {
                            if (sib !== item) {
                                sib.classList.remove('active');
                                const sibHeader = sib.querySelector('.minimal-accordion-header, .faq-header');
                                if (sibHeader) sibHeader.setAttribute('aria-expanded', 'false');
                            }
                        });
                    }

                    if (isOpen) {
                        item.classList.remove('active');
                        header.setAttribute('aria-expanded', 'false');
                    } else {
                        item.classList.add('active');
                        header.setAttribute('aria-expanded', 'true');
                    }
                }

                header.addEventListener('click', toggleAccordion);
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleAccordion();
                    }
                });
            });
        }

        return { init };
    })();

    /* ==========================================================================
       7. SCROLL ANIMATION & HEADER CONTRAST MODULE
       ========================================================================== */
    const ScrollAnimationModule = (() => {
        let masthead = null;
        let videoHero = null;
        let darkHero = null;

        function init() {
            initObserver();
            initHeaderScroll();
        }

        function initObserver() {
            const revealElements = document.querySelectorAll('.reveal-on-scroll, .glass-card, .prop-card, .pillar-card, .case-card, .stat-counter-box, .discover-article-card, .cinematic-card, .hud-panel, .ind-card');
            if (revealElements.length === 0) return;

            if ('IntersectionObserver' in window) {
                const revealObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-revealed', 'in-view');
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '0px 0px -40px 0px'
                });

                revealElements.forEach(el => {
                    if (!el.classList.contains('reveal-on-scroll')) {
                        el.classList.add('reveal-on-scroll');
                    }
                    revealObserver.observe(el);
                });
            } else {
                revealElements.forEach(el => el.classList.add('is-revealed', 'in-view'));
            }
        }

        function initHeaderScroll() {
            masthead = document.getElementById('masthead') || document.querySelector('.site-header');
            if (!masthead) return;

            videoHero = document.querySelector('.ind-fullscreen-video-hero');
            darkHero = document.querySelector('.hero-section, .hero-particles, body.dark-theme');

            let ticking = false;

            function onScroll() {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        updateHeaderContrast();
                        ticking = false;
                    });
                    ticking = true;
                }
            }

            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', throttle(updateHeaderContrast, 150));
            updateHeaderContrast();
        }

        function updateHeaderContrast() {
            if (!masthead) return;

            const scrollY = window.scrollY || window.pageYOffset || 0;

            if (videoHero) {
                const videoHeight = videoHero.offsetHeight || window.innerHeight || 400;
                if (scrollY < videoHeight - 80) {
                    masthead.classList.remove('scrolled', 'light-nav');
                    masthead.classList.add('dark-nav');
                } else {
                    masthead.classList.add('scrolled', 'light-nav');
                    masthead.classList.remove('dark-nav');
                }
                return;
            }

            if (scrollY > 40) {
                masthead.classList.add('scrolled', 'light-nav');
                masthead.classList.remove('dark-nav');
            } else {
                if (darkHero) {
                    masthead.classList.remove('scrolled', 'light-nav');
                    masthead.classList.add('dark-nav');
                } else {
                    masthead.classList.add('light-nav');
                    masthead.classList.remove('dark-nav', 'scrolled');
                }
            }
        }

        return { init, updateHeaderContrast };
    })();

    /* ==========================================================================
       8. ADDITIONAL INTERACTIVE COMPONENTS (Strictly Element-Guarded)
       ========================================================================== */
    const InteractiveComponentsModule = (() => {

        function init() {
            initCardTilt();
            initVideoControllers();
            initTabs();
            initSpeedToLeadGraph();
            initWorkflowSimulator();
            initHeroEmailForm();
        }

        // 3D Card Hover Tilt
        function initCardTilt() {
            const tiltCards = document.querySelectorAll('.glass-card, .prop-card, .pillar-card');
            if (tiltCards.length === 0) return;

            tiltCards.forEach(card => {
                let rafId = null;
                card.addEventListener('mousemove', (e) => {
                    if (rafId) cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame(() => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;

                        const rotateX = ((y - centerY) / centerY) * -5;
                        const rotateY = ((x - centerX) / centerX) * 5;

                        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
                    });
                });

                card.addEventListener('mouseleave', () => {
                    if (rafId) cancelAnimationFrame(rafId);
                    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
                });
            });
        }

        // Top Industry Hero Video Controller & Video Autoplay Observers
        function initVideoControllers() {
            const indTopVideo = document.getElementById('ind-top-video');
            const indVideoBox = document.getElementById('top-industry-video-box');
            const btnToggleSticky = document.getElementById('btn-toggle-sticky');
            const btnToggleMute = document.getElementById('btn-toggle-mute');
            const muteIcon = document.getElementById('mute-icon');
            const muteLabel = document.getElementById('mute-label');

            if (indTopVideo) {
                if (btnToggleSticky && indVideoBox) {
                    btnToggleSticky.addEventListener('click', () => {
                        indVideoBox.classList.toggle('is-sticky');
                        const isSticky = indVideoBox.classList.contains('is-sticky');
                        btnToggleSticky.classList.toggle('active', isSticky);
                        const label = btnToggleSticky.querySelector('.tool-label');
                        if (label) label.textContent = isSticky ? 'Pinned Top' : 'Sticky Pin';
                        ToastModule.show(isSticky ? 'Video pinned to top of screen!' : 'Video returned to header banner.');
                    });
                }

                if (btnToggleMute) {
                    btnToggleMute.addEventListener('click', () => {
                        indTopVideo.muted = !indTopVideo.muted;
                        if (indTopVideo.muted) {
                            if (muteIcon) muteIcon.className = 'fa-solid fa-volume-xmark';
                            if (muteLabel) muteLabel.textContent = 'Muted';
                        } else {
                            if (muteIcon) muteIcon.className = 'fa-solid fa-volume-high';
                            if (muteLabel) muteLabel.textContent = 'Sound On';
                        }
                    });
                }
            }

            // Awareness Section & New Era Video Observer
            const awarenessSection = document.getElementById('awareness-section') || document.getElementById('new-era');
            const newEraVideo = document.getElementById('new-era-video');

            if (awarenessSection && newEraVideo && 'IntersectionObserver' in window) {
                let hasPlayedOnce = false;
                const newEraObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            awarenessSection.classList.add('is-visible', 'in-view');
                            if (!hasPlayedOnce) {
                                hasPlayedOnce = true;
                                newEraVideo.currentTime = 0;
                                const playPromise = newEraVideo.play();
                                if (playPromise !== undefined) {
                                    playPromise.catch(() => { });
                                }
                            }
                        }
                    });
                }, { threshold: 0.25 });

                newEraObserver.observe(awarenessSection);

                newEraVideo.addEventListener('ended', () => {
                    newEraVideo.pause();
                });
            }
        }

        // Interactive Capability & Business Proposition Tabs
        function initTabs() {
            // Business Proposition Section Tabs
            const propTabBtns = document.querySelectorAll('.prop-tab-btn');
            propTabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabId = btn.getAttribute('data-tab-id');
                    if (!tabId) return;

                    const navParent = btn.closest('.prop-tabs-nav');
                    if (navParent) {
                        navParent.querySelectorAll('.prop-tab-btn').forEach(b => b.classList.remove('active'));
                    }
                    btn.classList.add('active');

                    const container = navParent ? navParent.nextElementSibling : null;
                    if (container && container.classList.contains('prop-cards-container')) {
                        container.querySelectorAll('.prop-card-panel').forEach(panel => {
                            panel.classList.remove('active');
                        });
                        const targetPanel = container.querySelector(`#${tabId}`);
                        if (targetPanel) {
                            targetPanel.classList.add('active');
                        }
                    }
                });
            });

            // General Tabs
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabPanes = document.querySelectorAll('.tab-pane');

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetTab = btn.getAttribute('data-tab');
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabPanes.forEach(p => p.classList.remove('active'));

                    btn.classList.add('active');
                    const targetPane = document.getElementById(`tab-${targetTab}`);
                    if (targetPane) targetPane.classList.add('active');
                });
            });

            // Problem Tabs
            const probTabBtns = document.querySelectorAll('.prob-tab-btn');
            const probBlocks = document.querySelectorAll('.problem-content-block');

            probTabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetProblem = btn.getAttribute('data-problem');
                    if (!targetProblem) return;

                    probTabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    probBlocks.forEach(block => {
                        block.classList.remove('active');
                        if (block.id === `problem-${targetProblem}-block`) {
                            block.classList.add('active');
                        }
                    });
                });
            });

            // Step Pills in Sticky Showcase
            const stickySection = document.getElementById('sticky-showcase');
            if (stickySection) {
                const textLayers = stickySection.querySelectorAll('.sticky-text-layer');
                const graphicLayers = stickySection.querySelectorAll('.sticky-graphic-layer');
                const stepPills = stickySection.querySelectorAll('.step-pill');

                stepPills.forEach((pill, idx) => {
                    pill.addEventListener('click', () => {
                        stepPills.forEach(p => p.classList.remove('active'));
                        pill.classList.add('active');

                        textLayers.forEach(layer => {
                            layer.classList.toggle('active', parseInt(layer.getAttribute('data-step'), 10) === idx);
                        });

                        graphicLayers.forEach(layer => {
                            layer.classList.toggle('active', parseInt(layer.getAttribute('data-step'), 10) === idx);
                        });
                    });
                });
            }

            // Proposition Slider Pills
            const propTrack = document.getElementById('prop-slider-track');
            const propTabs = document.querySelectorAll('.prop-tab-pill');

            if (propTrack && propTabs.length > 0) {
                propTabs.forEach((tab, idx) => {
                    tab.addEventListener('click', () => {
                        propTabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        const translateX = idx * -33.333333;
                        propTrack.style.transform = `translateX(${translateX}%)`;
                    });
                });
            }
        }

        // Speed-to-Lead Live Graph Time Selector
        function initSpeedToLeadGraph() {
            const timePillBtns = document.querySelectorAll('.time-pill-btn');
            const dispGraphMult = document.getElementById('disp-graph-mult');
            const dispGraphTime = document.getElementById('disp-graph-time');

            if (timePillBtns.length === 0) return;

            const timeDataMap = {
                '5min': { mult: '21x', time: '< 5 Mins', color: 'text-success' },
                '15min': { mult: '10x', time: '15 Mins', color: 'text-primary-color' },
                '30min': { mult: '4.2x', time: '30 Mins', color: 'text-warning' },
                '24hr': { mult: '1.0x', time: '24 Hours', color: 'text-danger' }
            };

            timePillBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const selectedTime = btn.getAttribute('data-time');
                    if (!selectedTime || !timeDataMap[selectedTime]) return;

                    timePillBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    const info = timeDataMap[selectedTime];
                    if (dispGraphMult) {
                        dispGraphMult.textContent = info.mult;
                        dispGraphMult.className = `g-stat-num ${info.color}`;
                    }
                    if (dispGraphTime) {
                        dispGraphTime.textContent = info.time;
                    }

                    const barGroups = document.querySelectorAll('.mit-bar-group');
                    barGroups.forEach(bg => {
                        bg.style.opacity = '0.5';
                        bg.style.transform = 'scale(0.99)';
                    });

                    const activeBar = document.getElementById(`graph-bar-${selectedTime}`);
                    if (activeBar) {
                        activeBar.style.opacity = '1';
                        activeBar.style.transform = 'scale(1.02)';
                        activeBar.style.transition = 'all 0.3s ease';
                    }
                });
            });
        }

        // Interactive AI Agent Workflow Simulator
        function initWorkflowSimulator() {
            const simRunBtn = document.getElementById('sim-run-btn');
            const simProgressFill = document.getElementById('sim-progress-fill');
            const simLogTerminal = document.getElementById('sim-log-terminal');
            const simStepNodes = document.querySelectorAll('.sim-step-node');

            if (!simRunBtn || !simProgressFill || !simLogTerminal) return;

            let isSimRunning = false;

            const simStepsData = [
                { stepIndex: 0, progress: 25, log: "[0.02s] Strategy Engine: Initializing high-availability agent cluster..." },
                { stepIndex: 1, progress: 50, log: "[0.45s] Vector DB: Ingested enterprise schemas. Querying pgvector index (cos_sim: 0.94)..." },
                { stepIndex: 2, progress: 75, log: "[0.89s] Multi-Agent Neural Mesh: Parallelizing task execution across 4 specialized workers..." },
                { stepIndex: 3, progress: 100, log: "[1.20s] Compliance Guardrail: Verified SOC2/HIPAA policies. Zero PII leaks detected. Workflow executed in 1.20s." }
            ];

            simRunBtn.addEventListener('click', () => {
                if (isSimRunning) return;
                isSimRunning = true;
                simRunBtn.disabled = true;
                simRunBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executing Workflow...';

                simProgressFill.style.width = '0%';
                simLogTerminal.innerHTML = '<div class="sim-log-line"><span class="sim-log-time">[0.00s]</span> Initiating autonomous agent execution...</div>';
                simStepNodes.forEach(node => node.classList.remove('active', 'completed'));

                let step = 0;
                const interval = setInterval(() => {
                    if (step < simStepsData.length) {
                        const stepData = simStepsData[step];

                        for (let i = 0; i < stepData.stepIndex; i++) {
                            if (simStepNodes[i]) {
                                simStepNodes[i].classList.remove('active');
                                simStepNodes[i].classList.add('completed');
                                const statusEl = simStepNodes[i].querySelector('.sim-step-status');
                                if (statusEl) statusEl.textContent = 'Completed';
                            }
                        }

                        if (simStepNodes[stepData.stepIndex]) {
                            simStepNodes[stepData.stepIndex].classList.add('active');
                            const statusEl = simStepNodes[stepData.stepIndex].querySelector('.sim-step-status');
                            if (statusEl) statusEl.textContent = 'Processing...';
                        }

                        simProgressFill.style.width = `${stepData.progress}%`;
                        const logLine = document.createElement('div');
                        logLine.className = 'sim-log-line';
                        logLine.innerHTML = stepData.log;
                        simLogTerminal.appendChild(logLine);
                        simLogTerminal.scrollTop = simLogTerminal.scrollHeight;

                        step++;
                    } else {
                        clearInterval(interval);
                        simStepNodes.forEach(node => {
                            node.classList.remove('active');
                            node.classList.add('completed');
                            const statusEl = node.querySelector('.sim-step-status');
                            if (statusEl) statusEl.textContent = 'Completed';
                        });

                        simRunBtn.disabled = false;
                        simRunBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Re-Run Simulation';
                        isSimRunning = false;
                        ToastModule.show('Multi-Agent Workflow Simulation completed in 1.20s!');
                    }
                }, 800);
            });
        }

        // Hero Quick Email Capture Form
        function initHeroEmailForm() {
            const heroEmailForm = document.getElementById('hero-email-form');
            const heroWorkEmailInput = document.getElementById('hero-work-email');

            if (!heroEmailForm) return;

            heroEmailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailValue = heroWorkEmailInput ? heroWorkEmailInput.value.trim() : '';
                if (emailValue) {
                    const modal = document.getElementById('demo-modal');
                    const modalEmailInput = modal ? modal.querySelector('input[type="email"]') : null;
                    if (modalEmailInput) {
                        modalEmailInput.value = emailValue;
                    }
                    if (modal) {
                        ModalModule.open();
                    } else {
                        ToastModule.show(`Thank you! We will reach out to ${emailValue} shortly.`);
                    }
                }
            });
        }

        return { init };
    })();

    /* ==========================================================================
       9. HOW WE WORK: SPATIAL ZOOM CANVAS & 4-PHASE LIFECYCLE
       ========================================================================== */
    const HowWeWorkModule = (function () {
        let isInitialized = false;
        let sectionEl = null;
        let trackEl = null;
        let canvasEl = null;
        let introFrameEl = null;
        let stateIntroEl = null;
        let statePlatformEl = null;
        let cornerTags = [];
        let quadrantCards = [];
        let hudWireframe = null;

        let currentProgress = 0;
        let targetProgress = 0;
        let isLoopRunning = false;
        let rafId = null;
        let observer = null;
        let boundScrollHandler = null;
        let boundResizeHandler = null;
        let activePhaseIndex = 0;

        const LERP_FACTOR = 0.04;

        function getWaypoints() {
            const ww = typeof window !== 'undefined' ? window.innerWidth : 1200;
            const wh = typeof window !== 'undefined' ? window.innerHeight : 800;
            const isMobile = ww < 768;

            const vwScale = ww / 1200;
            const vhScale = wh / 700;
            const overviewScale = Math.min(vwScale, vhScale) * (isMobile ? 0.95 : 0.85);

            const zoomScale = Math.min(ww / 540, wh / 300) * (isMobile ? 0.9 : 0.65);

            const dx = 290;
            const dy = 160;

            return [
                { p: 0.00, scale: overviewScale, x: 0, y: 0, stage: 0 },
                { p: 0.12, scale: overviewScale, x: 0, y: 0, stage: 0 },

                // Stage 1: Top Right (Discovery)
                { p: 0.22, scale: zoomScale, x: -dx, y: dy, stage: 1 },
                { p: 0.32, scale: zoomScale, x: -dx, y: dy, stage: 1 },

                // Stage 2: Top Left (Building)
                { p: 0.42, scale: zoomScale, x: dx, y: dy, stage: 2 },
                { p: 0.52, scale: zoomScale, x: dx, y: dy, stage: 2 },

                // Stage 3: Bottom Left (Integration)
                { p: 0.62, scale: zoomScale, x: dx, y: -dy, stage: 3 },
                { p: 0.72, scale: zoomScale, x: dx, y: -dy, stage: 3 },

                // Stage 4: Bottom Right (Maintenance)
                { p: 0.82, scale: zoomScale, x: -dx, y: -dy, stage: 4 },
                { p: 0.88, scale: zoomScale, x: -dx, y: -dy, stage: 4 },

                // Stage 5: Outro
                { p: 0.98, scale: overviewScale, x: 0, y: 0, stage: 5 },
                { p: 1.00, scale: overviewScale, x: 0, y: 0, stage: 5 }
            ];
        }

        let waypoints = getWaypoints();

        function smoothstep(t) {
            const clamped = Math.max(0, Math.min(1, t));
            return clamped * clamped * (3 - 2 * clamped);
        }

        function computeCameraTransform(progress) {
            const clampedP = Math.max(0, Math.min(1, progress || 0));

            let aCurrent = waypoints[0];
            let aNext = waypoints[waypoints.length - 1];

            for (let i = 0; i < waypoints.length - 1; i++) {
                if (clampedP >= waypoints[i].p && clampedP <= waypoints[i + 1].p) {
                    aCurrent = waypoints[i];
                    aNext = waypoints[i + 1];
                    break;
                }
            }

            const range = aNext.p - aCurrent.p;
            const t = range > 0 ? (clampedP - aCurrent.p) / range : 0;
            const easedT = smoothstep(t);

            const scale = aCurrent.scale + (aNext.scale - aCurrent.scale) * easedT;
            const x = aCurrent.x + (aNext.x - aCurrent.x) * easedT;
            const y = aCurrent.y + (aNext.y - aCurrent.y) * easedT;

            let stage = 0;
            if (clampedP < 0.12) stage = 0;
            else if (clampedP < 0.37) stage = 1;
            else if (clampedP < 0.57) stage = 2;
            else if (clampedP < 0.77) stage = 3;
            else if (clampedP < 0.93) stage = 4;
            else stage = 5;

            return {
                stage,
                scale: parseFloat(scale.toFixed(4)),
                x: parseFloat(x.toFixed(2)),
                y: parseFloat(y.toFixed(2))
            };
        }

        function computeTargetProgress() {
            if (!trackEl) return 0;
            const rect = trackEl.getBoundingClientRect();
            const viewportHeight = window.innerHeight || 1;
            const trackHeight = trackEl.offsetHeight || 1;
            const scrollable = Math.max(1, trackHeight - viewportHeight);
            const rawProgress = -rect.top / scrollable;
            return Math.max(0, Math.min(1, rawProgress));
        }

        // Exact mathematical fade mappings based on your requirements
        function calculateOpacityForQuadrant(qNum, p) {
            let op = 0;
            if (qNum === 1) { // Top Right
                if (p < 0.12) op = 0;
                else if (p < 0.22) op = (p - 0.12) / 0.10;
                else if (p <= 0.32) op = 1;
                else if (p < 0.37) op = 1 - ((p - 0.32) / 0.05);
                else op = 0;
            } else if (qNum === 2) { // Top Left
                if (p < 0.37) op = 0;
                else if (p < 0.42) op = (p - 0.37) / 0.05;
                else if (p <= 0.52) op = 1;
                else if (p < 0.57) op = 1 - ((p - 0.52) / 0.05);
                else op = 0;
            } else if (qNum === 3) { // Bottom Left
                if (p < 0.57) op = 0;
                else if (p < 0.62) op = (p - 0.57) / 0.05;
                else if (p <= 0.72) op = 1;
                else if (p < 0.77) op = 1 - ((p - 0.72) / 0.05);
                else op = 0;
            } else if (qNum === 4) { // Bottom Right
                if (p < 0.77) op = 0;
                else if (p < 0.82) op = (p - 0.77) / 0.05;
                else if (p <= 0.88) op = 1;
                else if (p < 0.98) op = 1 - ((p - 0.88) / 0.10);
                else op = 0;
            }
            return Math.max(0, Math.min(1, op));
        }

        function renderFrame(progress) {
            const matrix = computeCameraTransform(progress);
            const stage = matrix.stage;

            if (stage >= 1 && stage <= 4) {
                activePhaseIndex = stage;
            } else {
                activePhaseIndex = 0;
            }

            if (canvasEl) {
                canvasEl.style.transform = `scale(${matrix.scale}) translate3d(${matrix.x}px, ${matrix.y}px, 0)`;
            }

            if (introFrameEl) {
                if (stage === 0) {
                    introFrameEl.style.opacity = '1';
                    if (stateIntroEl) stateIntroEl.style.display = 'block';
                    if (statePlatformEl) statePlatformEl.style.display = 'none';
                } else if (stage === 5) {
                    introFrameEl.style.opacity = '1';
                    if (stateIntroEl) stateIntroEl.style.display = 'none';
                    if (statePlatformEl) statePlatformEl.style.display = 'block';

                    const titleOutro = document.getElementById('outroTitle');
                    if (titleOutro) titleOutro.style.opacity = '1';
                } else {
                    introFrameEl.style.opacity = '0';
                    if (stateIntroEl) stateIntroEl.style.display = 'none';
                }
            }

            quadrantCards.forEach(card => {
                if (!card) return;
                const qNum = parseInt(card.getAttribute('data-quadrant'), 10);
                card.style.opacity = calculateOpacityForQuadrant(qNum, progress).toFixed(3);
            });

            const phaseToCornerMap = { 1: 'discovery', 2: 'building', 3: 'integrating', 4: 'maintenance' };
            const activeCorner = phaseToCornerMap[activePhaseIndex];

            cornerTags.forEach(tag => {
                if (!tag) return;
                const cornerName = tag.getAttribute('data-corner');
                if (stage === 0 || stage === 5) {
                    tag.style.opacity = '1';
                    tag.style.transform = 'scale(1)';
                    const square = tag.querySelector('.hww-node-square');
                    if (square) square.style.boxShadow = '';
                } else if (cornerName === activeCorner) {
                    tag.style.opacity = '1';
                    tag.style.transform = 'scale(1.04)';
                } else {
                    tag.style.opacity = '0.4';
                    tag.style.transform = 'scale(0.95)';
                }
            });

            if (hudWireframe) {
                if (stage === 0 || stage === 5) {
                    hudWireframe.style.opacity = '1';
                } else {
                    hudWireframe.style.opacity = '0.3';
                }
            }
        }

        function loop() {
            if (!isLoopRunning) return;
            const delta = targetProgress - currentProgress;

            if (Math.abs(delta) < 0.0001) {
                currentProgress = targetProgress;
            } else {
                currentProgress += delta * LERP_FACTOR;
            }

            renderFrame(currentProgress);
            rafId = window.requestAnimationFrame(loop);
        }

        function startLoop() {
            if (isLoopRunning) return;
            isLoopRunning = true;
            loop();
        }

        function stopLoop() {
            isLoopRunning = false;
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
            }
        }

        function onScroll() {
            targetProgress = computeTargetProgress();
        }

        function onResize() {
            waypoints = getWaypoints();
            targetProgress = computeTargetProgress();
            renderFrame(currentProgress);
        }

        function init() {
            if (isInitialized) return;

            sectionEl = document.getElementById('how-we-work-section');
            if (!sectionEl) return;

            trackEl = document.getElementById('hww-track');
            canvasEl = document.getElementById('hww-spatial-canvas');
            introFrameEl = document.getElementById('hww-intro-frame');
            stateIntroEl = document.getElementById('hww-state-intro');
            statePlatformEl = document.getElementById('hww-state-platform');
            hudWireframe = document.querySelector('.hww-wireframe');

            cornerTags = Array.from(document.querySelectorAll('.hww-corner-node'));
            quadrantCards = Array.from(document.querySelectorAll('.hww-quadrant'));

            boundScrollHandler = onScroll;
            boundResizeHandler = onResize;
            window.addEventListener('scroll', boundScrollHandler, { passive: true });
            window.addEventListener('resize', boundResizeHandler, { passive: true });

            targetProgress = computeTargetProgress();
            currentProgress = targetProgress;
            waypoints = getWaypoints();
            renderFrame(currentProgress);

            if ('IntersectionObserver' in window) {
                observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            targetProgress = computeTargetProgress();
                            startLoop();
                        } else {
                            stopLoop();
                        }
                    });
                }, { threshold: [0, 0.05, 0.1] });
                observer.observe(sectionEl);
            } else {
                startLoop();
            }

            isInitialized = true;
        }

        return { init };
    })();

    /* ==========================================================================
       10. DISCOVER ROBOT HERO MODULE (Lighting Glow & Spline Watermark Cleanup)
       ========================================================================== */
    const RobotHeroModule = (function () {
        let heroSection, glowEl, splineViewer;
        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;
        let animFrameId = null;
        let isInitialized = false;

        const LERP_SPEED = 0.08;

        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        function removeSplineWatermark() {
            if (!splineViewer) return;
            const hideLogo = () => {
                try {
                    const shadow = splineViewer.shadowRoot;
                    if (shadow) {
                        const logo = shadow.querySelector('#logo, a#logo, a[href*="spline.design"], .watermark, #spline-logo');
                        if (logo) {
                            logo.style.display = 'none';
                            logo.style.opacity = '0';
                            logo.style.pointerEvents = 'none';
                            logo.style.visibility = 'hidden';
                        }
                    }
                } catch (e) {
                    /* ignore shadow root locks */
                }
            };

            hideLogo();
            const interval = setInterval(hideLogo, 300);
            setTimeout(() => clearInterval(interval), 10000);
        }

        function onMouseMove(e) {
            if (!heroSection) return;
            const rect = heroSection.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        }

        function onMouseLeave() {
            if (!heroSection) return;
            mouseX = heroSection.offsetWidth / 2;
            mouseY = heroSection.offsetHeight / 2;
        }

        function animate() {
            // Smoothly move background lighting glow (Robot container does not rotate)
            glowX = lerp(glowX, mouseX, LERP_SPEED);
            glowY = lerp(glowY, mouseY, LERP_SPEED);
            if (glowEl) {
                glowEl.style.left = glowX + 'px';
                glowEl.style.top = glowY + 'px';
            }

            animFrameId = requestAnimationFrame(animate);
        }

        function init() {
            heroSection = document.querySelector('.discover-robot-hero');
            if (!heroSection) return;

            glowEl = document.getElementById('discover-hero-glow');
            splineViewer = document.getElementById('spline-robot-viewer');

            mouseX = heroSection.offsetWidth / 2;
            mouseY = heroSection.offsetHeight / 2;
            glowX = mouseX;
            glowY = mouseY;

            heroSection.addEventListener('mousemove', onMouseMove);
            heroSection.addEventListener('mouseleave', onMouseLeave);

            removeSplineWatermark();

            animFrameId = requestAnimationFrame(animate);
            isInitialized = true;
        }

        function destroy() {
            if (!isInitialized) return;
            if (heroSection) {
                heroSection.removeEventListener('mousemove', onMouseMove);
                heroSection.removeEventListener('mouseleave', onMouseLeave);
            }
            if (animFrameId) cancelAnimationFrame(animFrameId);
            isInitialized = false;
        }

        return { init, destroy };
    })();

    /* ==========================================================================
       11. INTELLECTIR NAMESPACE & LIFECYCLE INITIALIZER
       ========================================================================== */
    window.Intellectir = {
        ToastModule,
        HeaderNavModule,
        ModalModule,
        DiscoverFilterModule,
        RoiCalculatorModule,
        AccordionModule,
        ScrollAnimationModule,
        InteractiveComponentsModule,
        HowWeWorkModule,
        RobotHeroModule,
        init: function () {
            ToastModule.init();
            HeaderNavModule.init();
            ModalModule.init();
            DiscoverFilterModule.init();
            RoiCalculatorModule.init();
            AccordionModule.init();
            ScrollAnimationModule.init();
            InteractiveComponentsModule.init();
            HowWeWorkModule.init();
            RobotHeroModule.init();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.Intellectir.init();
        });
    } else {
        window.Intellectir.init();
    }

})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : {});

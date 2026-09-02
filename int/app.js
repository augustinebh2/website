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

            // Form Submissions
            const modalForm = document.getElementById('modal-consultation-form') || demoModal.querySelector('form');
            const consultationForm = document.getElementById('consultation-form');

            if (modalForm) {
                modalForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    ToastModule.show('Thank you! Your AI Consultation request has been received.');
                    modalForm.reset();
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
       4. DISCOVER RESEARCH & ARTICLE FILTER MODULE
       ========================================================================== */
    const DiscoverFilterModule = (() => {
        let searchInput = null;
        let filterPills = [];
        let articleCards = [];

        function init() {
            searchInput = document.getElementById('discover-search-input') ||
                document.getElementById('search-input') ||
                document.getElementById('article-search');
            filterPills = Array.from(document.querySelectorAll('.filter-pill, .category-pill'));
            articleCards = Array.from(document.querySelectorAll('.discover-article-card, .case-card, .insight-card, .article-card, .whitepaper, .research-card'));

            if (!searchInput && filterPills.length === 0 && articleCards.length === 0) return;

            if (searchInput) {
                searchInput.addEventListener('input', debounce(filterArticles, 100));
            }

            filterPills.forEach(pill => {
                pill.addEventListener('click', (e) => {
                    e.preventDefault();
                    filterPills.forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    filterArticles();
                });
            });
        }

        function filterArticles() {
            const rawQuery = searchInput ? searchInput.value : '';
            const normalizedQuery = (rawQuery || '').trim().toLowerCase();
            const activePill = document.querySelector('.filter-pill.active, .category-pill.active');
            const selectedCategory = activePill ? (activePill.getAttribute('data-category') || 'all').toLowerCase() : 'all';

            articleCards.forEach(card => {
                const title = card.querySelector('h3, .card-title, .case-title, .pillar-title')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('p, .card-desc, .case-desc, .pillar-desc')?.textContent.toLowerCase() || '';
                const category = (card.getAttribute('data-category') || 'all').toLowerCase();

                const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
                const matchesQuery = !normalizedQuery || title.includes(normalizedQuery) || desc.includes(normalizedQuery);

                if (matchesCategory && matchesQuery) {
                    card.style.display = '';
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    card.style.display = 'none';
                }
            });
        }

        return { init, filterArticles };
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
       9. HOW WE WORK: 2.5D SPATIAL MOTION & CAMERA CONTROLLER MODULE
       ========================================================================== */
    const HowWeWorkModule = (function () {
        let isInitialized = false;
        let sectionEl = null;
        let trackEl = null;
        let canvasEl = null;
        let introFrameEl = null;
        let stateIntroEl = null;
        let statePlatformEl = null;
        let scrubberProgressEl = null;
        let navPills = [];
        let cornerTags = [];
        let quadrantCards = [];

        let currentProgress = 0;
        let targetProgress = 0;
        let isLoopRunning = false;
        let rafId = null;
        let observer = null;
        let boundScrollHandler = null;
        let boundResizeHandler = null;
        let activePhaseIndex = 1;

        const LERP_FACTOR = 0.1; // Smooth jank-free damping bounded between 0.05 and 0.20

        // 2.5D Camera Keyframe Waypoints (Stages 0 to 5)
        // Stage 0: Overview (scale 1.00, x: 0, y: 0)
        // Stage 1: Top-Right (Discovery Call) -> translateX -24%, translateY +24%
        // Stage 2: Top-Left (Building Phase) -> translateX +24%, translateY +24%
        // Stage 3: Bottom-Left (Integrating Phase) -> translateX +24%, translateY -24%
        // Stage 4: Bottom-Right (Maintenance) -> translateX -24%, translateY -24%
        // Stage 5: Ecosystem Zoom-Out Overview -> scale 1.00, x: 0, y: 0
        const CAMERA_ANCHORS = [
            { p: 0.00, scale: 1.00, x: 0, y: 0, stage: 0 },
            { p: 0.08, scale: 1.00, x: 0, y: 0, stage: 0 },
            { p: 0.25, scale: 1.85, x: -24, y: 24, stage: 1 },
            { p: 0.45, scale: 1.85, x: 24, y: 24, stage: 2 },
            { p: 0.65, scale: 1.85, x: 24, y: -24, stage: 3 },
            { p: 0.825, scale: 1.85, x: -24, y: -24, stage: 4 },
            { p: 0.95, scale: 1.00, x: 0, y: 0, stage: 5 },
            { p: 1.00, scale: 1.00, x: 0, y: 0, stage: 5 }
        ];

        // Sanitize phase index input
        function sanitizeGotoIndex(val) {
            const num = parseInt(val, 10);
            if (isNaN(num) || num < 1) return 1;
            if (num > 4) return 4;
            return num;
        }

        // Hermite smoothstep interpolation
        function smoothstep(t) {
            const clamped = Math.max(0, Math.min(1, t));
            return clamped * clamped * (3 - 2 * clamped);
        }

        // Camera Matrix Calculation from Progress (0.00 to 1.00)
        function computeCameraTransform(progress) {
            const numP = (typeof progress === 'number' && !isNaN(progress)) ? progress : 0;
            const clampedP = Math.max(0, Math.min(1, numP));

            // Find segment in CAMERA_ANCHORS
            let aCurrent = CAMERA_ANCHORS[0];
            let aNext = CAMERA_ANCHORS[CAMERA_ANCHORS.length - 1];

            for (let i = 0; i < CAMERA_ANCHORS.length - 1; i++) {
                if (clampedP >= CAMERA_ANCHORS[i].p && clampedP <= CAMERA_ANCHORS[i + 1].p) {
                    aCurrent = CAMERA_ANCHORS[i];
                    aNext = CAMERA_ANCHORS[i + 1];
                    break;
                }
            }

            const range = aNext.p - aCurrent.p;
            const t = range > 0 ? (clampedP - aCurrent.p) / range : 0;
            const easedT = smoothstep(t);

            const scale = aCurrent.scale + (aNext.scale - aCurrent.scale) * easedT;
            const x = aCurrent.x + (aNext.x - aCurrent.x) * easedT;
            const y = aCurrent.y + (aNext.y - aCurrent.y) * easedT;

            // Determine stage based on progress boundaries
            let currentStage = 0;
            if (clampedP < 0.15) {
                currentStage = 0;
            } else if (clampedP < 0.35) {
                currentStage = 1;
            } else if (clampedP < 0.55) {
                currentStage = 2;
            } else if (clampedP < 0.75) {
                currentStage = 3;
            } else if (clampedP < 0.90) {
                currentStage = 4;
            } else {
                currentStage = 5;
            }

            return {
                stage: currentStage,
                scale: parseFloat(scale.toFixed(4)),
                translateX: parseFloat(x.toFixed(2)),
                translateY: parseFloat(y.toFixed(2)),
                transformString: `scale(${scale.toFixed(4)}) translate3d(${x.toFixed(2)}%, ${y.toFixed(2)}%, 0px)`
            };
        }

        // Target scroll progress from current window position
        function computeTargetProgress() {
            if (!trackEl) return 0;
            const rect = trackEl.getBoundingClientRect();
            const viewportHeight = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 1;
            const trackHeight = trackEl.offsetHeight || rect.height || 1;
            const scrollableDistance = Math.max(1, trackHeight - viewportHeight);
            const scrollY = -rect.top;
            const rawProgress = scrollY / scrollableDistance;

            if (isNaN(rawProgress)) return 0;
            return Math.max(0, Math.min(1, rawProgress));
        }

        // Render one animation frame for visual synchronization
        function renderFrame(progress) {
            const matrix = computeCameraTransform(progress);
            const stage = matrix.stage;

            // Map stage to active phase (1 to 4)
            if (stage === 0 || stage === 1) {
                activePhaseIndex = 1;
            } else if (stage === 2) {
                activePhaseIndex = 2;
            } else if (stage === 3) {
                activePhaseIndex = 3;
            } else {
                activePhaseIndex = 4;
            }

            // 1. Camera Canvas Matrix Transformation
            if (canvasEl && canvasEl.style) {
                const prefersReducedMotion = typeof window !== 'undefined' &&
                    window.matchMedia &&
                    typeof window.matchMedia === 'function' &&
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                const isMobileReflow = typeof window !== 'undefined' && window.innerWidth && window.innerWidth <= 992;

                if (prefersReducedMotion) {
                    canvasEl.style.transform = 'none';
                } else if (isMobileReflow) {
                    canvasEl.style.transform = '';
                } else {
                    canvasEl.style.transform = matrix.transformString;
                }
            }

            // 2. Intro / Outro Center Frame State Switching
            if (introFrameEl) {
                if (progress < 0.12) {
                    // Stage 0: Initial "How we work" view
                    if (introFrameEl.classList) introFrameEl.classList.remove('faded', 'hidden', 'is-dimmed');
                    if (introFrameEl.style) {
                        introFrameEl.style.opacity = '1';
                        introFrameEl.style.pointerEvents = 'auto';
                        introFrameEl.style.visibility = 'visible';
                    }
                    if (stateIntroEl && stateIntroEl.style) stateIntroEl.style.display = 'block';
                    if (statePlatformEl && statePlatformEl.style) statePlatformEl.style.display = 'none';
                } else if (progress > 0.90) {
                    // Stage 5: Final Ecosystem "The Intellectir Platform" & Explore Solutions CTA
                    if (introFrameEl.classList) introFrameEl.classList.remove('faded', 'hidden', 'is-dimmed');
                    if (introFrameEl.style) {
                        introFrameEl.style.opacity = '1';
                        introFrameEl.style.pointerEvents = 'auto';
                        introFrameEl.style.visibility = 'visible';
                    }
                    if (stateIntroEl && stateIntroEl.style) stateIntroEl.style.display = 'none';
                    if (statePlatformEl && statePlatformEl.style) statePlatformEl.style.display = 'block';
                } else {
                    // Stages 1–4: Panned focus onto active quadrant card
                    if (introFrameEl.classList) introFrameEl.classList.add('faded', 'hidden', 'is-dimmed');
                    if (introFrameEl.style) {
                        introFrameEl.style.opacity = '0';
                        introFrameEl.style.pointerEvents = 'none';
                        introFrameEl.style.visibility = 'hidden';
                    }
                }
            }

            // 3. Scrubber Pills Active Synchronization
            navPills.forEach(pill => {
                if (!pill) return;
                const goto = sanitizeGotoIndex(pill.getAttribute ? pill.getAttribute('data-hww-goto') : null);
                const isActive = goto === activePhaseIndex;
                if (pill.classList) pill.classList.toggle('active', isActive);
                if (pill.setAttribute) pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            // 4. Scrubber Progress Line Width
            if (scrubberProgressEl && scrubberProgressEl.style) {
                const pct = Math.max(0, Math.min(100, progress * 100));
                scrubberProgressEl.style.width = `${pct}%`;
            }

            // 5. HUD Corner Boundary Tags Illumination
            // Stage 0 and Stage 5 illuminate all 4 corner tags; Stages 1-4 isolate specific active tag
            const cornerTagMap = {
                1: 'discovery',
                2: 'building',
                3: 'integrating',
                4: 'maintenance'
            };

            cornerTags.forEach(tag => {
                if (!tag) return;
                const cornerName = tag.getAttribute ? tag.getAttribute('data-corner') : null;
                if (stage === 0 || stage === 5) {
                    if (tag.classList) tag.classList.add('active');
                } else {
                    const activeCornerName = cornerTagMap[activePhaseIndex];
                    if (tag.classList) tag.classList.toggle('active', cornerName === activeCornerName);
                }
            });

            // 6. Quadrant Cards Active Illumination
            quadrantCards.forEach(card => {
                if (!card) return;
                const qNum = parseInt(card.getAttribute ? card.getAttribute('data-quadrant') : '', 10);
                if (stage === 0 || stage === 5) {
                    if (card.classList) card.classList.remove('active');
                } else {
                    if (card.classList) card.classList.toggle('active', qNum === activePhaseIndex);
                }
            });
        }

        // Cross-environment RAF wrappers
        function requestNextFrame(callback) {
            if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
                return window.requestAnimationFrame(callback);
            }
            if (typeof requestAnimationFrame === 'function') {
                return requestAnimationFrame(callback);
            }
            return setTimeout(callback, 16);
        }

        function cancelFrame(id) {
            if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
                window.cancelAnimationFrame(id);
                return;
            }
            if (typeof cancelAnimationFrame === 'function') {
                cancelAnimationFrame(id);
                return;
            }
            clearTimeout(id);
        }

        // Animation Loop
        function loop() {
            if (!isLoopRunning) return;

            const delta = targetProgress - currentProgress;
            if (Math.abs(delta) < 0.0001) {
                currentProgress = targetProgress;
            } else {
                currentProgress += delta * LERP_FACTOR;
            }

            renderFrame(currentProgress);

            rafId = requestNextFrame(loop);
        }

        function startLoop() {
            if (isLoopRunning) return;
            isLoopRunning = true;
            loop();
        }

        function stopLoop() {
            isLoopRunning = false;
            if (rafId) {
                cancelFrame(rafId);
                rafId = null;
            }
        }

        // Scroll listener
        function onScroll() {
            targetProgress = computeTargetProgress();
        }

        // Resize listener
        function onResize() {
            targetProgress = computeTargetProgress();
            renderFrame(currentProgress);
        }

        // Programmatic Scroll to Phase (1..4)
        function scrollToPhase(phaseIndex) {
            const sanitized = sanitizeGotoIndex(phaseIndex);
            const targetPhaseProgressMap = {
                1: 0.25,
                2: 0.45,
                3: 0.65,
                4: 0.825
            };
            const phaseP = targetPhaseProgressMap[sanitized] || 0.25;

            if (!trackEl) return;
            const rect = trackEl.getBoundingClientRect();
            const scrollY = (typeof window !== 'undefined' && window.pageYOffset) ? window.pageYOffset : (document.documentElement.scrollTop || 0);
            const trackAbsoluteTop = scrollY + (rect ? rect.top : 0);
            const viewportHeight = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 1;
            const trackHeight = trackEl.offsetHeight || (rect ? rect.height : 1);
            const scrollableDistance = Math.max(1, trackHeight - viewportHeight);

            const targetScrollTop = trackAbsoluteTop + (phaseP * scrollableDistance);

            if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
                window.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
            }
        }

        // Active Phase Query
        function getActivePhase() {
            return activePhaseIndex;
        }

        // Initialization
        function init() {
            if (typeof document === 'undefined') return { initialized: false, reason: 'Document missing' };

            sectionEl = document.getElementById('how-we-work-section');
            if (!sectionEl) return { initialized: false, reason: 'Root element missing' };

            if (isInitialized) return { initialized: true, alreadyInitialized: true };
            isInitialized = true;

            trackEl = document.getElementById('hww-track') || (sectionEl.querySelector ? sectionEl.querySelector('.hww-track') : null);
            canvasEl = document.getElementById('hww-spatial-canvas') || (sectionEl.querySelector ? sectionEl.querySelector('.hww-spatial-canvas') : null);
            introFrameEl = document.getElementById('hww-intro-frame') || (sectionEl.querySelector ? sectionEl.querySelector('.hww-intro-frame') : null);
            stateIntroEl = document.getElementById('hww-state-intro') || (introFrameEl && introFrameEl.querySelector ? introFrameEl.querySelector('.state-intro') : null);
            statePlatformEl = document.getElementById('hww-state-platform') || (introFrameEl && introFrameEl.querySelector ? introFrameEl.querySelector('.state-platform') : null);
            scrubberProgressEl = document.getElementById('hww-scrubber-progress');
            navPills = sectionEl.querySelectorAll ? Array.from(sectionEl.querySelectorAll('.hww-nav-pill')) : [];
            cornerTags = sectionEl.querySelectorAll ? Array.from(sectionEl.querySelectorAll('.hww-corner-tag')) : [];
            quadrantCards = sectionEl.querySelectorAll ? Array.from(sectionEl.querySelectorAll('.hww-quadrant-card')) : [];

            // Setup Scrubber Click Handlers
            navPills.forEach(pill => {
                if (!pill || !pill.addEventListener) return;
                const handler = function (e) {
                    if (e && e.preventDefault) e.preventDefault();
                    const gotoVal = pill.getAttribute ? pill.getAttribute('data-hww-goto') : null;
                    if (gotoVal !== null) {
                        scrollToPhase(gotoVal);
                    }
                };
                pill._hwwClickHandler = handler;
                pill.addEventListener('click', handler);
            });

            // Bind Event Listeners
            boundScrollHandler = onScroll;
            boundResizeHandler = onResize;
            if (typeof window !== 'undefined' && window.addEventListener) {
                window.addEventListener('scroll', boundScrollHandler, { passive: true });
                window.addEventListener('resize', boundResizeHandler, { passive: true });
            }

            // Initial Target & Frame Calculation
            targetProgress = computeTargetProgress();
            currentProgress = targetProgress;
            renderFrame(currentProgress);

            // IntersectionObserver Lifecycle for Performance
            if (typeof window !== 'undefined' && 'IntersectionObserver' in window && typeof window.IntersectionObserver === 'function') {
                observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            targetProgress = computeTargetProgress();
                            startLoop();
                        } else {
                            stopLoop();
                        }
                    });
                }, {
                    root: null,
                    threshold: [0, 0.05, 0.1]
                });
                observer.observe(sectionEl);
            } else {
                startLoop();
            }

            return { initialized: true };
        }

        // Cleanup & Teardown
        function destroy() {
            stopLoop();

            if (observer) {
                observer.disconnect();
                observer = null;
            }

            if (typeof window !== 'undefined' && window.removeEventListener) {
                if (boundScrollHandler) window.removeEventListener('scroll', boundScrollHandler);
                if (boundResizeHandler) window.removeEventListener('resize', boundResizeHandler);
            }

            navPills.forEach(pill => {
                if (pill && pill.removeEventListener && pill._hwwClickHandler) {
                    pill.removeEventListener('click', pill._hwwClickHandler);
                    delete pill._hwwClickHandler;
                }
            });

            if (canvasEl && canvasEl.style) canvasEl.style.transform = '';
            if (introFrameEl && introFrameEl.style) {
                introFrameEl.style.opacity = '';
                introFrameEl.style.pointerEvents = '';
                introFrameEl.style.visibility = '';
            }
            if (stateIntroEl && stateIntroEl.style) stateIntroEl.style.display = '';
            if (statePlatformEl && statePlatformEl.style) statePlatformEl.style.display = '';

            isInitialized = false;
        }

        return {
            init,
            getActivePhase,
            scrollToPhase,
            destroy,
            computeCameraTransform,
            computeTargetProgress
        };
    })();    /* ==========================================================================
       10. DISCOVER 3D ROBOT HERO MODULE (3D Mouse-tracking & Glow Effect)
       ========================================================================== */
    const RobotHeroModule = (function () {
        let heroSection, glowEl, robotContainer, splineViewer;
        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;
        let targetTiltX = 0, targetTiltY = 0;
        let currentTiltX = 0, currentTiltY = 0;
        let animFrameId = null;
        let isInitialized = false;

        // 3D Tilt Constraints
        const MAX_TILT_Y = 18; // Degrees left/right (yaw)
        const MAX_TILT_X = 14; // Degrees up/down (pitch)
        const LERP_SPEED = 0.08;

        function lerp(a, b, t) {
            return a + (b - a) * t;
        }

        function clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
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
            // Smoothly move background lighting glow
            glowX = lerp(glowX, mouseX, LERP_SPEED);
            glowY = lerp(glowY, mouseY, LERP_SPEED);
            if (glowEl) {
                glowEl.style.left = glowX + 'px';
                glowEl.style.top = glowY + 'px';
            }

            // Calculate 3D viewport angles relative to center of hero section
            if (heroSection) {
                const heroW = heroSection.offsetWidth || 1;
                const heroH = heroSection.offsetHeight || 1;

                const normX = clamp((mouseX - heroW / 2) / (heroW / 2), -1, 1);
                const normY = clamp((mouseY - heroH / 2) / (heroH / 2), -1, 1);

                targetTiltY = normX * MAX_TILT_Y;   // Yaw rotation
                targetTiltX = -normY * MAX_TILT_X;  // Pitch rotation
            }

            currentTiltX = lerp(currentTiltX, targetTiltX, LERP_SPEED);
            currentTiltY = lerp(currentTiltY, targetTiltY, LERP_SPEED);

            // Apply 3D perspective rotation matrix to robot container
            const targetEl = splineViewer || robotContainer;
            if (targetEl && targetEl.style) {
                targetEl.style.transform =
                    'perspective(1200px) ' +
                    'rotateX(' + currentTiltX.toFixed(2) + 'deg) ' +
                    'rotateY(' + currentTiltY.toFixed(2) + 'deg) ' +
                    'translateZ(20px)';
            }

            animFrameId = requestAnimationFrame(animate);
        }

        function init() {
            heroSection = document.querySelector('.discover-robot-hero');
            if (!heroSection) return;

            glowEl = document.getElementById('discover-hero-glow');
            robotContainer = document.getElementById('discover-hero-robot');
            splineViewer = document.getElementById('spline-robot-viewer');

            mouseX = heroSection.offsetWidth / 2;
            mouseY = heroSection.offsetHeight / 2;
            glowX = mouseX;
            glowY = mouseY;

            heroSection.addEventListener('mousemove', onMouseMove);
            heroSection.addEventListener('mouseleave', onMouseLeave);

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

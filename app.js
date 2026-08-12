/* ==========================================================
   INTELLECTIR - INTERACTIVE APPLICATION SCRIPT
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------
       0. 3D CARD TILT MANAGER
       ---------------------------------------------------------- */

    // 3D Mouse Card Tilt on Hover
    const tiltCards = document.querySelectorAll('.glass-card, .prop-card, .pillar-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });

    /* ----------------------------------------------------------
       1. HERO BACKGROUND VIDEO & PARTICLE BACKDROP MANAGER
       ---------------------------------------------------------- */
    const heroBgVideo = document.getElementById('hero-bg-video');
    const userVideoInput = document.getElementById('user-video-input');
    const videoStatusText = document.getElementById('video-filename-status');
    const canvas = document.getElementById('hero-particles-canvas');

    // Handle user video file upload / insertion
    if (userVideoInput && heroBgVideo) {
        userVideoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const fileURL = URL.createObjectURL(file);
                heroBgVideo.src = fileURL;
                heroBgVideo.load();
                heroBgVideo.play().catch(err => console.log('Autoplay prevented:', err));

                if (videoStatusText) {
                    videoStatusText.textContent = `Active Video: ${file.name}`;
                    videoStatusText.style.color = '#00f2fe';
                }
                showToast(`Hero video updated to "${file.name}"!`);
            }
        });
    }

    /* ----------------------------------------------------------
       1B. TOP ATTACHED INDUSTRY HERO VIDEO CONTROLLER
       ---------------------------------------------------------- */
    const indTopVideo = document.getElementById('ind-top-video');
    const indVideoBox = document.getElementById('top-industry-video-box');
    const btnToggleSticky = document.getElementById('btn-toggle-sticky');
    const btnToggleMute = document.getElementById('btn-toggle-mute');
    const muteIcon = document.getElementById('mute-icon');
    const muteLabel = document.getElementById('mute-label');

    if (indTopVideo) {
        // Sticky pin toggle
        if (btnToggleSticky && indVideoBox) {
            btnToggleSticky.addEventListener('click', () => {
                indVideoBox.classList.toggle('is-sticky');
                const isSticky = indVideoBox.classList.contains('is-sticky');
                btnToggleSticky.classList.toggle('active', isSticky);
                btnToggleSticky.querySelector('.tool-label').textContent = isSticky ? 'Pinned Top' : 'Sticky Pin';
                if (typeof showToast === 'function') {
                    showToast(isSticky ? 'Video pinned to top of screen!' : 'Video returned to header banner.');
                }
            });
        }

        // Sound Mute/Unmute toggle
        if (btnToggleMute) {
            btnToggleMute.addEventListener('click', () => {
                indTopVideo.muted = !indTopVideo.muted;
                if (indTopVideo.muted) {
                    muteIcon.className = 'fa-solid fa-volume-xmark';
                    muteLabel.textContent = 'Muted';
                } else {
                    muteIcon.className = 'fa-solid fa-volume-high';
                    muteLabel.textContent = 'Sound On';
                }
            });
        }
    }

    // Dynamic High-Tech Cyber Particle Canvas Backdrop
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.parentElement.clientWidth;
        let height = canvas.height = canvas.parentElement.clientHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = canvas.parentElement.clientWidth;
            height = canvas.height = canvas.parentElement.clientHeight;
        });

        const particles = [];
        const particleCount = 45;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.2
            });
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);

            // Draw connecting mesh lines
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 242, 254, ${0.12 * (1 - dist / 140)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            // Draw glowing particle nodes
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 242, 254, ${p.alpha})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#00f2fe';
                ctx.fill();

                // Move
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
            });

            requestAnimationFrame(drawParticles);
        }

        drawParticles();
    }

    /* ----------------------------------------------------------
       2. HEADER SCROLL & AUTOMATIC CONTRAST THEME MANAGER
       ---------------------------------------------------------- */
    const masthead = document.getElementById('masthead');
    const videoHero = document.querySelector('.ind-fullscreen-video-hero');
    const darkHero = document.querySelector('.hero-section, .hero-particles');

    function updateHeaderContrast() {
        if (!masthead) return;

        const scrollY = window.scrollY;

        // If on Industries page with top video hero
        if (videoHero) {
            const videoHeight = videoHero.offsetHeight || window.innerHeight;
            if (scrollY < videoHeight - 80) {
                // Over dark video background -> White text
                masthead.classList.remove('scrolled', 'light-nav');
                masthead.classList.add('dark-nav');
            } else {
                // Over white page background -> Black text
                masthead.classList.add('scrolled', 'light-nav');
                masthead.classList.remove('dark-nav');
            }
            return;
        }

        // For other pages
        if (scrollY > 40) {
            // Scrolled down over light/white page sections -> Black text
            masthead.classList.add('scrolled', 'light-nav');
            masthead.classList.remove('dark-nav');
        } else {
            // At top of page: check if hero background is dark or light
            if (darkHero) {
                // Dark hero background -> White text
                masthead.classList.remove('scrolled', 'light-nav');
                masthead.classList.add('dark-nav');
            } else {
                // Light hero background -> Black text
                masthead.classList.add('light-nav');
                masthead.classList.remove('dark-nav', 'scrolled');
            }
        }
    }

    window.addEventListener('scroll', updateHeaderContrast);
    window.addEventListener('resize', updateHeaderContrast);
    updateHeaderContrast();

    /* ----------------------------------------------------------
       3. INTERACTIVE CAPABILITY TABS
       ---------------------------------------------------------- */
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(`tab-${targetTab}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    /* ----------------------------------------------------------
       4. MODAL POPUP DIALOG HANDLER
       ---------------------------------------------------------- */
    const demoModal = document.getElementById('demo-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.querySelector('.modal-close-btn');

    function openModal() {
        if (demoModal) {
            demoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (demoModal) {
            demoModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (demoModal) {
        demoModal.addEventListener('click', (e) => {
            if (e.target === demoModal) {
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && demoModal && demoModal.classList.contains('active')) {
            closeModal();
        }
    });

    /* ----------------------------------------------------------
       5. FORM SUBMISSION & TOAST NOTIFICATION
       ---------------------------------------------------------- */
    const consultationForm = document.getElementById('consultation-form');
    const modalForm = document.getElementById('modal-consultation-form');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    function showToast(msg) {
        if (toast) {
            toastMessage.textContent = msg || 'Request submitted successfully! We will be in touch shortly.';
            toast.classList.add('active');
            setTimeout(() => {
                toast.classList.remove('active');
            }, 4000);
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        showToast('Thank you! Your AI Consultation request has been received.');
        e.target.reset();
        closeModal();
    }

    if (consultationForm) {
        consultationForm.addEventListener('submit', handleFormSubmit);
    }

    if (modalForm) {
        modalForm.addEventListener('submit', handleFormSubmit);
    }

    /* ----------------------------------------------------------
       6. INTERACTIVE ROI CALCULATOR LOGIC
       ---------------------------------------------------------- */
    const deptBtns = document.querySelectorAll('.dept-btn');
    const teamSlider = document.getElementById('team-size-slider');
    const teamValBadge = document.getElementById('team-size-val');
    const resHours = document.getElementById('res-hours');
    const resSavings = document.getElementById('res-savings');
    const resTaskDesc = document.getElementById('res-task-desc');

    const deptTasksMap = {
        support: "Ticket triage, customer replies, CRM logging & follow-ups",
        sales: "Lead qualification, deal prep, CRM sync & follow-up emails",
        finance: "Invoice extraction, contract audit, compliance & reporting",
        operations: "Incident triage, system checks, ticket routing & workflows"
    };

    function updateCalculator() {
        if (!teamSlider || !resHours || !resSavings) return;

        const activeDeptBtn = document.querySelector('.dept-btn.active');
        if (!activeDeptBtn) return;

        const hoursPerEmp = parseFloat(activeDeptBtn.getAttribute('data-hours')) || 20;
        const hourlyRate = parseFloat(activeDeptBtn.getAttribute('data-rate')) || 50;
        const deptKey = activeDeptBtn.getAttribute('data-dept') || 'support';
        const teamSize = parseInt(teamSlider.value, 10) || 10;

        if (teamValBadge) {
            teamValBadge.textContent = `${teamSize} Employees`;
        }

        const weeklyHours = teamSize * hoursPerEmp;
        // 70% efficiency automation model over 52 weeks
        const annualSavings = Math.round(weeklyHours * hourlyRate * 52 * 0.70);

        resHours.textContent = `${weeklyHours.toLocaleString()} hrs`;
        resSavings.textContent = `$${annualSavings.toLocaleString()}`;

        if (resTaskDesc && deptTasksMap[deptKey]) {
            resTaskDesc.textContent = deptTasksMap[deptKey];
        }
    }

    deptBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            deptBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateCalculator();
        });
    });

    if (teamSlider) {
        teamSlider.addEventListener('input', updateCalculator);
    }

    // Initialize calculator defaults
    updateCalculator();

    /* ----------------------------------------------------------
       5. HERO WORK EMAIL FORM HANDLER
       ---------------------------------------------------------- */
    const heroEmailForm = document.getElementById('hero-email-form');
    const heroWorkEmailInput = document.getElementById('hero-work-email');

    if (heroEmailForm) {
        heroEmailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailValue = heroWorkEmailInput ? heroWorkEmailInput.value.trim() : '';
            if (emailValue) {
                // Open demo/consultation modal and populate work email if modal has email field
                const modal = document.getElementById('demo-modal') || document.querySelector('.modal-overlay');
                const modalEmailInput = modal ? modal.querySelector('input[type="email"]') : null;
                if (modalEmailInput) {
                    modalEmailInput.value = emailValue;
                }
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else {
                    showToast(`Thank you! We will reach out to ${emailValue} shortly.`);
                }
            }
        });
    }

    /* ----------------------------------------------------------
       6. INTERSECTION OBSERVER SCROLL REVEAL ANIMATIONS
       ---------------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .glass-card, .prop-card, .pillar-card, .case-card');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => {
            if (!el.classList.contains('reveal-on-scroll')) {
                el.classList.add('reveal-on-scroll');
            }
            revealObserver.observe(el);
        });
    }

    /* ----------------------------------------------------------
       7. INTERACTIVE AI AGENT WORKFLOW SIMULATOR
       ---------------------------------------------------------- */
    const simRunBtn = document.getElementById('sim-run-btn');
    const simProgressFill = document.getElementById('sim-progress-fill');
    const simLogTerminal = document.getElementById('sim-log-terminal');
    const simStepNodes = document.querySelectorAll('.sim-step-node');

    if (simRunBtn) {
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

            // Reset simulation states
            simProgressFill.style.width = '0%';
            simLogTerminal.innerHTML = '<div class="sim-log-line"><span class="sim-log-time">[0.00s]</span> Initiating autonomous agent execution...</div>';
            simStepNodes.forEach(node => node.classList.remove('active', 'completed'));

            let step = 0;
            const interval = setInterval(() => {
                if (step < simStepsData.length) {
                    const stepData = simStepsData[step];

                    // Mark previous steps completed
                    for (let i = 0; i < stepData.stepIndex; i++) {
                        if (simStepNodes[i]) {
                            simStepNodes[i].classList.remove('active');
                            simStepNodes[i].classList.add('completed');
                            const statusEl = simStepNodes[i].querySelector('.sim-step-status');
                            if (statusEl) statusEl.textContent = 'Completed';
                        }
                    }

                    // Set current active node
                    if (simStepNodes[stepData.stepIndex]) {
                        simStepNodes[stepData.stepIndex].classList.add('active');
                        const statusEl = simStepNodes[stepData.stepIndex].querySelector('.sim-step-status');
                        if (statusEl) statusEl.textContent = 'Processing...';
                    }

                    // Update progress bar & log output
                    simProgressFill.style.width = `${stepData.progress}%`;
                    const logLine = document.createElement('div');
                    logLine.className = 'sim-log-line';
                    logLine.innerHTML = stepData.log;
                    simLogTerminal.appendChild(logLine);
                    simLogTerminal.scrollTop = simLogTerminal.scrollHeight;

                    step++;
                } else {
                    clearInterval(interval);
                    // Finalize simulation
                    simStepNodes.forEach(node => {
                        node.classList.remove('active');
                        node.classList.add('completed');
                        const statusEl = node.querySelector('.sim-step-status');
                        if (statusEl) statusEl.textContent = 'Completed';
                    });

                    simRunBtn.disabled = false;
                    simRunBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Re-Run Simulation';
                    isSimRunning = false;
                    if (typeof showToast === 'function') {
                        showToast('Multi-Agent Workflow Simulation completed in 1.20s!');
                    }
                }
            }, 800);
        });
    }

    /* ----------------------------------------------------------
       8. DISCOVER PAGE SEARCH & CATEGORY FILTERING
       ---------------------------------------------------------- */
    const discoverSearchInput = document.getElementById('discover-search-input');
    const filterPills = document.querySelectorAll('.filter-pill');
    const articleCards = document.querySelectorAll('.discover-article-card, .case-card, .insight-card');

    function filterArticles() {
        const searchTerm = discoverSearchInput ? discoverSearchInput.value.toLowerCase().trim() : '';
        const activePill = document.querySelector('.filter-pill.active');
        const selectedCategory = activePill ? activePill.getAttribute('data-category') : 'all';

        articleCards.forEach(card => {
            const title = card.querySelector('h3, .card-title, .case-title')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('p, .card-desc, .case-desc')?.textContent.toLowerCase() || '';
            const category = card.getAttribute('data-category') || 'all';

            const matchesSearch = !searchTerm || title.includes(searchTerm) || desc.includes(searchTerm);
            const matchesCategory = selectedCategory === 'all' || category === selectedCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = '';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    if (card.style.opacity === '0') {
                        card.style.display = 'none';
                    }
                }, 200);
            }
        });
    }

    if (discoverSearchInput) {
        discoverSearchInput.addEventListener('input', filterArticles);
    }

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterArticles();
        });
    });

});


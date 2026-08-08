/* ==========================================================
   INTELLECTIR - INTERACTIVE APPLICATION SCRIPT
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ----------------------------------------------------------
       0. INTERACTIVE MOUSE TRACKER & 3D TILT MANAGER
       ---------------------------------------------------------- */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorCircle = document.getElementById('cursor-circle');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let circleX = mouseX;
    let circleY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
    });

    function renderCursor() {
        circleX += (mouseX - circleX) * 0.18;
        circleY += (mouseY - circleY) * 0.18;

        if (cursorCircle) {
            cursorCircle.style.left = `${circleX}px`;
            cursorCircle.style.top = `${circleY}px`;
        }

        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    // Hover scale effects on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, input, select, textarea, .glass-card, .dept-btn');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

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
       2. HEADER SCROLL & NAVIGATION
       ---------------------------------------------------------- */
    const masthead = document.getElementById('masthead');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            masthead.classList.add('scrolled');
        } else {
            masthead.classList.remove('scrolled');
        }
    });

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

});

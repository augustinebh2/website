# Task Dispatch: Milestone 3 (HTML Pages & Structural Modernization)

Project Root: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web
Working Directory: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\worker_m3
Original Request: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\ORIGINAL_REQUEST.md
Project Specification: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\PROJECT.md
CSS Stylesheet: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\styles.css
Assets Directory: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\assets

## Scope & File Ownership
You exclusively own:
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\index.html`
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\company.html`
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\discover.html`
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\industries.html`
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\solutions.html`

## Mandatory Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objectives
1. **Standardize Header Navigation & Mobile Drawer Trigger Across ALL 5 Pages**:
   - Every page (`index.html`, `company.html`, `discover.html`, `industries.html`, `solutions.html`) must have the exact standardized header markup:
     ```html
     <header class="site-header">
       <div class="nav-container">
         <a href="index.html" class="brand-logo">
           <img src="assets/intellectir_logo.svg" alt="Intellectir Logo" class="logo-img" width="140" height="36">
         </a>
         <nav class="site-navigation" id="primary-nav" aria-label="Main Navigation">
           <ul class="nav-menu">
             <li class="nav-item"><a href="index.html" class="nav-link {active_on_home}">Home</a></li>
             <li class="nav-item"><a href="solutions.html" class="nav-link {active_on_solutions}">Services</a></li>
             <li class="nav-item"><a href="industries.html" class="nav-link {active_on_industries}">Industries</a></li>
             <li class="nav-item"><a href="discover.html" class="nav-link {active_on_discover}">Discover</a></li>
             <li class="nav-item"><a href="company.html" class="nav-link {active_on_company}">Company</a></li>
           </ul>
         </nav>
         <div class="nav-actions">
           <button class="btn btn-outline nav-cta" data-modal-target="demo-modal">Book Consultation</button>
           <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="primary-nav">
             <span class="hamburger-bar"></span>
             <span class="hamburger-bar"></span>
             <span class="hamburger-bar"></span>
           </button>
         </div>
       </div>
     </header>
     ```
   - Mark `class="nav-link active"` appropriately for each page. Remove all inline `style="color: #2563eb;"`.

2. **Standardize 4-Column Modern Footer Across ALL 5 Pages**:
   - Replace conflicting footer variants with the unified 4-column footer (`PROJECT.md § Global Footer Contract`):
     - Column 1: Brand logo, tagline ("Autonomous AI Agents & Enterprise Process Orchestration"), Social Links (X/Twitter, LinkedIn, GitHub), Status badge.
     - Column 2: Navigation Links (`Home`, `Services`, `Industries`, `Discover`, `Company`).
     - Column 3: Trust, Security & Legal (`Privacy Policy`, `Terms of Service`, `SOC2 Type II Compliance`, `Security Architecture`).
     - Column 4: Newsletter Subscription form (`<form class="footer-email-form">` with email input and submit button).
     - Bottom bar: Copyright `© 2026 Intellectir AI Inc. All rights reserved.`, Cape Town & Global Operations badge.

3. **Standardize Consultation Modal Dialog Across ALL 5 Pages**:
   - Uniform modal dialog (`id="demo-modal"`) with 3 input fields across all 5 pages:
     1. Full Name (`id="modal-name"`, required)
     2. Work Email (`id="modal-email"`, type="email", required)
     3. Enterprise Need / Industry (`id="modal-interest"`, required)
     - Submit button: `<button type="submit" class="btn btn-primary">Schedule Briefing</button>`
   - Toast element `<div id="toast" class="toast" role="alert" aria-live="assertive"></div>` present on all 5 pages.

4. **SEO, OpenGraph, Favicon & Semantic Metadata**:
   - Every page must have clean `<head>` tags:
     - Descriptive `<title>` (e.g. `Intellectir | Autonomous Enterprise AI Agents`)
     - `<meta name="description" content="...">`
     - `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
     - `<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">`
     - `<link rel="icon" type="image/x-icon" href="assets/favicon.ico">`
     - OpenGraph metadata (`og:title`, `og:description`, `og:type`, `og:image`).

5. **Clean Up Inline Styles & Modernize Page Sections**:
   - Remove inline `style="display: grid; grid-template-columns: 1fr 1fr;"` from `index.html` (rely on `.cinematic-grid-2` in `styles.css`).
   - Remove inline styles on tables, badges, and text blocks across all 5 pages.
   - Ensure all image and video asset paths resolve correctly to `assets/...` (e.g., `assets/intellectir_logo.svg`, `assets/icons/openai.svg`, `assets/videos/industries_pg.mp4`).

6. **Verification**:
   - Run `node test/e2e_runner.js` and verify Tier 1, Tier 2, Tier 3, and Tier 4 assertions.
   - Ensure all 5 HTML files pass validation.
   - Document changes in `handoff.md` and send a message back.

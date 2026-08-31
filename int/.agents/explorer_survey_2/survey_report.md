# Comprehensive UI/UX, Design System, Layout & Responsiveness Survey Report
**Project**: Intellectir Enterprise AI Consulting Website  
**Investigator**: Explorer 2 (UI/UX & Responsiveness Explorer)  
**Date**: August 24, 2026  
**Scope**: All 5 HTML Pages (`index.html`, `company.html`, `discover.html`, `industries.html`, `solutions.html`), Stylesheets (`styles.css`), Scripts (`app.js`), Assets & Media.

---

## Executive Summary & High-Level Architecture Assessment

Intellectir is positioned as a high-end, tier-1 enterprise AI consulting and agentic engineering firm (targeting deployments from $35k to $250k+ across Real Estate, Legal, Finance, Healthcare, and Operations). However, an in-depth audit reveals significant architectural, visual, and responsive fragmentation across the web codebase. 

### Critical Survey Highlights:
1. **Broken Mobile Navigation**: Mobile and tablet devices (<992px) completely lose the navigation menu because `.site-navigation` is hidden via `display: none` without any hamburger toggle button or mobile navigation drawer. Users on mobile devices cannot navigate between pages.
2. **Navigational Inconsistency**: `index.html` features 5 navbar links (including `Home`), whereas `company.html`, `discover.html`, `industries.html`, and `solutions.html` only feature 4 links (omitting `Home`). Active state styling is hardcoded with inline styles (`style="color: #2563eb;"`) on secondary pages rather than using clean CSS classes.
3. **Divergent Footer Architectures**: There are 3 completely incompatible footer implementations across the 5 pages. `index.html` uses an inline flex layout with a newsletter form and "Cape Town" location tag but zero navigation links; `industries.html` has a 2-column link layout; and `company.html`, `discover.html`, and `solutions.html` use a 1-column layout without legal links or newsletter subscriptions. No page includes social media links.
4. **Color Contrast & Theme Clashes (WCAG Violations)**: While `:root` defines light theme colors (`--bg-main: #ffffff`, `--text-primary: #0f172a`), buttons such as `.btn-primary` have dark blue gradients with near-black `#05070f` text (contrast ratio ~1.8:1, failing WCAG AA). Dark cards (such as the ROI calculator in `discover.html`) inherit dark body text colors, rendering labels unreadable.
5. **Inline Styles Overriding Responsiveness**: Multiple multi-column grid containers (such as `.cinematic-grid-2` in `index.html`) use hardcoded inline `style="display: grid; grid-template-columns: 1fr 1fr;"`, preventing CSS media queries from stacking them into single columns on mobile.
6. **Missing Assets Causing 404s & Huge Video Payloads**: The tech marquee references non-existent PNG files (`openai_white.png`, `meta_blue.png`, `vapi_mint.png`), and `industries_pg.mp4` is an uncompressed 73.3MB video served directly without responsive downscaling or fallback poster images.
7. **Dead / Orphaned Code Overhead**: Over 200 lines in `app.js` and 500+ lines in `styles.css` cater to obsolete elements (mega menus, 3D pinned camera zoom from legacy experiments `#canvas-world`, `#how-we-work`, `user-video-input`) that no longer exist in the DOM.

---

## 1. Visual Design, Theme, Color Palette & Typography

### 1.1 Color Palette & Design Tokens
In `styles.css`, the CSS custom properties define a light theme palette:
```css
:root {
    --bg-main: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;
    --card-bg: rgba(255, 255, 255, 0.9);
    --card-border: rgba(15, 23, 42, 0.08);
    --card-hover-border: rgba(37, 99, 235, 0.4);

    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #64748b;

    --accent-cyan: #2563eb;    /* Note: Named cyan but set to royal blue #2563eb */
    --accent-blue: #3b82f6;
    --accent-purple: #4f46e5;
    --accent-pink: #d946ef;

    --gradient-primary: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    --gradient-glow: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(79, 70, 229, 0.05) 100%);
    --gradient-card: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
}
```

#### Color Issues & Inconsistencies:
- **Variable Semantic Mismatch**: `--accent-cyan` is assigned `#2563eb` (a deep royal blue), yet legacy components throughout `styles.css` still use hardcoded `#00f2fe` or `rgba(0, 242, 254, ...)` for neon cyan glows, borders, and shadows.
- **Button Text Contrast Bug**:
  - `styles.css:198`: `.btn-primary { background: var(--gradient-primary); color: #05070f; }`
  - The background is deep blue/indigo (`#2563eb` to `#4f46e5`), but the text is `#05070f` (almost black). This creates a contrast ratio of **1.8:1**, far below the WCAG AA minimum requirement of 4.5:1. Button text MUST be `#ffffff`.
- **Secondary Button Contrast**:
  - `styles.css:208`: `.btn-secondary { background: rgba(255, 255, 255, 0.06); color: var(--text-primary); border: 1px solid rgba(255, 255, 255, 0.15); }`
  - On a white background (light theme), white transparent background and borders are completely invisible.
- **Theme Mixing**:
  - `index.html` has `<body class="dark-theme">`, but sections 4, 5, 6, 7 use inline styles with `background: #ffffff; color: #0f172a;`.
  - `company.html`, `discover.html`, `industries.html`, and `solutions.html` have `<body class="light-theme">`.
  - The site lacks a coherent theme-switching architecture; instead, it alternates jarringly between dark video hero sections and stark white cards with inline styles.

### 1.2 Typography & Scale
- **Loaded Fonts**:
  - `Inter` (Body sans-serif, weights: 300, 400, 500, 600, 700, 800)
  - `Outfit` (Headings, weights: 400, 500, 600, 700, 800)
  - `JetBrains Mono` (Telemetry HUDs, code tags, weights: 400, 500, 600)
- **Hierarchy Deficiencies**:
  - Heading font sizes are hardcoded inline in several sections of `index.html` (e.g., `font-size: 2.8rem;`, `font-size: 2.5rem;`, `font-size: 2.2rem;`) rather than adhering to a centralized typographic fluid scale (`clamp()` or rem-based heading classes `.h1`, `.h2`, `.h3`).
  - Subheaders (`.subhead-tag`) mix different pill badge styles: some use `display: inline-block; font-family: var(--font-mono); letter-spacing: 2px;`, while others use inline styles with varying background tints (`#eff6ff`, `#f5f3ff`, `#ecfdf5`, `#f1f5f9`).

### 1.3 Glassmorphism & Elevation
- Glass cards (`.glass-card`, `.glass-card-enhanced`) have multiple conflicting definitions across `styles.css`:
  - `styles.css:168`: `.glass-card` uses `backdrop-filter: blur(16px); background: var(--card-bg);`
  - `styles.css:2761`: `.glass-card-enhanced` uses `backdrop-filter: blur(20px); background: linear-gradient(...);`
  - Box shadows range from subtle (`0 10px 30px rgba(15, 23, 42, 0.05)`) to high-contrast dark theme shadows (`0 12px 30px rgba(0, 0, 0, 0.4)`), causing visual dissonance when placed on pure white backgrounds.

---

## 2. Header Navigation, Brand Logo & Mobile Menu

### 2.1 Navigation Bar Audit Across All Pages

| Page | Header HTML Elements | Nav Links Present | Active State Mechanism | Modal Trigger Present |
|---|---|---|---|---|
| `index.html` | `<header id="masthead" class="site-header">` | Home, Services, Industries, Discover, Company (5 links) | Class `.nav-link.active` | Yes (`.open-modal-btn`) |
| `company.html` | `<header id="masthead" class="site-header">` | Services, Industries, Discover, Company (4 links — **Missing Home**) | Inline `style="color: #2563eb;"` + `.active` | Yes (`.open-modal-btn`) |
| `discover.html` | `<header id="masthead" class="site-header">` | Services, Industries, Discover, Company (4 links — **Missing Home**) | Inline `style="color: #2563eb;"` + `.active` | Yes (`.open-modal-btn`) |
| `industries.html` | `<header id="masthead" class="site-header">` | Services, Industries, Discover, Company (4 links — **Missing Home**) | Inline `style="color: #2563eb;"` + `.active` | Yes (`.open-modal-btn`) |
| `solutions.html` | `<header id="masthead" class="site-header">` | Services, Industries, Discover, Company (4 links — **Missing Home**) | Class `.nav-link` (No active highlight) | Yes (`.open-modal-btn`) |

### 2.2 Mobile Navigation Breakdown (Severity: Critical)
- In `styles.css` lines 540-544:
  ```css
  @media (max-width: 992px) {
      .site-navigation {
          display: none;
      }
  }
  ```
- **Finding**: There is **no hamburger toggle button** (`<button class="nav-toggle" aria-label="Toggle navigation">`), no mobile sidebar/drawer menu, and no mobile navigation overlay anywhere in the codebase.
- **Impact**: On any screen narrower than 992px (tablets, iPads, iPhones, Android devices), the navigation links vanish completely. A mobile visitor cannot navigate to Services, Industries, Discover, Company, or Home.

### 2.3 Floating Header Scroll & Contrast Logic
- The site header is styled as a floating pill:
  `styles.css:283`: `position: fixed; top: 20px; left: 50%; transform: translateX(-50%); width: calc(100% - 48px); max-width: var(--container-width);`
- `app.js` runs `updateHeaderContrast()` on scroll to switch between `.dark-nav` and `.light-nav` / `.scrolled`.
- **Issue**: On mobile viewports (<480px), `top: 20px` and `width: calc(100% - 48px)` combined with padding compresses the logo and CTA button into cramped space, causing touch targets to overlap. The CTA button text "Book a Consultation" does not scale down on small screens.

### 2.4 Brand Logo Asset Optimization
- Header currently uses `<img src="assets/intellectir_logo.jpg" alt="Intellectir Logo" class="logo-img">`.
- `intellectir_logo.svg` is present in the repository and provides a clean, resolution-independent vector glyph with dark rounded pill styling. Switching to SVG improves crispness on high-DPI (Retina) screens and reduces layout shifts.

---

## 3. Footer Architecture, Social Links & Uniformity

### 3.1 Detailed Footer Comparison

```
+---------------------------------------------------------------------------------------------------+
| index.html Footer:                                                                                |
| [Brand Logo + Tagline]                    | [Newsletter Form: "Stay in Touch" + Email + Subscribe]|
| ------------------------------------------------------------------------------------------------- |
| © 2026 Intellectir Inc. All rights reserved.                             [Cape Town]             |
+---------------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------------+
| industries.html Footer:                                                                           |
| [Brand Logo + Tagline]                    | [Navigation Links]         | [Legal & Privacy Links]  |
|                                           | Home, Services, Industries | Privacy Policy           |
|                                           | Discover, Company          | Terms of Service         |
|                                           |                            | SOC2 Compliance          |
| ------------------------------------------------------------------------------------------------- |
| © 2026 Intellectir Inc. All rights reserved.                                                      |
+---------------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------------+
| company.html / discover.html / solutions.html Footer:                                             |
| [Brand Logo]                              | [Navigation Links] (1 Column Only)                   |
| ------------------------------------------------------------------------------------------------- |
| © 2026 Intellectir Inc. All rights reserved.                                                      |
+---------------------------------------------------------------------------------------------------+
```

### 3.2 Key Deficiencies & Missing Elements:
1. **Zero Social Media Integration**: None of the 5 pages contain social media links (LinkedIn, X/Twitter, GitHub, YouTube).
2. **Missing Navigation in `index.html`**: The home page footer has completely stripped out navigation links in favor of an inline newsletter form.
3. **Missing Legal & Compliance Links**: Only `industries.html` lists legal links (Privacy Policy, Terms of Service, SOC2 Audit Compliance). On `company.html`, `discover.html`, `solutions.html`, and `index.html`, legal links are absent.
4. **CSS Class Inconsistencies**: `index.html` uses `.inner-footer-main`, `.inner-footer-brand`, `.inner-footer-cta`, `.inner-footer-bottom`, with heavy inline CSS (`style="display: flex; align-items: center; ..."`), while `company.html` and `industries.html` use `.footer-top`, `.footer-brand`, `.footer-links`, `.footer-col`, `.footer-bottom`.
5. **Newsletter Form Functionality**: The newsletter form in `index.html` relies on inline JS (`onsubmit="event.preventDefault(); if(typeof showToast==='function') showToast('Thank you for subscribing!');"`).

---

## 4. CSS Flexbox & Grid Layouts, Responsiveness Across Viewports

### 4.1 Responsive Viewport Breakdown

#### A. Desktop Viewport (>1024px)
- **Container**: Max width 1240px with 24px horizontal padding.
- **Grids**:
  - Services Overview (`.cinematic-grid-2`): 2 columns (`1fr 1fr`).
  - Industries Blueprint (`.ind-grid-3`): 3 columns (`1fr 1.2fr 1fr` for Problem, Solution, ROI).
  - Pillars (`.pillars-grid`): 3 columns (`repeat(3, 1fr)`).
  - Simulation Steps (`.sim-steps-grid`): 4 columns (`repeat(4, 1fr)`).
- **Status**: Generally well-proportioned on desktop displays, but plagued by color contrast and text styling issues.

#### B. Tablet Viewport (768px – 1024px)
- **Breakpoints**:
  - `@media (max-width: 992px)` switches `.hero-grid`, `.pillars-grid`, `.ind-grid-3`, and `.reports-grid` to `1fr`.
  - `.sim-steps-grid` switches to `repeat(2, 1fr)`.
- **Bugs Observed**:
  - Header navigation links disappear completely with no replacement toggle.
  - `.cinematic-grid-2` in `index.html` remains forced at 2 columns due to inline `style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;"`, compressing the interactive HUD panels and text into narrow columns with awkward word wrapping.

#### C. Mobile Viewport (<768px and <480px)
- **Critical Breakages**:
  1. **ROI Calculator (`discover.html`)**:
     - `.calc-grid` has `grid-template-columns: 1.2fr 0.8fr; gap: 40px;` with **no media query** in `styles.css`.
     - On mobile screens (375px–420px), the controls and results card are forced side-by-side, overflowing the viewport and breaking horizontal scroll.
  2. **Accordion Lists (`index.html`)**:
     - Accordion headers (`.minimal-accordion-header`) have fixed padding and flex alignment. On small screens, the long industry title wraps onto multiple lines, colliding with the chevron icon.
  3. **Video Hero Sections**:
     - `assets/videos/industries_pg.mp4` on `industries.html` is an unscaled 73.3MB video. On mobile networks, this causes massive data consumption, high latency, and browser throttling.
  4. **Modals (`#demo-modal`)**:
     - Modal card padding (40px) inside `.modal-dialog` is too wide for 320px–375px viewports, causing modal inputs to touch screen edges.

---

## 5. Accessibility (ARIA, Semantic HTML, Contrast & Performance)

### 5.1 WCAG 2.1 AA Compliance Matrix

| Criterion | Element / Component | Current Implementation | WCAG Status | Required Remediation |
|---|---|---|---|---|
| **1.4.3 Contrast (Minimum)** | Primary CTA Buttons (`.btn-primary`) | Black text (`#05070f`) on dark blue/indigo gradient (`#2563eb` to `#4f46e5`). Ratio: 1.8:1 | **FAIL** | Change text color to `#ffffff` (Ratio: 7.2:1). |
| **1.4.3 Contrast (Minimum)** | ROI Calculator Badges & Labels (`.slider-val-badge`, `.calc-label`) | Dark text on dark blue badge (`#05070f` on `#2563eb`), dark text on dark card. | **FAIL** | Set badge text to `#ffffff`, card label text to high-contrast white/slate. |
| **2.1.1 Keyboard Navigation** | Minimalist Accordions (`.minimal-accordion-header`) | `<div>` elements without `tabindex="0"`, no `keydown` event listener for Enter/Space. | **FAIL** | Convert to `<button class="minimal-accordion-header" aria-expanded="false">` or add `tabindex="0"` + ARIA controls. |
| **4.1.2 Name, Role, Value** | Consultation Modal (`#demo-modal`) | Plain `<div>` overlay without `role="dialog"`, `aria-modal="true"`, `aria-labelledby`. | **FAIL** | Add ARIA landmark attributes to modal container and connect title ID. |
| **4.1.2 Name, Role, Value** | Filter Pills (`.filter-pill`, `.dept-btn`) | `<button>` tags without `aria-pressed="true|false"`. | **FAIL** | Dynamically update `aria-pressed` attribute when active. |
| **2.4.3 Focus Order** | Modal Focus Trap | Opening modal does not move focus to the first input; Tab key can escape modal into hidden background. | **FAIL** | Implement focus trap and auto-focus first input on modal open. |
| **2.2.2 Pause, Stop, Hide** | Video Autoplay & Marquee Animation | Tech marquee and video heroes loop infinitely without a pause button or `prefers-reduced-motion` media query. | **FAIL** | Wrap animations in `@media (prefers-reduced-motion: no-preference)`. |

### 5.2 Performance & Asset Loading
1. **Broken Tech Logo Images**:
   - `index.html` lines 93, 160, 170:
     `<img src="assets/openai_white.png">`
     `<img src="assets/meta_blue.png">`
     `<img src="assets/vapi_mint.png">`
   - These files do not exist in the assets directory, triggering 404 HTTP requests on page load and displaying broken image placeholders.
2. **Video Payload Overhead**:
   - `assets/videos/industries_pg.mp4` is **73,361,520 bytes (73.3 MB)**. This should be compressed to < 5MB using WebM/H.264 codecs or replaced with a lightweight visual background poster.
3. **Render-Blocking External Resources**:
   - Google Fonts (Inter, Outfit, JetBrains Mono) are loaded via 3 external requests.
   - FontAwesome 6.4.0 is loaded from an external CDN (~80KB CSS + font files).
4. **Dead Script Execution**:
   - `app.js` runs event listeners and animation frames for `cameraScrollTrack` (`#how-we-work`), `canvasWorld`, `quadrantContents`, and `hero-bg-video` that do not exist on most or all pages, wasting CPU cycles on every scroll event.

---

## 6. Comprehensive Redesign & Architecture Roadmap

### 6.1 Proposed Design Tokens (`styles.css`)
```css
:root {
    /* Brand Theme Palette */
    --bg-main: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;
    --bg-dark: #090d16;
    
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #64748b;
    --text-inverse: #ffffff;

    --brand-primary: #2563eb;
    --brand-primary-hover: #1d4ed8;
    --brand-purple: #4f46e5;
    --brand-gradient: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
    
    --card-bg: rgba(255, 255, 255, 0.95);
    --card-border: rgba(15, 23, 42, 0.08);
    --card-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);

    /* Typography */
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-heading: 'Outfit', var(--font-sans);
    --font-mono: 'JetBrains Mono', monospace;

    /* Layout */
    --container-max: 1240px;
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --radius-full: 9999px;
}
```

### 6.2 Standardized Header Navigation Specification
```html
<header id="masthead" class="site-header">
    <div class="wrapper">
        <div class="main-header">
            <a href="index.html" class="brand-logo" aria-label="Intellectir Home">
                <img src="assets/intellectir_logo.svg" alt="Intellectir Logo" class="logo-img">
                <span class="logo-text">INTELLECTIR</span>
            </a>

            <!-- Desktop & Mobile Navigation Menu -->
            <nav id="site-nav" class="site-navigation" aria-label="Main Navigation">
                <ul class="nav-menu">
                    <li class="nav-item"><a href="index.html" class="nav-link {active_class}">Home</a></li>
                    <li class="nav-item"><a href="solutions.html" class="nav-link {active_class}">Services</a></li>
                    <li class="nav-item"><a href="industries.html" class="nav-link {active_class}">Industries</a></li>
                    <li class="nav-item"><a href="discover.html" class="nav-link {active_class}">Discover</a></li>
                    <li class="nav-item"><a href="company.html" class="nav-link {active_class}">Company</a></li>
                </ul>
            </nav>

            <div class="header-actions">
                <button class="btn btn-nav-cta open-modal-btn" data-modal="demo">
                    <span>Book a Consultation</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </button>
                <!-- Mobile Hamburger Toggle -->
                <button id="mobile-menu-toggle" class="mobile-menu-btn" aria-label="Toggle Menu" aria-expanded="false" aria-controls="site-nav">
                    <i class="fa-solid fa-bars menu-icon-open"></i>
                    <i class="fa-solid fa-xmark menu-icon-close" style="display: none;"></i>
                </button>
            </div>
        </div>
    </div>
</header>
```

### 6.3 Standardized Enterprise Footer Specification
```html
<footer id="colophon" class="site-footer">
    <div class="wrapper">
        <div class="footer-top-grid">
            <!-- Col 1: Brand & Bio -->
            <div class="footer-col-brand">
                <a href="index.html" class="brand-logo footer-logo">
                    <img src="assets/intellectir_logo.svg" alt="Intellectir Logo" class="logo-img">
                    <span class="logo-text">INTELLECTIR</span>
                </a>
                <p class="footer-tagline">
                    Architecting and deploying specialized autonomous agentic systems and multi-agent workflows for modern enterprise leaders.
                </p>
                <div class="footer-social-links">
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
                    <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>
                </div>
            </div>

            <!-- Col 2: Navigation Links -->
            <div class="footer-col">
                <h4 class="footer-heading">Navigation</h4>
                <ul class="footer-nav-list">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="solutions.html">Services &amp; Capabilities</a></li>
                    <li><a href="industries.html">Target Industries</a></li>
                    <li><a href="discover.html">Discover &amp; ROI Simulator</a></li>
                    <li><a href="company.html">About &amp; Trust</a></li>
                </ul>
            </div>

            <!-- Col 3: Legal & Trust -->
            <div class="footer-col">
                <h4 class="footer-heading">Trust &amp; Legal</h4>
                <ul class="footer-nav-list">
                    <li><a href="company.html#security">SOC 2 Type II Certified</a></li>
                    <li><a href="company.html#security">HIPAA &amp; Zero Retention</a></li>
                    <li><a href="#privacy">Privacy Policy</a></li>
                    <li><a href="#terms">Terms of Service</a></li>
                </ul>
            </div>

            <!-- Col 4: Newsletter Subscription -->
            <div class="footer-col-cta">
                <h4 class="footer-heading">Stay in Touch</h4>
                <p class="footer-cta-desc">Get the latest enterprise agentic AI blueprints and research directly in your inbox.</p>
                <form class="footer-email-form" id="footer-newsletter-form">
                    <input type="email" placeholder="Enter your work email" required aria-label="Work email address">
                    <button type="submit" class="btn btn-primary">Subscribe</button>
                </form>
            </div>
        </div>

        <div class="footer-bottom-bar">
            <div class="copyright">&copy; 2026 Intellectir Inc. All rights reserved.</div>
            <div class="footer-location"><i class="fa-solid fa-location-dot"></i> Cape Town</div>
        </div>
    </div>
</footer>
```

### 6.4 Key Refactoring Priority Checklist for Developers:
1. **P0 (Critical)**: Implement responsive mobile navigation hamburger toggle in `app.js` and `styles.css`.
2. **P0 (Critical)**: Fix `.btn-primary` contrast: set text color to `#ffffff` and replace black text on badges with white text.
3. **P0 (Critical)**: Unify header navbar across all 5 HTML pages: include `Home` link and use standardized `.nav-link.active` class.
4. **P1 (High)**: Standardize footer markup across all 5 HTML pages with 4-column layout (Brand, Nav, Legal, Newsletter).
5. **P1 (High)**: Remove inline `grid-template-columns: 1fr 1fr;` from `.cinematic-grid-2` in `index.html` and define responsive media queries in `styles.css`.
6. **P1 (High)**: Add media query for `.calc-grid` on `discover.html` to stack on viewports < 768px.
7. **P2 (Medium)**: Replace missing tech marquee PNG images with inline SVGs for OpenAI, Meta, and Vapi.
8. **P2 (Medium)**: Optimize / replace the 73.3MB `industries_pg.mp4` video with compressed WebM/MP4 or video poster.
9. **P2 (Medium)**: Clean up dead JS in `app.js` (legacy 3D pinned camera scroll `#how-we-work`, `#canvas-world`, `user-video-input`).
10. **P3 (Accessibility)**: Add ARIA dialog attributes to `#demo-modal`, make accordions keyboard-focusable, and add `aria-expanded` state tracking.

# Task Dispatch: Milestone 1 (Server & Asset Infrastructure)

Project Root: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web
Working Directory: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\worker_m1
Original Request: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\ORIGINAL_REQUEST.md
Project Specification: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\PROJECT.md
Explorer 1 Report: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\explorer_survey_1\survey_report.md

## Scope & File Ownership
You exclusively own:
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\server.js`
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\assets\*`

## Mandatory Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objectives
1. **Server Modernization (`server.js`)**:
   - Zero external npm dependencies (use native `http`, `fs`, `path`, `url`).
   - Configurable port via `process.env.PORT || 3000`.
   - Implement stream-based file delivery (`fs.createReadStream`) with error handling.
   - Implement HTTP 206 Partial Content support for `Range: bytes=start-end` headers (crucial for `.mp4` video streaming).
   - Safe path resolution and sanitization: prevent directory traversal (`..` attacks). Any request trying to escape the project directory must return 403 Forbidden or 404 Not Found.
   - Clean URL routing: transparently serve `/company` -> `company.html`, `/discover` -> `discover.html`, `/industries` -> `industries.html`, `/solutions` -> `solutions.html`.
   - Comprehensive MIME dictionary mapping (`.html`, `.css`, `.js`, `.json`, `.svg`, `.png`, `.jpg`, `.jpeg`, `.mp4`, `.webm`, `.ico`, `.woff2`, `.txt`).
   - Clean HTTP status codes: 200 OK, 206 Partial Content, 404 Not Found, 405 Method Not Allowed (for non-GET/HEAD), 500 Internal Server Error.
   - Standard security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`).

2. **Asset Infrastructure (`assets/`)**:
   - Establish `assets/` directory structure with:
     - `assets/intellectir_logo.svg` (high quality vector brand logo)
     - `assets/favicon.svg` and `assets/favicon.ico`
     - `assets/icons/` with vector SVG brand icons (OpenAI, Anthropic, Google DeepMind, Mistral, Meta, Supabase, AWS, Microsoft, n8n, Vercel, Vapi)
     - Copy/link media assets if present in parent repo (`../assets/videos/industries_pg.mp4` or create fallback video/poster asset)
     - Ensure all asset requests resolve with valid Content-Type and HTTP 200.

3. **Verification**:
   - Test starting `node server.js` and querying endpoints (`/`, `/company`, `/styles.css`, `/app.js`, `/assets/intellectir_logo.svg`, Range requests on video).
   - Document verification results in `handoff.md`.

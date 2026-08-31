/**
 * Intellectir E2E Test Runner
 * ==========================
 * Standalone, zero-dependency Node.js automated test runner.
 * 
 * Features:
 * - Zero external npm dependencies (native Node.js http, fs, path, url, assert, child_process)
 * - Test discovery (finds and runs all test_tier*.js files or custom filters)
 * - Server process supervisor (auto-spawns test server if not running, cleans up on exit)
 * - Async/await test lifecycle hooks (before, after, beforeEach, afterEach)
 * - HTTP client helper with Byte-Range, custom headers, and timing metrics
 * - Rich assertion library with detailed failure reporting and diffs
 * - ANSI colored CLI reporter with timing and exit codes
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { spawn } = require('child_process');

// ==========================================
// CLI Configuration & Arguments
// ==========================================
const ARGS = process.argv.slice(2);
const PORT = parseInt(process.env.TEST_PORT || getArgValue('--port') || '3000', 10);
const HOST = process.env.TEST_HOST || getArgValue('--host') || '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;
const GREP_FILTER = getArgValue('--grep') || null;
const TIER_FILTER = getArgValue('--tier') || null;
const VERBOSE = ARGS.includes('--verbose') || ARGS.includes('-v');

function getArgValue(flag) {
  const arg = ARGS.find(a => a.startsWith(`${flag}=`));
  if (arg) return arg.split('=')[1];
  const idx = ARGS.indexOf(flag);
  if (idx !== -1 && idx + 1 < ARGS.length) return ARGS[idx + 1];
  return null;
}

// ==========================================
// ANSI Color Formatting
// ==========================================
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m'
};

// ==========================================
// Test Suite Registry & State
// ==========================================
const testSuites = [];
let currentSuite = null;
let currentFileRunning = null;
let serverProcess = null;
let serverManagedByRunner = false;

class TestSuite {
  constructor(name, file) {
    this.name = name;
    this.file = file;
    this.tests = [];
    this.beforeHooks = [];
    this.afterHooks = [];
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
  }

  addTest(name, fn, options = {}) {
    this.tests.push({
      name,
      fn,
      options,
      suite: this,
      status: 'pending',
      duration: 0,
      error: null
    });
  }
}

function describe(name, fn) {
  const suite = new TestSuite(name, currentFileRunning || 'inline');
  testSuites.push(suite);
  const previousSuite = currentSuite;
  currentSuite = suite;
  try {
    fn();
  } finally {
    currentSuite = previousSuite;
  }
}

function test(name, fn, options = {}) {
  if (!currentSuite) {
    describe('Default Suite', () => {
      currentSuite.addTest(name, fn, options);
    });
  } else {
    currentSuite.addTest(name, fn, options);
  }
}

const it = test;

function before(fn) {
  if (currentSuite) currentSuite.beforeHooks.push(fn);
}

function after(fn) {
  if (currentSuite) currentSuite.afterHooks.push(fn);
}

function beforeEach(fn) {
  if (currentSuite) currentSuite.beforeEachHooks.push(fn);
}

function afterEach(fn) {
  if (currentSuite) currentSuite.afterEachHooks.push(fn);
}

// ==========================================
// HTTP Request Utility (WHATWG URL API)
// ==========================================
function httpRequest(optionsOrPath) {
  return new Promise((resolve, reject) => {
    let parsedUrl;
    let reqOptions = {};

    try {
      if (typeof optionsOrPath === 'string') {
        const pathStr = optionsOrPath.startsWith('http') ? (new URL(optionsOrPath).pathname + new URL(optionsOrPath).search) : (optionsOrPath.startsWith('/') ? optionsOrPath : `/${optionsOrPath}`);
        const fullUrl = optionsOrPath.startsWith('http') ? optionsOrPath : `${BASE_URL}${optionsOrPath.startsWith('/') ? '' : '/'}${optionsOrPath}`;
        parsedUrl = new URL(fullUrl);
        reqOptions = {
          protocol: parsedUrl.protocol,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: pathStr,
          method: 'GET',
          headers: {}
        };
      } else {
        const p = optionsOrPath.path || optionsOrPath.pathname || '/';
        const pathStr = p.startsWith('http') ? (new URL(p).pathname + new URL(p).search) : (p.startsWith('/') ? p : `/${p}`);
        const fullUrl = p.startsWith('http') ? p : `${BASE_URL}${p.startsWith('/') ? '' : '/'}${p}`;
        parsedUrl = new URL(fullUrl);
        reqOptions = {
          protocol: parsedUrl.protocol,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          path: pathStr,
          method: optionsOrPath.method || 'GET',
          headers: optionsOrPath.headers || {}
        };
        if (optionsOrPath.body) reqOptions.body = optionsOrPath.body;
      }
    } catch (err) {
      return reject(err);
    }

    const startTime = Date.now();
    const client = reqOptions.protocol === 'https:' ? https : http;

    const req = client.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const body = buffer.toString('utf-8');
        const timeMs = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body,
          buffer,
          timeMs,
          reqUrl: parsedUrl.href
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (reqOptions.body) {
      if (typeof reqOptions.body === 'object' && !Buffer.isBuffer(reqOptions.body)) {
        req.write(JSON.stringify(reqOptions.body));
      } else {
        req.write(reqOptions.body);
      }
    }

    req.end();
  });
}

// Custom assertion helpers
const customAssert = {
  ...assert,
  assertStatus(res, expectedStatus, message) {
    assert.strictEqual(
      res.statusCode,
      expectedStatus,
      message || `Expected HTTP status ${expectedStatus} on ${res.reqUrl}, received ${res.statusCode}`
    );
  },
  assertHeader(res, headerName, expectedValue, message) {
    const actual = res.headers[headerName.toLowerCase()];
    if (expectedValue instanceof RegExp) {
      assert.match(
        actual || '',
        expectedValue,
        message || `Expected header '${headerName}' matching ${expectedValue}, got '${actual}'`
      );
    } else {
      assert.strictEqual(
        actual,
        expectedValue,
        message || `Expected header '${headerName}: ${expectedValue}', got '${actual}'`
      );
    }
  },
  assertContains(actualText, searchString, message) {
    assert.ok(
      typeof actualText === 'string' && actualText.includes(searchString),
      message || `Expected content to contain '${searchString}'`
    );
  },
  assertNotContains(actualText, searchString, message) {
    assert.ok(
      typeof actualText === 'string' && !actualText.includes(searchString),
      message || `Expected content to NOT contain '${searchString}'`
    );
  }
};

// Export APIs early
exports.describe = describe;
exports.test = test;
exports.it = it;
exports.before = before;
exports.after = after;
exports.beforeEach = beforeEach;
exports.afterEach = afterEach;
exports.httpRequest = httpRequest;
exports.assert = customAssert;
exports.BASE_URL = BASE_URL;

// ==========================================
// Server Lifecycle Supervisor
// ==========================================
async function isServerRunning(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const req = http.request({
      host,
      port,
      path: '/',
      method: 'GET',
      timeout: 1000
    }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function ensureServerRunning() {
  const running = await isServerRunning(PORT, HOST);
  if (running) {
    console.log(`${colors.cyan}●${colors.reset} Connected to existing server at ${colors.bold}${BASE_URL}${colors.reset}`);
    return;
  }

  console.log(`${colors.cyan}●${colors.reset} Spawning local server process on port ${PORT}...`);
  const projectRoot = path.resolve(__dirname, '..');
  const serverScript = path.join(projectRoot, 'server.js');

  if (!fs.existsSync(serverScript)) {
    throw new Error(`Cannot find server script at ${serverScript}`);
  }

  serverProcess = spawn(process.execPath, [serverScript], {
    cwd: projectRoot,
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe'
  });

  serverManagedByRunner = true;

  serverProcess.stdout.on('data', (data) => {
    if (VERBOSE) process.stdout.write(`${colors.gray}[server] ${data.toString()}${colors.reset}`);
  });

  serverProcess.stderr.on('data', (data) => {
    process.stderr.write(`${colors.red}[server error] ${data.toString()}${colors.reset}`);
  });

  // Poll until server is responding (up to 5 seconds)
  const maxAttempts = 50;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 100));
    if (await isServerRunning(PORT, HOST)) {
      console.log(`${colors.green}✔${colors.reset} Server successfully started (PID: ${serverProcess.pid}) at ${colors.bold}${BASE_URL}${colors.reset}\n`);
      return;
    }
  }

  throw new Error(`Server failed to start and bind to port ${PORT} within 5 seconds.`);
}

function stopServer() {
  if (serverManagedByRunner && serverProcess && !serverProcess.killed) {
    try {
      serverProcess.kill('SIGTERM');
    } catch (_) {}
  }
}

process.on('SIGINT', () => {
  stopServer();
  process.exit(1);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(1);
});

// ==========================================
// Test Execution & CLI Reporting
// ==========================================
async function runTest(t, beforeEachHooks, afterEachHooks) {
  const startTime = Date.now();
  try {
    for (const hook of beforeEachHooks) {
      await hook();
    }
    await t.fn({
      request: httpRequest,
      assert: customAssert,
      baseUrl: BASE_URL,
      port: PORT,
      host: HOST
    });
    for (const hook of afterEachHooks) {
      await hook();
    }
    t.duration = Date.now() - startTime;
    t.status = 'passed';
  } catch (err) {
    t.duration = Date.now() - startTime;
    t.status = 'failed';
    t.error = err;
  }
}

async function runAllSuites() {
  console.log(`\n${colors.bold}${colors.cyan}======================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   INTELLECTIR E2E TEST RUNNER (4-Tier Test Suite)    ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}\n`);

  await ensureServerRunning();

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  const failures = [];
  const suiteStartTime = Date.now();

  for (const suite of testSuites) {
    // Filter tests
    let runnableTests = suite.tests;
    if (GREP_FILTER) {
      const re = new RegExp(GREP_FILTER, 'i');
      runnableTests = runnableTests.filter(t => re.test(t.name) || re.test(suite.name));
    }

    if (runnableTests.length === 0) continue;

    console.log(`${colors.bold}${colors.white}${suite.name}${colors.reset} ${colors.gray}(${path.basename(suite.file)})${colors.reset}`);

    // Run before hooks
    try {
      for (const hook of suite.beforeHooks) {
        await hook();
      }
    } catch (err) {
      console.log(`  ${colors.red}✖ Suite before() hook failed: ${err.message}${colors.reset}`);
    }

    for (const t of runnableTests) {
      totalTests++;
      await runTest(t, suite.beforeEachHooks, suite.afterEachHooks);

      if (t.status === 'passed') {
        passedTests++;
        const durationStr = t.duration > 100 ? `${colors.yellow}(${t.duration}ms)${colors.reset}` : `${colors.gray}(${t.duration}ms)${colors.reset}`;
        console.log(`  ${colors.green}✔${colors.reset} ${colors.dim}${t.name}${colors.reset} ${durationStr}`);
      } else if (t.status === 'failed') {
        failedTests++;
        console.log(`  ${colors.red}✖ ${colors.bold}${t.name}${colors.reset} ${colors.red}(${t.duration}ms)${colors.reset}`);
        failures.push({ suite, test: t, error: t.error });
      } else {
        skippedTests++;
        console.log(`  ${colors.yellow}⚠ ${t.name} (skipped)${colors.reset}`);
      }
    }

    // Run after hooks
    try {
      for (const hook of suite.afterHooks) {
        await hook();
      }
    } catch (err) {
      console.log(`  ${colors.red}✖ Suite after() hook failed: ${err.message}${colors.reset}`);
    }

    console.log();
  }

  const totalDuration = ((Date.now() - suiteStartTime) / 1000).toFixed(2);

  // Summary Report
  console.log(`${colors.bold}${colors.cyan}------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bold}Test Run Summary:${colors.reset}`);
  console.log(`  Suites:   ${testSuites.length}`);
  console.log(`  Total:    ${totalTests}`);
  console.log(`  Passed:   ${colors.green}${passedTests}${colors.reset}`);
  if (failedTests > 0) {
    console.log(`  Failed:   ${colors.red}${failedTests}${colors.reset}`);
  }
  if (skippedTests > 0) {
    console.log(`  Skipped:  ${colors.yellow}${skippedTests}${colors.reset}`);
  }
  console.log(`  Duration: ${totalDuration}s`);
  console.log(`${colors.bold}${colors.cyan}------------------------------------------------------${colors.reset}\n`);

  // Failure details
  if (failures.length > 0) {
    console.log(`${colors.bold}${colors.red}Failures (${failures.length}):${colors.reset}\n`);
    failures.forEach((f, idx) => {
      console.log(`${colors.bold}${colors.red}${idx + 1}) [${f.suite.name}] ${f.test.name}${colors.reset}`);
      console.log(`${colors.gray}File: ${f.suite.file}${colors.reset}`);
      if (f.error.message) {
        console.log(`  ${colors.red}Error: ${f.error.message}${colors.reset}`);
      }
      if (f.error.stack) {
        const stackLines = f.error.stack.split('\n').slice(1, 5).join('\n');
        console.log(`${colors.gray}${stackLines}${colors.reset}\n`);
      }
    });
  }

  stopServer();

  if (failedTests > 0) {
    console.log(`${colors.bgRed}${colors.white}${colors.bold} TEST RUN FAILED (${failedTests} failures) ${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.bgGreen}${colors.white}${colors.bold} ALL TESTS PASSED (${passedTests}/${totalTests}) ${colors.reset}\n`);
    process.exit(0);
  }
}

// ==========================================
// Test Discovery & Entry Point
// ==========================================
async function main() {
  // Export globals for test files
  global.describe = describe;
  global.test = test;
  global.it = it;
  global.before = before;
  global.after = after;
  global.beforeEach = beforeEach;
  global.afterEach = afterEach;
  global.httpRequest = httpRequest;
  global.assert = customAssert;
  global.BASE_URL = BASE_URL;

  const testDir = __dirname;
  const filesToRun = [];

  // Check explicit file arguments
  const explicitFiles = ARGS.filter(a => a.endsWith('.js') && !a.startsWith('--'));
  if (explicitFiles.length > 0) {
    for (const f of explicitFiles) {
      const full = path.resolve(process.cwd(), f);
      if (fs.existsSync(full)) {
        filesToRun.push(full);
      }
    }
  } else {
    // Auto-discover test_tier*.js and test_how_we_work_e2e.js (all test_*.js files)
    const files = fs.readdirSync(testDir);
    const testFiles = files
      .filter(f => f.startsWith('test_') && f.endsWith('.js'))
      .sort();

    for (const f of testFiles) {
      if (TIER_FILTER) {
        if (f.includes(`tier${TIER_FILTER}`) || (f.includes('how_we_work') && String(TIER_FILTER).toLowerCase() === 'all')) {
          filesToRun.push(path.join(testDir, f));
        }
      } else {
        filesToRun.push(path.join(testDir, f));
      }
    }
  }

  if (filesToRun.length === 0) {
    console.log(`${colors.yellow}⚠ No test files found matching criteria in ${testDir}${colors.reset}`);
    process.exit(0);
  }

  for (const f of filesToRun) {
    currentFileRunning = f;
    try {
      require(f);
    } catch (err) {
      console.error(`${colors.red}Failed to load test file ${f}: ${err.message}${colors.reset}`);
      console.error(err.stack);
      process.exit(1);
    }
  }

  await runAllSuites();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(`${colors.red}Fatal runner error: ${err.message}${colors.reset}`);
    console.error(err.stack);
    stopServer();
    process.exit(1);
  });
}

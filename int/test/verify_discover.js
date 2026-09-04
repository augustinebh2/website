const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'discover.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== 1. VERIFYING ALL 6 USER-PROVIDED ARTICLE URLS ===');
const requiredUrls = [
    'https://www.ibm.com/think/topics/ai-workflow',
    'https://www.deloitte.com/us/en/what-we-do/case-studies/hands-off-the-task-eyes-on-the-outcome.html',
    'https://www.mckinsey.com/industries/automotive-and-assembly/our-insights/empowering-advanced-industries-with-agentic-ai',
    'https://www.shopify.com/blog/ai-agents',
    'https://www.mckinsey.com.br/our-insights/agents-robots-and-us-skill-partnerships-in-the-age-of-ai',
    'https://shiftmate.co.za/ai/agents/what-are-ai-agents-south-africa'
];

let allPassed = true;
requiredUrls.forEach(url => {
    if (html.includes(url)) {
        console.log(`[PASS] URL present: ${url}`);
    } else {
        console.error(`[FAIL] URL missing: ${url}`);
        allPassed = false;
    }
});

console.log('\n=== 2. VERIFYING REMOVED ELEMENTS & BADGES ===');
const forbiddenStrings = [
    'INSIGHTS & INTELLIGENCE',
    'INSIGHTS &amp; INTELLIGENCE',
    'Explore curated global research from Deloitte',
    'Commerce &amp; Retail',
    'Commerce & Retail',
    'Hybrid Vector-Graph Retrieval',
    'SOC2 &amp; HIPAA Compliant Guardrails',
    'Global Fintech Reduces Claims Processing Time',
    'The 2026 Executive Guide to Agentic Engineering',
    'search-key-hint',
    'category-pills-row',
    'shimmer-badge'
];

forbiddenStrings.forEach(str => {
    if (!html.includes(str)) {
        console.log(`[PASS] Correctly removed: "${str}"`);
    } else {
        console.error(`[FAIL] Still present in discover.html: "${str}"`);
        allPassed = false;
    }
});

console.log('\n=== 3. VERIFYING SUBTITLE ===');
const expectedSubtitle = 'articles to help you understand basics of AI Implementation and how it is important for your business';
if (html.includes(expectedSubtitle)) {
    console.log(`[PASS] Subtitle present: "${expectedSubtitle}"`);
} else {
    console.error(`[FAIL] Subtitle missing: "${expectedSubtitle}"`);
    allPassed = false;
}

console.log('\n=== 4. VERIFYING TOTAL ARTICLES COUNT ===');
const matches = html.match(/class="glass-card discover-article-card/g) || [];
console.log(`Total discover article cards: ${matches.length}`);
if (matches.length === 6) {
    console.log('[PASS] Exactly 6 article cards present (all user-provided links).');
} else {
    console.error(`[FAIL] Expected exactly 6 article cards, got ${matches.length}`);
    allPassed = false;
}

if (allPassed) {
    console.log('\n>>> ALL DISCOVER HTML CHECKS PASSED! <<<');
    process.exit(0);
} else {
    console.error('\n>>> SOME DISCOVER HTML CHECKS FAILED! <<<');
    process.exit(1);
}

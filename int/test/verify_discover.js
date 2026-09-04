const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'discover.html');
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('=== 1. VERIFYING ARTICLE URLS IN DISCOVER.HTML ===');
const requiredUrls = [
    'https://www.deloitte.com/us/en/what-we-do/case-studies/hands-off-the-task-eyes-on-the-outcome.html',
    'https://www.mckinsey.com/industries/automotive-and-assembly/our-insights/empowering-advanced-industries-with-agentic-ai',
    'https://shiftmate.co.za/ai/agents/what-are-ai-agents-south-africa',
    'https://www.shopify.com/blog/ai-agents',
    'https://www.mckinsey.com.br/our-insights/agents-robots-and-us-skill-partnerships-in-the-age-of-ai',
    'https://www.ibm.com/think/topics/ai-workflow'
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

console.log('\n=== 2. VERIFYING PUBLISHERS ===');
const publishers = ['Deloitte', 'McKinsey & Company', 'ShiftMate SA', 'Shopify', 'McKinsey Global Institute', 'IBM Think', 'Intellectir Engineering', 'Intellectir Case Study', 'Intellectir Advisory'];
publishers.forEach(pub => {
    if (html.includes(`data-publisher="${pub}"`)) {
        console.log(`[PASS] Publisher present: ${pub}`);
    } else {
        console.error(`[FAIL] Publisher missing: ${pub}`);
        allPassed = false;
    }
});

console.log('\n=== 3. VERIFYING CATEGORY PILLS ===');
const categories = ['all', 'case-studies', 'strategy', 'workforce-sa', 'commerce-ops', 'architecture'];
categories.forEach(cat => {
    if (html.includes(`data-category="${cat}"`)) {
        console.log(`[PASS] Category present: ${cat}`);
    } else {
        console.error(`[FAIL] Category missing: ${cat}`);
        allPassed = false;
    }
});

console.log('\n=== 4. VERIFYING SEARCH BAR ELEMENTS ===');
const elements = [
    'id="discover-search-input"',
    'id="discover-search-clear"',
    'id="search-key-hint"',
    'id="category-pills-nav"',
    'id="discover-results-count"',
    'id="discover-articles-grid"',
    'id="discover-no-results"'
];
elements.forEach(el => {
    if (html.includes(el)) {
        console.log(`[PASS] Element present: ${el}`);
    } else {
        console.error(`[FAIL] Element missing: ${el}`);
        allPassed = false;
    }
});

console.log('\n=== 5. COUNT TOTAL ARTICLE CARDS ===');
const matches = html.match(/class="glass-card discover-article-card/g) || [];
console.log(`Total discover article cards: ${matches.length}`);
if (matches.length === 10) {
    console.log('[PASS] Exactly 10 article cards present.');
} else {
    console.error(`[FAIL] Expected 10 article cards, got ${matches.length}`);
    allPassed = false;
}

if (allPassed) {
    console.log('\n>>> ALL DISCOVER VERIFICATION TESTS PASSED SUCCESSFULLY! <<<');
    process.exit(0);
} else {
    console.error('\n>>> SOME DISCOVER VERIFICATION TESTS FAILED! <<<');
    process.exit(1);
}

const fs = require('fs');
const path = require('path');

// Extract card data from discover.html
const html = fs.readFileSync(path.join(__dirname, '..', 'discover.html'), 'utf8');

const cardRegex = /<article class="glass-card discover-article-card[^"]*"([\s\S]*?)<\/article>/g;
const cards = [];
let match;
let idx = 0;

while ((match = cardRegex.exec(html)) !== null) {
    const rawCard = match[1];
    const getAttr = (attr) => {
        const m = rawCard.match(new RegExp(`data-${attr}="([^"]*)"`));
        return m ? m[1] : '';
    };

    cards.push({
        index: idx++,
        title: getAttr('title'),
        summary: getAttr('summary'),
        publisher: getAttr('publisher'),
        category: getAttr('category'),
        tags: getAttr('tags'),
        titleText: getAttr('title').toLowerCase(),
        descText: getAttr('summary').toLowerCase(),
        publisherText: getAttr('publisher').toLowerCase(),
        categoryText: getAttr('category').toLowerCase(),
        tagsText: getAttr('tags').toLowerCase()
    });
}

console.log(`Extracted ${cards.length} cards for search simulation.`);

function rankSearch(query, selectedCategory = 'all') {
    const normalizedQuery = (query || '').trim().toLowerCase();
    const tokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);
    const scored = [];

    cards.forEach(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        if (!matchesCategory) {
            return;
        }

        if (tokens.length === 0) {
            scored.push({ item, score: 100 - item.index });
            return;
        }

        let score = 0;
        let matchedAny = false;

        if (normalizedQuery.length > 2) {
            if (item.titleText.includes(normalizedQuery)) score += 45;
            if (item.publisherText.includes(normalizedQuery)) score += 40;
            if (item.tagsText.includes(normalizedQuery)) score += 30;
            if (item.descText.includes(normalizedQuery)) score += 20;
        }

        tokens.forEach(token => {
            let tokenMatched = false;
            if (item.publisherText.includes(token)) {
                score += 20;
                tokenMatched = true;
            }
            if (item.titleText.includes(token)) {
                score += 16;
                tokenMatched = true;
            }
            if (item.tagsText.includes(token)) {
                score += 12;
                tokenMatched = true;
            }
            if (item.categoryText.includes(token)) {
                score += 10;
                tokenMatched = true;
            }
            if (item.descText.includes(token)) {
                score += 6;
                tokenMatched = true;
            }
            if (tokenMatched) matchedAny = true;
        });

        const allTokensMatch = tokens.every(token =>
            item.titleText.includes(token) ||
            item.descText.includes(token) ||
            item.publisherText.includes(token) ||
            item.tagsText.includes(token) ||
            item.categoryText.includes(token)
        );

        if (allTokensMatch) score += 25;

        if (matchedAny && score > 0) {
            scored.push({ item, score });
        }
    });

    scored.sort((a, b) => b.score - a.score || a.item.index - b.item.index);
    return scored;
}

let passed = true;

// Test 1: "invoice" -> Deloitte should be #1
console.log('\n--- Test 1: Search "invoice" ---');
const r1 = rankSearch('invoice');
console.log(`Top match: "${r1[0].item.title}" (${r1[0].item.publisher}) - Score: ${r1[0].score}`);
if (r1[0].item.publisher === 'Deloitte') {
    console.log('[PASS] Deloitte is #1 for "invoice"');
} else {
    console.error('[FAIL] Deloitte is not #1');
    passed = false;
}

// Test 2: "South Africa" -> ShiftMate should be #1
console.log('\n--- Test 2: Search "South Africa" ---');
const r2 = rankSearch('South Africa');
console.log(`Top match: "${r2[0].item.title}" (${r2[0].item.publisher}) - Score: ${r2[0].score}`);
if (r2[0].item.publisher === 'ShiftMate SA') {
    console.log('[PASS] ShiftMate SA is #1 for "South Africa"');
} else {
    console.error('[FAIL] ShiftMate SA is not #1');
    passed = false;
}

// Test 3: "Shopify" -> Shopify should be #1
console.log('\n--- Test 3: Search "Shopify" ---');
const r3 = rankSearch('Shopify');
console.log(`Top match: "${r3[0].item.title}" (${r3[0].item.publisher}) - Score: ${r3[0].score}`);
if (r3[0].item.publisher === 'Shopify') {
    console.log('[PASS] Shopify is #1 for "Shopify"');
} else {
    console.error('[FAIL] Shopify is not #1');
    passed = false;
}

// Test 4: "automotive" -> McKinsey should be #1
console.log('\n--- Test 4: Search "automotive" ---');
const r4 = rankSearch('automotive');
console.log(`Top match: "${r4[0].item.title}" (${r4[0].item.publisher}) - Score: ${r4[0].score}`);
if (r4[0].item.publisher === 'McKinsey & Company') {
    console.log('[PASS] McKinsey is #1 for "automotive"');
} else {
    console.error('[FAIL] McKinsey is not #1');
    passed = false;
}

// Test 5: "watsonx" -> IBM Think should be #1
console.log('\n--- Test 5: Search "watsonx" ---');
const r5 = rankSearch('watsonx');
console.log(`Top match: "${r5[0].item.title}" (${r5[0].item.publisher}) - Score: ${r5[0].score}`);
if (r5[0].item.publisher === 'IBM Think') {
    console.log('[PASS] IBM Think is #1 for "watsonx"');
} else {
    console.error('[FAIL] IBM Think is not #1');
    passed = false;
}

// Test 6: Category Filter "case-studies"
console.log('\n--- Test 6: Category Filter "case-studies" ---');
const r6 = rankSearch('', 'case-studies');
console.log(`Total items in case-studies: ${r6.length}`);
if (r6.length === 1 && r6[0].item.publisher === 'Deloitte') {
    console.log('[PASS] Exactly 1 case study item returned (Deloitte)');
} else {
    console.error(`[FAIL] Expected 1 item, got ${r6.length}`);
    passed = false;
}

// Test 7: Category Filter "strategy"
console.log('\n--- Test 7: Category Filter "strategy" ---');
const r7 = rankSearch('', 'strategy');
console.log(`Total items in strategy: ${r7.length}`);
if (r7.length === 3) {
    console.log('[PASS] Exactly 3 strategy items returned');
} else {
    console.error(`[FAIL] Expected 3 items, got ${r7.length}`);
    passed = false;
}

// Test 8: Category Filter "workforce-sa"
console.log('\n--- Test 8: Category Filter "workforce-sa" ---');
const r8 = rankSearch('', 'workforce-sa');
console.log(`Total items in workforce-sa: ${r8.length}`);
if (r8.length === 2) {
    console.log('[PASS] Exactly 2 workforce-sa items returned');
} else {
    console.error(`[FAIL] Expected 2 items, got ${r8.length}`);
    passed = false;
}

if (passed) {
    console.log('\n>>> ALL RELEVANCE AND FILTER TESTS PASSED! <<<');
    process.exit(0);
} else {
    console.error('\n>>> SOME TESTS FAILED! <<<');
    process.exit(1);
}

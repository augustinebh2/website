// WCAG 2.1 AA Contrast Ratio Calculator
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return [num >> 16, (num >> 8) & 255, num & 255];
}

function getLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(hex1, hex2) {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const pairs = [
  { name: '.btn-primary on #2563eb', fg: '#ffffff', bg: '#2563eb' },
  { name: '.btn-primary on #4f46e5', fg: '#ffffff', bg: '#4f46e5' },
  { name: '.btn-primary hover on #1d4ed8', fg: '#ffffff', bg: '#1d4ed8' },
  { name: '.btn-secondary on #f8fafc', fg: '#0f172a', bg: '#f8fafc' },
  { name: '.subhead-tag on #ffffff', fg: '#1d4ed8', bg: '#ffffff' },
  { name: '.minimal-roi-badge on #ffffff', fg: '#047857', bg: '#ffffff' },
  { name: '.slider-val-badge on #2563eb', fg: '#ffffff', bg: '#2563eb' },
  { name: 'Card Text primary on #ffffff', fg: '#0f172a', bg: '#ffffff' },
  { name: 'Card Text secondary on #ffffff', fg: '#334155', bg: '#ffffff' },
  { name: 'Dark card text inverse on #0f172a', fg: '#ffffff', bg: '#0f172a' },
  { name: 'Dark card muted text on #0f172a', fg: '#cbd5e1', bg: '#0f172a' },
  { name: 'Footer text muted on #090d16', fg: '#94a3b8', bg: '#090d16' }
];

console.log('=== WCAG 2.1 AA COLOR CONTRAST AUDIT (Requirement: >= 4.5:1 for normal text) ===\n');
let allPass = true;
pairs.forEach(({ name, fg, bg }) => {
  const ratio = getContrast(fg, bg);
  const pass = ratio >= 4.5;
  if (!pass) allPass = false;
  console.log(`${pass ? '✅ PASS' : '❌ FAIL'} [${ratio.toFixed(2)}:1] - ${name} (${fg} on ${bg})`);
});

console.log(`\nOverall Contrast Status: ${allPass ? 'ALL CHECKS PASSED ✅' : 'FAILURES DETECTED ❌'}`);

const fs = require('fs');

const unstyled = [
  "agent-feature-list",
  "block-desc",
  "block-heading",
  "btn-large",
  "calc-label",
  "calc-slider",
  "calc-subtitle",
  "calc-title",
  "completed",
  "cyan",
  "deal-badge",
  "discover-search-icon",
  "discover-search-input",
  "is-revealed",
  "is-sticky",
  "open-modal-btn",
  "sim-log-line"
];

const files = ['index.html', 'company.html', 'discover.html', 'industries.html', 'solutions.html', 'app.js'];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  unstyled.forEach(cls => {
    if (content.includes(cls)) {
      console.log(`Class "${cls}" found in ${f}`);
    }
  });
});

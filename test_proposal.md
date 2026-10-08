1. **Analyze the testing gap:**
The function `initSpeedToLeadGraph` in `app.js` and `hww_app.js` is untested. Looking at what it does, it queries DOM elements using `document.querySelectorAll('.time-pill-btn')`, `document.getElementById('disp-graph-mult')`, `document.getElementById('disp-graph-time')`, and `document.querySelectorAll('.mit-bar-group')`. Also, it has a map named `timeDataMap` containing data for keys: `'5min'`, `'15min'`, `'30min'`, and `'24hr'`.
However, the HTML markup actually present in the main files uses `.visual-speed-timer`, `.timer-bar-group`, `.timer-row`, `.t-bar`, etc., and doesn't match these specific JavaScript hooks. The functionality described as `Speed-to-Lead Live Graph Time Selector` exists in `app.js` but the corresponding UI isn't fully in the HTML tests, or the pairwise tests haven't covered it. Since we want to test the javascript function itself, or rather test its contract, we should add tests to ensure the javascript component contract is solid.

2. **Determine test strategy:**
Since `test_tier3_pairwise.js` handles pairwise component checks (HTML vs JS and similar contracts), we can add tests to `test_tier3_pairwise.js` that specifically test the `initSpeedToLeadGraph` logic bounds within `app.js` and `hww_app.js`.

3. **Plan the changes:**
Modify `int/test/test_tier3_pairwise.js` to add a new suite: `Tier 3.7: Speed-to-Lead Graph JS Component Logic (Pairwise)`.
This suite should contain tests that check:
- `3.7.1`: app.js and hww_app.js `initSpeedToLeadGraph` function has `timeDataMap` configuration for 5min, 15min, 30min, and 24hr.
- `3.7.2`: DOM query selectors for the Speed-to-Lead graph (e.g. `.time-pill-btn`, `disp-graph-mult`) are correctly implemented in app.js and hww_app.js.

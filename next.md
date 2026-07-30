- [x] ensure eslint is working
- [x] figure out what to .gitignore and what to stage
- [x] :
"""
    Your implication is correct — given at least one heading, zero h1s forces `headings[0].level !== 1`, so the first-heading finding always fires. No case escapes it.

    But **implication isn't the right test for whether to emit a finding. "Same fix?" is.** And these don't share one:

    - `{h2, h1, h3}` — an h1 exists, it's just not first. Fix: relabel or reorder.
    - `{h2, h3, h4}` — no h1 anywhere. Fix: create one.

    Both fire `first-heading-is-not-h1` and nothing else, so the report layer would give identical advice for two situations wanting different advice. That's the leak — not redundancy, but a *collapse*.

    **The lean fix is a field, not a type.** Carry the count on the finding:

    ```js
    problems.push({
        type: "first-heading-is-not-h1",
        level: headings[0].level,
        h1Count,
    });
    ```

    One problem, and the remedy is derivable from it. It also keeps problems self-describing, which matters because your collect step is `flatMap(c => c.problems)` — anything not in a problem object is something the report layer has to go hunting in `facts` for, and it won't.

    **And yes, move the h1 check out — it's safe, for a reason worth noticing.** Empty headings gives `h1Count === 0`, and `0 > 1` is false, so the empty case falls through without a guard. Unlike `headings[0].level`, which needs one. So:

    ```js
    if (h1Count > 1) problems.push({ type: "multiple-h1", count: h1Count });

    if (headings.length === 0) {
        problems.push({ type: "no-headings" });
    } else {
        if (headings[0].level !== 1) problems.push({ ... });
        for (let index = 1; ... ) { ... }
    }
    ```

    Rename while you're there: `bad-h1-count` was named for a check that covered two cases, and now it covers one. `multiple-h1` says what it is.
"""
- [x] heading checks
- [ ] README
- [ ] mvp·
- [/] other checks
- [ ] `// @ts-check`
- [ ] multi-page audit
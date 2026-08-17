# Terme und Variablen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein eigenständiges, responsives Aha-Modul erstellen, das mit dem festen Term `2x + 3` zeigt, dass ein unveränderter Term für verschiedene Werte von `x` verschiedene Termwerte besitzt.

**Architecture:** Reine Mathematikfunktionen liefern geprüfte Term-Snapshots; eine DOM- und zeitunabhängige Zustandsmaschine steuert genau sechs didaktische Ansichten. Eine kleine DOM-Schicht rendert semantische HTML-/CSS-Bausteine und verwaltet ausschließlich die präsentative Zeitfolge, einschließlich sicherer Timer-Aufhebung bei Reset.

**Tech Stack:** Browser-HTML5, CSS, native ES-Module, Node.js `node:test`, vorhandener Node-HTTP-Server; keine Abhängigkeiten.

## Global Constraints

- Ausschließlich im isolierten Clone `mathe-unterrichts-app-terme-variablen` auf `agent/terme-variablen-aha` arbeiten.
- Ausgangspunkt bleibt `origin/main` bei `76ec0ccd39d8022e6ecda50f8ddc52237d38c04f`.
- Startseite, Kapitelraster, Service Worker, Cache-Version, Manifest, README, Paketkonfiguration, Pages-/Deploymentdateien, zentrale Smoke-Ressourcen und andere Module bleiben unverändert.
- Genau sechs didaktische Zustände mit dem unveränderten Term `2x + 3`, zwei `x`-Bausteinen und drei Einer-Bausteinen.
- Freie Erkundung verändert ausschließlich ganzzahliges `x` im Bereich 0 bis 5.
- Zustand 4 sperrt Weiter und den Regler, lässt Reset aber aktiv; Reset muss Timer vollständig neutralisieren.
- Abschlusssatz exakt: „2x + 3 bleibt derselbe Term. Wenn x sich ändert, ändert sich sein Wert.“
- Keine Gegenstandsmetapher, Zahlengerade, Waage, freien Koeffizienten, veränderliche Konstante oder Übungsfunktionen.
- Ein einzelner fokussierter Commit erfolgt erst nach allen grünen Prüfungen.

---

### Task 1: Reine Termmathematik

**Files:**
- Create: `test/terms-variables-math.test.js`
- Create: `src/terms-variables-math.js`

**Interfaces:**
- Produces: `TERM_EXPRESSION`, `TERM_COEFFICIENT`, `TERM_CONSTANT`, `X_MIN`, `X_MAX`, `normalizeX(value)`, `termValue(x)`, `termSnapshot(x)`.
- `termSnapshot(x)` returns an immutable object `{ x, expression, coefficient, constant, xBlockValues, unitValues, expanded, substituted, value }`.

- [ ] **Step 1: Write failing behavior tests**

Create table-driven tests with literal expected values for `x = 0…5`, including the exact substituted and expanded equations, two equal `xBlockValues`, three unit values and rejection of non-finite input.

```js
const cases = [
  [0, 3], [1, 5], [2, 7], [3, 9], [4, 11], [5, 13],
];
for (const [x, expected] of cases) {
  assert.equal(termValue(x), expected);
  assert.deepEqual(termSnapshot(x).xBlockValues, [x, x]);
  assert.deepEqual(termSnapshot(x).unitValues, [1, 1, 1]);
}
```

- [ ] **Step 2: Verify RED**

Run: `node --test test/terms-variables-math.test.js`

Expected: FAIL because `src/terms-variables-math.js` does not exist.

- [ ] **Step 3: Implement minimal pure functions**

Use constants `2`, `3`, `0`, `5`; clamp and round finite input in `normalizeX`; derive every display string from the normalized value and `2 * x + 3`.

- [ ] **Step 4: Verify GREEN**

Run: `node --test test/terms-variables-math.test.js`

Expected: all math tests pass with no warnings.

### Task 2: Six-state model and locks

**Files:**
- Create: `test/terms-variables-state.test.js`
- Create: `src/terms-variables-state.js`

**Interfaces:**
- Consumes: `normalizeX` from Task 1.
- Produces: `TERMS_VARIABLES_VIEWS`, `TERMS_VARIABLES_INSIGHTS`, `createTermsVariablesState()`, `nextTermsVariablesState(state)`, `advanceChangingValue(state, x)`, `setExplorationX(state, x)`, `resetTermsVariablesState()`, `termsVariablesViewModel(state)`.
- State shape: `{ view, x, locked }`; `x` is `null` only in `irritation` and `structure`.

- [ ] **Step 1: Write failing state tests**

Cover the literal sequence `irritation → structure → assigned → changing → comparison → exploration`, with `changing` locked at `x=1`, locked at `x=2`, unlocked at `x=3`, and no possible skip from locked states.

```js
let state = createTermsVariablesState();
state = nextTermsVariablesState(state); // structure
state = nextTermsVariablesState(state); // assigned, x=1
state = nextTermsVariablesState(state); // changing, x=1, locked
assert.strictEqual(nextTermsVariablesState(state), state);
state = advanceChangingValue(state, 2);
state = advanceChangingValue(state, 3);
state = nextTermsVariablesState(state); // comparison
state = nextTermsVariablesState(state); // exploration
```

Also verify that only `exploration` accepts `setExplorationX`, all values clamp to 0…5, and reset from every state returns exactly to `irritation` with `x=null` and `locked=false`.

- [ ] **Step 2: Verify RED**

Run: `node --test test/terms-variables-state.test.js`

Expected: FAIL because the state module is absent.

- [ ] **Step 3: Implement minimal state transitions and view model**

The view model exposes visibility and copy without reading the DOM: `showBlocks`, `showAssigned`, `showComparison`, `showExploration`, `showConclusion`, `showNext`, `nextDisabled`, `sliderDisabled`, and `insight`.

- [ ] **Step 4: Verify GREEN**

Run: `node --test test/terms-variables-state.test.js`

Expected: all state tests pass.

### Task 3: Semantic standalone page and responsive algebra tiles

**Files:**
- Create: `test/terms-variables-static.test.js`
- Create: `terme-variablen.html`
- Create: `terms-variables.css`

**Interfaces:**
- HTML IDs consumed by Task 4: `terms-board`, `terms-blocks`, `terms-x-label`, `terms-x-block-value-a`, `terms-x-block-value-b`, `terms-substituted`, `terms-expanded`, `terms-value`, `terms-comparison`, `terms-exploration`, `terms-x-slider`, `terms-insight`, `terms-conclusion`, `terms-live`, `terms-next`, `terms-reset`.
- Exactly two elements carry `data-term-block="x"`; exactly three carry `data-term-block="unit"`.

- [ ] **Step 1: Write failing static tests**

Read the new HTML and CSS and assert the exact title, subtitle, prompt, constant term expression, two `x` tiles, three unit tiles, comparison rows, exact conclusion, slider bounds `0…5`, only two buttons, future back link, media rules at 760 px, 520 px, landscape and 1500 px, and no external URLs, Canvas, scale, number line or object metaphors.

- [ ] **Step 2: Verify RED**

Run: `node --test test/terms-variables-static.test.js`

Expected: FAIL because the HTML and CSS files are absent.

- [ ] **Step 3: Implement semantic markup and namespaced styles**

Keep `2x + 3` in a persistent formula element. Start with structure, equations, comparison, exploration and conclusion hidden. Use CSS Grid/Flexbox, `min-width: 0`, `max-width: 100%`, wrapping comparison rows, responsive tiles and a native `<input type="range" min="0" max="5" step="1">`.

- [ ] **Step 4: Verify GREEN**

Run: `node --test test/terms-variables-static.test.js`

Expected: static contract tests pass.

### Task 4: DOM interaction, presentational sequence and reset cancellation

**Files:**
- Create: `test/terms-variables-interaction.test.js`
- Create: `src/terms-variables-app.js`

**Interfaces:**
- Consumes all Task 1 snapshot functions and Task 2 transitions.
- Timer contract: `startChangingSequence()` stores both timeout handles and a generation number; `cancelChangingSequence()` increments the generation, clears every stored handle and empties the handle set.

- [ ] **Step 1: Write failing interaction tests**

Build a minimal real DOM-element harness with captured event listeners and controllable timeout callbacks. Verify:

```js
next.dispatch("click"); // structure
next.dispatch("click"); // assigned
next.dispatch("click"); // changing, one scheduled sequence
next.dispatch("click"); // ignored, no second sequence
assert.equal(next.disabled, true);
assert.equal(reset.disabled, false);
reset.dispatch("click");
runAllCapturedCallbacks();
assert.equal(board.dataset.state, "irritation");
```

Also verify normal `1 → 2 → 3`, reduced-motion direct completion, comparison/exploration visibility, `input` changes for pointer-like Touch/Maus paths, all values 0…5, live-region text, exact final conclusion, and deterministic rebuild after reset.

- [ ] **Step 2: Verify RED**

Run: `node --test test/terms-variables-interaction.test.js`

Expected: FAIL because the app module is absent.

- [ ] **Step 3: Implement rendering and cancellable sequence**

Render solely from current state and `termSnapshot`. The next handler starts the sequence only when transitioning from `assigned` to `changing`. The reset handler always calls `cancelChangingSequence()` before assigning a fresh initial state. Timeout callbacks compare their captured generation and current view before applying `x=2` or `x=3`.

- [ ] **Step 4: Verify GREEN**

Run: `node --test test/terms-variables-interaction.test.js`

Expected: interaction tests pass without leaked timers.

- [ ] **Step 5: Run all focused tests**

Run: `node --test test/terms-variables-*.test.js`

Expected: all focused tests pass.

### Task 5: Deterministic state renderer

**Files:**
- Create: `scripts/render-terms-variables-states.mjs`

**Interfaces:**
- Consumes Task 1 and Task 2 only; no DOM, animation clock or external dependency.
- Prints `<count>/<count> Terme-und-Variablen-Zustände gerendert` after validating six states and six exploration values.

- [ ] **Step 1: Create the renderer with assertions**

For each state, combine the view model and literal semantic snippets. Assert no `undefined` or `NaN`, constant expression `2x + 3`, exactly two x-blocks and three units. Render exploration snapshots for `x=0…5` and compare values with `[3, 5, 7, 9, 11, 13]`.

- [ ] **Step 2: Run the renderer**

Run: `node scripts/render-terms-variables-states.mjs`

Expected: deterministic success count and exit code 0.

### Task 6: Complete verification and browser QA

**Files:**
- No additional files.

- [ ] **Step 1: Run full suite**

Run: `npm test`

Expected: baseline 406 tests plus all new tests pass, zero failures.

- [ ] **Step 2: Start isolated local server for browser checks**

Run from the isolated clone: `PORT=4173 npm start`

Expected: server listens on `0.0.0.0` and serves `/terme-variablen.html`.

- [ ] **Step 3: Browser-check all viewports**

At 320×568, 390×844, 844×390, 1440×900 and 1920×1080, load the module, traverse all six states, verify `document.documentElement.scrollWidth <= window.innerWidth`, and inspect the algebra tiles, formula, comparison and conclusion.

- [ ] **Step 4: Browser-check native interactions**

In exploration, focus the slider and use ArrowLeft/ArrowRight; verify exact integral values and term values. Exercise pointer/touch-compatible range input, Reset, rapid repeated Next clicks and reduced-motion behavior.

- [ ] **Step 5: Review scope and diff**

Run: `git status --short`, `git diff --stat`, `git diff --check`, and `git diff --name-only origin/main...HEAD` plus untracked-file inspection.

Expected: only the new module, tests, renderer, spec and plan appear; no prohibited file is modified.

### Task 7: Focused commit, push and LAN preview

**Files:**
- Stage only the explicitly listed new files from Tasks 1–5 plus the updated spec and this plan.

- [ ] **Step 1: Fresh final verification**

Run focused tests, full suite, renderer and `git diff --check` again immediately before commit.

- [ ] **Step 2: Create focused commit**

Stage only new module-related paths and commit with message `Aha-Modul: Terme und Variablen`.

- [ ] **Step 3: Push without force**

Run: `git push -u origin agent/terme-variablen-aha`

Expected: remote branch created or fast-forwarded; any rejection stops without force.

- [ ] **Step 4: Confirm server origin and LAN address**

Verify the running process has the isolated clone as its working directory, resolve the active private LAN IPv4 address, and report `http://<LAN-IP>:4173/terme-variablen.html`.

- [ ] **Step 5: Report and stop**

Report Ausgangs-main, Branch-Head, changed files, six-state sequence, focused/full test counts, renderer, browser viewports, working-tree state, push status, LAN URL, later integration needs and remaining real-device uncertainty. Create no PR, merge or deployment.

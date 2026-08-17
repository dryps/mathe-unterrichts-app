# Subtraktion negativer Zahlen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein fünftes Aha-Modul zeigt sichtbar und interaktiv, dass Subtraktion die Linksrichtung eines negativen zweiten Terms in eine gleich lange Rechtsbewegung umkehrt.

**Architecture:** Das Modul folgt dem bestehenden Additionsmodul als getrennte statische Seite mit reiner Ganzzahlgeometrie, reinem Zustandsautomaten, reinen Animationsframes und einer DOM/SVG-Schicht. Die gemeinsame Zahlengeradenskala wird wiederverwendet; Homepage, PWA, Offline-Cache und Pages-Artefakt werden nur um die neuen Laufzeitdateien ergänzt.

**Tech Stack:** HTML, CSS, native ES-Module, SVG, Pointer Events, Node.js `node:test`, bestehende Node-Skripte; keine Laufzeitabhängigkeit.

## Global Constraints

- Leitfrage exakt: „Warum ist 4 − (−2) dasselbe wie 4 + 2?“
- Untertitel exakt: „Subtraktion negativer Zahlen“.
- Startwert fest 4; negative Subtrahenden ausschließlich −1, −2, −3 und −4.
- Die Umkehrung verändert nur die Richtung, nie Betrag oder Schrittzahl.
- Keine neue Navigationsebene, Aufgabe, Bewertung, Speicherung, Analyse, externe API oder Abhängigkeit.
- Kapitel 2 fachlich und gestalterisch unverändert lassen.
- Service-Worker-Cache genau einmal von `mathe-unterrichts-app-v14` auf `mathe-unterrichts-app-v15` erhöhen.
- Tests vor Produktionscode schreiben und den erwarteten roten Lauf beobachten.

---

### Task 1: Reine Subtraktionsmathematik

**Files:**
- Create: `test/subtraction-negative-geometry.test.js`
- Create: `src/subtraction-negative-geometry.js`
- Reuse: `src/number-line-geometry.js`

**Interfaces:**
- Produces: `SUBTRACTION_START`, `SUBTRAHEND_MIN`, `SUBTRAHEND_MAX`, `SUBTRACTION_LIMITS`, `snapNegativeSubtrahend(value)`, `negativeTermDirection(value)`, `subtractionEffectiveDirection(value)`, `subtractionStepCount(value)`, `subtractionResult(value)`, `subtractionMovement(value)`, `xToNegativeSubtrahend(x)`, `formatSubtraction(value)`.

- [ ] **Step 1: Write failing literal tests**

```js
const expected = new Map([[-1, 5], [-2, 6], [-3, 7], [-4, 8]]);
for (const [subtrahend, result] of expected) {
  assert.equal(subtractionResult(subtrahend), result);
  assert.equal(negativeTermDirection(subtrahend), "left");
  assert.equal(subtractionEffectiveDirection(subtrahend), "right");
  assert.equal(subtractionStepCount(subtrahend), Math.abs(subtrahend));
}
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test test/subtraction-negative-geometry.test.js`

Expected: FAIL because `src/subtraction-negative-geometry.js` does not exist.

- [ ] **Step 3: Implement the minimal pure geometry**

```js
export function subtractionResult(subtrahend) {
  return SUBTRACTION_START - snapNegativeSubtrahend(subtrahend);
}

export function subtractionMovement(subtrahend) {
  return Object.freeze({
    originalDirection: "left",
    effectiveDirection: "right",
    stepCount: Math.abs(snapped),
    originalEndX,
    effectiveEndX,
    result,
    values: Object.freeze(Array.from({ length: stepCount + 1 }, (_, index) => 4 + index)),
  });
}
```

- [ ] **Step 4: Run focused and shared geometry tests**

Run: `node --test test/subtraction-negative-geometry.test.js test/number-line-geometry.test.js`

Expected: PASS with exact integer endpoints and no intermediate snapped values.

### Task 2: Zustandsautomat und längenkonstante Animation

**Files:**
- Create: `test/subtraction-negative-state.test.js`
- Create: `test/subtraction-negative-animation.test.js`
- Create: `src/subtraction-negative-state.js`
- Create: `src/subtraction-negative-animation.js`

**Interfaces:**
- Consumes: `snapNegativeSubtrahend`, `subtractionMovement`.
- Produces: `SUBTRACTION_VIEWS`, `createSubtractionState()`, `nextSubtractionState(state)`, `finishDirectionReversal(state)`, `finishSubtractionMovement(state)`, `moveSubtrahend(state, value)`, `resetSubtractionState()`, `subtractionViewModel(state)`, `directionReversalFrame(elapsed, movement)`, `subtractionMovementFrame(elapsed, movement)`.

- [ ] **Step 1: Write failing state and animation tests**

```js
assert.deepEqual(
  ["prompt", "start", "negative", "reversing", "moving", "result", "free", "conclusion"],
  Object.values(SUBTRACTION_VIEWS),
);
const halfway = directionReversalFrame(DIRECTION_REVERSAL_DURATION_MS / 2, movement);
assert.equal(halfway.vectorLength, movement.stepCount * SUBTRACTION_LIMITS.step);
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test test/subtraction-negative-state.test.js test/subtraction-negative-animation.test.js`

Expected: FAIL because the state and animation modules do not exist.

- [ ] **Step 3: Implement minimal deterministic transitions and frames**

The `reversing` and `moving` states set `locked: true`. Extra `next` calls return the identical state. Reversal frames return an angle from 0° to 180° and a constant vector length; movement frames interpolate only the point position and visible whole-step count.

- [ ] **Step 4: Run focused tests**

Run: `node --test test/subtraction-negative-state.test.js test/subtraction-negative-animation.test.js`

Expected: PASS, including reset from every stable state and deterministic delayed endframes.

### Task 3: SVG-Seite, Styling und Interaktion

**Files:**
- Create: `subtraktion-negativ.html`
- Create: `subtraction-negative.css`
- Create: `src/subtraction-negative-app.js`
- Create: `test/subtraction-negative-static.test.js`
- Create: `test/subtraction-negative-interaction.test.js`

**Interfaces:**
- Consumes: all Task 1 and Task 2 interfaces.
- Produces: direct page `./subtraktion-negativ.html` with service-worker registration and accessible slider handle.

- [ ] **Step 1: Write failing static and interaction tests**

Tests assert the exact copy, initially hidden axis, distinct operator/sign elements, two same-length vectors, only two buttons, pointer capture, keyboard snapping, input locking, formula sequence and full reset/rebuild.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `node --test test/subtraction-negative-static.test.js test/subtraction-negative-interaction.test.js`

Expected: FAIL because page, CSS and app module do not exist.

- [ ] **Step 3: Add minimal page and responsive styling**

Create separate SVG groups for the original vector, rotating vector/effective vector, moving point, result formula stack and handle. Keep arrowheads as closed filled paths attached to butt-ended lines so the axis cannot show inside them.

- [ ] **Step 4: Implement rendering and input control**

`runNext()` starts reversal, automatically chains to movement and finishes in `result`. Pointer math reads only local x. `preventDefault()` and `touch-action: none` prevent scrolling only while dragging. Arrow keys adjust the negative subtrahend by exactly one.

- [ ] **Step 5: Run all new module tests**

Run: `node --test test/subtraction-negative-*.test.js`

Expected: PASS with no duplicate animation or skipped state.

### Task 4: Kapitelraster und Laufzeitintegration

**Files:**
- Modify: `index.html`
- Modify: `home.css`
- Modify: `README.md`
- Modify: `test/app-structure.test.js`
- Modify: `test/rationale-grid.test.js`
- Modify: `test/pages-deployment.test.js`
- Modify: `test/offline-restart.test.js`
- Modify: `scripts/pages-runtime-files.mjs`
- Modify: `scripts/smoke.mjs`
- Modify: `sw.js`

**Interfaces:**
- Consumes: direct page and six new runtime files from Task 3.
- Produces: exactly five Chapter-1 cards, cache `v15`, complete offline and Pages allowlists.

- [ ] **Step 1: Change integration tests first**

Update literal expectations from four to five Chapter-1 cards and from ten to eleven direct module pages. Add every new runtime path and assert the cache upgrade from v14 to v15 removes the old cache.

- [ ] **Step 2: Run integration tests and verify RED**

Run: `node --test test/app-structure.test.js test/rationale-grid.test.js test/pages-deployment.test.js test/offline-restart.test.js`

Expected: FAIL because card, grid rules and runtime files are not integrated.

- [ ] **Step 3: Add card and centered equal-width grid**

Use six explicit grid tracks for Chapter 1 only: cards span two tracks in landscape (3+2 centered) and three tracks in portrait tablet (2+2+1 centered). Keep every Chapter-2 selector and rule unchanged.

- [ ] **Step 4: Add runtime paths and increment cache once**

Add page, CSS and four source modules to `PAGES_RUNTIME_FILES`, smoke list, worker `APP_FILES` and offline assertions. Replace only canonical v14 expectations with v15.

- [ ] **Step 5: Run integration tests**

Run: `node --test test/app-structure.test.js test/rationale-grid.test.js test/pages-deployment.test.js test/offline-restart.test.js`

Expected: PASS with exactly five equal Chapter-1 cards and unchanged Chapter 2.

### Task 5: Renderer, workflow gate and complete verification

**Files:**
- Create: `scripts/render-subtraction-negative-states.mjs`
- Modify: `package.json`
- Modify: `.github/workflows/pages.yml`
- Create: `docs/subtraction-negative-validation.md`

**Interfaces:**
- Consumes: module geometry/state.
- Produces: `npm run test:subtraction-visual` rendering eight deterministic states.

- [ ] **Step 1: Add renderer expectations before wiring the script**

The renderer generates all eight states, both directions, unchanged step counts and finite SVG coordinates for −1 through −4. It throws on `NaN` or `undefined`.

- [ ] **Step 2: Run the new renderer and workflow-related tests**

Run: `npm run test:subtraction-visual && node --test test/pages-deployment.test.js`

Expected: PASS after the script and workflow command are present.

- [ ] **Step 3: Run complete automated verification**

Run:

```bash
npm test
npm run test:smoke
npm run test:visual
npm run test:area-visual
npm run test:circumcircle-visual
npm run test:incircle-visual
npm run test:unique-visual
npm run test:number-line-visual
npm run test:order-visual
npm run test:absolute-visual
npm run test:addition-visual
npm run test:subtraction-visual
npm run build:pages
npm run test:pages
git diff --check
```

- [ ] **Step 4: Inspect final diff and perform browser checks**

Verify prompt, reversal midpoint/end, result, all four free values, reset, portrait, landscape, narrow viewport, classroom viewport, direct page, no horizontal overflow and unchanged Chapter 2.

- [ ] **Step 5: Commit only the focused change**

```bash
git add .github/workflows/pages.yml README.md docs package.json scripts src test index.html home.css subtraktion-negativ.html subtraction-negative.css sw.js
git commit -m "Add Aha module for subtracting negative numbers"
```

- [ ] **Step 6: Push branch, open draft PR and stop after LAN preview**

Push only `agent/rationale-zahlen-subtraktion-negativ-aha`, create a draft PR against `main`, verify mergeability/check metadata, start the existing server on `0.0.0.0:4173`, report the actual LAN URL and do not mark ready, merge or deploy.

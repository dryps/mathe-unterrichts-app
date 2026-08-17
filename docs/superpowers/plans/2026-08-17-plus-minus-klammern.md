# K3.5 Plus- und Minusklammern – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein eigenständiges, offlinefähiges Klasse-7-Aha-Modul produzieren, das das äußere Minus als Faktor `−1` auf dem gesamten Klammerpaket sichtbar macht.

**Architecture:** Reine Vorzeichenmathematik, unveränderliche Zustandsmaschine und deterministische Animation bleiben von DOM/CSS und zentraler Integration getrennt. Phase A endet mit einem Standalone-Commit; Phase B ergänzt die App minimal und erhöht den Cache exakt einmal.

**Tech Stack:** Statisches HTML/CSS, native ES-Module, Node-Test-Runner und bestehende lokale Renderer-/Pages-/Smoke-Werkzeuge; keine neuen Abhängigkeiten.

### Task 1: Mathematik testgetrieben absichern

**Files:** `test/bracket-sign-math.test.js`, `src/bracket-sign-math.js`

- [x] Vorzeichenprodukte, beide äußeren Faktoren, Formeln und ungültige Eingaben zuerst testen.
- [x] Rotlauf beobachten und minimales reines Paketmodell implementieren.
- [x] Fokussierten Test grün ausführen.

### Task 2: Zustand und Rennen testgetrieben absichern

**Files:** `test/bracket-sign-state.test.js`, `src/bracket-sign-state.js`

- [x] Zustandsfolge, Sperre, Mehrfachtipps, Regler, echte Änderung und Reset zuerst testen.
- [x] Rotlauf beobachten und unveränderliche Zustandsmaschine samt View-Model implementieren.
- [x] Fokussierten Test grün ausführen.

### Task 3: Minuswirkung testgetrieben animieren

**Files:** `test/bracket-sign-animation.test.js`, `src/bracket-sign-animation.js`

- [x] Start-, Mittel-, End-, Monotonie-, Überlauf- und Ungültigkeitsfälle zuerst testen.
- [x] Reine begrenzte Animationsframes implementieren.
- [x] Fokussierten Test grün ausführen.

### Task 4: Oberfläche und Interaktion

**Files:** `plus-minus-klammern.html`, `bracket-sign.css`, `src/bracket-sign-app.js`, fokussierte Interaktions-/Strukturtests

- [x] DOM- und Strukturverträge zuerst rot schreiben.
- [x] Paketbühne, Plus-/Minuswirkung, Live-Region, Regler und Abschluss implementieren.
- [x] Animation, Reset, Reduced Motion und Race-Schutz verdrahten.
- [x] Responsive und fokussierte Tests grün ausführen.

### Task 5: Renderer und Standalone-Checkpoint

**Files:** `scripts/render-bracket-sign-states.mjs`

- [x] Alle Zustände deterministisch rendern und zweimal identische Ausgabe prüfen.
- [x] Fokussierte Tests, Syntax, Diff und reale Browserprüfung ausführen.
- [ ] Standalone-Dateien committen und normal pushen.

### Task 6: Zentrale Integration

**Files:** zentrale Startseiten-, Raster-, Cache-, Pages-, Smoke-, Workflow- und Regressionstestdateien

- [ ] Rote Verträge für genau eine fünfte K3-Karte und sechs Runtime-Dateien schreiben.
- [ ] Zentral minimal integrieren und Cache exakt `v21 → v22` erhöhen.
- [ ] Vollständige Regression, alle Renderer, Build, Pages, Smoke, Offline und Browser ausführen.
- [ ] Integrationscommit erstellen und normal pushen.

### Task 7: Review, PR, Merge und Produktion

- [ ] Unabhängigen Read-only-Review durchführen und Critical-/Important-Befunde beheben.
- [ ] Genau einen PR erstellen, Ready setzen und nur bei grünen Gates per Squash mergen.
- [ ] Pages-Lauf und Artefakt exakt dem neuen `main`-SHA zuordnen.
- [ ] Live-Seite, Cache `v22`, direkte URL, Offline und responsive Layouts prüfen.
- [ ] Erst danach K3.6 vom erneut abgerufenen `origin/main` beginnen.

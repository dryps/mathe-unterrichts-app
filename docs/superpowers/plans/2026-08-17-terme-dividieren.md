# K3.4 Terme dividieren – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein eigenständiges, offlinefähiges Klasse-7-Aha-Modul produzieren, das Division als Rückgängigmachen eines vorhandenen numerischen Faktors sichtbar macht.

**Architecture:** Reine Mathematik, unveränderliche Zustandsmaschine und deterministische Animation bleiben von DOM/SVG und Integration getrennt. Phase A enthält ausschließlich Moduldateien und fokussierte Tests; Phase B erweitert zentrale App-, Cache-, Pages- und Smoke-Listen minimal.

**Tech Stack:** Statisches HTML/CSS, native ES-Module, Node-Test-Runner, bestehende lokale Renderer-/Pages-/Smoke-Werkzeuge; keine neuen Abhängigkeiten.

### Task 1: Mathematik testgetrieben absichern

**Files:**
- Create: `test/term-division-math.test.js`
- Create: `src/term-division-math.js`

- [x] Tabellen für Gruppenanzahl 2–5, Faktorzerlegung, Formeltexte und Paketanzahl schreiben.
- [x] Rotlauf wegen fehlendem Modul beobachten.
- [x] Normalisierung und reines Divisionsmodell minimal implementieren.
- [x] Fokussierten Test grün ausführen.

### Task 2: Zustandsmaschine und Rennen testgetrieben absichern

**Files:**
- Create: `test/term-division-state.test.js`
- Create: `src/term-division-state.js`

- [x] Zustandsfolge, Animationssperre, Mehrfachtipps, Reglergrenzen, echte Änderung und Reset zuerst testen.
- [x] Rotlauf beobachten und unveränderliche Zustandsmaschine samt View-Model implementieren.
- [x] Fokussierten Test grün ausführen.

### Task 3: Gruppenanimation testgetrieben absichern

**Files:**
- Create: `test/term-division-animation.test.js`
- Create: `src/term-division-animation.js`

- [x] Start-, Mittel-, End-, Überlauf-, Monotonie- und Ungültigkeitsfälle zuerst testen.
- [x] Reine begrenzte Animationsframes implementieren.
- [x] Fokussierten Test grün ausführen.

### Task 4: Oberfläche und reale Interaktion

**Files:**
- Create: `terme-dividieren.html`
- Create: `term-division.css`
- Create: `src/term-division-app.js`
- Create: `test/term-division-interaction.test.js`
- Create: `test/term-division-static.test.js`

- [x] DOM-Harness und statische Verträge zuerst schreiben; fehlende Oberfläche rot beobachten.
- [x] Semantische Paketbühne, Zustandsflächen, Live-Region, Buttons und Regler implementieren.
- [x] Responsive Regeln für kleine Telefone, iPad und Klassenraum ergänzen.
- [x] Weiter, Animation, Reset, Reduced Motion und Regler verdrahten.
- [x] Interaktions- und Strukturtests grün ausführen.

### Task 5: Standalone-Renderer und Checkpoint

**Files:**
- Create: `scripts/render-term-division-states.mjs`

- [x] Alle Zustände deterministisch rendern und zweifach identische Ausgabe prüfen.
- [x] Fokussierte Tests, Syntax, Diff und reale responsive Browserprüfung ausführen.
- [x] Ausschließlich Standalone-Dateien committen und normal pushen.

### Task 6: Zentrale Integration

**Files:**
- Modify: `index.html`
- Modify: `home.css`
- Modify: `sw.js`
- Modify: `scripts/pages-runtime-files.mjs`
- Modify: `scripts/smoke.mjs`
- Modify: `scripts/verify-pages.mjs`
- Modify: `package.json`
- Modify: `.github/workflows/pages.yml`
- Modify/Create: zentrale Integrations-, Pages- und Offline-Tests

- [ ] Zuerst fehlschlagende Tests für genau eine vierte K3-Karte und alle sechs Runtime-Dateien schreiben.
- [ ] Zentrale Dateien minimal integrieren und Cache von der verifizierten Version `v20` genau auf `v21` erhöhen.
- [ ] Vollständige Regression, Renderer, Build, Pages, Smoke, Offline, Syntax, Diff und Browserprüfung ausführen.
- [ ] Integrationscommit erstellen und normal pushen.

### Task 7: Review, PR, Merge und Produktion

- [ ] Unabhängigen Read-only-Code-Review durchführen und alle Critical-/Important-Befunde vor dem PR beheben.
- [ ] Genau einen PR als Draft erstellen, review-bereit setzen und nur bei grünen Gates per Squash mergen.
- [ ] Push-getriggerten Pages-Lauf und Artefakt demselben neuen `main`-SHA zuordnen.
- [ ] Live-Seite, direkte Modul-URL, Cache `v21`, Offlineverhalten und responsive Layouts prüfen.
- [ ] Erst danach K3.5 auf erneut abgerufenem `origin/main` beginnen.

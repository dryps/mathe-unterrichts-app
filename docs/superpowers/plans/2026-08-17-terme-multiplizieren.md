# Terme multiplizieren Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** K3.3 macht interaktiv und offline verständlich, warum `x + x = 2x`, aber `x · x = x²` gilt.

**Architecture:** Reine Mathematik-, Zustands- und Animationsmodule liefern deterministische View-Modelle. Ein kleiner DOM-Controller verbindet semantisches HTML, responsives CSS, Weiter/Reset und einen nativen x-Regler. Die Veröffentlichung erfolgt in zwei robusten Checkpoints: erst das allein lauffähige Modul, dann die zentrale Integration.

**Tech Stack:** Semantisches HTML, responsives CSS, Browser-ES-Module, Node.js `node:test`, vorhandene Pages-/Smoke-Infrastruktur; keine neue Abhängigkeit.

## Verbindliche Grenzen

- Branch `agent/terme-multiplizieren-aha` basiert auf dem unmittelbar zuvor verifizierten `origin/main` `c983e05f99216cc29b64f1ea753bcd5734018c29`.
- Erste Veröffentlichung enthält nur modulbezogene Dateien, Tests, Renderer und diese Dokumentation.
- Zentrale Dateien werden ausschließlich im zweiten Commit integriert.
- Keine Änderung an Abhängigkeiten, Manifest, Datenerhebung, Konten oder externen Laufzeitdiensten.
- Kein Force-Push und keine parallele Modulproduktion.

---

### Task 1: Fachlogik testgetrieben aufbauen

**Files:**
- Create: `test/term-multiplication-math.test.js`
- Create: `src/term-multiplication-math.js`

- [ ] Tabellen für `x = 1…5`, `2x`, `x²`, Formeln und den Sonderfall `x = 2` schreiben.
- [ ] Den fokussierten Test ausführen und das erwartete Fehlen des Moduls beobachten.
- [ ] Normalisierung, Auswertung, Formel- und Vergleichsmodell minimal implementieren.
- [ ] Fokussierten Test grün ausführen.

### Task 2: Zustandsmaschine und Rennen testgetrieben absichern

**Files:**
- Create: `test/term-multiplication-state.test.js`
- Create: `src/term-multiplication-state.js`

- [ ] Tests für sechs didaktische Zustände, Animationssperre, Mehrfachtipps, x-Grenzen, echte Änderung, Sonderhinweis und vollständigen Reset schreiben.
- [ ] Rotlauf beobachten, dann eine unveränderliche Zustandsmaschine mit reinem View-Model implementieren.
- [ ] Fokussierten Test grün ausführen.

### Task 3: Deterministische Flächenanimation testgetrieben absichern

**Files:**
- Create: `test/term-multiplication-animation.test.js`
- Create: `src/term-multiplication-animation.js`

- [ ] Start-, Mittel-, End-, Überlauf- und Monotonie-Tests schreiben und rot beobachten.
- [ ] Reine, begrenzte Animationsframes implementieren; reduzierte Bewegung wird im Controller sofort abgeschlossen.
- [ ] Fokussierten Test grün ausführen.

### Task 4: Oberfläche und reale Interaktion

**Files:**
- Create: `terme-multiplizieren.html`
- Create: `term-multiplication.css`
- Create: `src/term-multiplication-app.js`
- Create: `test/term-multiplication-interaction.test.js`
- Create: `test/term-multiplication-static.test.js`

- [ ] DOM-Harness und statische Verträge zuerst schreiben; fehlende Oberfläche rot beobachten.
- [ ] Semantische Zustandsflächen, Live-Region, Buttons, Regler und lokalen Service-Worker-Hook implementieren.
- [ ] Responsive Darstellung für 320 px, Telefon, iPad-Hoch-/Querformat und Klassenraumbreite ergänzen.
- [ ] Controller für Weiter, Animationsabschluss, Mehrfachtipps, Regler und Reset implementieren.
- [ ] Interaktions- und Strukturtests grün ausführen.

### Task 5: Standalone-Renderer und erster Checkpoint

**Files:**
- Create: `scripts/render-term-multiplication-states.mjs`
- Verify: alle neuen modulbezogenen Dateien

- [ ] Deterministische Zustandsbilder und stabile Renderer-Ausgabe prüfen.
- [ ] Fokussierte Tests, Syntaxprüfungen, lokales Smoke der Modulressourcen und responsive Browserprüfung ausführen.
- [ ] `git diff --check`, Status, Dateiliste und vollständigen Diff prüfen.
- [ ] Moduldateien explizit stagen, als Standalone-Checkpoint committen und ohne Force-Push veröffentlichen.

### Task 6: Zentrale Integration testgetrieben ausführen

**Files:**
- Modify: `index.html`
- Modify: `src/app.js`
- Modify: `sw.js`
- Modify: `scripts/pages-runtime-files.mjs`
- Modify: `scripts/smoke.mjs`
- Modify: `package.json`
- Modify: `.github/workflows/pages.yml`
- Modify/Create: zentrale Integrations- und Pages-Tests

- [ ] Zuerst fehlschlagende Tests für K3.3-Karte, Navigation, Runtime-Dateien, Smoke, Renderer-Workflow und neue Cache-Version schreiben.
- [ ] Startseite/Navigation sowie explizite Offline-, Pages-, Smoke- und Renderer-Listen integrieren; Cache kontrolliert von `v18` auf `v19` erhöhen.
- [ ] Fokussierte Integrationsprüfungen grün ausführen.
- [ ] Vollständig `npm test`, Modulrenderer, `npm run build:pages`, `npm run test:pages`, `npm run test:smoke`, Syntax- und Diff-Prüfungen ausführen.
- [ ] Integrationsdateien explizit stagen, zweiten Commit erstellen und ohne Force-Push veröffentlichen.

### Task 7: Review, PR, Merge und Produktivprüfung

- [ ] Unabhängigen Read-only-Code-Review gegen den verifizierten Basis-SHA durchführen; kritische/wichtige Befunde vor dem PR beheben.
- [ ] Pull Request erstellen, prüfbare Beschreibung ergänzen und aus Draft in Ready überführen.
- [ ] Checks abwarten; bei grünen Gates per Squash in `main` mergen.
- [ ] Pages-Lauf und Artefakt demselben neuen `main`-SHA zuordnen; bei externem 5xx exakt die freigegebene einmalige `workflow_dispatch`-Fallback-Regel anwenden.
- [ ] Live-Seite, Offline-Cache `v19`, direkte Modul-URL, Startseitenkarte und responsive Layout-Gates verifizieren.
- [ ] Erst auf Basis des erneut abgerufenen `main` mit K3.4 beginnen.

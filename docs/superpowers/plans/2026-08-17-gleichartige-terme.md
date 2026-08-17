# Gleichartige Terme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein eigenständiges Aha-Modul zeigt mit algebraischen Bausteinen, warum nur gleichartige Terme zusammengefasst werden können.

**Architecture:** Reine Mathematik-, Zustands- und Animationsmodule liefern deterministische Daten. Ein kleiner DOM-Controller rendert semantische HTML-/CSS-Bausteine und verbindet Weiter, Reset und zwei native Regler, ohne zentrale Projektdateien zu verändern.

**Tech Stack:** Semantisches HTML, responsives CSS, Browser-ES-Module, Node.js `node:test`; keine neue Abhängigkeit.

## Global Constraints

- Branch `agent/gleichartige-terme-aha` basiert direkt auf dem unmittelbar zuvor abgerufenen `origin/main`.
- Ausschließlich neue modulbezogene Dateien erstellen.
- Startseite, Kapitelkarten, zentrale Rasterregeln, `sw.js`, Cache-Version, Pages-Freigabeliste, Pages-Workflow, Manifest, README, zentrale Smoke-Ressourcenlisten und Deploymentdateien bleiben unverändert.
- Keine neue Abhängigkeit, kein Merge, kein Pull Request und kein Pages-Deployment.
- Keine Konstanten in Zustand 6 und kein optionaler „Einer statt x“-Schalter.

---

### Task 1: Reine Termmathematik

**Files:**
- Create: `test/like-terms-math.test.js`
- Create: `src/like-terms-math.js`

**Interfaces:**
- Produces: `TERM_KINDS`, `createTerm(kind, coefficient)`, `areLikeTerms(left, right)`, `combineLikeTerms(left, right)`, `formatTerm(term)`, `formatSum(left, right)`.

- [ ] Testtabellen mit den handberechneten Fällen `3x + 2x = 5x`, `1x + 4x = 5x`, `4x + 4x = 8x` und dem nicht zusammenfassbaren `3x + 2` schreiben.
- [ ] `node --test test/like-terms-math.test.js` ausführen und das erwartete Fehlen des Moduls beobachten.
- [ ] Eingaben auf Typ `x`/`one` und ganzzahlige Koeffizienten ab 1 begrenzen; Gleichartigkeit ausschließlich über den Typ bestimmen; ungleichartige Zusammenfassung als `null` zurückgeben.
- [ ] Den fokussierten Test erneut ausführen und grün halten.

### Task 2: Zustandsmaschine

**Files:**
- Create: `test/like-terms-state.test.js`
- Create: `src/like-terms-state.js`

**Interfaces:**
- Consumes: Termmathematik aus Task 1.
- Produces: `LIKE_TERM_VIEWS`, `createLikeTermsState()`, `nextLikeTermsState(state)`, `finishLikeTermsMerge(state)`, `setGroupCoefficient(state, group, coefficient)`, `resetLikeTermsState()`, `likeTermsViewModel(state)`.

- [ ] Tests für Irritation, beide x-Gruppen, gesperrtes Zusammenführen, Ergebnis, Gegenfall, Vergleich und freie Erkundung schreiben.
- [ ] Tests für wirkungslose Mehrfachtipps, gesperrte Regler, Grenzen 1 bis 4, Schlussansicht nach erster Änderung und vollständigen Reset ergänzen.
- [ ] `node --test test/like-terms-state.test.js` ausführen und das erwartete Fehlen des Moduls beobachten.
- [ ] Die minimale unveränderliche Zustandsmaschine implementieren; `merging` ist ein interner Übergang innerhalb des dritten didaktischen Zustands.
- [ ] Den fokussierten Test erneut ausführen und grün halten.

### Task 3: Ruhige Zusammenführungsanimation

**Files:**
- Create: `test/like-terms-animation.test.js`
- Create: `src/like-terms-animation.js`

**Interfaces:**
- Produces: `LIKE_TERMS_MERGE_DURATION_MS`, `easeInOutCubic(progress)`, `likeTermsMergeFrame(elapsed)` mit `{ progress, shift, gap, complete }`.

- [ ] Tests für Start-, Mittel-, End- und verspätete Frames sowie monotones begrenztes Easing schreiben.
- [ ] `node --test test/like-terms-animation.test.js` ausführen und das erwartete Fehlen des Moduls beobachten.
- [ ] Eine reine Animation von 1100 ms implementieren; `shift` wächst von 0 auf 1 und `gap` fällt von 1 auf 0.
- [ ] Den fokussierten Test erneut ausführen und grün halten.

### Task 4: Semantische Oberfläche und Controller

**Files:**
- Create: `test/like-terms-interaction.test.js`
- Create: `gleichartige-terme.html`
- Create: `like-terms.css`
- Create: `src/like-terms-app.js`

**Interfaces:**
- Consumes: Mathematik, Zustand und Animation aus Tasks 1–3.
- Produces: DOM-Zustände über `data-state`, gerenderte `.x-block`/`.unit-block`, dynamische Formel und ARIA-Live-Ausgaben.

- [ ] Einen DOM-Harness und Interaktionstests für alle sechs didaktischen Zustände, reduziertes Bewegen, Mehrfachtipps, Regler, Tastaturverträglichkeit und Reset schreiben.
- [ ] `node --test test/like-terms-interaction.test.js` ausführen und das erwartete Fehlen der Oberfläche beobachten.
- [ ] Semantisches HTML mit anfangs verborgenen Zustandsflächen, zwei Reglern von 1 bis 4 und genau den freigegebenen Texten erstellen.
- [ ] CSS-Bausteine als längliche x-Rechtecke und quadratische Einer gestalten; ruhige Farben ohne Rot oder Fehlersymbol verwenden.
- [ ] Controller mit deterministischem Rendern, Pointer-/Input-Ereignissen, Animationssperre, Timeout-Fallback und `prefers-reduced-motion` implementieren.
- [ ] Den fokussierten Interaktionstest erneut ausführen und grün halten.

### Task 5: Statische und responsive Verträge

**Files:**
- Create: `test/like-terms-static.test.js`

**Interfaces:**
- Consumes: alle Moduldateien aus Tasks 1–4.

- [ ] Tests schreiben, die Irritation ohne Antwortauswahl, beide Bausteinarten, direkte Gegenüberstellung, Schlussaussage, lokale Laufzeit und ausgeschlossene Algebra bestätigen.
- [ ] Responsive Verträge für `max-width: 760px`, `max-width: 420px`, `max-width: 340px`, Querformat und `min-width: 1500px` sowie geschützte Überläufe prüfen.
- [ ] `node --test test/like-terms-static.test.js` ausführen; bei einer fehlenden Regel den erwarteten Fehler beobachten.
- [ ] Nur fehlende Markup-/CSS-Verträge ergänzen und den Test grün ausführen.

### Task 6: Gesamtverifikation, Veröffentlichung und LAN-Abnahme

**Files:**
- Verify only: alle neuen Modul-, Test- und Dokumentationsdateien.

- [ ] `npm test` vollständig ausführen und Tests/Fehler zählen.
- [ ] Lokalen Server ausschließlich im isolierten Clone starten.
- [ ] 320×700, 768×1024, 1024×768 und 1920×1080 im Browser auf horizontales Überlaufen, lesbare Bausteine und bedienbare Regler prüfen.
- [ ] `git diff --check`, `git status --short`, `git diff --stat` und den vollständigen Diff prüfen.
- [ ] Ausschließlich die neuen modulbezogenen Pfade explizit stagen und mit `Aha-Modul zu gleichartigen Termen` committen.
- [ ] Prüfungen nach dem Commit frisch wiederholen.
- [ ] Ohne Force-Push `git push -u origin agent/gleichartige-terme-aha` ausführen; keinen Pull Request anlegen.
- [ ] Branch-Head, Working-Tree-Status und direkte LAN-URL dokumentieren und auf die reale iPad-Abnahme warten.

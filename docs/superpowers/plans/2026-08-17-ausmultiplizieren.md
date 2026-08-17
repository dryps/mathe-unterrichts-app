# K3.6 Ausmultiplizieren – Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ein eigenständiges, offlinefähiges Aha-Modul produzieren, das `3(x + 2)` als drei vollständige Pakete und anschließend als `3x + 6` sichtbar macht.

**Architecture:** Reine Paketmathematik, unveränderliche Zustandsmaschine und deterministische Kopieranimation bleiben von DOM/CSS und zentraler Integration getrennt. Phase A endet mit einem Standalone-Commit; Phase B integriert minimal und erhöht den Cache genau einmal.

**Tech Stack:** Statisches HTML/CSS, native ES-Module, Node-Test-Runner und bestehende lokale Renderer-/Pages-/Smoke-Werkzeuge; keine neuen Abhängigkeiten.

### Task 1: Mathematik testgetrieben absichern

- [x] Faktoren 2–5, Paketanzahl, x-/Einer-Anzahl, Formeln und ungültige Eingaben zuerst testen.
- [x] Rotlauf beobachten, reines Paketmodell implementieren und fokussiert grün prüfen.

### Task 2: Zustand und Rennen testgetrieben absichern

- [x] Zustandsfolge, Kopiersperre, Mehrfachtipps, Regler, echte Änderung und Reset zuerst testen.
- [x] Rotlauf beobachten, Zustandsmaschine samt View-Model implementieren und grün prüfen.

### Task 3: Kopieranimation testgetrieben absichern

- [x] Start-, Zwischen-, End-, Monotonie-, Überlauf- und Ungültigkeitsfälle zuerst testen.
- [x] Reine Animationsframes implementieren und grün prüfen.

### Task 4: Oberfläche und Interaktion

- [x] DOM-/Struktur- und Interaktionsverträge zuerst rot schreiben.
- [x] Paketbühne, Kopien, Bündelung, Live-Region, Regler und Abschluss implementieren.
- [x] Animation, Reset, Reduced Motion, Race-Schutz und responsive Regeln grün prüfen.

### Task 5: Renderer und Standalone-Checkpoint

- [x] Alle Zustände deterministisch rendern, vollständige Tests und reale Browserprüfung ausführen.
- [x] Standalone-Dateien committen und normal pushen.

### Task 6: Zentrale Integration

- [ ] Rote Verträge für genau eine sechste K3-Karte und sechs Runtime-Dateien schreiben.
- [ ] Zentral minimal integrieren und Cache exakt `v22 → v23` erhöhen.
- [ ] Vollständige Regression, alle Renderer, Build, Pages, Smoke, Offline und Browser ausführen.
- [ ] Integrationscommit erstellen und normal pushen.

### Task 7: Review, PR, Merge, Produktion und Kapitelabschluss

- [ ] Unabhängigen Read-only-Review durchführen und Befunde beheben.
- [ ] Genau einen PR erstellen, Ready setzen und nur bei grünen Gates per Squash mergen.
- [ ] Pages-Lauf und Artefakt exakt dem neuen main-SHA zuordnen; Live/Cache/Offline prüfen.
- [ ] `class7-k3-v1` read-only erneut prüfen, annotiert auf den bestätigten produktiven SHA setzen und normal pushen.
- [ ] Erst danach K4.1 vom erneut abgerufenen `origin/main` beginnen.

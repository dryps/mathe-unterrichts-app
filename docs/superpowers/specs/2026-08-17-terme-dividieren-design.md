# K3.4 – Terme dividieren

## Modulvertrag

- **Aha-Frage:** Warum bleibt beim Teilen eines Terms genau das übrig, was nicht weggeteilt wurde?
- **Untertitel:** Terme dividieren
- **Kernerkenntnis:** Division macht einen vorhandenen Faktor rückgängig.
- **Kernbeispiel:** `(3 · 4 · x) : 3 = 4x`
- **Dauer:** ungefähr 3–5 Minuten.

## Didaktische Zustandsfolge

1. **Irritation:** `(3 · 4 · x) : 3` steht als offenes Ganzes im Raum.
2. **Faktoren:** `3 · 4 · x` wird als Faktor `3` und verbleibendes Paket `4x` lesbar.
3. **Gruppenaufbau:** Eine kurze deterministische Animation baut aus dem Faktor `3` drei gleiche `4x`-Pakete; Weiter ist gesperrt, Reset bleibt aktiv.
4. **Gleiche Gruppen:** Drei gleich große Pakete zeigen, was der vorhandene Faktor `3` bewirkt hat.
5. **Division:** `: 3` fragt sichtbar nach dem Inhalt einer von drei gleichen Gruppen; es wird nichts magisch durchgestrichen.
6. **Ergebnis:** Ein Paket bleibt als mathematischer Inhalt einer Gruppe hervorgehoben: `4x`.
7. **Freie Erkundung:** Die Zahl gleicher Pakete lässt sich ganzzahlig von 2 bis 5 verändern. `(n · 4 · x) : n = 4x` bleibt invariant; nach der ersten echten Änderung erscheint der Schluss.

## Mathematische Invarianten

- Für jede erlaubte Gruppenanzahl `n ∈ {2,3,4,5}` gilt `(n · 4 · x) : n = 4x` als Rückgängigmachen des vorhandenen numerischen Faktors `n`.
- Jedes dargestellte Paket enthält exakt vier gleiche `x`-Bausteine.
- Die Anzahl sichtbarer Pakete entspricht stets dem Faktor und Divisor.
- Das Ergebnis beschreibt den Inhalt genau einer gleich großen Gruppe, nicht das willkürliche Entfernen anderer Faktoren.
- Es wird weder durch eine Variable geteilt noch ein Definitionsbereichsproblem eingeführt.

## Interaktion und Bühne

- Eine dominante Paketbühne zeigt 2–5 gleich große Gruppen mit je vier `x`-Bausteinen.
- Bedienung: `Weiter`, `Zurücksetzen`, ein nativer Regler in der freien Erkundung und der bestehende Rücklink.
- Mehrfachtipps überspringen die Aufbauanimation nicht.
- Reset beendet laufende RAF-/Timer-Arbeit und stellt den vollständigen Ausgang wieder her.
- Reduced Motion beendet den Gruppenaufbau sofort und deterministisch.

## Nicht-Funktionen

- kein magisches Wegstreichen oder Durchkreuzen von Faktoren
- keine Division durch `x` oder andere Variablen
- keine zusätzlichen Definitionsbereichsfragen
- keine Übungsserie, Punkte, Lösungen, Eingabefelder oder Bewertung
- keine Speicherung, Konten, Analyse, Fremdaufrufe oder neue Abhängigkeiten

## Responsive und offline

- Kein horizontaler Überlauf bei 320×700, 390×844, 768×1024, 1024×768 und 1920×1080.
- Alle Modulressourcen werden explizit in Pages-, Smoke- und Offline-Listen aufgenommen.
- Der produktive Cache wird bei Integration genau von der dann bestätigten Version um eins erhöht.

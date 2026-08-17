# Gleichartige Terme – Design

## Ziel

Das Standalone-Modul macht sichtbar, warum `3x + 2x` zu `5x` zusammengefasst werden kann, `3x + 2` aber unverändert bleibt. Die einzige zentrale Erkenntnis lautet: Nur gleichartige Bestandteile können zusammengefasst werden.

## Abgrenzung

- Das Modul verwendet ausschließlich längliche `x`-Bausteine und quadratische Einer-Bausteine.
- Es setzt keinen Zahlenwert für `x` ein.
- `x²`, `xy`, weitere Variablen und negative Koeffizienten sind ausgeschlossen.
- Der optionale Umschalter zu Einern in der freien Erkundung wird nicht umgesetzt.
- Es gibt keine Startseiten-, Cache-, Manifest-, Pages-, Deployment- oder README-Integration.
- Es werden keine Abhängigkeiten hinzugefügt.

## Zustandsfolge

1. **Irritation:** `3x + 2x` und `3x + 2` stehen ohne Antwortauswahl untereinander.
2. **x-Gruppen:** Drei und zwei identische x-Bausteine werden als getrennte Gruppen sichtbar.
3. **Zusammenführen:** Die zweite Gruppe bewegt sich ruhig zur ersten; anschließend erscheinen fünf x-Bausteine und `3x + 2x = 5x`.
4. **Gegenfall:** Drei x-Bausteine und zwei quadratische Einer-Bausteine nähern sich kurz an, bleiben aber ohne Fehlerfarbe getrennt.
5. **Vergleich:** Links stehen fünf gleiche x-Bausteine, rechts drei x-Bausteine und zwei Einer.
6. **Freie Erkundung:** Zwei native, tastatur- und touchfähige Regler verändern zwei x-Gruppen jeweils von 1 bis 4. Die Formel aktualisiert sich als `ax + bx = (a+b)x`.

Die erste Veränderung im freien Zustand blendet die Abschlusserkenntnis ein: „Nur Gleichartiges kann zusammengefasst werden.“ Darunter steht: „x-Bausteine mit x-Bausteinen, Einer mit Einern.“

## Architektur

- `gleichartige-terme.html` enthält semantische Struktur, initial verborgene Ebenen, Regler und Live-Regionen.
- `like-terms.css` zeichnet die algebraischen Bausteine, steuert die ruhige Gegenfallbewegung und schützt kleine, hohe, breite und sehr große Viewports.
- `src/like-terms-math.js` modelliert Typ, Koeffizient, Gleichartigkeit und Zusammenfassung als reine Funktionen.
- `src/like-terms-state.js` enthält die deterministische Zustandsmaschine, Eingabesperren, Reset und freie Koeffizienten.
- `src/like-terms-animation.js` liefert reine, zeitabhängige Frames für das Zusammenführen.
- `src/like-terms-app.js` rendert DOM-Bausteine, verbindet Weiter/Reset/Regler und führt die Animation aus.

## Bedienung und Barrierefreiheit

Weiter und Zurücksetzen sind echte Buttons. Die Gruppengrößen sind native Bereichsregler mit sichtbaren Beschriftungen und Live-Ausgabe; damit funktionieren Touch, Maus sowie Pfeil-, Pos1- und Ende-Tasten ohne parallele Eingabelogik. Während der Zusammenführungsanimation sind alle Eingaben gesperrt. `prefers-reduced-motion` beendet Bewegungen unmittelbar im korrekten Endzustand.

## Prüfung

Reine Node-Tests prüfen Mathematik, Zustandsfolge, Animation, Mehrfachtipps, Eingabesperren und Reset. Ein DOM-Harness prüft den realen Modulcontroller einschließlich Reglerereignissen. Strukturtests sichern Texte, Bausteinarten, ausgeschlossene Inhalte, lokale Laufzeit und responsive Regeln. Die lokale Browserprüfung kontrolliert 320 px, iPad-Hochformat, iPad-Querformat und Klassenraumbreite auf horizontales Überlaufen und Lesbarkeit.

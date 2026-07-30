# Aha-Modul: Dreiecksfläche

Prüfdatum: 30. Juli 2026

## Sichtbarer Funktionsumfang

- Titel „Warum wird bei der Dreiecksfläche durch 2 geteilt?“
- Untertitel „Flächeninhalt“
- feste horizontale Grundseite `g`
- senkrechte Höhe `h` mit Fußpunkt und rechtem Winkel
- obere Spitze per Touch, Maus und Tastatur beweglich
- Hauptaktion „Zweites Dreieck ergänzen“
- ruhige 1,7-Sekunden-Animation einer halbtransparenten kongruenten Kopie
- deterministisch berechneter Endzustand als Parallelogramm
- zwei farblich unterscheidbare, gleich große Dreieckshälften
- Erkenntnissatz und beide Flächenbeziehungen erst nach der Ergänzung
- „Zurücksetzen“ und Rücklink „← Dreiecke“

Nicht vorhanden sind Zahlen, Einheiten, Aufgaben, Quiz, Eingabefelder,
frei ziehbare Kopie, Speicherung, Anmeldung, Analyse oder externe Dienste.

## Mathematische Konstruktion

Die feste Grundseite verläuft von `A` nach `B`, die bewegliche Spitze ist `C`.
Der vierte Parallelogrammpunkt wird direkt als

`D = B + C - A`

berechnet. Das Außenviereck `A-B-D-C` ist daher ein Parallelogramm. Das
Originaldreieck `A-B-C` und die Kopie `B-D-C` besitzen dieselben drei
Seitenlängen und sind kongruent. Die gemeinsame Diagonale `B-C` zerlegt das
Parallelogramm in genau diese beiden Hälften.

Die Höhe ist der senkrechte Abstand von `C` zur horizontalen Grundseite `A-B`.
Damit gilt geometrisch:

- `A_Parallelogramm = g · h`
- `A_Dreieck = (g · h) / 2`

## Animation und deterministischer Endzustand

Die sichtbare Kopie startet deckungsgleich und halbtransparent über dem
Original. Sie wird 1,7 Sekunden lang mit einer ruhigen kubischen
Ein-/Ausblendkurve um den Mittelpunkt von `B-C` um 180 Grad gedreht. Diese
starre Drehung bildet das Original sichtbar auf die Zielhälfte ab.

Nach dem letzten Animationsframe wird die transformierte Animationskopie
vollständig entfernt. Anschließend rendert die App ausschließlich die direkt
berechnete Zielgeometrie. Verspätete Browserframes oder ein Abbruch der
Animation können daher keine mathematisch abweichende Endfigur erzeugen.

## Bewegungs- und Schutzgrenzen

Im SVG-Koordinatensystem `1200 × 760` gelten:

- feste Grundseite: `A = (180, 590)`, `B = (680, 590)`
- Spitze horizontal: `290 ≤ x ≤ 570`
- Spitze vertikal: `150 ≤ y ≤ 410`
- Mindesthöhe: 180 SVG-Einheiten
- Höhenfuß immer innerhalb der Grundseite
- ergänzter vierter Punkt bleibt innerhalb der Zeichenfläche

Damit bleiben Grundseite, Höhe, Beschriftungen und beide Dreieckshälften
lesbar. Fälle mit außen liegender Höhe sind ausgeschlossen.

## Architektur

- `triangle-area-geometry.js`: reine Geometrie, Grenzen und Flächen
- `triangle-area-state.js`: Ausgangs-, Animations- und Endzustand
- `triangle-area-animation.js`: reine Zeitkurve und sichtbare Zwischenframes
- `triangle-area-app.js`: DOM-, SVG-, Pointer- und Tastaturdarstellung
- `triangle-area.css`: responsive Darstellung

Die Trennung hält spätere Module unabhängig und führt keine Framework- oder
Laufzeitabhängigkeit ein.

## Automatische Prüfungen

- 87 von 87 Node-Tests bestanden
- davon 32 neue Geometrie-, Animations-, Zustands- und Darstellungstests
- vollständige bisherige Suite mit 55 Tests bestanden
- Kongruenz an sechs erlaubten Spitzenpositionen bestätigt
- Parallelogramm und parallele Gegenseiten bestätigt
- senkrechte Höhe und rechter Winkel bestätigt
- Flächenverhältnis exakt `2 : 1`
- Schutzgrenzen und mehrere Grenzpositionen bestätigt
- Mehrfachtipps und Eingabesperre bestätigt
- Bewegung nach der Ergänzung, Reset und erneute Ergänzung bestätigt
- 21 von 21 lokale Laufzeitressourcen erreichbar
- 3 von 3 bestehende Dreiecksungleichungsdarstellungen gerendert
- 6 von 6 Dreiecksflächenzustände ohne Animationsreste als SVG gerendert
- JavaScript-Syntaxprüfungen bestanden
- keine Änderung der bestehenden Mathematik- und Geometriedateien
- kein externer Laufzeitaufruf, keine Speicherung und keine Schülerdaten

## Browser- und Betriebsgrenzen

Die Cloud-Browserinstanz blockierte die ausschließlich lokale Adresse mit
`ERR_BLOCKED_BY_CLIENT`. Deshalb wurde keine öffentliche oder private
Hostingvorschau erzeugt.

Eine lokale DOM- und Interaktionssimulation bestätigte:

- Touch- und Maus-Pointer über denselben Ereignispfad
- schnelle Mehrfachtipps
- gesperrte Spitze und Schaltflächen während der Animation
- vollständiger Endzustand ohne alte SVG-Transformation
- Spitzenbewegung nach der Ergänzung
- Zurücksetzen und erneute Ergänzung
- keine Laufzeitfehler

Offen bleiben die physische Sichtprüfung auf einem echten iPad im Hoch- und
Querformat, der reale Flugmodus-Neustart und die Klassenraumübertragung.

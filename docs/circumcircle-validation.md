# Aha-Modul: Mittelsenkrechten und Umkreis

Prüfdatum: 30. Juli 2026

## Sichtbarer Funktionsumfang

- Titel „Warum treffen sich die Mittelsenkrechten genau dort?“
- Untertitel „Mittelsenkrechten und Umkreis“
- Dreieck A, B, C
- hervorgehobene Seite AB mit Mittelpunkt und Mittelsenkrechter
- P ausschließlich auf dieser Mittelsenkrechten, Strecken PA und PB sowie
  `PA = PB`
- zweite und dritte Mittelsenkrechte schrittweise
- gemeinsamer Schnittpunkt M, Radiusstrecken und `MA = MB = MC`
- Umkreis durch A, B und C
- im Endzustand bewegliche Eckpunkte
- „Zurücksetzen“ und Rücklink „← Dreiecke“

Nicht vorhanden sind Aufgaben, Quiz, Koordinaten, Längenwerte,
Dreiecksarterkennung, weitere Dreieckslinien, Speicherung oder externe Dienste.

## Mathematische Konstruktion

Für jede Seite wird der Mittelpunkt als arithmetisches Mittel ihrer Endpunkte
berechnet. Die Richtung der Mittelsenkrechten entsteht durch eine exakte
90-Grad-Drehung des Seitenvektors. P wird orthogonal auf die erste
Mittelsenkrechte projiziert und anschließend nur entlang ihrer sichtbaren
Geraden begrenzt.

M wird analytisch aus den tatsächlichen Koordinaten von A, B und C als
Umkreismittelpunkt berechnet. Die dritte Mittelsenkrechte wird unabhängig
berechnet und muss M innerhalb einer Toleranz von `10⁻⁷` enthalten. Der Radius
ist die Distanz MA; MB und MC werden getrennt berechnet und auf Gleichheit
geprüft.

## Zustandsablauf

1. Erste Mittelsenkrechte, bewegliches P, PA und PB.
2. Zweite Mittelsenkrechte; P und seine Hilfsstrecken verschwinden.
3. Dritte Mittelsenkrechte, M, MA, MB und MC.
4. Umkreis; A, B und C werden beweglich.

Kurze Mehrfachtipps werden für 280 Millisekunden gesperrt. Jeder Zustand wird
vollständig aus dem aktuellen Modell gerendert; alte SVG-Elemente werden über
explizite Sichtbarkeit entfernt.

## Bewegungs- und Schutzgrenzen

Im SVG-Koordinatensystem `1200 × 760` gelten:

- Eckpunkte: `120 ≤ x ≤ 1080`, `100 ≤ y ≤ 660`
- Mindestseitenlänge: 170
- minimale doppelte Dreiecksfläche: 64.000
- maximaler Umkreisradius: 480
- der vollständige Umkreis muss mit mindestens 26 Einheiten Innenrand innerhalb
  der Zeichenfläche liegen
- M muss im sichtbaren Bereich `48 ≤ x ≤ 1152`, `48 ≤ y ≤ 712` liegen
- Mittelsenkrechten werden innerhalb eines Randes von 58 geschnitten

Damit bleiben nahezu kollineare Dreiecke, extrem kleine Seiten und unlesbar
große oder angeschnittene Kreise ausgeschlossen. M darf bei stumpfwinkligen
Dreiecken außerhalb liegen. Ein unzulässiger Zug verändert die letzte gültige
Geometrie nicht und zeigt eine kurze Rückmeldung.

Die unveränderte Ausgangsform wurde als Ganzes um 80 SVG-Einheiten nach oben
verschoben: `A = (300, 460)`, `B = (900, 460)`, `C = (540, 100)` und das
Ausgangsziel von P liegt bei `(600, 220)`. Dadurch beträgt der kleinste Abstand
des initialen Umkreises zum Rand gut 54 SVG-Einheiten. Für zulässige
Eckpunktbewegungen gilt weiterhin der feste Schutzrand von 26 Einheiten, ohne
Skalierungs-, ViewBox- oder Zustandswechsel.

## Architektur

- `circumcircle-geometry.js`: reine Geometrie, Projektion und Schutzgrenzen
- `circumcircle-state.js`: vier Zustände und erlaubte Bewegungen
- `circumcircle-app.js`: SVG-, Pointer-, Tastatur- und DOM-Darstellung
- `circumcircle.css`: responsive Darstellung und eindeutige Farben für P und M

SVG und Zustandsanimation sind keine mathematische Berechnungsgrundlage.

## Automatische Prüfungen

- Seitenmittelpunkte und Senkrechtstellung
- P-Projektion und `PA = PB` an mehreren Positionen
- Umkreismittelpunkt und dritte Mittelsenkrechte
- `MA = MB = MC` und Kreis durch alle Eckpunkte
- spitz-, recht- und stumpfwinklige Fälle
- M innen, auf der Hypotenuse und außerhalb
- Kollinearitäts-, Abstands-, Radius- und Sichtschutz
- vollständige Zustands-, Pointer-, Mehrfachtipp- und Reset-Simulation
- responsive und datenschutzbezogene Strukturprüfungen
- 7 von 7 repräsentative SVG-Zustände ohne ungültige Koordinaten

## Offene reale Abnahme

- visuelle Wirkung auf einem echten iPad im Hoch- und Querformat
- Lesbarkeit der fünf Punktnamen und Gleichheitsanzeigen
- Wirkung von M außerhalb bei einem stumpfwinkligen Dreieck
- Home-Bildschirm- und Flugmodus-Neustart
- Klassenraumübertragung

# Aha-Modul: Negative Zahlen auf der Zahlengeraden

Prüfdatum: 31. Juli 2026

## Sichtbarer Funktionsumfang

- Leitfrage „Warum liegen negative Zahlen links von der Null?“
- Untertitel „Zahlengerade“
- große horizontale Zahlengerade mit gleichen Abständen
- anfänglich ausschließlich die Markierungen 0, 1, 2 und 3
- großer Punkt, der bei 0 startet
- automatische ruhige Bewegung nach rechts bis 3
- automatische Rückbewegung bis 0
- anschließende Bewegung über 0 hinaus bis −3
- erst danach freie Bewegung per Touch, Maus oder Tastatur
- aktueller Wert über dem Punkt im freien Zustand
- Einrasten auf ganze Zahlen von −3 bis +3
- „Weiter“, „Zurücksetzen“ und Rücklink „← Rationale Zahlen“

Nicht vorhanden sind Rechenoperationen, Sachkontexte, Brüche, Dezimalzahlen,
Aufgaben, Quiz, Eingabefelder, Regler, Speicherung oder externe Dienste.

## Mathematische Konstruktion

Das SVG-Koordinatensystem besitzt `1200 × 520` Einheiten. Die Zahlengerade liegt
horizontal auf `y = 270`. Die Null liegt exakt bei `x = 600`; eine ganze Zahl
entspricht genau 150 horizontalen Einheiten. Damit liegen die sieben zulässigen
Positionen von −3 bis +3 gleichmäßig zwischen `x = 150` und `x = 1050`.

Die reine Geometriefunktion bildet Werte linear auf x-Positionen ab und rechnet
Pointerpositionen durch Begrenzen und ganzzahliges Einrasten zurück. Die
y-Koordinate einer Ziehbewegung beeinflusst den Wert nicht. Der dargestellte
Punkt wird stets neu aus dem ganzzahligen Wert erzeugt und kann die Gerade daher
weder nach oben noch nach unten verlassen.

## Zustandsablauf

1. Ausgang bei 0 mit sichtbaren Markierungen 0 bis 3.
2. Gesperrte Bewegung `0 → 1 → 2 → 3` und Erkenntnis: „Nach rechts werden
   Zahlen größer.“
3. Gesperrte Rückbewegung `3 → 2 → 1 → 0`.
4. Gesperrte Bewegung `0 → −1 → −2 → −3`; die negativen Markierungen werden
   entlang der Bewegung sichtbar.
5. Freier Zustand mit aktueller Zahl und der Abschlusserkenntnis: „Positive und
   negative Zahlen beschreiben zwei entgegengesetzte Richtungen.“

Jeder automatische Weg besteht aus drei Abschnitten zu je 520 Millisekunden.
Ein kubisches Ease-in-out sorgt für ruhige Übergänge. Der Abschluss jedes Wegs
wird unabhängig vom letzten Animationsframe direkt aus dem Zustand erzeugt.
Bei reduzierter Browserbewegung wird derselbe Endzustand ohne Animation gesetzt.

## Schutzgrenzen und Bedienung

- Wertebereich ausschließlich −3 bis +3
- ausschließlich ganze Werte, keine Zwischenwerte
- Punktzentrum immer exakt auf `y = 270`
- 116 SVG-Einheiten großes unsichtbares Griffziel um den sichtbaren Punkt
- Pointer Events als gemeinsamer Pfad für Touch und Maus
- Pointer Capture während der Ziehbewegung
- `touch-action: none` auf Zeichenfläche und Griff
- Pfeiltasten als barrierearme Ergänzung, ohne zusätzliches sichtbares
  Bedienelement
- Eingaben und Reset während automatischer Bewegungen gesperrt
- wiederholte schnelle Tipps starten keine zweite Bewegung
- SVG-Rand lässt Markierungen, Zahlen und Pfeilspitzen vollständig sichtbar

## Architektur

- `number-line-geometry.js`: lineare Zuordnung, Einrasten, Grenzen und Formate
- `number-line-state.js`: deterministische Zustandsfolge und Eingabesperre
- `number-line-animation.js`: reine zeitabhängige Bewegungsframes
- `number-line-app.js`: Pointer-, Tastatur-, SVG- und DOM-Darstellung
- `number-line.css`: Touchziele und responsive Darstellung

Weder DOM noch SVG noch Animation sind mathematische Berechnungsgrundlage.

## Automatische Prüfungen

- Mittelpunkt, Linearität und gleiche Abstände
- exakte Hin- und Rückabbildung aller ganzen Werte
- Einrasten ohne Zwischenwerte und Begrenzung auf −3 bis +3
- Punkt bleibt exakt auf der Zahlengeraden
- drei korrekte automatische Bewegungswege und deterministische Endframes
- Ausgang, rechte Lage, Rückkehr, negative Lage und freier Zustand
- Eingabesperre und schnelle Mehrfachtipps
- Touch- und Mausbewegung über denselben Pointer-Pfad
- Ziehen mit beliebiger y-Position verändert ausschließlich den Zahlenwert
- Tastaturbedienung, Reset und erneuter Aufbau
- Hochformat, Querformat, kleine Breite und Klassenraumbildschirm
- vollständiger gemeinsamer Offline-Cache und automatisierter Offline-Neustart
- keine Speicherung, Analyse oder externen Laufzeitaufrufe

## Offene reale Abnahme

- tatsächliche visuelle Wirkung auf einem physischen iPad
- Ruhe und Verständlichkeit der drei automatischen Bewegungen
- Fingergefühl des Einrastens im Hoch- und Querformat
- Lesbarkeit von Punkt, Zahlen und Erkenntnissätzen im Klassenraum
- Start vom iPad-Home-Bildschirm und realer Flugmodus-Neustart
- Klassenraumübertragung

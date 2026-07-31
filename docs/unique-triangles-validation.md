# Aha-Modul: Eindeutige Dreiecke

Prüfdatum: 31. Juli 2026

## Sichtbarer Funktionsumfang

- Titel „Warum reichen manche Angaben aus – und andere nicht?“
- Untertitel „Eindeutige Dreiecke“
- feste Grundseite AB
- zwei Kreisbögen und zwei echte Kreisschnittpunkte
- kräftiges oberes und transparentes unteres SSS-Dreieck
- identische Seitenmarkierungen ohne Zahlenwerte
- kleine Anzeige `SSS` nach dem vollständigen Aufbau
- ruhiger Vergleich über „Dreiecke vergleichen“
- deckungsgleicher deterministischer Endzustand
- fester Winkelstrahl und Kreis um B im zweiten Fall
- zwei echte Strahl-Kreis-Schnittpunkte
- zwei gleichzeitig sichtbare, nicht kongruente Dreiecke
- kompakter Abschlussvergleich
- „Zurücksetzen“ und Rücklink „← Dreiecke“

Nicht vorhanden sind eine vollständige Kongruenzsatzübersicht, SWS- oder
WSW-Untermodul, allgemeine SSW-Aussage, Zahlenwerte, Aufgaben, Quiz, Regler,
freie Geometriegriffe, Speicherung oder externe Dienste.

## Mathematische Konstruktion

### Drei Seiten

AB ist eine feste horizontale Grundseite. Zwei Kreise um A und B mit festen
Radien besitzen zwei echte Schnittpunkte. Die reine Geometriefunktion berechnet
beide analytisch und ordnet sie als obere und untere Lage. Beide Dreiecke
besitzen dieselben sortierten drei Seitenlängen.

Die Spiegelung des unteren Schnittpunkts an der Geraden AB wird unabhängig von
SVG und Animation berechnet und trifft den oberen Schnittpunkt innerhalb einer
Toleranz von `10⁻⁷`.

### Andere Anordnung

Ein Strahl mit festem Ursprung A und fester Richtung schneidet einen Kreis um B
in zwei positiven, getrennten Parametern. Beide resultierenden Dreiecke besitzen:

- dieselbe Grundseite AB
- dieselbe markierte Seite vom jeweiligen Schnittpunkt zu B
- denselben Winkel zwischen AB und dem Strahl

Die dritte Seite unterscheidet sich deutlich; die sortierten Seitenlängen
beweisen unabhängig von der Darstellung, dass die Dreiecke nicht kongruent sind.

## Zustandsablauf

1. SSS-Aufbau mit beiden spiegelbildlichen Lagen.
2. Starre Vergleichsbewegung bei gesperrten Eingaben.
3. Deckungsgleicher deterministischer Endzustand.
4. Mehrdeutigkeitsfall mit zwei verschiedenen Dreiecken.
5. Nach einer ruhigen Lesephase automatisch eingeblendeter kompakter
   Abschlussvergleich.

Die sichtbare Abschlussaussage bildet den vierten didaktischen Zustand. Die
Einblendung nach 1.400 Millisekunden benötigt keinen weiteren Button. Während
dieser Lesephase bleibt „Zurücksetzen“ verfügbar.

## Spiegelanimation

Die Vergleichsbewegung dauert 1.550 Millisekunden. Die untere Form wird als
starres Dreieck um ihren Schwerpunkt gedreht, während der Schwerpunkt ruhig zum
Schwerpunkt der oberen Lage wandert. In jedem Animationsframe bleiben alle drei
Seitenlängen exakt erhalten; es gibt weder Skalierung noch perspektivische
Verzerrung.

Ein zeitlicher Abschlusswächter setzt bei gedrosselten Browserframes spätestens
120 Millisekunden nach der Solldauer direkt den mathematisch berechneten
Deckzustand. Die Animation ist damit niemals die Berechnungsgrundlage.

## Schutzgrenzen

Im SVG-Koordinatensystem `1200 × 760` gelten:

- allgemeiner sichtbarer Innenrand: mindestens 40 Einheiten
- Abstand der SSS-Schnittpunkte: mindestens 260 Einheiten
- Höhe der SSS-Dreiecke: mindestens 180 Einheiten
- Innenrand während der Vergleichsbewegung: mindestens 48 Einheiten
- Abstand der Strahl-Kreis-Schnittpunkte: mindestens 240 Einheiten
- minimale doppelte Fläche jedes Mehrdeutigkeitsdreiecks: 70.000
- Mindestunterschied der variablen dritten Seiten: 220 Einheiten
- der Kreis des zweiten Falls bleibt vollständig mit mindestens 40 Einheiten
  Innenrand sichtbar

Tangentiallagen, getrennte Kreise, rückwärts liegende Strahlschnittpunkte,
flache Dreiecke und fast identische Mehrdeutigkeitsformen werden abgelehnt.

## Architektur

- `unique-triangles-geometry.js`: reine Schnittpunkt-, Spiegelungs-,
  Kongruenz- und Schutzlogik
- `unique-triangles-state.js`: deterministische Zustandsfolge und Eingabesperre
- `unique-triangles-animation.js`: reine starre Bewegungsframes
- `unique-triangles-app.js`: SVG-, Button- und DOM-Darstellung
- `unique-triangles.css`: responsive Darstellung und ruhige Einblendungen

SVG, DOM und Animation sind keine mathematische Berechnungsgrundlage.

## Automatische Prüfungen

- zwei korrekte Kreisschnittpunkte und Symmetrie
- identische drei Seitenlängen und Kongruenz
- exakte Spiegelung an AB
- starre Seitenlängen in mehreren Animationsframes
- exakter deckungsgleicher Animationsendzustand
- zwei positive Strahl-Kreis-Schnittpunkte
- dieselbe Grundseiten-, Seiten- und Winkelvorgabe
- nachgewiesene Nichtkongruenz
- Tangential-, Flächen-, Trennungs- und Sichtschutz
- Ausgang, Vergleich, Eingabesperre, Deckung, zweiter Fall und Abschluss
- schnelle Mehrfachtipps, Reset und erneuter Aufbau
- repräsentative SVG-Zustände ohne ungültige Koordinaten
- Hochformat, Querformat, kleine Breite und Klassenraumbildschirm

## Offene reale Abnahme

- visuelle Wirkung auf einem echten iPad im Hoch- und Querformat
- Verständlichkeit der starren Vergleichsbewegung
- Lesbarkeit der Seiten- und Winkelmarkierungen
- deutliche Unterscheidbarkeit der beiden Mehrdeutigkeitsdreiecke
- Home-Bildschirm- und Flugmodus-Neustart
- Klassenraumübertragung

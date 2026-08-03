# Validierung: Addition negativer Zahlen

## Umfang

Das Modul `addition-negativ.html` beantwortet ausschließlich die Frage
„Warum ist 3 + (−5) nicht 8?“. Der Startwert bleibt 3; der zweite Summand ist
auf die ganzen Zahlen −1 bis −6 begrenzt.

## Geprüfte Invarianten

- `3 + (−1) = 2` bis `3 + (−6) = −3`
- Richtung für jeden zulässigen Summanden: links
- Schrittzahl: Betrag des Summanden
- lineare Ganzzahlpositionen ohne Zwischenwerte
- getrennte Darstellung von Rechenzeichen und Vorzeichen
- gesperrte automatische Bewegung und deterministischer Endzustand
- Pointer-Eingabe für Touch und Maus; vertikale Bewegung ohne Werteinfluss
- Reset ohne verbleibende dynamische SVG-Elemente
- vier Karten in Kapitel 1 und sechs unveränderte Karten in Kapitel 2
- Offline-Cache V13 ohne Speicherung oder externe Laufzeitaufrufe

## Automatisierte Abnahme

- vollständige Node-Test-Suite: 358/358
- lokale Laufzeitressourcen: 61/61
- gerenderte Modulzustände: 57/57
- davon neues Additionsmodul: 8/8
- JavaScript-Syntax: alle Dateien bestanden

Eine Hostingvorschau ist nicht Bestandteil dieser Arbeitsphase.

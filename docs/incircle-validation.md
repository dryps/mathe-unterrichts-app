# Aha-Modul: Winkelhalbierende und Inkreis

Prüfdatum: 30. Juli 2026

## Sichtbarer Funktionsumfang

- Titel „Warum treffen sich die Winkelhalbierenden genau dort?“
- Untertitel „Winkelhalbierende und Inkreis“
- Dreieck A, B, C mit hervorgehobenem Winkel bei A
- zwei gleich markierte Teilwinkel
- P ausschließlich auf der ersten inneren Winkelhalbierenden
- zwei senkrechte Lotstrecken von P zu AB und AC
- Lotfußpunkte, Rechtwinkelsymbole und identische Längenmarkierungen
- zweite und dritte Winkelhalbierende in kurzer gestaffelter Abfolge
- gemeinsamer Schnittpunkt I
- drei gleich markierte senkrechte Seitenabstände mit `r = r = r`
- Inkreis mit drei Berührpunkten
- im Endzustand bewegliche Eckpunkte
- „Zurücksetzen“ und Rücklink „← Dreiecke“

Nicht vorhanden sind Konstruktionsanleitung, Außenwinkelhalbierende, Ankreise,
Zahlenwerte, Aufgaben, Quiz, direkte Griffe für I oder Berührpunkte,
Speicherung oder externe Dienste.

## Mathematische Konstruktion

Jede innere Winkelhalbierende entsteht aus der normierten Summe der beiden
normierten Winkelschenkel. Ihr sichtbares Ende wird analytisch als Schnitt mit
der jeweiligen Gegenseite berechnet.

P wird orthogonal auf die erste Winkelhalbierende projiziert und anschließend
auf einen sichtbaren Teil des Segments zwischen A und der Gegenseite begrenzt.
Seine Lotfußpunkte sind die orthogonalen Projektionen auf AB und AC.

I wird unabhängig von SVG und Darstellung aus den tatsächlichen Seitenlängen
baryzentrisch berechnet. Die drei Lotfußpunkte von I auf AB, BC und CA sind
zugleich die Berührpunkte. Der gemeinsame Lotabstand ist der Radius des
Inkreises. Die dritte Winkelhalbierende wird unabhängig berechnet und muss I
innerhalb einer Toleranz von `10⁻⁷` enthalten.

## Zustandsablauf

1. Erste Winkelhalbierende, bewegliches P und zwei gleich markierte Lotstrecken.
2. Zweite und dritte Winkelhalbierende, I und drei gleich markierte Radien.
3. Inkreis; A, B und C werden beweglich.

Beim ersten Schritt setzt die Zustandslogik den vollständigen zweiten Zustand
sofort deterministisch. Ausschließlich die Darstellung blendet zweite und dritte
Winkelhalbierende mit 230 Millisekunden Abstand ein. Während der insgesamt
820 Millisekunden langen Abfolge sind weitere Eingaben gesperrt. Die Animation
ist keine mathematische Berechnungsgrundlage.

## Bewegungs- und Schutzgrenzen

Im SVG-Koordinatensystem `1200 × 760` gelten:

- Eckpunkte: `105 ≤ x ≤ 1095`, `90 ≤ y ≤ 670`
- Mindestseitenlänge: 190
- minimale doppelte Dreiecksfläche: 90.000
- kleinster Innenwinkel: 24°
- kleinster Inkreisradius: 58
- vollständiger Inkreis mit mindestens 34 Einheiten Innenrand
- Berührpunkte mit mindestens 52 Einheiten Abstand zu jedem Seitenendpunkt
- P bleibt zwischen 26 % und 74 % der ersten Winkelhalbierendenstrecke
- alle Berührpunkte müssen auf den tatsächlichen Seitenstrecken liegen

Damit bleiben nahezu kollineare, extrem schmale und für Lot- oder
Rechtwinkelsymbole unlesbare Dreiecke ausgeschlossen. Spitze, rechte und
stumpfe Fälle bleiben möglich. Ein unzulässiger Zug verändert die letzte
gültige Geometrie nicht und zeigt eine kurze Rückmeldung.

## Architektur

- `incircle-geometry.js`: reine Winkelhalbierenden-, Projektions-, Inkreis- und
  Schutzlogik
- `incircle-state.js`: drei deterministische Zustände und erlaubte Bewegungen
- `incircle-app.js`: SVG-, Pointer-, Tastatur- und DOM-Darstellung
- `incircle.css`: responsive Darstellung und gestaffelte Einblendung

SVG, DOM und Übergangsanimation sind keine mathematische Berechnungsgrundlage.

## Automatische Prüfungen

- Winkelhalbierende und gleiche Teilwinkel
- P-Projektion an mehreren Zielpositionen
- gleiche senkrechte Abstände von P zu AB und AC
- exakte Lotfußpunkte und Senkrechtstellung
- I auf allen drei Winkelhalbierenden und innerhalb des Dreiecks
- gleiche Abstände von I zu allen Seiten
- Berührpunkte auf den Seitenstrecken
- Inkreis berührt alle drei Seiten
- spitz-, recht- und stumpfwinklige Fälle
- Mindestseiten-, Flächen-, Winkel-, Radius-, Rand- und Lesbarkeitsschutz
- Touch- und Mausinteraktion
- Mehrfachtipp- und Eingabesperre
- Reset aus allen Zuständen und erneuter Aufbau
- repräsentative SVG-Zustände ohne ungültige Koordinaten

## Offene reale Abnahme

- visuelle Wirkung auf einem echten iPad im Hoch- und Querformat
- Lesbarkeit von Teilwinkel-, Lot- und Rechtwinkelsymbolen
- Wirkung der gestaffelten Winkelhalbierenden
- Bewegung spitzer, rechter und stumpfer Endzustände
- Home-Bildschirm- und Flugmodus-Neustart
- Klassenraumübertragung

# Aha-Modul: Ordnung negativer Zahlen

Prüfdatum: 31. Juli 2026

## Sichtbarer Funktionsumfang

- Leitfrage „Warum ist −8 kleiner als −3?“
- Untertitel „Ordnung“
- anfänglich ausschließlich die neutrale Frage „Welche Zahl ist größer?“
- −8 und −3 ohne Auswahl, Bewertung oder vorweggenommene Lösung
- ruhiges Erscheinen der Zahlengeraden
- gestaffelte Markierungen: zuerst −8, danach −3
- sichtbarer Vergleich −8 < −3 als Folge der Positionen
- großer frei beweglicher Punkt im Endzustand
- aktueller ganzzahliger Wert direkt über dem Punkt
- Einrasten auf alle ganzen Zahlen von −10 bis +3
- „Weiter“, „Zurücksetzen“ und Rücklink „← Rationale Zahlen“

Nicht vorhanden sind Antwortschaltflächen, Bewertung, Aufgaben,
Rechenoperationen, Sachmodelle, Eingabefelder, Speicherung oder externe
Dienste.

## Mathematische Konstruktion

Das SVG-Koordinatensystem besitzt 1400 × 520 Einheiten. Die Zahlengerade liegt
horizontal auf y = 270. Ihre ganzzahligen Positionen reichen von x = 115 für
−10 bis x = 1285 für +3. Der Abstand zweier benachbarter ganzer Zahlen beträgt
exakt 90 Einheiten.

Damit gelten insbesondere:

- −8 bei x = 295
- −3 bei x = 745
- 0 bei x = 1015
- −8 liegt exakt links von −3
- −3 liegt exakt links von 0

Die gemeinsame reine Ganzzahlskala berechnet Begrenzung, Einrasten,
Wert-zu-Position, Position-zu-Wert, Tickpunkte und die Prüfung der horizontalen
Punktlage. Der dargestellte Punkt wird immer aus dem eingerasteten ganzzahligen
Wert neu erzeugt. Seine y-Koordinate bleibt unabhängig von der Ziehbewegung
exakt 270.

## Zustandsablauf

1. Neutraler Denkimpuls ohne Zahlengerade.
2. Gesperrter 1,8-Sekunden-Übergang: Achse erscheint, dann −8, danach −3.
3. Stabile Zahlengerade mit der Erkenntnis „Größere Zahlen liegen weiter
   rechts.“
4. Gesperrte kurze Einblendung von −8 < −3.
5. Vergleichszustand mit „−3 liegt weiter rechts und ist deshalb größer.“
6. Gesperrte kurze Freigabe des beweglichen Punkts.
7. Freies Einrasten von −10 bis +3.
8. Nach der ersten echten Bewegung erscheint die Abschlusserkenntnis:
   „Die Position auf der Zahlengeraden entscheidet. Weiter rechts bedeutet
   größer.“

Jeder gesperrte Übergang besitzt einen direkt berechneten Endzustand. Die
Animation ist keine mathematische Berechnungsgrundlage. Schnelle Mehrfachtipps
bleiben während der Übergänge wirkungslos.

## Wiederverwendung und Architektur

- number-line-geometry.js enthält weiterhin die unveränderten bisherigen
  Exporte für Modul 1 und zusätzlich die allgemeine Ganzzahlskalierung.
- order-number-line-geometry.js konfiguriert diese Skalierung ausschließlich
  für −10 bis +3.
- order-number-line-state.js besitzt eine unabhängige deterministische
  Zustandsfolge.
- order-number-line-animation.js erzeugt ausschließlich visuelle
  Übergangsframes.
- order-number-line-app.js verbindet Pointer, Tastatur, SVG und DOM.
- order-number-line.css hält Gestaltung und Responsive-Regeln getrennt.

Modul 1 behält Markup, Gestaltung, Zustandsfolge, Animation und Interaktion
unverändert. Seine bestehenden Tests bleiben vollständig grün.

## Schutzgrenzen

- Minimalwert −10 und Maximalwert +3
- ausschließlich ganze Werte
- Normalisierung von internem negativem Nullwert auf 0
- Punktzentrum immer exakt auf der horizontalen Achse
- 120 SVG-Einheiten großes unsichtbares Griffziel
- Pointer Events als gemeinsamer Pfad für Touch und Maus
- Pointer Capture während der Ziehbewegung
- touch-action: none auf Zeichenfläche und Griff
- Eingabesperre während automatischer Übergänge
- Reset aus jedem stabilen Zustand
- Endwerte und Schlüsselbeschriftungen mit sichtbarem SVG-Rand

## Automatische Prüfungen

- 289 von 289 Node-Tests bestanden
- vollständige bisherige Suite mit 251 Tests grün
- 49 von 49 lokale Laufzeitressourcen erreichbar
- 7 von 7 Ordnungszustände als SVG gerendert
- insgesamt 41 von 41 Modulzustände gerendert
- exakte lineare Abbildung und gleiche Einheitsschritte
- −8 links von −3, −3 links von 0 und −8 < −3
- Hin- und Rückabbildung aller vierzehn ganzen Werte
- Einrasten ohne Zwischenwerte oder negativen Nullwert
- Touch-, Maus- und Tastaturpfad
- gesperrte Übergänge und schnelle Mehrfachtipps
- Reset und erneuter vollständiger Aufbau
- Startseite mit zwei Kapiteln und acht Karten
- Kapitel 1 mit zwei Karten, Kapitel 2 mit sechs Karten
- gemeinsamer Offline-Cache auf Version 11
- automatisierter Offline-Neustart ohne Netzwerk
- keine Speicherung, Schülerdaten, Analyse oder externen Laufzeitaufrufe

## Offene reale Abnahme

Die Cloud-Browserumgebung darf die lokale Vorschauadresse nicht öffnen. DOM-,
Pointer-, SVG-, Ressourcen-, Responsive- und Offlineprüfungen wurden deshalb
direkt gegen die Arbeitskopie ausgeführt.

Auf einem physischen iPad bleiben zu beurteilen:

- Wirkung des neutralen Denkimpulses
- Ruhe und Verständlichkeit der gestaffelten Markierungen
- Lesbarkeit von −8 < −3
- Fingergefühl des Einrastens im Hoch- und Querformat
- Lesbarkeit im Klassenraum
- Home-Bildschirm-Start und realer Flugmodus-Neustart
- Klassenraumübertragung

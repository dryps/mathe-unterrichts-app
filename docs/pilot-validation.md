# Pilotprüfung: Winkelsumme im Dreieck

Prüfdatum: 29. Juli 2026

## Automatische Prüfungen

- 18 von 18 Node-Tests bestanden
- 7 von 7 lokale Laufzeitressourcen erreichbar
- geprüft: spitz-, recht- und stumpfwinklige Dreiecke
- geprüft: gleichseitige und gleichschenklige Dreiecke
- geprüft: exakte interne Winkelsumme und sichtbare Ganzzahlsumme von 180°
- geprüft: schnelle Zugfolgen, Mindestabstände, Bildschirmränder, fast kollineare
  Punkte, kleine Winkel und unveränderter letzter gültiger Zustand
- geprüft: Pointer-Event-Pfad für Touch und Maus, Zurücksetzen, responsive Regeln,
  Offline-Cache und Ausschluss von Speicherung, Analyse und externen URLs

## Echte Browserprüfung

Die App wurde in einem lokalen Headless-Chromium ohne öffentliche Bereitstellung
geprüft.

| Zielansicht | Viewport | Eingabe | kleinstes Touch-Ziel | Ergebnis |
| --- | ---: | --- | ---: | --- |
| iPad Hochformat | 820 × 1180 | Touch Pointer Events | 89 px | bestanden |
| iPad Querformat | 1180 × 820 | Touch Pointer Events | 75 px | bestanden |
| Klassenraumbildschirm | 1920 × 1080 | Maus Pointer Events | 109 px | bestanden |

In allen drei Ansichten:

- kein horizontaler Überlauf
- Dreieck, Winkelbögen, Werte, Rechnung und Reset sichtbar
- Ziehen verändert Form und Werte unmittelbar
- sichtbare Gleichung bleibt exakt 180°
- ungültige Ziehbewegung lässt nur gültige Geometrie bestehen
- Zurücksetzen stellt die Ausgangsform wieder her
- keine JavaScript-Seitenfehler
- keine externen Netzwerkaufrufe

Zusätzlich bestanden:

- Service Worker übernimmt die App nach dem ersten Laden
- vollständiger Seitenneustart im Offline-Modus
- Titel, Dreieck und Winkelgleichung bleiben offline verfügbar

## Sichtprüfung

Die gerenderten Ansichten wurden zusätzlich visuell kontrolliert. Winkelwerte und
Winkelbögen sind in allen drei Zielgrößen klar lesbar; die große Rechnung bleibt
der stärkste visuelle Anker. Die unsichtbaren Touch-Ziele wurden nach dem ersten
Querformatlauf von ungefähr 65 px auf mindestens 75 px vergrößert.

## Bewusste Grenze

Die optionale Funktion „Winkel zusammenlegen“ ist nicht umgesetzt. Sie bleibt eine
mögliche V2-Erweiterung und ist kein Abnahmekriterium dieses Piloten.

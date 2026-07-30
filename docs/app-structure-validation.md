# App-Struktur: Startseite und Modulauswahl

Prüfdatum: 30. Juli 2026

## Umgesetzte Struktur

- Startseite „Mathe im Unterricht“
- Untertitel „Interaktive Aha-Momente“
- Klassenstufe „Klasse 7“
- Buchkapitel „2. Dreiecke“
- fünf große Modulkarten:
  - „Warum bleiben es immer 180°?“ – „Winkelsumme“
  - „Wann kann überhaupt ein Dreieck entstehen?“ – „Dreiecksungleichung“
  - „Warum wird bei der Dreiecksfläche durch 2 geteilt?“ – „Flächeninhalt“
  - „Warum treffen sich die Mittelsenkrechten genau dort?“ –
    „Mittelsenkrechten und Umkreis“
  - „Warum treffen sich die Winkelhalbierenden genau dort?“ –
    „Winkelhalbierende und Inkreis“
- Status „fertig“ auf allen fünf Karten
- ein einziger Rückweg „← Dreiecke“ in jedem Modul
- gemeinsamer Offline-Cache für Übersicht, Navigation und alle fünf Module

Das bisher unter `index.html` liegende Winkelsummen-Modul wurde inhaltlich
unverändert nach `winkelsumme.html` übernommen. Die mathematischen JavaScript-
und Geometriedateien aller vier bestehenden Module wurden beim Ergänzen des
fünften Moduls nicht verändert.

## Automatische Prüfungen

- 173 von 173 Node-Tests bestanden
- die vollständige bisherige Suite mit 128 Tests bleibt grün
- 31 von 31 lokale Laufzeitressourcen erreichbar
- 3 von 3 Dreiecksungleichungszustände als SVG gerendert
- 6 von 6 Dreiecksflächenzustände als SVG gerendert
- 7 von 7 Mittelsenkrechtenzustände als SVG gerendert
- 7 von 7 Winkelhalbierendenzustände als SVG gerendert
- JavaScript-Syntaxprüfungen bestanden
- genau ein Kapitel und genau fünf Modulkarten bestätigt
- keine Klassenauswahl, keine leeren Klassenstufen und kein Kapitelplatzhalter
- alle fünf Karten und Rückwege bestätigt
- keine Suche, Einstellungen, Konten, Favoriten oder Statistiken
- Hochformat-, Querformat- und Großbildschirmregeln statisch bestätigt
- Home-Bildschirm-Konfiguration über Manifest bestätigt
- gemeinsamer Service-Worker-Cache auf Version 8 bestätigt
- keine Speicherung, Analyse oder externen Laufzeitaufrufe

## Browser- und Betriebsgrenzen

Die Cloud-Browserinstanz darf die lokale Adresse der Work-Umgebung nicht
öffnen. Eine Hostingvorschau wurde nicht erzeugt, weil diese Phase ausdrücklich
keine Veröffentlichung vorsieht.

Für das dritte Modul besteht weiterhin die lokale DOM- und
Interaktionssimulation für Touch- und Maus-Pointer, Mehrfachtipps,
Eingabesperre, Animation, deterministischen Endzustand, Spitzenbewegung,
Zurücksetzen und erneute Ergänzung.

Für das vierte Modul prüft eine eigene DOM- und Interaktionssimulation
Pointer-Drag für P und die Eckpunkte, Mehrfachtipps, sämtliche Zustandswechsel,
Schutzrückmeldungen, Zurücksetzen, erneuten Aufbau und das Entfernen früherer
SVG-Zustände.

Für das fünfte Modul prüft eine eigene DOM- und Interaktionssimulation Touch-
und Maus-Pointer für P und die Eckpunkte, die gestaffelte Eingabesperre,
Mehrfachtipps, alle Zustandswechsel, Schutzrückmeldungen, Zurücksetzen, erneuten
Aufbau und das Entfernen früherer SVG-Zustände.

Deshalb bleiben als reale Betriebsprüfungen offen:

- Safari auf einem physischen iPad im Hochformat
- Safari auf einem physischen iPad im Querformat
- Start vom iPad-Home-Bildschirm
- vollständiger Offline-Neustart im Flugmodus
- reale Klassenraumübertragung

Die vorhandenen Responsive-, Ressourcen-, Manifest- und Cachetests sichern
diese Anforderungen strukturell ab, ersetzen die physischen Prüfungen aber
nicht.

## Datenschutz und Veröffentlichung

- vollständig lokale Laufzeit
- keine Schülerdaten
- keine Anmeldung oder Speicherung
- keine Analyse und kein Tracking
- keine externe API
- keine neue Laufzeitabhängigkeit
- keine öffentliche oder private Hostingvorschau
- keine Veröffentlichung

# App-Struktur: Startseite und Modulauswahl

Prüfdatum: 30. Juli 2026

## Umgesetzte Struktur

- Startseite „Mathe im Unterricht“
- Untertitel „Interaktive Aha-Momente“
- Klassenstufe „Klasse 7“
- Buchkapitel „2. Dreiecke“
- drei große Modulkarten:
  - „Warum bleiben es immer 180°?“ – „Winkelsumme“
  - „Wann kann überhaupt ein Dreieck entstehen?“ – „Dreiecksungleichung“
  - „Warum wird bei der Dreiecksfläche durch 2 geteilt?“ – „Flächeninhalt“
- Status „fertig“ auf allen drei Karten
- ein einziger Rückweg „← Dreiecke“ in jedem Modul
- gemeinsamer Offline-Cache für Übersicht, Navigation und alle drei Module

Das bisher unter `index.html` liegende Winkelsummen-Modul wurde inhaltlich
unverändert nach `winkelsumme.html` übernommen. Die mathematischen JavaScript-
und Geometriedateien beider bestehenden Module wurden beim Ergänzen des dritten
Moduls nicht verändert.

## Automatische Prüfungen

- 87 von 87 Node-Tests bestanden
- die vollständige bisherige Suite mit 55 Tests bleibt grün
- 21 von 21 lokale Laufzeitressourcen erreichbar
- 3 von 3 Dreiecksungleichungszustände als SVG gerendert
- JavaScript-Syntaxprüfungen bestanden
- genau ein Kapitel und genau drei Modulkarten bestätigt
- keine Klassenauswahl, keine leeren Klassenstufen und kein Kapitelplatzhalter
- alle drei Karten und Rückwege bestätigt
- keine Suche, Einstellungen, Konten, Favoriten oder Statistiken
- Hochformat-, Querformat- und Großbildschirmregeln statisch bestätigt
- Home-Bildschirm-Konfiguration über Manifest bestätigt
- gemeinsamer Service-Worker-Cache auf Version 6 bestätigt
- keine Speicherung, Analyse oder externen Laufzeitaufrufe

## Browser- und Betriebsgrenzen

Die Cloud-Browserinstanz darf die lokale Adresse der Work-Umgebung nicht
öffnen. Eine Hostingvorschau wurde nicht erzeugt, weil diese Phase ausdrücklich
keine Veröffentlichung vorsieht.

Für das dritte Modul wurde zusätzlich eine lokale DOM- und
Interaktionssimulation durchgeführt. Geprüft wurden Touch- und Maus-Pointer,
Mehrfachtipps, Eingabesperre, Animation, deterministischer Endzustand,
Spitzenbewegung nach der Ergänzung, Zurücksetzen und erneute Ergänzung.

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

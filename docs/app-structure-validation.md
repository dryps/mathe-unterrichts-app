# App-Struktur: Startseite und Modulauswahl

Prüfdatum: 30. Juli 2026

## Umgesetzte Struktur

- Startseite „Mathe im Unterricht“
- Untertitel „Interaktive Aha-Momente“
- Kapitelübersicht „Dreiecke“
- zwei große Modulkarten:
  - „Warum bleiben es immer 180°?“ – „Winkelsumme“
  - „Wann kann überhaupt ein Dreieck entstehen?“ – „Dreiecksungleichung“
- Status „fertig“ auf beiden Karten
- ein einziger Rückweg „← Dreiecke“ in jedem Modul
- gemeinsamer Offline-Cache für Übersicht, Navigation und beide Module

Das bisher unter `index.html` liegende Winkelsummen-Modul wurde inhaltlich
unverändert nach `winkelsumme.html` übernommen. Die mathematischen JavaScript-
und Geometriedateien beider Module wurden nicht verändert.

## Automatische Prüfungen

- 55 von 55 Node-Tests bestanden
- davon 49 vollständige Regressionstests der beiden bestehenden Module
- 15 von 15 lokale Laufzeitressourcen erreichbar
- 3 von 3 Dreiecksungleichungszustände als SVG gerendert
- JavaScript-Syntaxprüfungen bestanden
- genau ein Kapitel und genau zwei Modulkarten bestätigt
- beide Karten und beide Rückwege bestätigt
- keine Suche, Einstellungen, Konten, Favoriten oder Statistiken
- Hochformat-, Querformat- und Großbildschirmregeln statisch bestätigt
- Home-Bildschirm-Konfiguration über Manifest bestätigt
- gemeinsamer Service-Worker-Cache auf Version 4 bestätigt
- keine Speicherung, Analyse oder externen Laufzeitaufrufe

## Browser- und Betriebsgrenzen

Die Cloud-Browserinstanz darf die lokale Adresse der Work-Umgebung nicht
öffnen. Eine Hostingvorschau wurde nicht erzeugt, weil diese Phase ausdrücklich
keine Veröffentlichung vorsieht.

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

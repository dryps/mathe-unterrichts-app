# App-Struktur: Startseite und Modulauswahl

Prüfdatum: 31. Juli 2026

## Umgesetzte Struktur

- Startseite „Mathe im Unterricht“
- Untertitel „Interaktive Aha-Momente“
- Klassenstufe „Klasse 7“
- Buchkapitel „1. Rationale Zahlen“ mit genau einer Modulkarte:
  - „Warum liegen negative Zahlen links von der Null?“ – „Zahlengerade“
- unverändertes Buchkapitel „2. Dreiecke“
- sechs große Modulkarten:
  - „Warum bleiben es immer 180°?“ – „Winkelsumme“
  - „Wann kann überhaupt ein Dreieck entstehen?“ – „Dreiecksungleichung“
  - „Warum wird bei der Dreiecksfläche durch 2 geteilt?“ – „Flächeninhalt“
  - „Warum treffen sich die Mittelsenkrechten genau dort?“ –
    „Mittelsenkrechten und Umkreis“
  - „Warum treffen sich die Winkelhalbierenden genau dort?“ –
    „Winkelhalbierende und Inkreis“
  - „Warum reichen manche Angaben aus – und andere nicht?“ –
    „Eindeutige Dreiecke“
- Status „fertig“ auf allen sieben Karten
- Rückweg „← Rationale Zahlen“ im neuen Modul
- unveränderter Rückweg „← Dreiecke“ in jedem Dreiecksmodul
- gemeinsamer Offline-Cache für Übersicht, Navigation und alle sieben Module

Im iPad-Hochformat stehen die Karten in drei Reihen mit je zwei Karten. Im
iPad-Querformat belegen sie zwei vollständige Reihen mit je drei Karten. Die
sechs bestehenden Dreiecksmodule und ihre Laufzeitdateien wurden beim Ergänzen
von Kapitel 1 nicht verändert.

## Automatische Prüfungen

- 251 von 251 Node-Tests bestanden
- die vollständige bisherige Suite mit 217 Tests bleibt grün
- 43 von 43 lokale Laufzeitressourcen erreichbar
- 3 von 3 Dreiecksungleichungszustände als SVG gerendert
- 6 von 6 Dreiecksflächenzustände als SVG gerendert
- 7 von 7 Mittelsenkrechtenzustände als SVG gerendert
- 7 von 7 Winkelhalbierendenzustände als SVG gerendert
- 5 von 5 Zustände des sechsten Moduls als SVG gerendert
- 6 von 6 Zahlengeraden-Zustände als SVG gerendert
- JavaScript-Syntaxprüfungen bestanden
- genau zwei Kapitel und genau sieben Modulkarten bestätigt
- keine Klassenauswahl, keine leeren Klassenstufen und kein Kapitelplatzhalter
- alle sieben Karten und Rückwege strukturell sowie über ihre lokalen
  Laufzeitressourcen bestätigt
- Hochformat mit 2 + 2 + 2 Karten und Querformat mit 3 + 3 Karten bestätigt
- keine Suche, Einstellungen, Konten, Favoriten oder Statistiken
- Home-Bildschirm-Konfiguration über Manifest bestätigt
- gemeinsamer Service-Worker-Cache auf Version 10 bestätigt
- automatisierter Offline-Neustart ohne Netzwerk bestanden
- keine Speicherung, Analyse oder externen Laufzeitaufrufe

## Browser- und Betriebsgrenzen

Die automatisierte Interaktions-, Struktur- und Darstellungsprüfung bestätigte:

- Kapitel 1 und das unveränderte Raster mit sechs Dreieckskarten ohne
  horizontalen Überlauf
- alle sieben Karten verweisen auf das richtige Modul
- alle sieben Rücklinks führen zur jeweiligen Kapitelübersicht
- vollständiger Zahlengeraden-Aufbau von 0 nach rechts, zurück und über 0 hinaus
- freie Punktbewegung mit Einrasten auf −3 bis +3
- vollständiger SSS-Aufbau, gesperrter Spiegelvergleich und deckungsgleicher Endzustand
- Mehrdeutigkeitsfall mit zwei getrennten Schnittpunkten
- Abschlussvergleich, Zurücksetzen und erneuter vollständiger Aufbau
- vollständige Sichtbarkeit aller neuen SVG-Elemente in den geprüften Zielbreiten
- keine app-eigenen JavaScript-Fehler

Die getrennte Cloud-Browserumgebung blockiert lokale `127.0.0.1`-Adressen. Ein
neuer visueller Klickdurchlauf der tatsächlichen lokalen Seite konnte deshalb
nicht ausgeführt werden. JavaScript-Syntax, DOM-Zustandswechsel, Pointer-
Interaktion, Navigation, Responsive-Regeln und sämtliche Ressourcen wurden
stattdessen direkt gegen die Arbeitskopie automatisiert geprüft. Die sechs
unveränderten Dreiecksmodule behalten zusätzlich ihren bereits bestätigten
Browserstand.

Als reale Betriebsprüfungen bleiben offen:

- Safari auf einem physischen iPad im Hochformat
- Safari auf einem physischen iPad im Querformat
- didaktische Wirkung der Spiegelbewegung und des Mehrdeutigkeitsfalls
- didaktische Wirkung der Richtungsbewegung auf der Zahlengeraden
- Start vom iPad-Home-Bildschirm
- vollständiger Offline-Neustart im Flugmodus
- reale Klassenraumübertragung

Die vorhandenen Responsive-, Ressourcen-, Manifest-, Browser- und Cachetests
ersetzen diese physischen Prüfungen nicht.

## Datenschutz und Veröffentlichung

- vollständig lokale Laufzeit
- keine Schülerdaten
- keine Anmeldung oder Speicherung
- keine Analyse und kein Tracking
- keine externe API
- keine neue Laufzeitabhängigkeit
- keine private Hostingvorschau
- keine allgemeine Veröffentlichung

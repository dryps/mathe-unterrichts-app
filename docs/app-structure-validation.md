# App-Struktur: Startseite und Modulauswahl

Prüfdatum: 31. Juli 2026

## Umgesetzte Struktur

- Startseite „Mathe im Unterricht“
- Untertitel „Interaktive Aha-Momente“
- Klassenstufe „Klasse 7“
- Buchkapitel „2. Dreiecke“
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
- Status „fertig“ auf allen sechs Karten
- ein einziger Rückweg „← Dreiecke“ in jedem Modul
- gemeinsamer Offline-Cache für Übersicht, Navigation und alle sechs Module

Im iPad-Hochformat stehen die Karten in drei Reihen mit je zwei Karten. Im
iPad-Querformat belegen sie zwei vollständige Reihen mit je drei Karten. Die
fünf bestehenden Module und ihre Laufzeitdateien wurden beim Ergänzen des
sechsten Moduls nicht verändert.

## Automatische Prüfungen

- 217 von 217 Node-Tests bestanden
- die vollständige bisherige Suite mit 175 Tests bleibt grün
- 37 von 37 lokale Laufzeitressourcen erreichbar
- 3 von 3 Dreiecksungleichungszustände als SVG gerendert
- 6 von 6 Dreiecksflächenzustände als SVG gerendert
- 7 von 7 Mittelsenkrechtenzustände als SVG gerendert
- 7 von 7 Winkelhalbierendenzustände als SVG gerendert
- 5 von 5 Zustände des sechsten Moduls als SVG gerendert
- JavaScript-Syntaxprüfungen bestanden
- genau ein Kapitel und genau sechs Modulkarten bestätigt
- keine Klassenauswahl, keine leeren Klassenstufen und kein Kapitelplatzhalter
- alle sechs Karten und Rückwege im Browser bestätigt
- Hochformat mit 2 + 2 + 2 Karten und Querformat mit 3 + 3 Karten bestätigt
- keine Suche, Einstellungen, Konten, Favoriten oder Statistiken
- Home-Bildschirm-Konfiguration über Manifest bestätigt
- gemeinsamer Service-Worker-Cache auf Version 9 bestätigt
- automatisierter Offline-Neustart ohne Netzwerk bestanden
- keine Speicherung, Analyse oder externen Laufzeitaufrufe

## Browser- und Betriebsgrenzen

Die lokale Browserprüfung bestätigte:

- sechs symmetrische Karten ohne horizontalen Überlauf
- alle sechs Karten öffnen das richtige Modul
- alle sechs Rücklinks führen zur Kapitelübersicht
- vollständiger SSS-Aufbau, gesperrter Spiegelvergleich und deckungsgleicher Endzustand
- Mehrdeutigkeitsfall mit zwei getrennten Schnittpunkten
- Abschlussvergleich, Zurücksetzen und erneuter vollständiger Aufbau
- vollständige Sichtbarkeit aller neuen SVG-Elemente in den geprüften Zielbreiten
- keine app-eigenen JavaScript-Fehler

Als reale Betriebsprüfungen bleiben offen:

- Safari auf einem physischen iPad im Hochformat
- Safari auf einem physischen iPad im Querformat
- didaktische Wirkung der Spiegelbewegung und des Mehrdeutigkeitsfalls
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

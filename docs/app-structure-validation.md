# App-Struktur: Startseite und Modulauswahl

Prüfdatum: 31. Juli 2026

## Umgesetzte Struktur

- Startseite „Mathe im Unterricht“
- Untertitel „Interaktive Aha-Momente“
- Klassenstufe „Klasse 7“
- Buchkapitel „1. Rationale Zahlen“ mit genau zwei Modulkarten:
  - „Warum liegen negative Zahlen links von der Null?“ – „Zahlengerade“
  - „Warum ist −8 kleiner als −3?“ – „Ordnung“
- unverändertes Buchkapitel „2. Dreiecke“ mit sechs Modulkarten:
  - „Warum bleiben es immer 180°?“ – „Winkelsumme“
  - „Wann kann überhaupt ein Dreieck entstehen?“ – „Dreiecksungleichung“
  - „Warum wird bei der Dreiecksfläche durch 2 geteilt?“ – „Flächeninhalt“
  - „Warum treffen sich die Mittelsenkrechten genau dort?“ –
    „Mittelsenkrechten und Umkreis“
  - „Warum treffen sich die Winkelhalbierenden genau dort?“ –
    „Winkelhalbierende und Inkreis“
  - „Warum reichen manche Angaben aus – und andere nicht?“ –
    „Eindeutige Dreiecke“
- Status „fertig“ auf allen acht Karten
- Rückweg „← Rationale Zahlen“ in beiden Modulen aus Kapitel 1
- unveränderter Rückweg „← Dreiecke“ in jedem Dreiecksmodul
- gemeinsamer Offline-Cache für Übersicht, Navigation und alle acht Module

Im iPad-Hochformat besitzt jedes Kapitel ein Zweispaltenraster. Im
iPad-Querformat stehen die beiden Karten aus Kapitel 1 als zentrierte Gruppe;
Kapitel 2 behält zwei vollständige Reihen mit je drei Karten.

## Automatische Prüfungen

- 294 von 294 Node-Tests bestanden
- vollständige bisherige Suite mit 251 Tests grün
- 49 von 49 lokale Laufzeitressourcen erreichbar
- 3 von 3 Dreiecksungleichungszustände
- 6 von 6 Dreiecksflächenzustände
- 7 von 7 Mittelsenkrechtenzustände
- 7 von 7 Winkelhalbierendenzustände
- 5 von 5 Zustände „Eindeutige Dreiecke“
- 6 von 6 Zustände des ersten Zahlengeradenmoduls
- 7 von 7 Zustände des Ordnungsmoduls
- JavaScript-Syntaxprüfungen bestanden
- genau zwei Kapitel und genau acht Modulkarten bestätigt
- alle acht Karten und Rückwege strukturell geprüft
- keine Klassenauswahl, leeren Klassenstufen oder Platzhalter
- Hochformat-, Querformat-, Kleinbreiten- und Großbildregeln bestätigt
- gemeinsamer Service-Worker-Cache auf Version 11
- automatisierter Offline-Neustart ohne Netzwerk bestanden
- keine Speicherung, Analyse oder externen Laufzeitaufrufe

## Regression

Die sechs Module aus Kapitel 2 und ihre 30 produktiven Laufzeitdateien blieben
bytegenau unverändert. Beim ersten Zahlengeradenmodul blieben HTML, CSS,
Zustand, Animation und App-Darstellung bytegenau unverändert. In seiner
Geometriedatei wurde ausschließlich eine additive allgemeine Ganzzahlskalierung
ergänzt; alle bisherigen Exporte und das Verhalten von −3 bis +3 bleiben
unverändert und vollständig getestet.

## Browser- und Betriebsgrenzen

Die getrennte Cloud-Browserumgebung darf lokale Vorschauadressen nicht öffnen.
Ein visueller Klickdurchlauf der lokalen Seite war deshalb nicht möglich.
JavaScript-Syntax, DOM-Zustandswechsel, Pointer-Interaktion, Navigation,
Responsive-Regeln, SVG-Zustände, Ressourcen und Offline-Neustart wurden direkt
gegen die Arbeitskopie automatisiert geprüft.

Als reale Betriebsprüfungen bleiben offen:

- Safari auf einem physischen iPad im Hoch- und Querformat
- didaktische Wirkung von Irritation, Auflösung und Vergleich
- Fingergefühl des Einrastens
- Lesbarkeit im Klassenraum
- Home-Bildschirm-Start und Flugmodus-Neustart
- Klassenraumübertragung

## Datenschutz und Veröffentlichung

- vollständig lokale Laufzeit
- keine Schülerdaten
- keine Anmeldung oder Speicherung
- keine Analyse und kein Tracking
- keine externe API
- keine neue Laufzeitabhängigkeit
- keine private Hostingvorschau
- keine allgemeine Veröffentlichung
